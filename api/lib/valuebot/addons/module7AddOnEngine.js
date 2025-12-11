import { analyzeStockAPI } from '../client.js';
import { buildAddOnAssessmentUserPrompt, ADDON_ASSESSMENT_SYSTEM_PROMPT } from './prompts.js';
import {
  buildMetaFromScores,
  deriveNumericScoresFromMeta,
  extractJsonBlock,
  mapRiskLabel,
  mergeFlags
} from './parsers.js';
import { runHighDebtStressTestModule } from './modules/highDebtStressTest.js';

function isAddOnEnabled() {
  return (process.env.ENABLE_ADDON_ENGINE || '').toLowerCase() === 'true';
}

async function fetchUniverseRow(supabaseClient, ticker, profileId) {
  if (!supabaseClient || !ticker) return null;
  try {
    let query = supabaseClient.from('investment_universe').select('*').eq('symbol', ticker);
    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      console.warn('[AddOnEngine] Failed to fetch universe row', error);
      return null;
    }
    return data || null;
  } catch (err) {
    console.warn('[AddOnEngine] Error fetching universe row', err);
    return null;
  }
}

function normalizeSelection(rawOutput) {
  const parsed = extractJsonBlock(rawOutput);
  const selectedModules = Array.isArray(parsed.selected_modules)
    ? [...parsed.selected_modules].sort((a, b) => (a?.priority || 0) - (b?.priority || 0))
    : [];

  return {
    ticker: parsed.ticker,
    run_addons: Boolean(parsed.run_addons),
    selected_modules: selectedModules
  };
}

function collectModule6Summary(moduleOutputs = {}) {
  return (
    moduleOutputs.module6Markdown ||
    moduleOutputs.masterMarkdown ||
    moduleOutputs.module6Output ||
    moduleOutputs.module6 ||
    ''
  );
}

function buildBaseScores(masterMeta, universeRow) {
  const fromMeta = deriveNumericScoresFromMeta(masterMeta || {});
  if (Object.keys(fromMeta).length) return fromMeta;

  if (universeRow) {
    return deriveNumericScoresFromMeta({
      risk_label: universeRow.last_risk_label,
      quality_label: universeRow.last_quality_label,
      timing_label: universeRow.last_timing_label,
      composite_score:
        typeof universeRow.last_composite_score === 'number'
          ? universeRow.last_composite_score
          : Number(universeRow.last_composite_score)
    });
  }

  return {};
}

function buildAssessmentQuestion({ ticker, universeRow, keyMetrics, module6Summary }) {
  const userPrompt = buildAddOnAssessmentUserPrompt({
    ticker,
    universeRow,
    keyMetrics,
    module6Summary
  });

  return `${ADDON_ASSESSMENT_SYSTEM_PROMPT}\n\n${userPrompt}\n\nReturn the strict JSON block after your short explanation.`;
}

function mergeMeta(masterMeta, scores) {
  const updated = buildMetaFromScores(masterMeta || {}, scores || {});
  if (!updated.risk_label && masterMeta?.risk_label) updated.risk_label = masterMeta.risk_label;
  if (!updated.quality_label && masterMeta?.quality_label) updated.quality_label = masterMeta.quality_label;
  if (!updated.timing_label && masterMeta?.timing_label) updated.timing_label = masterMeta.timing_label;
  if (!Number.isFinite(updated.composite_score) && Number.isFinite(masterMeta?.composite_score)) {
    updated.composite_score = masterMeta.composite_score;
  }
  return updated;
}

export async function runAddOnEngineForTicker({
  supabaseClient,
  ticker,
  profileId,
  moduleOutputs,
  masterMeta,
  keyMetrics = {},
  provider = 'openai',
  model
}) {
  if (!isAddOnEnabled()) {
    return { enabled: false };
  }

  const universeRow = await fetchUniverseRow(supabaseClient, ticker, profileId);
  const module6Summary = collectModule6Summary(moduleOutputs);
  const assessmentQuestion = buildAssessmentQuestion({
    ticker,
    universeRow,
    keyMetrics,
    module6Summary
  });

  const { data: assessmentData, error: assessmentError } = await analyzeStockAPI({
    provider,
    model,
    ticker,
    question: assessmentQuestion,
    stageLabel: 'addon_assessment',
    timeframe: null
  });

  if (assessmentError) {
    throw new Error(assessmentError);
  }

  const assessmentRaw = assessmentData?.rawResponse || assessmentData?.summary || '';
  const selection = normalizeSelection(assessmentRaw);

  if (!selection.run_addons || !selection.selected_modules.length) {
    return {
      enabled: true,
      selection,
      moduleDeltas: [],
      addonFlags: universeRow?.addon_flags || {},
      addonSummary: universeRow?.addon_summary || '',
      updatedMeta: masterMeta || {},
      universePatch: null,
      runTimestamp: null
    };
  }

  let addonFlags = universeRow?.addon_flags || {};
  let addonSummary = universeRow?.addon_summary || '';
  const moduleDeltas = [];
  let currentScores = buildBaseScores(masterMeta, universeRow);
  const defaultScores = {
    risk: currentScores.risk ?? null,
    quality: currentScores.quality ?? null,
    timing: currentScores.timing ?? null,
    composite: currentScores.composite ?? masterMeta?.composite_score ?? null
  };

  let updatedMeta = mergeMeta(masterMeta, defaultScores);

  for (const moduleSelection of selection.selected_modules) {
    if (moduleSelection.id === 'high_debt_stress_test') {
      const { delta, metaFromScores } = await runHighDebtStressTestModule({
        provider,
        model,
        ticker,
        companyName: moduleOutputs?.companyName || ticker,
        universeRow,
        oldScores: currentScores,
        reason: moduleSelection.reason,
        keyMetrics,
        excerpts: module6Summary,
        keyQuestion: moduleSelection.key_question
      });

      currentScores = delta.new_scores || currentScores;
      updatedMeta = mergeMeta({ ...updatedMeta }, { ...metaFromScores, ...currentScores });
      addonFlags = mergeFlags(addonFlags, delta.universe_flags);
      addonSummary = delta.summary_for_universe_table || addonSummary;
      moduleDeltas.push(delta);
    }
  }

  const runTimestamp = new Date().toISOString();
  const finalMeta = mergeMeta(updatedMeta, currentScores);
  const universePatch = {
    addon_summary: addonSummary || null,
    addon_flags: addonFlags,
    last_addon_run_at: runTimestamp,
    last_risk_label: finalMeta.risk_label || mapRiskLabel(currentScores.risk) || masterMeta?.risk_label || null,
    last_quality_label: finalMeta.quality_label || masterMeta?.quality_label || null,
    last_timing_label: finalMeta.timing_label || masterMeta?.timing_label || null,
    last_composite_score: Number.isFinite(finalMeta.composite_score)
      ? finalMeta.composite_score
      : masterMeta?.composite_score ?? null
  };

  return {
    enabled: true,
    selection,
    moduleDeltas,
    addonFlags,
    addonSummary,
    updatedMeta: finalMeta,
    universePatch,
    runTimestamp,
    assessmentRaw
  };
}
