import { useContext, useState } from 'preact/hooks';
import { ValueBotContext, ValueBotDeepDiveConfig, ValueBotMasterMeta } from './types.ts';

type RunMetaSummaryInput = {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module6Markdown: string;
  companyName?: string | null;
};

type RunMetaSummaryResult = {
  runMasterMetaSummary: (input: RunMetaSummaryInput) => Promise<ValueBotMasterMeta | null>;
  runMetaSummary: (input: RunMetaSummaryInput) => Promise<ValueBotMasterMeta | null>;
  loadingMeta: boolean;
  metaError: string | null;
  masterMeta: ValueBotMasterMeta | null;
  loading: boolean;
  error: string | null;
  data: ValueBotMasterMeta | null;
};

const DEFAULT_ERROR_MESSAGE = 'Unable to generate score summary right now.';

export function useRunMasterMetaSummary(): RunMetaSummaryResult {
  const valueBot = useContext(ValueBotContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValueBotMasterMeta | null>(null);

  const runMasterMetaSummary = async ({ deepDiveConfig, module6Markdown, companyName }: RunMetaSummaryInput) => {
    const trimmedMarkdown = module6Markdown?.trim();
    if (!trimmedMarkdown) {
      const message = 'Module 6 MASTER markdown is required to generate the score summary.';
      setError(message);
      console.error('[ValueBot] Skipping MASTER meta generation — missing Module 6 markdown.');
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/master-meta-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: deepDiveConfig?.provider || 'openai',
          model: deepDiveConfig?.model || null,
          ticker: deepDiveConfig?.ticker?.trim() || '',
          companyName: companyName?.trim() || null,
          module6Markdown: trimmedMarkdown
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.message || payload?.error || DEFAULT_ERROR_MESSAGE;
        setError(message);
        console.error('[ValueBot] MASTER meta generation failed:', message, payload);
        return null;
      }

      const meta: ValueBotMasterMeta | undefined = payload?.meta || payload?.data;

      if (!meta) {
        const message = 'AI response did not include a score summary.';
        setError(message);
        console.error('[ValueBot] MASTER meta generation returned no meta object.', payload);
        return null;
      }

      console.log('[ValueBot] MASTER meta generation succeeded with parsed meta:', meta);
      setData(meta);
      valueBot?.updateContext?.({ masterMeta: meta });
      return meta;
    } catch (err) {
      const message = err?.message || DEFAULT_ERROR_MESSAGE;
      setError(message);
      console.error('[ValueBot] Unexpected error during MASTER meta generation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    runMasterMetaSummary,
    runMetaSummary: runMasterMetaSummary,
    loadingMeta: loading,
    metaError: error,
    masterMeta: data,
    loading,
    error,
    data
  };
}

export default useRunMasterMetaSummary;
