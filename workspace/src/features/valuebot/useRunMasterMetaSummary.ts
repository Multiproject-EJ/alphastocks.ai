import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { ValueBotContext, ValueBotMasterMeta, ValueBotAnalysisContext } from './types.ts';

type RunMasterMetaSummaryResult = {
  meta?: ValueBotMasterMeta | null;
  error?: string | null;
};

const DEFAULT_ERROR_MESSAGE = 'Unable to generate score summary right now.';

export function useRunMasterMetaSummary() {
  const valueBot = useContext(ValueBotContext);
  const [localContext, setLocalContext] = useState<ValueBotAnalysisContext | null>(valueBot?.context ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMeta, setLastMeta] = useState<ValueBotMasterMeta | null>(null);

  useEffect(() => {
    if (valueBot?.context) {
      setLocalContext(valueBot.context);
    }
  }, [valueBot?.context]);

  const runMasterMetaSummary = useCallback(
    async (markdownOverride?: string): Promise<RunMasterMetaSummaryResult> => {
      const resolvedContext = valueBot?.context ?? localContext;
      const contextMarkdown = resolvedContext?.module6Markdown?.trim() || '';
      const markdown = (markdownOverride && markdownOverride.trim()) || contextMarkdown;

      if (!markdown) {
        const message = 'Module 6 MASTER markdown is required to generate the score summary.';
        setError(message);
        setLastMeta(null);
        console.error('[ValueBot] Skipping MASTER meta generation — missing Module 6 markdown.');
        return { error: message };
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
            module6Markdown: markdown,
            markdown,
            response_format: 'json_object'
          })
        });

        const payload = await response.json();

        if (!response.ok) {
          const message = payload?.message || payload?.error || DEFAULT_ERROR_MESSAGE;
          setError(message);
          setLastMeta(null);
          console.error('[ValueBot] MASTER meta generation failed:', message, payload);
          return { meta: null, error: message };
        }

        const parsedMeta: ValueBotMasterMeta | undefined = payload?.meta || payload?.data;

        if (!parsedMeta) {
          const message = 'AI response did not include a score summary.';
          setError(message);
          setLastMeta(null);
          console.error('[ValueBot] MASTER meta generation returned no meta object.', payload);
          return { meta: null, error: message };
        }

        console.log('[ValueBot] MASTER meta generation succeeded with parsed meta:', parsedMeta);
        setLastMeta(parsedMeta);
        valueBot?.updateContext?.({ masterMeta: parsedMeta });
        return { meta: parsedMeta, error: null };
      } catch (err: unknown) {
        const message = (err as Error)?.message || DEFAULT_ERROR_MESSAGE;
        setError(message);
        setLastMeta(null);
        console.error('[ValueBot] Unexpected error during MASTER meta generation:', err);
        return { meta: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [localContext, valueBot]
  );

  const masterMetaFromContext = useMemo(
    () => valueBot?.context?.masterMeta ?? localContext?.masterMeta ?? null,
    [localContext?.masterMeta, valueBot?.context?.masterMeta]
  );
  const resolvedMeta = lastMeta ?? masterMetaFromContext;

  return {
    runMasterMetaSummary,
    loading,
    error,
    meta: resolvedMeta,
    data: resolvedMeta,
    masterMeta: resolvedMeta,
    loadingMeta: loading,
    metaError: error
  };
}

export default useRunMasterMetaSummary;
