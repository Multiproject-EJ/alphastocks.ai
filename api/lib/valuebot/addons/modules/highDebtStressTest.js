import { analyzeStockAPI } from '../../client.js';
import { HIGH_DEBT_SYSTEM_PROMPT, buildHighDebtUserPrompt } from '../prompts.js';
import { buildMetaFromScores, extractJsonBlock, mergeFlags } from '../parsers.js';

function normalizeScores(oldScores = {}, newScores = {}) {
  const merged = { ...oldScores };
  for (const key of ['risk', 'quality', 'timing', 'composite']) {
    const candidate = newScores?.[key];
    if (candidate !== undefined && candidate !== null && candidate !== '') {
      const numeric = Number(candidate);
      if (Number.isFinite(numeric)) {
        merged[key] = numeric;
      }
    }
  }
  return merged;
}

export async function runHighDebtStressTestModule({
  provider = 'openai',
  model,
  ticker,
  companyName,
  universeRow,
  oldScores,
  reason,
  keyMetrics,
  excerpts,
  keyQuestion
}) {
  const userPrompt = buildHighDebtUserPrompt({
    ticker,
    companyName,
    universeRow,
    oldScores,
    reason,
    keyMetrics,
    excerpts,
    keyQuestion
  });

  const question = `${HIGH_DEBT_SYSTEM_PROMPT}\n\nUSER INPUT:\n${userPrompt}\n\nReturn the markdown analysis followed by the JSON block exactly.`;
  const { data, error } = await analyzeStockAPI({
    provider: provider || 'openai',
    model,
    ticker,
    companyName,
    question,
    stageLabel: 'addon_high_debt',
    timeframe: null
  });

  if (error) {
    throw new Error(error);
  }

  const rawOutput = data?.rawResponse || data?.summary || '';
  const parsedDelta = extractJsonBlock(rawOutput);
  const mergedScores = normalizeScores(oldScores, parsedDelta?.new_scores);
  const normalizedFlags = mergeFlags({}, parsedDelta?.universe_flags || {});
  const metaFromScores = buildMetaFromScores({}, mergedScores);

  return {
    delta: {
      ...parsedDelta,
      new_scores: mergedScores,
      universe_flags: normalizedFlags,
      module_id: parsedDelta?.module_id || 'high_debt_stress_test',
      module_name: parsedDelta?.module_name || 'High Debt Stress Test',
      summary_for_universe_table: parsedDelta?.summary_for_universe_table || '',
      notes_for_human_analyst: parsedDelta?.notes_for_human_analyst || ''
    },
    metaFromScores,
    rawOutput
  };
}
