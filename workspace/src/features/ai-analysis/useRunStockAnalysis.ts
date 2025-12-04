import { useStockAnalysis } from '../../lib/useStockAnalysis.js';

type RunStockAnalysisInput = {
  provider: string;
  model?: string | null;
  ticker: string;
  companyName?: string | null;
  timeframe?: string | null;
  customQuestion?: string | null;
  prompt?: string;
};

export function useRunStockAnalysis() {
  const { analyzeStock, loading, error, data } = useStockAnalysis();

  const runAnalysis = async ({ provider, model, ticker, companyName, timeframe, customQuestion, prompt }: RunStockAnalysisInput) => {
    const normalizedTicker = ticker?.trim();
    const normalizedCompanyName = companyName?.trim();
    const question = prompt?.trim() || customQuestion?.trim();

    return analyzeStock({
      provider: provider || 'openai',
      model: model || undefined,
      ticker: normalizedTicker,
      companyName: normalizedCompanyName,
      timeframe: timeframe?.trim() || undefined,
      question: question || undefined
    });
  };

  return { runAnalysis, loading, error, data };
}

export type { RunStockAnalysisInput };
