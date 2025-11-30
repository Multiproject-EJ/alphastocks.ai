import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module2GrowthEngine: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module2Markdown || '');

  const ticker = resolvedContext?.deepDiveConfig?.ticker?.trim();
  const timeframe = resolvedContext?.deepDiveConfig?.timeframe?.trim();
  const model = resolvedContext?.deepDiveConfig?.model?.trim();
  const provider = resolvedContext?.deepDiveConfig?.provider || 'openai';
  const customQuestion = resolvedContext?.deepDiveConfig?.customQuestion;
  const module0Markdown = resolvedContext?.module0OutputMarkdown?.trim();
  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();

  const hasTicker = Boolean(ticker);
  const hasModule0Output = Boolean(module0Markdown);
  const hasModule1Output = Boolean(module1Markdown);
  const canRunModule = hasTicker && hasModule0Output;

  useEffect(() => {
    if (resolvedContext?.module2Markdown && resolvedContext.module2Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module2Markdown);
    }
  }, [moduleOutput, resolvedContext?.module2Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Not provided]';
    const timeframeValue = timeframe || 'General';
    const module0Context = module0Markdown || '[No data]';
    const module1Context = module1Markdown || '[Module 1 not run]';

    return `You are ValueBot.ai — MODULE 2: Business Model & Growth Engine.

Your task is to evaluate how this company makes money today and where durable growth will come from in the next 5–15 years.

Company: ${tickerValue}
Timeframe context: ${timeframeValue}

Previous context:
--- MODULE 0: DATA LOADER ---
${module0Context}
--- MODULE 1: CORE RISK & QUALITY DIAGNOSTICS ---
${module1Context}
(Use this context only as background. Do NOT override or re-run Module 1.)

### OUTPUT REQUIREMENTS (MARKDOWN ONLY)

## Table — Growth Engine Snapshot
| Revenue Driver / Segment | % of Revenue (approx) | Growth Engine Type | Moat / Advantage | Key Risks |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... |

## Table — Capital Allocation & Growth Quality
| Dimension | Assessment | Notes |
| --- | --- | --- |
| Reinvestment | ... | ... |
| M&A | ... | ... |
| Buybacks | ... | ... |
| Dividends | ... | ... |
| R&D / Innovation | ... | ... |

## Narrative — Business Model & Growth Engine
- Explain how the company makes money.
- Identify the 3–5 major growth engines over the next decade.
- Evaluate scalability, pricing power, switching costs, network effects.
- Discuss secular tailwinds or headwinds.
- Conclude with: how strong is this company's long-term *cash flow durability*?

### RULES
- Do NOT produce any buy/sell/hold verdict.
- Do NOT repeat Module 1 risk analysis—reference but do not duplicate.
- Keep everything as MARKDOWN ONLY.`;
  }, [module0Markdown, module1Markdown, ticker, timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure a ticker in Module 0 — Data Loader before running Module 2.');
      return;
    }

    if (!hasModule0Output) {
      setLocalError('Module 2 requires Module 0 output. Run the Data Loader first.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider,
        model: model || undefined,
        ticker: ticker!,
        timeframe: timeframe || undefined,
        customQuestion: customQuestion || undefined,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      updateContext?.({ module2Markdown: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 2 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 2 — Business Model &amp; Growth Engine</h3>
        <p className="detail-meta">
          Analyze revenue drivers, moat &amp; scalability, sector trends, and long-term growth durability.
        </p>
        <p className="detail-meta">
          {hasTicker
            ? `Growth engine analysis for ${resolvedContext?.deepDiveConfig?.ticker}`
            : 'Configure Module 0 to set your ticker and provider before running Module 2.'}
        </p>
        {!hasModule0Output && (
          <p className="ai-error" role="status">
            Module 2 depends on the Deep-Dive configuration and a completed Module 0 output.
          </p>
        )}
        {!hasModule1Output && hasModule0Output && hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 1 output not found. Running with limited risk context.
          </div>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
        >
          {loading ? 'Running...' : 'Run Module 2 — Growth Engine'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Deep-Dive Configuration</h4>
        <p className="detail-meta">Read-only summary for this module run.</p>
        <dl className="detail-meta">
          <div>
            <dt>Provider</dt>
            <dd>{provider || 'openai'}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{model || 'Default model for provider'}</dd>
          </div>
          <div>
            <dt>Ticker</dt>
            <dd>{ticker || 'Not set'}</dd>
          </div>
          <div>
            <dt>Timeframe</dt>
            <dd>{timeframe || 'General'}</dd>
          </div>
        </dl>
      </div>

      <div className="detail-card">
        <h4>Growth Engine Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run Module 2 to generate markdown on revenue drivers, moat durability, and capital allocation quality.
          </p>
        )}
        {loading && (
          <p className="detail-meta" role="status">
            Running growth engine…
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

export default Module2GrowthEngine;
