import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotModuleProps } from '../types.ts';

const Module1CoreDiagnostics: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(context?.module1Markdown || '');

  const hasTicker = !!context?.ticker?.trim();

  useEffect(() => {
    if (context?.module1Markdown && context.module1Markdown !== moduleOutput) {
      setModuleOutput(context.module1Markdown);
    }
  }, [context?.module1Markdown, moduleOutput]);

  const prompt = useMemo(() => {
    const ticker = context?.ticker?.trim() || '[Not provided]';
    const timeframe = context?.timeframe?.trim() || 'General';
    const customQuestion = context?.customQuestion?.trim() || 'None';
    const module0Markdown = context?.module0Data?.trim() || 'No prior Module 0 context available.';

    return `You are ValueBot.ai — MODULE 1: Core Risk & Quality Diagnostics.

This is the second step after MODULE 0 (Data Loader).
You will analyze the downside risks, balance sheet, cash flow strength, margins, profitability, and competitive moat.

Company/ticker: ${ticker}
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
  }, [context?.customQuestion, context?.module0Data, context?.ticker, context?.timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please enter a company or ticker in the main ValueBot configuration first.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider: context?.provider || 'openai',
        model: context?.model || undefined,
        ticker: context.ticker!,
        timeframe: context?.timeframe,
        customQuestion: context?.customQuestion,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      onUpdateContext?.({ module1Markdown: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 1 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 1 — Core Risk &amp; Quality Diagnostics</h3>
        <p className="detail-meta">Assess durability, governance, and downside guardrails before sizing conviction.</p>
        <p className="detail-meta">{context?.ticker ? `Scoring risk profile for ${context.ticker}` : 'Add a ticker to enable this module.'}</p>
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
          <p className="detail-meta" role="status">Enter a ticker to run Core Risk &amp; Quality Diagnostics.</p>
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
