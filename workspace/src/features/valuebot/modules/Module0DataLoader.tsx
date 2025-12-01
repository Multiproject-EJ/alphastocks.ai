import { FunctionalComponent } from 'preact';
import { useMemo, useState, useEffect, useCallback, useContext } from 'preact/hooks';
import { useRunStockAnalysis } from '../../ai-analysis/useRunStockAnalysis.ts';
import {
  ValueBotModuleProps,
  ValueBotDeepDiveConfig,
  ValueBotContext,
  defaultDeepDiveConfig
} from '../types.ts';
import { useRunDeepDivePipeline } from '../useRunDeepDivePipeline.ts';

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openrouter', label: 'OpenRouter' }
];

const modelOptions = {
  openai: [
    { value: '', label: 'Use default (gpt-4o-mini)' },
    { value: 'gpt-4o', label: 'gpt-4o (quality)' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini (fast & cost effective)' },
    { value: 'gpt-4.1', label: 'gpt-4.1 (premium)' }
  ],
  gemini: [
    { value: '', label: 'Use default (gemini-1.5-flash)' },
    { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (quality)' },
    { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (fast)' }
  ],
  openrouter: [
    { value: '', label: 'Use default (openai/gpt-3.5-turbo)' },
    { value: 'openai/gpt-4o', label: 'openai/gpt-4o (quality)' },
    { value: 'openai/gpt-3.5-turbo', label: 'openai/gpt-3.5-turbo (fast & low cost)' },
    { value: 'mistralai/mistral-large', label: 'mistralai/mistral-large (balanced)' }
  ]
};

const Module0DataLoader: FunctionalComponent<ValueBotModuleProps> = ({ context, onUpdateContext }) => {
  const valueBot = useContext(ValueBotContext);
  const resolvedContext = valueBot?.context ?? context;
  const updateContext = valueBot?.updateContext ?? onUpdateContext;
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();
  const { runPipeline, pipelineProgress } = useRunDeepDivePipeline();
  const [localError, setLocalError] = useState<string | null>(null);
  const [config, setConfig] = useState<ValueBotDeepDiveConfig>(
    resolvedContext?.deepDiveConfig || defaultDeepDiveConfig
  );
  const [moduleOutput, setModuleOutput] = useState<string>(resolvedContext?.module0OutputMarkdown || '');

  useEffect(() => {
    if (resolvedContext?.module0OutputMarkdown && resolvedContext.module0OutputMarkdown !== moduleOutput) {
      setModuleOutput(resolvedContext.module0OutputMarkdown);
    }
  }, [moduleOutput, resolvedContext?.module0OutputMarkdown]);

  useEffect(() => {
    if (!resolvedContext?.deepDiveConfig) return;
    setConfig((prev) => ({
      ...prev,
      ...resolvedContext.deepDiveConfig
    }));
  }, [resolvedContext?.deepDiveConfig]);

  const prompt = useMemo(() => {
    const ticker = config?.ticker?.trim() || '[Not provided]';
    const timeframe = config?.timeframe?.trim() || 'General / not specified';
    const customQuestion = config?.customQuestion?.trim() || 'None provided';

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
  }, [config?.customQuestion, config?.ticker, config?.timeframe]);

  const handleConfigChange = useCallback(
    (updates: Partial<ValueBotDeepDiveConfig>) => {
      setConfig((prev) => {
        const nextConfig = { ...prev, ...updates };
        updateContext?.({ deepDiveConfig: nextConfig });
        return nextConfig;
      });
      setLocalError(null);
    },
    [updateContext]
  );

  const handleRun = async () => {
    setLocalError(null);

    if (!config?.ticker?.trim()) {
      setLocalError('Please enter a company or ticker to run Module 0.');
      return;
    }

    try {
      const response = await runAnalysis({
        provider: config.provider || 'openai',
        model: config.model || undefined,
        ticker: config.ticker,
        timeframe: config.timeframe || undefined,
        customQuestion: config.customQuestion || undefined,
        prompt
      });

      const output = response?.rawResponse || response?.summary || 'No response received from the AI provider.';
      setModuleOutput(output);
      updateContext?.({
        module0OutputMarkdown: output,
        deepDiveConfig: {
          ...config
        }
      });
    } catch (err) {
      setLocalError(err?.message || 'Unable to run Module 0 right now.');
    }
  };

  const providerModelOptions = modelOptions[config.provider as keyof typeof modelOptions] ?? modelOptions.openai;

  const pipelineSteps = [
    { key: 'module0', label: 'Module 0 — Data Loader' },
    { key: 'module1', label: 'Module 1 — Core Diagnostics' },
    { key: 'module2', label: 'Module 2 — Growth Engine' },
    { key: 'module3', label: 'Module 3 — Scenario Engine' },
    { key: 'module4', label: 'Module 4 — Valuation Engine' },
    { key: 'module5', label: 'Module 5 — Timing & Momentum' },
    { key: 'module6', label: 'Module 6 — Final Verdict' },
    { key: 'module7', label: 'Step 7 — Score Summary' }
  ];

  const isPipelineRunning = pipelineProgress?.status === 'running';

  return (
    <div className="detail-grid detail-grid--balanced">
      <div className="detail-card">
        <h3>Configure Deep Dive</h3>
        <p className="detail-meta">Provider, model, and ticker are stored for the deep-dive modules.</p>
        <div className="form-grid">
          <label className="form-field">
            <span>Provider</span>
            <select
              value={config.provider}
              onChange={(e) => handleConfigChange({ provider: e.currentTarget.value })}
            >
              {providerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Model (optional)</span>
            <select
              value={config.model ?? ''}
              onChange={(e) => handleConfigChange({ model: e.currentTarget.value })}
            >
              {providerModelOptions.map((option) => (
                <option key={`${config.provider}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Company or Ticker *</span>
            <input
              type="text"
              value={config.ticker}
              onInput={(e) => handleConfigChange({ ticker: e.currentTarget.value })}
              placeholder="e.g., AAPL or Apple"
              required
            />
          </label>
          <label className="form-field">
            <span>Timeframe (optional)</span>
            <input
              type="text"
              value={config.timeframe ?? ''}
              onInput={(e) => handleConfigChange({ timeframe: e.currentTarget.value })}
              placeholder="e.g., Last 5 years"
            />
          </label>
          <label className="form-field">
            <span>Custom Question (optional)</span>
            <textarea
              value={config.customQuestion ?? ''}
              onInput={(e) => handleConfigChange({ customQuestion: e.currentTarget.value })}
              rows={3}
              placeholder="Any special angle or note for the analysis"
            />
          </label>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleRun}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Running...' : 'Run Module 0 — Data Loader'}
        </button>
        {(localError || error) && (
          <div className="ai-error" role="alert">
            {localError || error}
          </div>
        )}

        <div className="detail-divider" aria-hidden="true" />
        <h4>Run Full Deep Dive</h4>
        <p className="detail-meta">
          Runs Modules 0–7 in sequence using separate AI calls for each step, finishing with the score summary. You can still
          run any module individually at any time.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={runPipeline}
          disabled={isPipelineRunning}
          aria-busy={isPipelineRunning}
        >
          {isPipelineRunning ? 'Running full deep dive…' : 'Run Full Deep Dive (0–7)'}
        </button>
        {pipelineProgress?.status === 'error' && pipelineProgress?.errorMessage && (
          <div className="ai-error" role="alert">
            {pipelineProgress.errorMessage}
          </div>
        )}
        {pipelineProgress?.status === 'success' && (
          <div className="detail-meta" role="status">
            Deep dive complete. Review the modules 0–7 results or re-run individual steps if needed.
          </div>
        )}
        <div className="detail-meta" style={{ marginTop: '0.75rem' }}>
          <strong>Pipeline Progress</strong>
          <ul className="detail-meta">
            {pipelineSteps.map((step) => (
              <li key={step.key}>
                {step.label}: {pipelineProgress?.steps?.[step.key as keyof typeof pipelineProgress.steps] || 'pending'}
              </li>
            ))}
          </ul>
        </div>
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
        {loading && (
          <p className="detail-meta" role="status">
            Fetching module output…
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
