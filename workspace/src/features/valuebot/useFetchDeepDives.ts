import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export interface ValueBotDeepDiveRow {
  id: string;
  created_at: string;
  user_id: string | null;
  ticker: string;
  company_name: string | null;
  currency: string | null;
  provider: string | null;
  model: string | null;
  timeframe: string | null;
  custom_question: string | null;
  module0_markdown: string | null;
  module1_markdown: string | null;
  module2_markdown: string | null;
  module3_markdown: string | null;
  module4_markdown: string | null;
  module5_markdown: string | null;
  module6_markdown: string;
  source: string | null;
}

interface FetchDeepDivesResult {
  deepDives: ValueBotDeepDiveRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Fetches saved ValueBot deep dives for a ticker (and optional user). */
const useFetchDeepDives = (ticker?: string | null, userId?: string | null): FetchDeepDivesResult => {
  const { user } = useAuth();
  const resolvedUserId = useMemo(() => userId ?? user?.id ?? null, [user?.id, userId]);
  const [deepDives, setDeepDives] = useState<ValueBotDeepDiveRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeepDives = useCallback(async () => {
    if (!ticker?.trim()) {
      setDeepDives([]);
      setError(null);
      return;
    }

    if (typeof supabase?.from !== 'function') {
      setError('Supabase client is not configured. Add Supabase credentials to load your deep dives.');
      setDeepDives([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseQuery = supabase
        .from('valuebot_deep_dives')
        .select('*')
        .eq('ticker', ticker)
        .order('created_at', { ascending: false });

      const query = resolvedUserId ? baseQuery.eq('user_id', resolvedUserId) : baseQuery;

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setDeepDives(data ?? []);
    } catch (err) {
      const message = err?.message || 'Unable to load deep dives right now.';
      setError(message);
      setDeepDives([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedUserId, ticker]);

  useEffect(() => {
    fetchDeepDives();
  }, [fetchDeepDives]);

  return { deepDives, loading, error, refresh: fetchDeepDives };
};

export default useFetchDeepDives;
