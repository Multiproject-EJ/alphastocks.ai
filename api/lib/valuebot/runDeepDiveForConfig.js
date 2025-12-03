// NOTE: There are two versions of runDeepDiveForConfig:
// - workspace/src/features/valuebot/runDeepDiveForConfig.ts (front-end / type-safe)
// - api/lib/valuebot/runDeepDiveForConfig.js (serverless worker)
// Keep their behavior in sync when making pipeline changes.

const PROTECTION_BYPASS_TOKEN = process.env.VERCEL_PROTECTION_BYPASS;
const VALUEBOT_API_BASE_URL = process.env.VALUEBOT_API_BASE_URL || '';

function resolveApiBaseUrl() {
  if (VALUEBOT_API_BASE_URL) {
    return VALUEBOT_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    return '';
  }

  const envUrl =
    process.env.SITE_URL ||
    process.env.VERCEL_URL ||
    process.env.DEPLOYMENT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PUBLIC_URL;

  if (envUrl) {
    const normalized = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
    return normalized.replace(/\/$/, '');
  }

  return '';
}

export function buildApiUrl(path) {
  const base = resolveApiBaseUrl();
  if (!base) return path;
  return `${base}${path}`;
}

const stockAnalysisUrl = buildApiUrl('/api/stock-analysis');
const masterMetaSummaryUrl = buildApiUrl('/api/master-meta-summary');

export async function safeJsonFetch(stageLabel = 'unknown_stage', url, init = {}) {
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (PROTECTION_BYPASS_TOKEN) {
    headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_TOKEN);
  }

  const finalInit = { ...init, headers };

  const res = await fetch(url, finalInit);
  const text = await res.text();
  const contentType = res.headers?.get?.('content-type') || '';
  const snippet = text.slice(0, 300);

  console.error('[ValueBot Worker fetch]', {
    stageLabel,
    url,
    status: res.status,
    contentType,
    snippet
  });

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`[stage=${stageLabel}] Non-JSON response from ${url} (status ${res.status})`);
  }

  try {
    const json = JSON.parse(text);
    return { json, status: res.status, ok: res.ok };
  } catch (err) {
    throw new Error(
      `[stage=${stageLabel}] JSON parse failed from ${url} (status ${res.status}): ${String(err)}`
    );
  }
}

export async function analyzeStockAPI({ provider, model, ticker, question, timeframe, stageLabel }) {
  try {
    const { json, ok } = await safeJsonFetch(stageLabel || 'module_0_data_loader', stockAnalysisUrl, {
      method: 'POST',
      body: JSON.stringify({
        provider: provider || 'openai',
        model,
        ticker,
        question,
        timeframe
      })
    });

    if (!ok) {
      return {
        data: null,
        error: json?.message || 'HTTP error'
      };
    }

    return {
      data: json,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err?.message || 'Failed to analyze stock'
    };
  }
}

function getDefaultModelForProvider(provider) {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    default:
      return null;
  }
}

function resolveEffectiveModelId(provider, rawModel) {
  const trimmedModel = rawModel?.trim();
  if (trimmedModel) return trimmedModel;
  return getDefaultModelForProvider(provider);
}

export const defaultDeepDiveConfig = {
  provider: 'openai',
  model: '',
  ticker: '',
  companyName: '',
  currency: '',
  timeframe: '',
  customQuestion: '',
  profileId: null
};

export const createInitialSteps = () => ({
  module0: 'pending',
  module1: 'pending',
  module2: 'pending',
  module3: 'pending',
  module4: 'pending',
  module5: 'pending',
  module6: 'pending',
  scoreSummary: 'pending'
});

/**
 * @typedef {'module0' | 'module1' | 'module2' | 'module3' | 'module4' | 'module5' | 'module6' | 'scoreSummary'} DeepDiveStepKey
 */

/**
 * @typedef {Object} DeepDiveRunResult
 * @property {boolean} success
 * @property {string} [error]
 * @property {string} [deepDiveId]
 * @property {string} ticker
 * @property {Object|null} [meta]
 */

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

const buildModule1Prompt = (config = defaultDeepDiveConfig, module0Markdown) => {
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

const buildModule2Prompt = (config = defaultDeepDiveConfig, module0Markdown, module1Markdown) => {
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

const buildModule3Prompt = (config = defaultDeepDiveConfig, module0Markdown, module1Markdown, module2Markdown) => {
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
  module0Markdown,
  module1Markdown,
  module2Markdown,
  module3Markdown
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

const buildModule5Prompt = (config = defaultDeepDiveConfig, module1Markdown, module3Markdown, module4Markdown) => {
  const tickerValue = config?.ticker?.trim() || '[Ticker not set]';
  const timeframeValue = config?.timeframe?.trim() || '5–15 year horizon';
  const module1Context = module1Markdown?.trim() || '[Module 1 — Core Diagnostics output missing]';
  const module3Context = module3Markdown?.trim() || '[Module 3 — Scenario Engine output missing]';
  const module4Context = module4Markdown?.trim() || '[Module 4 — Valuation Engine output missing]';

  return `You are ValueBot.ai — Module 5: Timing & Momentum for ${tickerValue}.

Timeframe context: ${timeframeValue}.

Use the following prior module outputs as your context:
[Module 1 — Core Diagnostics]
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
  companyName,
  currentPrice,
  module0Markdown,
  module1Markdown,
  module2Markdown,
  module3Markdown,
  module4Markdown,
  module5Markdown
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

async function runModuleAnalysis(params) {
  const { config, prompt, stageLabel } = params;
  const response = await analyzeStockAPI({
    provider: config.provider || 'openai',
    model: config.model || undefined,
    ticker: config.ticker?.trim(),
    timeframe: config.timeframe || undefined,
    question: prompt,
    stageLabel
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  const output = response?.data?.rawResponse || response?.data?.summary || '';
  return output?.trim?.() || '';
}

async function runScoreSummary({ config, module6Markdown }) {
  if (!module6Markdown?.trim()) {
    return { meta: null, error: 'Module 6 markdown is required for score summary.' };
  }

  try {
    const { json: payload, ok } = await safeJsonFetch('score_summary', masterMetaSummaryUrl, {
      method: 'POST',
      body: JSON.stringify({
        provider: config.provider || 'openai',
        model: config.model || null,
        ticker: config.ticker?.trim() || '',
        companyName: null,
        module6Markdown,
        markdown: module6Markdown,
        response_format: 'json_object'
      })
    });

    if (!ok) {
      return { meta: null, error: payload?.message || 'Unable to generate score summary.' };
    }

    return { meta: payload?.meta || payload?.data || null, error: null };
  } catch (error) {
    return { meta: null, error: error?.message || 'Unable to generate score summary.' };
  }
}

async function saveDeepDiveToSupabase(params) {
  const { supabaseClient, pipeline, config, masterMeta, userId } = params;

  if (!supabaseClient) {
    throw new Error('Supabase client is required to save deep dives.');
  }

  const provider = (config.provider || 'openai').trim();
  const modelSnapshot = resolveEffectiveModelId(provider, config.model ?? null);
  const compositeScore =
    typeof masterMeta?.composite_score === 'number' ? masterMeta.composite_score : null;
  const ownerId = userId || config.profileId || null;

  const payload = {
    ticker: pipeline.ticker?.trim() || '',
    provider,
    model: modelSnapshot,
    timeframe: config.timeframe || null,
    custom_question: config.customQuestion || null,
    company_name: config.companyName?.trim() || null,
    currency: config.currency?.trim() || null,
    module0_markdown: pipeline.module0Markdown,
    module1_markdown: pipeline.module1Markdown,
    module2_markdown: pipeline.module2Markdown,
    module3_markdown: pipeline.module3Markdown,
    module4_markdown: pipeline.module4Markdown,
    module5_markdown: pipeline.module5Markdown,
    module6_markdown: pipeline.module6Markdown,
    source: 'valuebot_deep_dive',
    user_id: ownerId
  };

  const { data: insertData, error } = await supabaseClient
    .from('valuebot_deep_dives')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message || 'Unable to save deep dive.');
  }

  let metadataWarning = null;

  const { error: universeError } = await supabaseClient
    .from('investment_universe')
    .upsert(
      {
        profile_id: ownerId,
        symbol: payload.ticker,
        name: payload.company_name || payload.ticker,
        last_deep_dive_at: new Date().toISOString(),
        last_risk_label: masterMeta?.risk_label ?? null,
        last_quality_label: masterMeta?.quality_label ?? null,
        last_timing_label: masterMeta?.timing_label ?? null,
        last_composite_score: compositeScore,
        last_model: modelSnapshot
      },
      { onConflict: 'profile_id,symbol' }
    );

  if (universeError) {
    metadataWarning =
      "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
    console.error('Universe upsert failed', universeError);
  }

  return { deepDiveId: insertData?.id ?? null, warning: metadataWarning };
}

/**
 * Runs the ValueBot deep-dive pipeline server-side.
 * @param {Object} params
 * @param {Object} params.config - Deep dive configuration (ticker, companyName, provider, model, timeframe, customQuestion, userId, etc.).
 * @param {string|null} [params.userId]
 * @param {Object} [params.supabaseClient]
 * @param {boolean} [params.skipSave]
 * @param {(step: DeepDiveStepKey, status: 'running' | 'done' | 'error') => void} [params.onStepStatusChange]
 * @returns {Promise<DeepDiveRunResult>}
 */
export async function runDeepDiveForConfig(params = {}) {
  const config = params?.config || defaultDeepDiveConfig;
  const notify = params?.onStepStatusChange;

  const safeNotify = (step, status) => {
    try {
      notify?.(step, status);
    } catch (err) {
      console.warn('Failed to send step status update', err);
    }
  };

  let pipelineResult = null;
  let currentStage = 'pipeline:init';
  let module0Markdown;
  let module1Markdown;
  let module2Markdown;
  let module3Markdown;
  let module4Markdown;
  let module5Markdown;
  let module6Markdown;
  let meta = null;

  try {
    currentStage = 'module_0_data_loader';
    module0Markdown = await (async () => {
      safeNotify('module0', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule0Prompt(config),
          stageLabel: 'module_0_data_loader'
        });
        safeNotify('module0', 'done');
        return output;
      } catch (error) {
        safeNotify('module0', 'error');
        throw error;
      }
    })();

    currentStage = 'module_1_core_diagnostics';
    module1Markdown = await (async () => {
      safeNotify('module1', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule1Prompt(config, module0Markdown),
          stageLabel: 'module_1_core_diagnostics'
        });
        safeNotify('module1', 'done');
        return output;
      } catch (error) {
        safeNotify('module1', 'error');
        throw error;
      }
    })();

    currentStage = 'module_2_business_model';
    module2Markdown = await (async () => {
      safeNotify('module2', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule2Prompt(config, module0Markdown, module1Markdown),
          stageLabel: 'module_2_business_model'
        });
        safeNotify('module2', 'done');
        return output;
      } catch (error) {
        safeNotify('module2', 'error');
        throw error;
      }
    })();

    currentStage = 'module_3_scenario_engine';
    module3Markdown = await (async () => {
      safeNotify('module3', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule3Prompt(config, module0Markdown, module1Markdown, module2Markdown),
          stageLabel: 'module_3_scenario_engine'
        });
        safeNotify('module3', 'done');
        return output;
      } catch (error) {
        safeNotify('module3', 'error');
        throw error;
      }
    })();

    currentStage = 'module_4_competitive_dynamics';
    module4Markdown = await (async () => {
      safeNotify('module4', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule4Prompt(config, module0Markdown, module1Markdown, module2Markdown, module3Markdown),
          stageLabel: 'module_4_competitive_dynamics'
        });
        safeNotify('module4', 'done');
        return output;
      } catch (error) {
        safeNotify('module4', 'error');
        throw error;
      }
    })();

    currentStage = 'module_5_capital_allocation';
    module5Markdown = await (async () => {
      safeNotify('module5', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule5Prompt(config, module1Markdown, module3Markdown, module4Markdown),
          stageLabel: 'module_5_capital_allocation'
        });
        safeNotify('module5', 'done');
        return output;
      } catch (error) {
        safeNotify('module5', 'error');
        throw error;
      }
    })();

    currentStage = 'module_6_final_verdict';
    module6Markdown = await (async () => {
      safeNotify('module6', 'running');
      try {
        const output = await runModuleAnalysis({
          config,
          prompt: buildModule6Prompt(
            config,
            null,
            null,
            module0Markdown,
            module1Markdown,
            module2Markdown,
            module3Markdown,
            module4Markdown,
            module5Markdown
          ),
          stageLabel: 'module_6_final_verdict'
        });
        safeNotify('module6', 'done');
        return output;
      } catch (error) {
        safeNotify('module6', 'error');
        throw error;
      }
    })();

    currentStage = 'step_7_score_summary';
    safeNotify('scoreSummary', 'running');
    const scoreResult = await runScoreSummary({ config, module6Markdown });
    meta = scoreResult.meta;
    if (scoreResult.error) {
      safeNotify('scoreSummary', 'error');
    } else {
      safeNotify('scoreSummary', 'done');
    }

    pipelineResult = {
      ticker: config.ticker?.trim() || '',
      provider: config.provider || 'openai',
      model: config.model || null,
      module0Markdown,
      module1Markdown,
      module2Markdown,
      module3Markdown,
      module4Markdown,
      module5Markdown,
      module6Markdown,
      masterMeta: meta || null
    };

    currentStage = 'save_deep_dive';
    try {
      if (!params?.skipSave) {
        const { deepDiveId } = await saveDeepDiveToSupabase({
          supabaseClient: params?.supabaseClient,
          pipeline: pipelineResult,
          config,
          masterMeta: meta,
          userId: params?.userId
        });

        return {
          success: true,
          deepDiveId: deepDiveId || undefined,
          ticker: pipelineResult.ticker,
          meta: meta || null,
          masterMeta: meta || null,
          module0Markdown,
          module1Markdown,
          module2Markdown,
          module3Markdown,
          module4Markdown,
          module5Markdown,
          module6Markdown
        };
      }

      return {
        success: true,
        deepDiveId: undefined,
        ticker: pipelineResult.ticker,
        meta: meta || null,
        masterMeta: meta || null,
        module0Markdown,
        module1Markdown,
        module2Markdown,
        module3Markdown,
        module4Markdown,
        module5Markdown,
        module6Markdown
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Unable to save deep dive',
        ticker: pipelineResult?.ticker || config.ticker?.trim() || '',
        meta: meta || null,
        masterMeta: meta || null,
        module0Markdown: pipelineResult?.module0Markdown,
        module1Markdown: pipelineResult?.module1Markdown,
        module2Markdown: pipelineResult?.module2Markdown,
        module3Markdown: pipelineResult?.module3Markdown,
        module4Markdown: pipelineResult?.module4Markdown,
        module5Markdown: pipelineResult?.module5Markdown,
        module6Markdown: pipelineResult?.module6Markdown
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const wrapped = `[stage=${currentStage}] ${msg}`;
    console.error('[ValueBot Worker] Deep-dive error', { currentStage, msg });
    throw new Error(wrapped);
  }
}

export async function runDeepDiveForConfigServer({ supabase, job }) {
  const ticker = job?.ticker?.trim?.() || job?.company_name || '[unknown]';
  const companyName = job?.company_name?.trim?.() || '';

  console.log('[ValueBot Worker] Starting deep dive', { ticker, companyName });

  try {
    const result = await runDeepDiveForConfig({
      supabaseClient: supabase,
      userId: job?.user_id || job?.profileId || null,
      config: {
        provider: job?.provider || 'openai',
        model: job?.model || job?.model_id || '',
        ticker: job?.ticker || '',
        companyName,
        timeframe: job?.timeframe || job?.time_horizon || '',
        customQuestion: job?.custom_question || job?.customQuestion || '',
        profileId: job?.profileId || job?.user_id || null,
        market: job?.market || ''
      }
    });

    if (!result?.success) {
      throw new Error(result?.error || 'Deep dive failed');
    }

    console.log('[ValueBot Worker] Deep dive completed', { ticker, companyName });

    return {
      ok: true,
      deepDiveId: result?.deepDiveId,
      module0Markdown: result?.module0Markdown,
      module1Markdown: result?.module1Markdown,
      module2Markdown: result?.module2Markdown,
      module3Markdown: result?.module3Markdown,
      module4Markdown: result?.module4Markdown,
      module5Markdown: result?.module5Markdown,
      module6Markdown: result?.module6Markdown,
      masterMeta: result?.masterMeta || result?.meta || null
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ValueBot Worker] Deep dive exception', { ticker, error: msg });
    throw new Error(msg);
  }
}

export {
  buildModule0Prompt,
  buildModule1Prompt,
  buildModule2Prompt,
  buildModule3Prompt,
  buildModule4Prompt,
  buildModule5Prompt,
  buildModule6Prompt,
  runScoreSummary
};
