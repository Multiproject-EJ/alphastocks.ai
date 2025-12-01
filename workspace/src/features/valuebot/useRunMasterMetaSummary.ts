import { useState } from 'preact/hooks';
import { ValueBotDeepDiveConfig, ValueBotMasterMeta } from './types.ts';

type RunMetaSummaryInput = {
  deepDiveConfig: ValueBotDeepDiveConfig;
  module6Markdown: string;
  companyName?: string | null;
};

type RunMetaSummaryResult = {
  runMetaSummary: (input: RunMetaSummaryInput) => Promise<ValueBotMasterMeta>;
  loading: boolean;
  error: string | null;
  data: ValueBotMasterMeta | null;
};

const DEFAULT_ERROR_MESSAGE = 'Unable to generate score summary right now.';

export function useRunMasterMetaSummary(): RunMetaSummaryResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValueBotMasterMeta | null>(null);

  const runMetaSummary = async ({ deepDiveConfig, module6Markdown, companyName }: RunMetaSummaryInput) => {
    const trimmedMarkdown = module6Markdown?.trim();
    if (!trimmedMarkdown) {
      const message = 'Module 6 MASTER markdown is required to generate the score summary.';
      setError(message);
      throw new Error(message);
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
        throw new Error(message);
      }

      const meta: ValueBotMasterMeta | undefined = payload?.meta || payload?.data;

      if (!meta) {
        const message = 'AI response did not include a score summary.';
        setError(message);
        throw new Error(message);
      }

      setData(meta);
      return meta;
    } catch (err) {
      const message = err?.message || DEFAULT_ERROR_MESSAGE;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { runMetaSummary, loading, error, data };
}

export default useRunMasterMetaSummary;
