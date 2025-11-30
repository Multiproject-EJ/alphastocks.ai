import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module6FinalVerdict: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module6Markdown || '');

  const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
  const ticker = deepDiveConfig?.ticker?.trim();
  const timeframe = deepDiveConfig?.timeframe?.trim();
  const model = deepDiveConfig?.model?.trim();
  const provider = deepDiveConfig?.provider || 'openai';
  const customQuestion = deepDiveConfig?.customQuestion?.trim();

  const companyName = resolvedContext?.companyName?.trim();
  const currentPrice = resolvedContext?.currentPrice;

  const module0Markdown = resolvedContext?.module0OutputMarkdown?.trim();
  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();
  const module2Markdown = resolvedContext?.module2Markdown?.trim();
  const module3Markdown = resolvedContext?.module3Markdown?.trim();
  const module4Markdown = resolvedContext?.module4Markdown?.trim();
  const module5Markdown = resolvedContext?.module5Markdown?.trim();

  const hasTicker = Boolean(ticker);
  const hasModule1Output = Boolean(module1Markdown);
  const hasModule2Output = Boolean(module2Markdown);
  const hasModule3Output = Boolean(module3Markdown);
  const hasModule4Output = Boolean(module4Markdown);
  const hasModule5Output = Boolean(module5Markdown);

  const canRunModule =
    hasTicker && hasModule1Output && hasModule2Output && hasModule3Output && hasModule4Output && hasModule5Output;

  useEffect(() => {
    if (resolvedContext?.module6Markdown && resolvedContext.module6Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module6Markdown);
    }
  }, [moduleOutput, resolvedContext?.module6Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Ticker not set]';
    const timeframeValue = timeframe || '5–15 year horizon';
    const companyLabel = companyName || 'the company';
    const priceLabel = typeof currentPrice === 'number' ? `$${currentPrice}` : 'Price not provided';

    const module0Context = module0Markdown || '[Module 0 — Data Loader output missing]';
    const module1Context = module1Markdown || '[Module 1 — Core Diagnostics output missing]';
    const module2Context = module2Markdown || '[Module 2 — Growth Engine output missing]';
    const module3Context = module3Markdown || '[Module 3 — Scenario Engine output missing]';
    const module4Context = module4Markdown || '[Module 4 — Valuation Engine output missing]';
    const module5Context = module5Markdown || '[Module 5 — Timing & Momentum output missing]';

    return `You are ValueBot.ai — Module 6: Final Verdict Synthesizer for ${tickerValue} (${companyLabel}).

Role: equity valuation assistant. Synthesize a final verdict from the prior module analyses without repeating long sections verbatim.

Timeframe lens: ${timeframeValue}.
Current price (if known): ${priceLabel}.

Output requirements — always start with the tables, then concise narratives:
1) One-liner summary table (single row):
   - Columns: Ticker | Risk | Quality | Timing | Composite Score (/10)
2) Final verdicts one-line table:
   - Columns: Risk | Quality | Timing
3) Standardized scorecard one-line table:
   - Columns: Debt & Balance Sheet Risk | Cash Flow Strength | Margins & Profitability | Competition & Moat | Timing & Momentum | Composite
4) Valuation ranges one-line table:
   - Columns: Bear | Base | Bull (fair value ranges)

Narrative sections (succinct, avoid walls of text):
- Restate current price context & long-term (5–15 years) perspective.
- Compressed downside & risk view.
- Compressed business model & growth durability view.
- Summarize scenario analysis & valuation with probabilities.
- Clear timing / entry-zone verdict: Buy / Hold / Wait / Avoid, with 3–5 short bullets.

Important instructions:
- Do NOT repeat large chunks of prior modules. Synthesize and compress.
- Always output tables first, followed by short narrative sections.
- Keep wording crisp and investment-oriented.

=== PRIOR MODULE CONTEXT (DO NOT REPEAT VERBATIM, JUST SYNTHESIZE) ===

[MODULE 0 — DATA LOADER]
${module0Context}

[MODULE 1 — CORE RISK & QUALITY DIAGNOSTICS]
${module1Context}

[MODULE 2 — BUSINESS MODEL & GROWTH ENGINE]
${module2Context}

[MODULE 3 — SCENARIO ENGINE]
${module3Context}

[MODULE 4 — VALUATION ENGINE]
${module4Context}

[MODULE 5 — TIMING & MOMENTUM]
${module5Context}`;
  }, [
    companyName,
    currentPrice,
    module0Markdown,
    module1Markdown,
    module2Markdown,
    module3Markdown,
    module4Markdown,
    module5Markdown,
    ticker,
    timeframe
  ]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader before running Module 6.');
      return;
    }

    if (!hasModule1Output || !hasModule2Output || !hasModule3Output || !hasModule4Output || !hasModule5Output) {
      setLocalError('Module 6 requires completed outputs from Modules 1–5. Please run any missing modules first.');
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
      updateContext?.({ module6Markdown: output, module6Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 6 right now.');
    }
  };

  const prerequisites = [
    { label: 'Module 1 — Core Risk & Quality Diagnostics', complete: hasModule1Output },
    { label: 'Module 2 — Business Model & Growth Engine', complete: hasModule2Output },
    { label: 'Module 3 — Scenario Engine', complete: hasModule3Output },
    { label: 'Module 4 — Valuation Engine', complete: hasModule4Output },
    { label: 'Module 5 — Timing & Momentum', complete: hasModule5Output }
  ];

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 6 — Final Verdict Synthesizer</h3>
        <p className="detail-meta">Combines prior module outputs into a single, investable verdict and standardized summary tables.</p>
        <p className="detail-meta">Uses deep-dive configuration plus completed Modules 1–5 to generate a concise final view.</p>
        {!hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 6 depends on the deep-dive configuration from Module 0.
          </div>
        )}
        {!canRunModule && hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 6 requires completed outputs from Modules 1–5. Please run any missing modules first.
          </div>
        )}
        <div className="detail-meta" aria-live="polite">
          <strong>Prerequisites checklist</strong>
          <ul>
            {prerequisites.map((item) => (
              <li key={item.label}>
                {item.complete ? '✅' : '⚠️'} {item.label}
              </li>
            ))}
          </ul>
          {!module0Markdown && (
            <p className="detail-meta" role="status">
              Module 0 output is not present. While not required, ensure the data loader has been run for best results.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
          title={!canRunModule ? 'Complete Modules 1–5 and set a ticker before running the Final Verdict Synthesizer.' : undefined}
        >
          {loading ? 'Running Module 6…' : 'Run Module 6 — Final Verdict Synthesizer'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Deep-Dive Configuration</h4>
        <p className="detail-meta">Read-only snapshot used for this final verdict run.</p>
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
      </div>

      <div className="detail-card">
        <h4>Final Verdict Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            No final verdict has been generated yet. Configure and run this module to synthesize the full analysis.
          </p>
        )}
        {loading && (
          <p className="detail-meta" role="status">
            Running Final Verdict Synthesizer…
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

export default Module6FinalVerdict;
