import { useContext, useMemo, useState } from 'preact/hooks';
import { ValueBotContext, ValueBotMasterMeta } from './types.ts';

type RunMasterMetaSummaryResult = {
  meta: ValueBotMasterMeta | null;
  error: string | null;
};

type RunMetaSummaryHookResult = {
  runMasterMetaSummary: () => Promise<RunMasterMetaSummaryResult>;
  runMetaSummary: () => Promise<RunMasterMetaSummaryResult>;
  loadingMeta: boolean;
  metaError: string | null;
  masterMeta: ValueBotMasterMeta | null;
  loading: boolean;
  error: string | null;
  data: ValueBotMasterMeta | null;
};

const DEFAULT_ERROR_MESSAGE = 'Unable to generate score summary right now.';

export function useRunMasterMetaSummary(): RunMetaSummaryHookResult {
  const valueBot = useContext(ValueBotContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValueBotMasterMeta | null>(null);

  const resolvedContext = valueBot?.context;

  const runMasterMetaSummary = async (): Promise<RunMasterMetaSummaryResult> => {
    const trimmedMarkdown = resolvedContext?.module6Markdown?.trim();
    if (!trimmedMarkdown) {
      const message = 'Module 6 MASTER markdown is required to generate the score summary.';
      setError(message);
      console.error('[ValueBot] Skipping MASTER meta generation — missing Module 6 markdown.');
      return { meta: null, error: message };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/master-meta-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: resolvedContext?.deepDiveConfig?.provider || 'openai',
          model: resolvedContext?.deepDiveConfig?.model || null,
          ticker: resolvedContext?.deepDiveConfig?.ticker?.trim() || '',
          companyName: resolvedContext?.companyName?.trim() || null,
          module6Markdown: trimmedMarkdown,
          response_format: 'json_object'
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.message || payload?.error || DEFAULT_ERROR_MESSAGE;
        setError(message);
        console.error('[ValueBot] MASTER meta generation failed:', message, payload);
        return { meta: null, error: message };
      }

      const meta: ValueBotMasterMeta | undefined = payload?.meta || payload?.data;

      if (!meta) {
        const message = 'AI response did not include a score summary.';
        setError(message);
        console.error('[ValueBot] MASTER meta generation returned no meta object.', payload);
        return { meta: null, error: message };
      }

      console.log('[ValueBot] MASTER meta generation succeeded with parsed meta:', meta);
      setData(meta);
      valueBot?.updateContext?.({ masterMeta: meta });
      return { meta, error: null };
    } catch (err) {
      const message = err?.message || DEFAULT_ERROR_MESSAGE;
      setError(message);
      console.error('[ValueBot] Unexpected error during MASTER meta generation:', err);
      return { meta: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const masterMetaFromContext = useMemo(() => resolvedContext?.masterMeta ?? null, [resolvedContext?.masterMeta]);

  return {
    runMasterMetaSummary,
    runMetaSummary: runMasterMetaSummary,
    loadingMeta: loading,
    metaError: error,
    masterMeta: data ?? masterMetaFromContext,
    loading,
    error,
    data: data ?? masterMetaFromContext
  };
}

export default useRunMasterMetaSummary;
