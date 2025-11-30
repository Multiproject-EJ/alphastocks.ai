import { FunctionalComponent } from 'preact';
import { useEffect, useMemo, useState, useContext } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module1CoreDiagnostics: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module1OutputMarkdown || '');

  const ticker = resolvedContext?.deepDiveConfig?.ticker?.trim();
  const hasTicker = !!ticker;
  const hasModule0Output = Boolean(resolvedContext?.module0OutputMarkdown?.trim());
  const canRunModule = hasTicker && hasModule0Output;

  useEffect(() => {
    if (resolvedContext?.module1OutputMarkdown && resolvedContext.module1OutputMarkdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module1OutputMarkdown);
    }
  }, [moduleOutput, resolvedContext?.module1OutputMarkdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Not provided]';
    const timeframe = resolvedContext?.deepDiveConfig?.timeframe?.trim() || 'General';
    const customQuestion = resolvedContext?.deepDiveConfig?.customQuestion?.trim() || 'None';
    const module0Markdown =
      resolvedContext?.module0OutputMarkdown?.trim() || 'No prior Module 0 context available.';

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
  }, [resolvedContext?.deepDiveConfig?.customQuestion, resolvedContext?.deepDiveConfig?.timeframe, resolvedContext?.module0OutputMarkdown, ticker]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader first.');
      return;
    }

    if (!hasModule0Output) {
      setLocalError('Please run Module 0 — Data Loader to generate context before Module 1.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider: resolvedContext?.deepDiveConfig?.provider || 'openai',
        model: resolvedContext?.deepDiveConfig?.model || undefined,
        ticker: ticker!,
        timeframe: resolvedContext?.deepDiveConfig?.timeframe,
        customQuestion: resolvedContext?.deepDiveConfig?.customQuestion,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      updateContext?.({ module1OutputMarkdown: output });
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
            ? `Scoring risk profile for ${resolvedContext?.deepDiveConfig?.ticker}`
            : 'Please configure and run Module 0 — Data Loader first.'}
        </p>
        {!hasModule0Output && (
          <p className="ai-error" role="status">
            Module 1 depends on the Deep-Dive configuration and a completed Module 0 output.
          </p>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
        >
          {loading ? 'Running...' : 'Run Module 1 — Core Diagnostics'}
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
        {loading && (
          <p className="detail-meta" role="status">
            Running diagnostics…
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
