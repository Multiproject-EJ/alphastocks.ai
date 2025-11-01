import { createClient } from '@supabase/supabase-js';
import { requireSupabaseConfig } from '../../config/runtimeConfig.js';

const buildQuery = (client, table, options = {}) => {
  const { select = '*', match, order, limit, range } = options;
  let query = client.from(table).select(select);

  if (match && typeof match === 'object' && match !== null) {
    Object.entries(match).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

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
        throw new Error(`Supabase query for "${name}" failed: ${error.message}`);
      }

      return {
        table: name,
        rows: data ?? [],
        metadata: {
          count: typeof count === 'number' ? count : data?.length ?? 0
        }
      };
    }
  };
};
