import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module5TimingMomentum: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module5Markdown || '');

  const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
  const ticker = deepDiveConfig?.ticker?.trim();
  const timeframe = deepDiveConfig?.timeframe?.trim();
  const model = deepDiveConfig?.model?.trim();
  const provider = deepDiveConfig?.provider || 'openai';
  const customQuestion = deepDiveConfig?.customQuestion?.trim();

  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();
  const module3Markdown = resolvedContext?.module3Markdown?.trim();
  const module4Markdown = resolvedContext?.module4Markdown?.trim();

  const hasTicker = Boolean(ticker);
  const hasModule3Output = Boolean(module3Markdown);
  const hasModule4Output = Boolean(module4Markdown);
  const canRunModule = hasTicker && hasModule3Output && hasModule4Output;

  useEffect(() => {
    if (resolvedContext?.module5Markdown && resolvedContext.module5Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module5Markdown);
    }
  }, [moduleOutput, resolvedContext?.module5Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Ticker not set]';
    const timeframeValue = timeframe || '5–15 year horizon';
    const module1Context = module1Markdown || '[Module 1 — Core Diagnostics output missing]';
    const module3Context = module3Markdown || '[Module 3 — Scenario Engine output missing]';
    const module4Context = module4Markdown || '[Module 4 — Valuation Engine output missing]';

    return `You are ValueBot.ai — Module 5: Timing & Momentum for ${tickerValue}.

Timeframe context: ${timeframeValue}.

Use the following prior module outputs as your context:
[Module 1 — Core Risk & Quality Diagnostics]
${module1Context}

[Module 3 — Scenario Engine (Bear / Base / Bull)]
${module3Context}

[Module 4 — Valuation Engine]
${module4Context}

Task — MODULE 5: Timing & Momentum
1) Provide a concise heading for the timing/momentum read.
2) Assess setup & sentiment (qualitative) using scenario/valuation context. Discuss short-term vs long-term skew.
3) Evaluate risk & momentum alignment: does recent narrative/positioning support upside? Mention catalysts & risks (earnings, regulatory, macro, competitive shifts).
4) Describe entry zones in words (no prices):
   - Accumulation Zone (cheap but earlier, more volatility)
   - Buy Zone (strong expected long-term CAGR)
   - Strong Buy Zone (rare deep value, where 25–65% CAGR could be realistic given scenarios & quality)
5) Deliver a clear Timing verdict: Buy / Hold / Wait / Avoid, with a 1–2 sentence rationale tying back to scenarios and valuation cushions.

Output format: markdown narrative with short heading, then bullet or mini-subhead sections for setup & sentiment, risk & momentum alignment, entry zone narrative (Accumulation/Buy/Strong Buy), and final Timing verdict with explanation.`;
  }, [module1Markdown, module3Markdown, module4Markdown, ticker, timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader before running Module 5.');
      return;
    }

    if (!hasModule3Output) {
      setLocalError('Module 5 requires completed scenarios from Module 3 — Scenario Engine.');
      return;
    }

    if (!hasModule4Output) {
      setLocalError('Module 5 requires valuation output from Module 4 — Valuation Engine.');
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
      updateContext?.({ module5Markdown: output, module5Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 5 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 5 — Timing &amp; Momentum</h3>
        <p className="detail-meta">
          Blend momentum, sentiment, catalysts, and valuation anchors to decide when to act.
        </p>
        <p className="detail-meta">
          Depends on deep-dive config from Module 0 plus completed Scenario Engine (Module 3) and Valuation Engine (Module 4).
        </p>
        {!hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 5 depends on the deep-dive configuration from Module 0.
          </div>
        )}
        {!hasModule3Output && hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 5 requires completed scenarios. Run Module 3 — Scenario Engine first.
          </div>
        )}
        {!hasModule4Output && hasTicker && hasModule3Output && (
          <div className="demo-banner warning" role="status">
            Module 5 requires valuation output. Run Module 4 — Valuation Engine before proceeding.
          </div>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
          title={!canRunModule ? 'Complete Modules 0, 3, and 4 before running Timing & Momentum.' : undefined}
        >
          {loading ? 'Running Module 5…' : 'Run Module 5 — Timing & Momentum'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Deep-Dive Configuration</h4>
        <p className="detail-meta">Read-only snapshot used for this timing run.</p>
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
            Scenario output (Module 3) is required before running timing &amp; momentum.
          </p>
        )}
        {!hasModule4Output && (
          <p className="detail-meta" role="status">
            Valuation output (Module 4) is required before running timing &amp; momentum.
          </p>
        )}
      </div>

      <div className="detail-card">
        <h4>Timing &amp; Momentum Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run Module 5 to get a timing and momentum narrative that leverages scenario and valuation context.
          </p>
        )}
        {loading && (
          <p className="detail-meta" role="status">
            Running Timing &amp; Momentum…
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

export default Module5TimingMomentum;
