import { useCallback, useContext } from 'preact/hooks';
import { useRunStockAnalysis } from '../ai-analysis/useRunStockAnalysis.ts';
import {
  DeepDivePipelineProgress,
  DeepDivePipelineStep,
  DeepDiveStepStatus,
  ValueBotContext,
  defaultDeepDiveConfig,
  defaultPipelineProgress
} from './types.ts';
import { useRunMasterMetaSummary } from './useRunMasterMetaSummary.ts';

const createInitialSteps = () => ({
  module0: 'pending' as DeepDiveStepStatus,
  module1: 'pending' as DeepDiveStepStatus,
  module2: 'pending' as DeepDiveStepStatus,
  module3: 'pending' as DeepDiveStepStatus,
  module4: 'pending' as DeepDiveStepStatus,
  module5: 'pending' as DeepDiveStepStatus,
  module6: 'pending' as DeepDiveStepStatus,
  scoreSummary: 'pending' as DeepDiveStepStatus
});

const buildModule0Prompt = (config = defaultDeepDiveConfig) => {
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
};

const buildModule1Prompt = (config = defaultDeepDiveConfig, module0Markdown?: string | null) => {
  const tickerValue = config?.ticker?.trim() || '[Not provided]';
  const timeframe = config?.timeframe?.trim() || 'General';
  const customQuestion = config?.customQuestion?.trim() || 'None';
  const module0Content = module0Markdown?.trim() || 'No prior Module 0 context available.';

  return `You are ValueBot.ai — MODULE 1: Core Risk & Quality Diagnostics.

This is the second step after MODULE 0 (Data Loader).
You will analyze the downside risks, balance sheet, cash flow strength, margins, profitability, and competitive moat.

Company/ticker: ${tickerValue}
Optional timeframe: ${timeframe}
Additional investor note: ${customQuestion}

Previous context from Module 0:
${module0Content}

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
};

const buildModule2Prompt = (
  config = defaultDeepDiveConfig,
  module0Markdown?: string | null,
  module1Markdown?: string | null
) => {
  const tickerValue = config?.ticker?.trim() || '[Not provided]';
  const timeframeValue = config?.timeframe?.trim() || 'General';
  const module0Context = module0Markdown?.trim() || '[No data]';
  const module1Context = module1Markdown?.trim() || '[Module 1 not run]';

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
};

const buildModule3Prompt = (
  config = defaultDeepDiveConfig,
  module0Markdown?: string | null,
  module1Markdown?: string | null,
  module2Markdown?: string | null
) => {
  const tickerValue = config?.ticker?.trim() || '[Ticker not set]';
  const timeframeValue = config?.timeframe?.trim() || '5–15 year horizon';
  const questionValue = config?.customQuestion?.trim() || 'No custom question provided.';
  const module0Context = module0Markdown?.trim() || '[Module 0 snapshot missing]';
  const module1Context = module1Markdown?.trim() || '[Module 1 diagnostics missing]';
  const module2Context = module2Markdown?.trim() || '[Module 2 growth engine missing]';
  const provider = config?.provider || 'openai';
  const model = config?.model?.trim() || 'Default';

  const configSummary = `Provider: ${provider}; Model: ${model}; Ticker: ${tickerValue}; Timeframe: ${timeframeValue}; Custom question: ${questionValue}`;

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
};

const buildModule4Prompt = (
  config = defaultDeepDiveConfig,
  module0Markdown?: string | null,
  module1Markdown?: string | null,
  module2Markdown?: string | null,
  module3Markdown?: string | null
) => {
  const tickerValue = config?.ticker?.trim() || '[Ticker not set]';
  const timeframeValue = config?.timeframe?.trim() || '5–15 year horizon';
  const module0Context = module0Markdown?.trim() || '[Module 0 — Data Loader output missing]';
  const module1Context = module1Markdown?.trim() || '[Module 1 — Core Diagnostics output missing]';
  const module2Context = module2Markdown?.trim() || '[Module 2 — Growth Engine output missing]';
  const module3Context = module3Markdown?.trim() || '[Module 3 — Scenario Engine output missing]';

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
};

const buildModule5Prompt = (
  config = defaultDeepDiveConfig,
  module1Markdown?: string | null,
  module3Markdown?: string | null,
  module4Markdown?: string | null
) => {
  const tickerValue = config?.ticker?.trim() || '[Ticker not set]';
  const timeframeValue = config?.timeframe?.trim() || '5–15 year horizon';
  const module1Context = module1Markdown?.trim() || '[Module 1 — Core Diagnostics output missing]';
  const module3Context = module3Markdown?.trim() || '[Module 3 — Scenario Engine output missing]';
  const module4Context = module4Markdown?.trim() || '[Module 4 — Valuation Engine output missing]';

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
};

const buildModule6Prompt = (
  config = defaultDeepDiveConfig,
  companyName?: string | null,
  currentPrice?: number | null,
  module0Markdown?: string | null,
  module1Markdown?: string | null,
  module2Markdown?: string | null,
  module3Markdown?: string | null,
  module4Markdown?: string | null,
  module5Markdown?: string | null
) => {
  const tickerValue = config?.ticker?.trim() || '[Ticker not set]';
  const timeframeValue = config?.timeframe?.trim() || '5–15 year horizon';
  const companyLabel = companyName?.trim() || 'the company';
  const priceLabel = typeof currentPrice === 'number' ? `$${currentPrice}` : 'Price not provided';

  const module0Context = module0Markdown?.trim() || '[Module 0 — Data Loader output missing]';
  const module1Context = module1Markdown?.trim() || '[Module 1 — Core Diagnostics output missing]';
  const module2Context = module2Markdown?.trim() || '[Module 2 — Growth Engine output missing]';
  const module3Context = module3Markdown?.trim() || '[Module 3 — Scenario Engine output missing]';
  const module4Context = module4Markdown?.trim() || '[Module 4 — Valuation Engine output missing]';
  const module5Context = module5Markdown?.trim() || '[Module 5 — Timing & Momentum output missing]';
  const hasModule5Output = Boolean(module5Markdown?.trim());
  const timingNote = hasModule5Output
    ? 'Timing signals from Module 5 are included below.'
    : 'Module 5 — Timing & Momentum has not been run. Proceed with the final verdict, but note that timing signals are missing.';

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
${module5Context}

${timingNote}`;
};

export const useRunDeepDivePipeline = () => {
  const valueBot = useContext(ValueBotContext);
  const { runAnalysis } = useRunStockAnalysis();
  const { runMasterMetaSummary } = useRunMasterMetaSummary();
  const currentContext = valueBot?.context;
  const updateContext = valueBot?.updateContext;
  const setPipelineProgress = valueBot?.setPipelineProgress;

  const pipelineProgress = currentContext?.pipelineProgress ?? defaultPipelineProgress;

  const resetPipeline = useCallback(() => {
    if (!setPipelineProgress) return;
    setPipelineProgress({
      ...defaultPipelineProgress,
      steps: createInitialSteps()
    });
  }, [setPipelineProgress]);

  const runPipeline = useCallback(async () => {
    if (!currentContext || !updateContext || !setPipelineProgress) {
      console.warn('ValueBot context is not available for the deep-dive pipeline.');
      return;
    }

    const config = currentContext?.deepDiveConfig ?? defaultDeepDiveConfig;
    const ticker = config.ticker?.trim();

    let latestContext = { ...currentContext };
    let latestModule6Markdown = '';
    let latestProgress: DeepDivePipelineProgress = {
      ...(currentContext?.pipelineProgress ?? defaultPipelineProgress),
      steps: createInitialSteps()
    };

    const missingTickerProgress: DeepDivePipelineProgress = {
      ...defaultPipelineProgress,
      status: 'error',
      errorMessage: 'Please enter a company or ticker to run the full deep dive pipeline.',
      steps: createInitialSteps()
    };

    if (!ticker) {
      latestProgress = missingTickerProgress;
      setPipelineProgress(missingTickerProgress);
      return {
        pipelineProgress: missingTickerProgress,
        coreModulesSucceeded: false,
        masterMetaGenerated: Boolean(latestContext.masterMeta)
      };
    }

    const areCoreStepsSuccessful = (steps: DeepDivePipelineProgress['steps']) =>
      ['module0', 'module1', 'module2', 'module3', 'module4', 'module5', 'module6'].every(
        (step) => steps[step as keyof DeepDivePipelineProgress['steps']] === 'done'
      );

    const buildResult = () => ({
      pipelineProgress: latestProgress,
      coreModulesSucceeded: areCoreStepsSuccessful(latestProgress.steps),
      masterMetaGenerated: Boolean(latestContext.masterMeta)
    });

    const safeSetProgress = (
      updater:
        | DeepDivePipelineProgress
        | ((prev: DeepDivePipelineProgress) => DeepDivePipelineProgress)
    ) => {
      const previous = latestProgress ?? { ...defaultPipelineProgress, steps: createInitialSteps() };
      const next = typeof updater === 'function' ? updater(previous) : updater;
      latestProgress = next;
      setPipelineProgress(next);
    };

    safeSetProgress({
      status: 'running',
      currentStep: 0,
      steps: createInitialSteps(),
      errorMessage: null
    });

    const runStep = async (
      stepKey: DeepDivePipelineStep,
      stepNumber: DeepDivePipelineProgress['currentStep'],
      promptBuilder: () => string,
      onSuccess: (output: string) => void
    ) => {
      safeSetProgress((prev) => ({
        ...prev,
        status: 'running',
        currentStep: stepNumber,
        steps: {
          ...prev.steps,
          [stepKey]: 'running'
        },
        errorMessage: null
      }));

      try {
        const response = await runAnalysis({
          provider: config.provider || 'openai',
          model: config.model || undefined,
          ticker,
          timeframe: config.timeframe || undefined,
          customQuestion: config.customQuestion || undefined,
          prompt: promptBuilder()
        });

        const output =
          response?.rawResponse ||
          response?.summary ||
          'No response received from the AI provider.';

        onSuccess(output);

        safeSetProgress((prev) => ({
          ...prev,
          status: 'running',
          currentStep: null,
          steps: {
            ...prev.steps,
            [stepKey]: 'done'
          }
        }));
        return output;
      } catch (error: any) {
        const message = error?.message || `Module ${stepNumber} failed.`;
        safeSetProgress((prev) => ({
          ...prev,
          status: 'error',
          currentStep: stepNumber,
          steps: {
            ...prev.steps,
            [stepKey]: 'error'
          },
          errorMessage: message
        }));
        throw error;
      }
    };

    try {
      const module0Output = await runStep('module0', 0, () => buildModule0Prompt(config), (output) => {
        latestContext = {
          ...latestContext,
          module0OutputMarkdown: output,
          deepDiveConfig: { ...config }
        };
        updateContext(latestContext);
      });

      const module1Output = await runStep(
        'module1',
        1,
        () => buildModule1Prompt(config, module0Output || currentContext?.module0OutputMarkdown),
        (output) => {
          latestContext = {
            ...latestContext,
            module1OutputMarkdown: output
          };
          updateContext(latestContext);
        }
      );

      const module2Output = await runStep(
        'module2',
        2,
        () =>
          buildModule2Prompt(
            config,
            module0Output || currentContext?.module0OutputMarkdown,
            module1Output || currentContext?.module1OutputMarkdown
          ),
        (output) => {
          latestContext = {
            ...latestContext,
            module2Markdown: output
          };
          updateContext(latestContext);
        }
      );

      const module3Output = await runStep(
        'module3',
        3,
        () =>
          buildModule3Prompt(
            config,
            module0Output || currentContext?.module0OutputMarkdown,
            module1Output || currentContext?.module1OutputMarkdown,
            module2Output || currentContext?.module2Markdown
          ),
        (output) => {
          latestContext = {
            ...latestContext,
            module3Markdown: output,
            module3Output: output
          };
          updateContext(latestContext);
        }
      );

      const module4Output = await runStep(
        'module4',
        4,
        () =>
          buildModule4Prompt(
            config,
            module0Output || currentContext?.module0OutputMarkdown,
            module1Output || currentContext?.module1OutputMarkdown,
            module2Output || currentContext?.module2Markdown,
            module3Output || currentContext?.module3Markdown
          ),
        (output) => {
          latestContext = {
            ...latestContext,
            module4Markdown: output,
            module4Output: output
          };
          updateContext(latestContext);
        }
      );

      const module5Output = await runStep(
        'module5',
        5,
        () =>
          buildModule5Prompt(
            config,
            module1Output || currentContext?.module1OutputMarkdown,
            module3Output || currentContext?.module3Markdown,
            module4Output || currentContext?.module4Markdown
          ),
        (output) => {
          latestContext = {
            ...latestContext,
            module5Markdown: output,
            module5Output: output
          };
          updateContext(latestContext);
        }
      );

      const module6Output = await runStep(
        'module6',
        6,
        () =>
          buildModule6Prompt(
            config,
            currentContext?.companyName,
            currentContext?.currentPrice ?? null,
            module0Output || currentContext?.module0OutputMarkdown,
            module1Output || currentContext?.module1OutputMarkdown,
            module2Output || currentContext?.module2Markdown,
            module3Output || currentContext?.module3Markdown,
            module4Output || currentContext?.module4Markdown,
            module5Output || currentContext?.module5Markdown
        ),
        (output) => {
          latestContext = {
            ...latestContext,
            module6Markdown: output,
            module6Output: output
          };
          latestModule6Markdown = (output || '').trim();
          updateContext(latestContext);
        }
      );

      const module6Markdown = (module6Output || latestContext?.module6Markdown || '').trim();
      const tickerSymbol = latestContext?.deepDiveConfig?.ticker?.trim() || '';

      console.debug('[ValueBot] Starting Step 7 — Score Summary', {
        ticker: tickerSymbol,
        hasModule6Markdown: Boolean(module6Markdown)
      });

      safeSetProgress((prev) => ({
        ...prev,
        status: 'running',
        currentStep: 7,
        errorMessage: null,
        steps: {
          ...prev.steps,
          scoreSummary: 'running'
        }
      }));

      try {
        const primaryMarkdown = (latestModule6Markdown && latestModule6Markdown.trim()) || undefined;
        let { meta, error } = await runMasterMetaSummary(primaryMarkdown);

        const needsRetry =
          !meta &&
          Boolean(error) &&
          error.toLowerCase().includes('master markdown is required');

        if (needsRetry) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          ({ meta, error } = await runMasterMetaSummary(primaryMarkdown));
        }

        if (meta) {
          latestContext = {
            ...latestContext,
            masterMeta: meta ?? null
          };
          updateContext(latestContext);
          console.debug('[ValueBot] Step 7 meta generation succeeded', {
            ticker: tickerSymbol,
            risk: meta?.risk_label,
            quality: meta?.quality_label,
            timing: meta?.timing_label,
            score: meta?.composite_score
          });
          safeSetProgress((prev) => ({
            ...prev,
            status: 'success',
            currentStep: null,
            errorMessage: null,
            steps: {
              ...prev.steps,
              scoreSummary: 'done'
            }
          }));
        } else {
          const fallbackMessage =
            error ||
            'Unable to generate score summary automatically. You can open Module 6 and click “Update score summary” or “Save to Universe” to refresh it manually.';
          console.debug('[ValueBot] Step 7 meta generation failed', { ticker: tickerSymbol, error: fallbackMessage });
          safeSetProgress((prev) => ({
            ...prev,
            status: 'error',
            currentStep: 7,
            steps: {
              ...prev.steps,
              scoreSummary: 'error'
            },
            errorMessage: fallbackMessage
          }));
        }
      } catch (err: any) {
        const errorMessage =
          err?.message ||
          'Unexpected error while generating score summary. Try rerunning or update it from Module 6.';
        console.debug('[ValueBot] Step 7 meta generation threw', { ticker: tickerSymbol, errorMessage });
        safeSetProgress((prev) => ({
          ...prev,
          status: 'error',
          currentStep: 7,
          steps: {
            ...prev.steps,
            scoreSummary: 'error'
          },
          errorMessage
        }));
      }
      return buildResult();
    } catch (error) {
      // Errors are handled inside runStep; no additional action required here.
      return buildResult();
    }

    return buildResult();
  }, [currentContext, runAnalysis, runMasterMetaSummary, setPipelineProgress, updateContext]);

  return { runPipeline, resetPipeline, pipelineProgress };
};
