import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';

const Module3ScenarioEngine: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module3Markdown || '');

  const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
  const ticker = deepDiveConfig?.ticker?.trim();
  const timeframe = deepDiveConfig?.timeframe?.trim();
  const model = deepDiveConfig?.model?.trim();
  const provider = deepDiveConfig?.provider || 'openai';
  const customQuestion = deepDiveConfig?.customQuestion?.trim();

  const module0Markdown = resolvedContext?.module0OutputMarkdown?.trim();
  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();
  const module2Markdown = resolvedContext?.module2Markdown?.trim();

  const hasTicker = Boolean(ticker);
  const hasModule1Output = Boolean(module1Markdown);
  const hasModule2Output = Boolean(module2Markdown);
  const canRunModule = hasTicker && hasModule1Output && hasModule2Output;

  useEffect(() => {
    if (resolvedContext?.module3Markdown && resolvedContext.module3Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module3Markdown);
    }
  }, [moduleOutput, resolvedContext?.module3Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = ticker || '[Ticker not set]';
    const timeframeValue = timeframe || '5–15 year horizon';
    const questionValue = customQuestion || 'No custom question provided.';
    const module0Context = module0Markdown || '[Module 0 snapshot missing]';
    const module1Context = module1Markdown || '[Module 1 diagnostics missing]';
    const module2Context = module2Markdown || '[Module 2 growth engine missing]';

    const configSummary = `Provider: ${provider || 'openai'}; Model: ${model || 'Default'}; Ticker: ${tickerValue}; Timeframe: ${timeframeValue}; Custom question: ${questionValue}`;

    return `You are ValueBot.ai — Module 3: Scenario Engine (Bear / Base / Bull).

Use ONLY the provided context blocks (Config, Module 0, Module 1, Module 2). Build three coherent long-term scenarios for this company over a 5–15 year lens. Respect downside risks, competitive position, and growth opportunities already discussed.

First, output a markdown table with columns: Scenario | Revenue CAGR | Margin Outlook | Free Cash Flow | Key Risks | 5Y Valuation Range | 15Y Valuation Range.
Then output concise narrative paragraphs for each scenario (Bear/Base/Bull), clearly labeled. Avoid adding extra headings beyond a reasonable “### Scenario Analysis” and “### Narrative.”

Context:
Config: ${configSummary}
Module 0 snapshot:
${module0Context}
Module 1 diagnostics:
${module1Context}
Module 2 business model & growth:
${module2Context}`;
  }, [customQuestion, model, module0Markdown, module1Markdown, module2Markdown, provider, ticker, timeframe]);

  const handleRun = async () => {
    setLocalError(null);

    if (!canRunModule) {
      setLocalError('Please run Module 0, then Module 1, then Module 2 before using the Scenario Engine.');
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
      updateContext?.({ module3Markdown: output, module3Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 3 right now.');
    }
  };

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 3 — Scenario Engine (Bear / Base / Bull)</h3>
        <p className="detail-meta">
          Build three long-term outcomes over 5–15 years that reflect risks, moat durability, and growth vectors.
        </p>
        <p className="detail-meta">
          {hasTicker
            ? `Scenario analysis for ${resolvedContext?.deepDiveConfig?.ticker}`
            : 'Configure Module 0 to set your ticker and provider before running Module 3.'}
        </p>
        {!canRunModule && (
          <div className="demo-banner warning" role="status">
            Module 3 depends on the deep-dive configuration and completed Modules 1 and 2. Please run Module 0, then
            Module 1, then Module 2 before using the Scenario Engine.
          </div>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
          title={!canRunModule ? 'Run Modules 0, 1, and 2 first.' : undefined}
        >
          {loading ? 'Running...' : 'Run Module 3 — Scenario Engine'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}
      </div>

      <div className="detail-card">
        <h4>Deep-Dive Configuration</h4>
        <p className="detail-meta">Read-only snapshot used for this scenario run.</p>
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
        </dl>
        {!hasModule1Output && (
          <p className="detail-meta" role="status">Core diagnostics (Module 1) are required before running scenarios.</p>
        )}
        {!hasModule2Output && (
          <p className="detail-meta" role="status">Business model & growth output (Module 2) is required.</p>
        )}
      </div>

      <div className="detail-card">
        <h4>Scenario Engine Output</h4>
        {moduleOutput ? (
          <div className="ai-raw-response" style={{ whiteSpace: 'pre-wrap' }}>
            {moduleOutput}
          </div>
        ) : (
          <p className="detail-meta">
            Run the Scenario Engine to generate Bear, Base, and Bull markdown with valuation ranges over 5–15 years.
          </p>
        )}
        {loading && (
          <p className="detail-meta" role="status">
            Running Scenario Engine…
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

export default Module3ScenarioEngine;
