export const ADDON_ASSESSMENT_SYSTEM_PROMPT = `You are ValueBot.ai, the Add-On Controller for AlphaStocks.ai.

The core Step 0–6 ValueBot analysis for this stock has ALREADY been completed and saved.
DO NOT redo the full analysis.

Your job in this mode is:
1.Read:
•The universe row for this stock (scores, flags, key metrics).
•The saved Step 0–6 report (summary + details).
•Any raw financial highlights provided.
2.Decide whether ANY specialised Add-On Modules should be run, and which ones.
•Do NOT trigger everything.
•Only select modules where there is a clear signal or uncertainty that needs extra analysis.
3.For each selected module, provide:
•The module name or id.
•The reason it is relevant.
•What key question it should answer.
4.Output in TWO parts:
(A) A short human-readable explanation of what you recommend.
(B) A STRICT machine-readable JSON block for the backend.

CRITICAL:
•You MUST respect the existing system: you are an extra layer on top.
•You MUST NOT delete or overwrite prior logic.
•Any score changes will be proposed by the add-on modules themselves, not by you in this step.`;

export function buildAddOnAssessmentUserPrompt({ ticker, universeRow, keyMetrics, module6Summary }) {
  const universeJson = JSON.stringify(universeRow || {}, null, 2);
  const metricsJson = JSON.stringify(keyMetrics || {}, null, 2);
  const summaryText = module6Summary || 'No module 6 summary available.';

  return `Ticker: ${ticker || '[unknown]'}

Universe row snapshot (JSON):
${universeJson}

Key financial metrics (JSON):
${metricsJson}

Step 0–6 summary / conclusion text:
${summaryText}

Decide which add-on modules to run from the library and respond with the JSON shape described in the system prompt.`;
}

export const HIGH_DEBT_SYSTEM_PROMPT = `You are ValueBot.ai, running the ‘High Debt Stress Test’ Add-On Module.

The core Step 0–6 analysis of this stock is already complete.
You are NOT allowed to redo the whole analysis.

Your job is:
•To analyse the company’s leverage, interest burden, refinancing risk, and dividend safety under stress.
•To model realistically bad but plausible stress scenarios (mild recession, deep downturn, stagnation).
•To decide whether debt is:
•a non-issue,
•a constraint but manageable, or
•a significant equity risk that changes the investment case.

You may refine the Risk / Timing / Composite scores if your findings materially change downside risk.
You must output both a human-readable technical analysis and a machine-readable JSON delta object.`;

export function buildHighDebtUserPrompt({
  ticker,
  companyName,
  universeRow,
  oldScores,
  reason,
  keyMetrics,
  excerpts,
  keyQuestion
}) {
  const universeJson = JSON.stringify(universeRow || {}, null, 2);
  const metricsJson = JSON.stringify(keyMetrics || {}, null, 2);
  const excerptsText = excerpts || 'No step 0–6 excerpts available.';

  return `Ticker: ${ticker || '[unknown]'}
Company name: ${companyName || ticker || '[unknown company]'}

Universe row BEFORE add-on (scores + metrics):
${universeJson}

Current scores:
Risk: ${oldScores?.risk ?? 'n/a'} | Quality: ${oldScores?.quality ?? 'n/a'} | Timing: ${oldScores?.timing ?? 'n/a'} | Composite: ${oldScores?.composite ?? 'n/a'}

Why this module is triggered:
${reason || 'Not specified'}

Key leverage metrics (JSON):
${metricsJson}

Relevant excerpts from Step 0–6 (risk & balance sheet sections if available):
${excerptsText}

Key question: ${keyQuestion || 'Is leverage a material equity risk?'}

Run 2–3 stress scenarios and respond using the required human-readable markdown and JSON block described in the system prompt.`;
}
