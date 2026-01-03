import { createClient } from '@supabase/supabase-js';
import { requireSupabaseConfig } from '../../config/runtimeConfig.js';

const applyMatch = (query, match) => {
  let nextQuery = query;

  if (match && typeof match === 'object' && match !== null) {
    Object.entries(match).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        nextQuery = nextQuery.in(key, value);
      } else if (value !== undefined && value !== null) {
        nextQuery = nextQuery.eq(key, value);
      }
    });
  }

  return nextQuery;
};

const buildQuery = (client, table, options = {}) => {
  const { select = '*', match, order, limit, range } = options;
  let query = client.from(table).select(select);

  query = applyMatch(query, match);

  if (order && typeof order.column === 'string') {
    query = query.order(order.column, {
      ascending: order.ascending !== false,
      nullsFirst: order.nullsFirst === true
    });
  }

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  if (range && Array.isArray(range) && range.length === 2) {
    query = query.range(range[0], range[1]);
  }

  return query;
};

export const createSupabaseProvider = () => {
  const { url, anonKey } = requireSupabaseConfig();
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });

  return {
    mode: 'supabase',
    listTables() {
      return [];
    },
    async getTable(name, options) {
      const query = buildQuery(client, name, options);
      const { data, error, count } = await query;

      if (error) {
        if (error.code === '42P01') {
          console.warn(`Supabase table "${name}" is missing. Returning empty dataset.`);
          return {
            table: name,
            rows: [],
            metadata: { count: 0, missingTable: true }
          };
        }

        throw new Error(`Supabase query for "${name}" failed: ${error.message}`);
      }

      return {
        table: name,
        rows: data ?? [],
        metadata: {
          count: typeof count === 'number' ? count : data?.length ?? 0
        }
      };
    },
    async createRow(name, payload) {
      const { data, error } = await client.from(name).insert(payload).select().single();

      if (error) {
        throw new Error(`Supabase insert into "${name}" failed: ${error.message}`);
      }

      return data ?? null;
    },
    async updateRows(name, match, updates) {
      let query = client.from(name).update(updates);
      query = applyMatch(query, match);
      const { data, error } = await query.select();

      if (error) {
        throw new Error(`Supabase update for "${name}" failed: ${error.message}`);
      }

      return data ?? [];
    },
    async deleteRows(name, match) {
      let query = client.from(name).delete();
      query = applyMatch(query, match);
      const { data, error } = await query.select();

      if (error) {
        throw new Error(`Supabase delete for "${name}" failed: ${error.message}`);
      }

      return data ?? [];
    },
    /**
     * Fetch the latest stock analysis for a given symbol
     * @param {string} symbol - Stock ticker symbol
     * @param {string} profileId - User profile ID
     * @returns {Promise<{data: object|null, error: Error|null}>}
     */
    async fetchStockAnalysis(symbol, profileId) {
      try {
        const { data, error } = await client
          .from('stock_analyses')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          // If no analysis found, return null data instead of throwing
          if (error.code === 'PGRST116') {
            return { data: null, error: null };
          }
          throw error;
        }
        
        return { data, error: null };
      } catch (err) {
        console.error('[DataService] Failed to fetch stock analysis:', err);
        return { data: null, error: err };
      }
    }
  };
};
