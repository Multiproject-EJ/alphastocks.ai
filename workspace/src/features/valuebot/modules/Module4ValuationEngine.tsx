import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module4ValuationEngine: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module4Markdown || '');

  const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
  const ticker = deepDiveConfig?.ticker?.trim();
  const timeframe = deepDiveConfig?.timeframe?.trim();
  const model = deepDiveConfig?.model?.trim();
  const provider = deepDiveConfig?.provider || 'openai';
  const customQuestion = deepDiveConfig?.customQuestion?.trim();

  const module0Markdown = resolvedContext?.module0OutputMarkdown?.trim();
  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();
  const module2Markdown = resolvedContext?.module2Markdown?.trim();
  const module3Markdown = resolvedContext?.module3Markdown?.trim();

  const hasTicker = Boolean(ticker);
  const hasModule3Output = Boolean(module3Markdown);
  const canRunModule = hasTicker && hasModule3Output;

  useEffect(() => {
    if (resolvedContext?.module4Markdown && resolvedContext.module4Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module4Markdown);
    }
  }, [moduleOutput, resolvedContext?.module4Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Ticker not set]';
    const timeframeValue = timeframe || '5–15 year horizon';
    const module0Context = module0Markdown || '[Module 0 — Data Loader output missing]';
    const module1Context = module1Markdown || '[Module 1 — Core Diagnostics output missing]';
    const module2Context = module2Markdown || '[Module 2 — Growth Engine output missing]';
    const module3Context = module3Markdown || '[Module 3 — Scenario Engine output missing]';

    return `You are ValueBot.ai — Module 4: Valuation Engine (DCF + Reverse Engineering) for ${tickerValue}.

Use a 5–15 year horizon consistent with the selected timeframe: ${timeframeValue}.

Use the following prior module outputs as your context:
[Module 0 — Data Loader]
${module0Context}

[Module 1 — Core Risk & Quality Diagnostics]
${module1Context}

[Module 2 — Business Model & Growth Engine]
${module2Context}

[Module 3 — Scenario Engine (Bear / Base / Bull)]
${module3Context}

Task — MODULE 4: Valuation Engine (DCF + Reverse Engineering)
1. Convert the Bear / Base / Bull scenarios into explicit valuation ranges:
- For each scenario, estimate:
  - Reasonable valuation multiples or DCF assumptions.
  - 5-year and 15-year per-share fair value ranges.
- Summarize in a markdown table:

Scenario\tRevenue CAGR\tMargin Outlook\tFree Cash Flow Profile\t5Y Valuation Range\t15Y Valuation Range

2. Reverse-engineer the current price:
- Treat the current share price as “given.”
- Infer what long-term growth, margins, and reinvestment assumptions the market is currently pricing in.
- State whether those implicit assumptions look conservative, fair, or aggressive based on prior modules.
3. Compute a probability-weighted fair value range:
- Assign explicit probabilities to Bear / Base / Bull.
- Calculate a probability-weighted expected fair value today.
- Summarize in a small markdown table:

Scenario\tProbability\t5Y Fair Value\t15Y Fair Value

4. Define entry zones based on expected CAGR and valuation cushion:
- Accumulation Zone: price below X
- Buy Zone: price below Y
- Strong Buy Zone: price below Z
- Explain briefly how these thresholds relate to:
  - Required return (e.g. 25–65% CAGR for very attractive setups).
  - Downside risk and balance sheet strength from Module 1.
5. Provide a short narrative section that explains:
- Key drivers behind your valuation.
- Main upside and downside risks to the valuation.
- How sensitive the valuation is to growth/margin assumptions.

Output format:
- Start with compact markdown tables for valuation ranges and probabilities.
- Follow with 3–5 short narrative paragraphs (no huge walls of text).
- Do NOT repeat the full risk/business description; assume the reader has Modules 1–3 available. Focus on valuation logic.`;
  }, [module0Markdown, module1Markdown, module2Markdown, module3Markdown, ticker, timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader before running Module 4.');
      return;
    }

    if (!hasModule3Output) {
      setLocalError('Module 4 requires scenario output from Module 3 — Scenario Engine.');
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
      updateContext?.({ module4Markdown: output, module4Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 4 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 4 — Valuation Engine (DCF + Reverse Engineering)</h3>
        <p className="detail-meta">
          Convert scenarios into valuation ranges, reverse-engineer the current price, and define entry zones aligned to required returns.
        </p>
        <p className="detail-meta">
          {hasTicker
            ? `Valuation analysis for ${resolvedContext?.deepDiveConfig?.ticker}`
            : 'Configure Module 0 to set your ticker and provider before running Module 4.'}
        </p>
        {!hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 4 depends on the deep-dive configuration from Module 0.
          </div>
        )}
        {!hasModule3Output && hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 4 requires completed scenarios. Run Module 3 — Scenario Engine first.
          </div>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
          title={!canRunModule ? 'Run Module 3 — Scenario Engine before Valuation.' : undefined}
        >
          {loading ? 'Running...' : 'Run Module 4 — Valuation Engine'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Deep-Dive Configuration</h4>
        <p className="detail-meta">Read-only snapshot used for this valuation run.</p>
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
            <dd>{timeframe || '5–15 year lens'}</dd>
          </div>
          <div>
            <dt>Custom Question</dt>
            <dd>{customQuestion || 'None provided'}</dd>
          </div>
        </dl>
        {!hasModule3Output && (
          <p className="detail-meta" role="status">
            Scenario output (Module 3) is required before running valuation.
          </p>
        )}
      </div>

      <div className="detail-card">
        <h4>Valuation Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run Module 4 to translate scenarios into valuation ranges, reverse-engineered assumptions, and entry zones.
          </p>
        )}
        {loading && (
          <p className="detail-meta" role="status">
            Running Valuation Engine…
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

export default Module4ValuationEngine;
