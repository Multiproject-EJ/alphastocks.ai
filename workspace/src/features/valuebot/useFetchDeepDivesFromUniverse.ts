import { useCallback, useEffect, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export interface ValueBotDeepDiveSummary {
  id: string;
  created_at: string;
  ticker: string;
  company_name?: string | null;
  currency?: string | null;
  provider?: string | null;
  model?: string | null;
  timeframe?: string | null;
}

/** Fetches the saved ValueBot deep dives for the authenticated user. */
const useFetchDeepDivesFromUniverse = () => {
  const { user } = useAuth();
  const [deepDives, setDeepDives] = useState<ValueBotDeepDiveSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeepDives = useCallback(async () => {
    if (!user?.id) {
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
      const { data, error: supabaseError } = await supabase
        .from('valuebot_deep_dives')
        .select('id, created_at, ticker, company_name, currency, provider, model, timeframe')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  }, [user?.id]);

  useEffect(() => {
    fetchDeepDives();
  }, [fetchDeepDives]);

  return { deepDives, loading, error, refresh: fetchDeepDives };
};

export default useFetchDeepDivesFromUniverse;
