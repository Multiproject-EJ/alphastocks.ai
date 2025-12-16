import { FunctionalComponent } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import { MASTER_STOCK_ANALYSIS_INSTRUCTIONS } from '../prompts/masterStockAnalysisPrompt.ts';
import { renderPromptTemplate } from '../promptTemplateRenderer.ts';
import { ValueBotContext, ValueBotModuleProps } from '../types.ts';
import { useSaveDeepDiveToUniverse } from '../useSaveDeepDiveToUniverse.ts';
import { useRunMasterMetaSummary } from '../useRunMasterMetaSummary.ts';
import VerdictCard from '../components/VerdictCard.tsx';

const Module6FinalVerdict: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module6Markdown || '');

  const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
  const ticker =
    resolvedContext?.ticker?.trim() || deepDiveConfig?.ticker?.trim() || '';
  const timeframe = deepDiveConfig?.timeframe?.trim();
  const model = deepDiveConfig?.model?.trim();
  const provider = deepDiveConfig?.provider || 'openai';
  const customQuestion = deepDiveConfig?.customQuestion?.trim();

  const companyName =
    resolvedContext?.companyName?.trim() ||
    deepDiveConfig?.companyName?.trim() ||
    ticker ||
    '';
  const companyNameLabel =
    companyName ||
    resolvedContext?.deepDiveConfig?.companyName?.trim() ||
    resolvedContext?.deepDiveConfig?.ticker?.trim() ||
    'the company';
  const tickerLabel = ticker || resolvedContext?.deepDiveConfig?.ticker?.trim() || '';
  const currentPrice = resolvedContext?.currentPrice;

  const module0Markdown = resolvedContext?.module0OutputMarkdown?.trim();
  const module1Markdown = resolvedContext?.module1OutputMarkdown?.trim();
  const module2Markdown = resolvedContext?.module2Markdown?.trim();
  const module3Markdown = resolvedContext?.module3Markdown?.trim();
  const module4Markdown = resolvedContext?.module4Markdown?.trim();
  const module5Markdown = resolvedContext?.module5Markdown?.trim();
  const module6Markdown = resolvedContext?.module6Markdown?.trim();
  const { runMasterMetaSummary, loading: isGeneratingMeta, error: metaError, meta: hookMasterMeta } =
    useRunMasterMetaSummary();

  const hasTicker = Boolean(tickerLabel);
  const hasModule1Output = Boolean(module1Markdown);
  const hasModule2Output = Boolean(module2Markdown);
  const hasModule3Output = Boolean(module3Markdown);
  const hasModule4Output = Boolean(module4Markdown);
  const hasModule5Output = Boolean(module5Markdown);
  const hasModule6Output = Boolean(module6Markdown);
  const hasModule6Text = Boolean((moduleOutput || module6Markdown || '').trim());

  const canRunModule = hasTicker && hasModule1Output && hasModule2Output && hasModule3Output && hasModule4Output;

  const { saveDeepDive, isSaving: isSavingDeepDive, saveError, saveWarning, saveSuccess } = useSaveDeepDiveToUniverse();
  const canSaveDeepDive = hasTicker && hasModule6Output;
  const masterMeta = hookMasterMeta ?? resolvedContext?.masterMeta ?? null;
  const isBusy = isSavingDeepDive || isGeneratingMeta;
  const saveButtonLabel = isSavingDeepDive ? 'Saving…' : 'Save to Universe';

  useEffect(() => {
    if (resolvedContext?.module6Markdown && resolvedContext.module6Markdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module6Markdown);
    }
  }, [moduleOutput, resolvedContext?.module6Markdown]);

  const prompt = useMemo(() => {
    const tickerValue = tickerLabel || '[Ticker not set]';
    const timeframeValue = timeframe || '5–15 year horizon';
    const companyLabel = companyNameLabel;
    const priceLabel = typeof currentPrice === 'number' ? `$${currentPrice}` : 'Price not provided';
    const modelLabel = model || 'Default model for provider';

    const module0Context = module0Markdown || '[Module 0 — Data Loader output missing. Proceed and highlight uncertainty.]';
    const module1Context = module1Markdown || '[Module 1 — Core Diagnostics output missing. Proceed and highlight uncertainty.]';
    const module2Context = module2Markdown || '[Module 2 — Growth Engine output missing. Proceed and highlight uncertainty.]';
    const module3Context = module3Markdown || '[Module 3 — Scenario Engine output missing. Proceed and highlight uncertainty.]';
    const module4Context = module4Markdown || '[Module 4 — Valuation Engine output missing. Proceed and highlight uncertainty.]';
    const module5Context = module5Markdown || '[Module 5 — Timing & Momentum output missing. Proceed and highlight uncertainty.]';

    const missingSignals = [
      !module0Markdown && 'Module 0 data loader',
      !module1Markdown && 'Module 1 risk diagnostics',
      !module2Markdown && 'Module 2 business model',
      !module3Markdown && 'Module 3 scenario engine',
      !module4Markdown && 'Module 4 valuation engine',
      !module5Markdown && 'Module 5 timing & momentum'
    ].filter(Boolean);

    const missingNotice = missingSignals.length
      ? `Some modules were missing (${missingSignals.join(', ')}). Do your best, but clearly indicate uncertainty where inputs are sparse.`
      : 'All prior modules are present. Synthesize confidently while staying concise.';

    // Assemble a single prompt that carries the deep-dive config snapshot, source materials from modules 0–5,
    // and the MASTER instructions that define the required tables and narrative sections. The AI should not
    // repeat the prior modules verbatim; it should synthesize them into the standardized MASTER output.
    return `You are ValueBot.ai — Module 6: Final Verdict Synthesizer for ${tickerValue} (${companyLabel}).

Role: equity valuation copilot. Produce the MASTER STOCK ANALYSIS as standardized markdown tables plus concise narrative sections.

Deep-dive configuration snapshot:
- Provider: ${provider}
- Model: ${modelLabel}
- Ticker: ${tickerValue}
- Timeframe: ${timeframeValue}
- Custom question: ${customQuestion || 'None provided'}
- Current price: ${priceLabel}

Source materials to synthesize (do NOT paste verbatim):
=== MODULE 0 – Data Loader Snapshot ===
${module0Context}

=== MODULE 1 – Core Risk & Quality Diagnostics ===
${module1Context}

=== MODULE 2 – Business Model & Growth Engine ===
${module2Context}

=== MODULE 3 – Scenario Engine (Bear/Base/Bull) ===
${module3Context}

=== MODULE 4 – Valuation Engine ===
${module4Context}

=== MODULE 5 – Timing & Momentum ===
${module5Context}

${missingNotice}

Follow the MASTER STOCK ANALYSIS instructions exactly below. Output must be valid GitHub-flavored markdown, with the four tables first, then headings 0–6 with clear paragraphs.
${MASTER_STOCK_ANALYSIS_INSTRUCTIONS}`;
  }, [
    companyName,
    currentPrice,
    customQuestion,
    model,
    module0Markdown,
    module1Markdown,
    module2Markdown,
    module3Markdown,
    module4Markdown,
    module5Markdown,
    provider,
    ticker,
    timeframe
  ]);

  const handleRun = async () => {
    setLocalError(null);

    if (!hasTicker) {
      setLocalError('Please configure and run Module 0 — Data Loader before running Module 6.');
      return;
    }

    if (!hasModule1Output || !hasModule2Output || !hasModule3Output || !hasModule4Output) {
      setLocalError('Module 6 requires completed outputs from Modules 1–4. Please run any missing modules first.');
      return;
    }

    try {
      const renderedPrompt = renderPromptTemplate(
        prompt,
        {
          ticker: tickerLabel,
          companyName: companyNameLabel,
          deepDiveConfig,
          module0Markdown,
          module1Markdown,
          module2Markdown,
          module3Markdown,
          module4Markdown,
          module5Markdown
        },
        'Module 6 — Final Verdict'
      );
      const response = await runAnalysis({
        provider,
        model: model || undefined,
        ticker: ticker!,
        timeframe: timeframe || undefined,
        customQuestion: customQuestion || undefined,
        prompt: renderedPrompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      updateContext?.({ module6Markdown: output, module6Output: output });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 6 right now.');
    }
  };

  const handleGenerateMetaSummary = async () => {
    if (!hasModule6Text || !ticker) {
      return;
    }

    setLocalWarning(null);

    const { meta, error: metaGenerationError } = await runMasterMetaSummary();

    if (metaGenerationError || !meta) {
      setLocalWarning(metaGenerationError || 'Unable to refresh the score summary right now.');
    }
  };

  const handleSaveToUniverse = async () => {
    if (!hasTicker) {
      setLocalError('Run Module 0 to configure the deep dive first.');
      return;
    }

    if (!hasModule6Output) {
      setLocalError('Run Module 6 to generate the final report first.');
      return;
    }

    setLocalError(null);
    setLocalWarning(null);

    try {
      const result = await saveDeepDive();

      if (result?.error) {
        setLocalError(result.error);
      }

      if (result?.metadataWarning) {
        setLocalWarning(result.metadataWarning);
      }
    } catch (err) {
      setLocalError(err?.message || 'Unable to save deep dive right now.');
    }
  };

  const prerequisites = [
    { label: 'Module 1 — Core Risk & Quality Diagnostics', complete: hasModule1Output },
    { label: 'Module 2 — Business Model & Growth Engine', complete: hasModule2Output },
    { label: 'Module 3 — Scenario Engine', complete: hasModule3Output },
    { label: 'Module 4 — Valuation Engine', complete: hasModule4Output },
    { label: 'Module 5 — Timing & Momentum (optional for timing signals)', complete: hasModule5Output }
  ];

  // Parse valuation ranges from markdown output
  const parseValuationRanges = (markdown: string): { bear?: string; base?: string; bull?: string } | null => {
    if (!markdown) return null;
    
    // Look for the Valuation Ranges table (Table D)
    const tableMatch = markdown.match(/\|\s*Bear\s*\|\s*Base\s*\|\s*Bull\s*\|[^\n]*\n\|[^\n]+\n\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/i);
    
    if (tableMatch) {
      return {
        bear: tableMatch[1]?.trim(),
        base: tableMatch[2]?.trim(),
        bull: tableMatch[3]?.trim()
      };
    }
    
    return null;
  };

  const valuationRanges = useMemo(() => {
    return parseValuationRanges(moduleOutput || module6Markdown || '');
  }, [moduleOutput, module6Markdown]);

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>MODULE 6 — Final Verdict Synthesizer</h3>
        <p className="detail-meta">Synthesizes Modules 0–5 into a MASTER Stock Analysis with standardized tables and narrative sections.</p>
        <p className="detail-meta">Uses the deep-dive configuration and prior module markdown to generate the final verdict in one pass.</p>
        {!hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 6 depends on the deep-dive configuration from Module 0.
          </div>
        )}
        {!canRunModule && hasTicker && (
          <div className="demo-banner warning" role="status">
            Module 6 requires completed outputs from Modules 1–4. Please run any missing modules first.
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
          {!hasModule5Output && (
            <p className="detail-meta" role="status">
              Module 5 — Timing & Momentum has not been run yet. You can still run the Final Verdict, but it will omit Module 5 timing signals.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading || !canRunModule}
          aria-busy={loading}
          title={!canRunModule ? 'Complete Modules 1–4 and set a ticker before running the Final Verdict Synthesizer.' : undefined}
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
        <div className="detail-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleGenerateMetaSummary}
            disabled={!hasModule6Text || isBusy}
            aria-busy={isBusy}
            title={!hasModule6Text ? 'Generate the MASTER report before requesting a score summary.' : undefined}
          >
            {isGeneratingMeta
              ? 'Generating score summary…'
              : masterMeta
                ? 'Update score summary'
                : 'Generate score summary'}
          </button>
          {!hasModule6Text && (
            <span className="detail-meta" role="status">
              Run Module 6 to enable the score summary.
            </span>
          )}
          {metaError && (
            <div className="ai-error" role="status">
              {metaError}
            </div>
          )}
        </div>
      </div>

      <div className="detail-card">
        <h4>Score summary (Risk / Quality / Timing / Score)</h4>
        <p className="detail-meta">
          Scores are generated automatically when you run the full deep-dive pipeline. Use “Update score summary” if you want
          to refresh them manually.
        </p>
        {masterMeta ? (
          <dl className="detail-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <dt>Risk</dt>
              <dd>{masterMeta?.risk_label}</dd>
            </div>
            <div>
              <dt>Quality</dt>
              <dd>{masterMeta?.quality_label}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{masterMeta?.timing_label}</dd>
            </div>
            <div>
              <dt>Composite score</dt>
              <dd>{masterMeta?.composite_score}</dd>
            </div>
          </dl>
        ) : (
          <p className="detail-meta" role="status">
            No score summary generated yet. Run the MASTER report, then click “Generate score summary.”
          </p>
        )}
      </div>

      {/* Visual Verdict Card - Snapshot View */}
      {masterMeta && hasTicker && (
        <div className="detail-card">
          <h4>Visual Snapshot Card</h4>
          <p className="detail-meta">
            A quick-glance visual summary of the analysis results, perfect for sharing or quick reference.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <VerdictCard
              ticker={tickerLabel}
              companyName={companyNameLabel}
              masterMeta={masterMeta}
              valuationRanges={valuationRanges}
            />
          </div>
        </div>
      )}

      <div className="detail-card">
        <h4>Save deep-dive to Investing Universe</h4>
        <p className="detail-meta">
          Save the complete ValueBot deep dive (Modules 0–7, including the score summary) and ensure this ticker is added to your Investing Universe
          tracker.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSaveToUniverse}
          disabled={!canSaveDeepDive || isBusy}
          aria-busy={isBusy}
          title={!canSaveDeepDive ? 'Complete the deep-dive configuration and run Module 6 before saving.' : undefined}
        >
          {saveButtonLabel}
        </button>
        {!hasTicker && (
          <p className="detail-meta" role="status">
            Run Module 0 to configure the deep dive first.
          </p>
        )}
        {hasTicker && !hasModule6Output && (
          <p className="detail-meta" role="status">
            Run Module 6 to generate the final report first.
          </p>
        )}
        {isSavingDeepDive && (
          <p className="detail-meta" role="status">
            Saving deep dive…
          </p>
        )}
        {saveSuccess && (
          <p className="detail-meta" role="status">
            Saved to Universe ✔
          </p>
        )}
        {localWarning && (
          <p className="detail-meta" role="status">
            {localWarning}
          </p>
        )}
        {saveError && (
          <div className="ai-error" role="status">
            {saveError}
          </div>
        )}
        {saveWarning && (
          <p className="detail-meta" role="status">
            {saveWarning}
          </p>
        )}
      </div>
    </div>
  );
};

export default Module6FinalVerdict;
