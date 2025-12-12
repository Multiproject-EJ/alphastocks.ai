function sanitizeJsonText(rawText) {
  if (!rawText) return '';
  let candidate = rawText.trim();

  const fenceMatch = candidate.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (fenceMatch) {
    candidate = fenceMatch[1].trim();
  }

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidate = candidate.slice(firstBrace, lastBrace + 1);
  }

  return candidate;
}

export function extractJsonBlock(rawText) {
  const candidate = sanitizeJsonText(rawText);
  if (!candidate) {
    throw new Error('No JSON content found');
  }

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new Error(`Unable to parse JSON block: ${error.message || 'unknown parse error'}`);
  }
}

export function mapRiskLabel(score) {
  if (!Number.isFinite(score)) return null;
  if (score >= 7) return 'Low';
  if (score >= 4) return 'Medium';
  return 'High';
}

export function mapQualityLabel(score) {
  if (!Number.isFinite(score)) return null;
  if (score >= 9) return 'World Class';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Strong';
  if (score >= 6) return 'Strong';
  if (score >= 5) return 'Good';
  if (score >= 4) return 'Average';
  if (score >= 3) return 'Weak';
  if (score >= 2) return 'Poor';
  return 'Horrific';
}

export function mapTimingLabel(score) {
  if (!Number.isFinite(score)) return null;
  if (score >= 7) return 'Buy';
  if (score >= 5) return 'Hold';
  if (score >= 3) return 'Wait';
  return 'Avoid';
}

export function deriveNumericScoresFromMeta(meta) {
  if (!meta) return {};
  const numeric = {};

  const riskLabel = meta.risk_label?.toLowerCase?.();
  if (riskLabel) {
    numeric.risk = riskLabel === 'low' ? 8 : riskLabel === 'medium' ? 5.5 : 3;
  }

  const qualityLabel = meta.quality_label?.toLowerCase?.();
  if (qualityLabel) {
    if (qualityLabel.includes('world')) numeric.quality = 9.5;
    else if (qualityLabel.includes('excellent')) numeric.quality = 8.5;
    else if (qualityLabel.includes('very strong')) numeric.quality = 7.5;
    else if (qualityLabel.includes('strong')) numeric.quality = 6.5;
    else if (qualityLabel.includes('good')) numeric.quality = 5.5;
    else if (qualityLabel.includes('average')) numeric.quality = 4.5;
    else if (qualityLabel.includes('weak')) numeric.quality = 3.5;
    else if (qualityLabel.includes('poor')) numeric.quality = 2.5;
    else numeric.quality = 1.5;
  }

  const timingLabel = meta.timing_label?.toLowerCase?.();
  if (timingLabel) {
    if (timingLabel.includes('buy')) numeric.timing = 8;
    else if (timingLabel.includes('hold')) numeric.timing = 6;
    else if (timingLabel.includes('wait')) numeric.timing = 4;
    else numeric.timing = 2;
  }

  if (typeof meta.composite_score === 'number') {
    numeric.composite = meta.composite_score;
  }

  return numeric;
}

export function mergeFlags(existing = {}, incoming = {}) {
  const merged = { ...existing };
  const booleanKeys = [
    'debt_stress_flag',
    'liquidity_risk_flag',
    'dividend_at_risk_flag',
    'fraud_red_flag'
  ];

  for (const key of booleanKeys) {
    if (incoming[key] !== undefined) {
      merged[key] = Boolean(incoming[key]);
    }
  }

  const otherFlags = Array.isArray(existing.other_flags) ? [...existing.other_flags] : [];
  if (Array.isArray(incoming.other_flags)) {
    for (const flag of incoming.other_flags) {
      if (flag && !otherFlags.includes(flag)) {
        otherFlags.push(flag);
      }
    }
  }
  if (otherFlags.length) {
    merged.other_flags = otherFlags;
  }

  return merged;
}

export function buildMetaFromScores(baseMeta = {}, scores = {}) {
  const next = { ...baseMeta };
  if (Number.isFinite(scores.risk)) {
    next.risk_label = mapRiskLabel(scores.risk);
  }
  if (Number.isFinite(scores.quality)) {
    next.quality_label = mapQualityLabel(scores.quality);
  }
  if (Number.isFinite(scores.timing)) {
    next.timing_label = mapTimingLabel(scores.timing);
  }
  if (Number.isFinite(scores.composite)) {
    next.composite_score = scores.composite;
  }
  return next;
}
