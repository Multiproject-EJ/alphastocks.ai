import { FunctionalComponent } from 'preact';
import { useMemo, useState, useEffect } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotModuleProps } from '../types.ts';

const Module0DataLoader: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(context?.module0Data || '');

  useEffect(() => {
    if (context?.module0Data && context.module0Data !== moduleOutput) {
      setModuleOutput(context.module0Data);
    }
  }, [context?.module0Data, moduleOutput]);

  const prompt = useMemo(() => {
    const ticker = context?.ticker?.trim() || '[Not provided]';
    const timeframe = context?.timeframe?.trim() || 'General / not specified';
    const customQuestion = context?.customQuestion?.trim() || 'None provided';

    return `You are ValueBot.ai, a fundamental stock analyst preparing raw input data for a deeper multi-step valuation.

Step: MODULE 0 — Data Loader (Pre-Step).

Company or ticker: ${ticker}
Optional timeframe focus: ${timeframe}
Additional investor note (if any): ${customQuestion}

TASK
- Return a clean, spreadsheet-friendly **markdown output** that summarizes the company’s key factual data and history, without giving any final investment verdict yet.
- Focus on objective facts and structured lists/tables that later modules can build on.

REQUIRED STRUCTURE
1. Company Snapshot (bullet list)
   - Business description (1–3 sentences)
   - Main segments / geographies
   - Exchange, ticker, currency
   - Latest fiscal year and most recent reported quarter

2. Key Financials Table (last 5–10 years if easily available)
   | Year | Revenue | Operating Income | Net Income | EPS (basic or diluted) | Free Cash Flow | Notes |
   (Fill what you reasonably can; if data is sparse, use fewer years but still keep the header.)

3. Margin & Return Snapshot
   - Bullet list with recent gross margin, operating margin, net margin.
   - Any notable trends (improving, stable, deteriorating).

4. Balance Sheet & Debt Snapshot
   - Total debt, cash & equivalents (approx.)
   - Net debt (if possible)
   - Brief comments on leverage (low/medium/high).

5. Ownership & Capital Allocation Notes
   - Any known major shareholders or insider ownership (if relevant).
   - Brief history of dividends, buybacks, or major M&A.

6. Data Quality Notes
   - Mention any missing data, inconsistencies, or caveats in the above numbers.

IMPORTANT
- Do NOT provide a Buy/Hold/Sell verdict in this module.
- Do NOT compute detailed valuation or scenarios here.
- Keep everything concise but clear, ready to be reused in later modules.`;
  }, [context?.customQuestion, context?.ticker, context?.timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!context?.ticker?.trim()) {
      setLocalError('Please enter a company or ticker in the main ValueBot configuration first.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider: context?.provider || 'openai',
        model: context?.model || undefined,
        ticker: context.ticker,
        timeframe: context?.timeframe,
        customQuestion: context?.customQuestion,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      onUpdateContext?.({ module0Data: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 0 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 0 — Data Loader (Pre-Step)</h3>
        <p className="detail-meta">
          Aggregate raw inputs before any analysis starts so the copilot has a clean foundation.
        </p>
        <p className="detail-meta">
          {context?.ticker ? `Preparing data for ${context.ticker}` : 'Ticker and company context will populate here.'}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Running...' : 'Run Module'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Data Loader Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run the Data Loader to fetch a structured snapshot of this company before you dive into the later modules.
          </p>
        )}
        {data?.provider && (
          <p className="detail-meta" aria-live="polite">
            Provider: {data.provider} {data.modelUsed ? `• Model: ${data.modelUsed}` : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default Module0DataLoader;
