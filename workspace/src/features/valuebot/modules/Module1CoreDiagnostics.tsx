import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotModuleProps } from '../types.ts';

const Module1CoreDiagnostics: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(context?.module1Output || '');

  const ticker = context?.deepDiveConfig?.ticker?.trim();
  const hasTicker = !!ticker;

  useEffect(() => {
    if (context?.module1Output && context.module1Output !== moduleOutput) {
      setModuleOutput(context.module1Output);
    }
  }, [context?.module1Output, moduleOutput]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Not provided]';
    const timeframe = context?.deepDiveConfig?.timeframe?.trim() || 'General';
    const customQuestion = context?.deepDiveConfig?.customQuestion?.trim() || 'None';
    const module0Markdown = context?.module0Output?.trim() || 'No prior Module 0 context available.';

    return `You are ValueBot.ai — MODULE 1: Core Risk & Quality Diagnostics.

This is the second step after MODULE 0 (Data Loader).
You will analyze the downside risks, balance sheet, cash flow strength, margins, profitability, and competitive moat.

Company/ticker: ${tickerValue}
Optional timeframe: ${timeframe}
Additional investor note: ${customQuestion}

Previous context from Module 0:
${module0Markdown}

TASK:
Produce a markdown analysis covering:

### Summary Table
| Metric | Score (/10) | Label | Notes |
| ----- | ----------- | ----- | ----- |
| Debt & Balance Sheet Risk | X | [World Class…Horrific] | ... |
| Cash Flow Strength        | X | ... | ... |
| Margins & Profitability  | X | ... | ... |
| Competition & Moat       | X | ... | ... |
| Overall Quality          | X | ... | ... |

### 1. Downside & Risk Analysis
(Explain debt, liquidity, refinancing risk, interest coverage, volatility)

### 2. Cash Flow Strength
(Explain the stability and predictability of FCF)

### 3. Margins & Profitability
(Gross, operating, net — historical trend)

### 4. Competition & Moat
(Market structure, pricing power, switching costs)

### Requirements:
- MUST NOT include any buy/sell/hold verdict.
- MUST NOT include scenario analysis or valuation.
- DO NOT contradict or rewrite Module 0.
- Keep everything factual, structured, and reusable by Module 2.

Return only markdown.`;
  }, [context?.deepDiveConfig?.customQuestion, context?.deepDiveConfig?.timeframe, context?.module0Output, ticker]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader first.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider: context?.deepDiveConfig?.provider || 'openai',
        model: context?.deepDiveConfig?.model || undefined,
        ticker: ticker!,
        timeframe: context?.deepDiveConfig?.timeframe,
        customQuestion: context?.deepDiveConfig?.customQuestion,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      onUpdateContext?.({ module1Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 1 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 1 — Core Risk &amp; Quality Diagnostics</h3>
        <p className="detail-meta">Assess durability, governance, and downside guardrails before sizing conviction.</p>
        <p className="detail-meta">
          {hasTicker
            ? `Scoring risk profile for ${context?.deepDiveConfig?.ticker}`
            : 'Please configure and run Module 0 — Data Loader first.'}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !hasTicker}
          aria-busy={loading}
        >
          {loading ? 'Running...' : 'Run Module'}
        </button>
        {!hasTicker && (
          <p className="detail-meta" role="status">Please configure and run Module 0 — Data Loader first.</p>
        )}
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Core Diagnostics Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run Module 1 to generate markdown scoring of debt risk, cash flows, profitability, and moat.
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

export default Module1CoreDiagnostics;
