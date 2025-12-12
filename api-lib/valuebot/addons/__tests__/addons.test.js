import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaFromScores,
  deriveNumericScoresFromMeta,
  extractJsonBlock,
  mapQualityLabel,
  mergeFlags
} from '../parsers.js';

const sampleJson = [
  'Here is what I recommend:',
  '{',
  '  "ticker": "ABC",',
  '  "run_addons": true,',
  '  "selected_modules": [',
  '    {"id": "high_debt_stress_test", "priority": 1, "reason": "leverage is rising", "key_question": "Is dividend safe?"}',
  '  ]',
  '}'
].join('\n');

test('extractJsonBlock parses fenced JSON payload', () => {
  const parsed = extractJsonBlock(sampleJson);
  assert.equal(parsed.ticker, 'ABC');
  assert.equal(parsed.run_addons, true);
  assert.equal(parsed.selected_modules[0].id, 'high_debt_stress_test');
});

test('mergeFlags merges boolean switches and other flags uniquely', () => {
  const merged = mergeFlags(
    { debt_stress_flag: false, other_flags: ['legacy'] },
    { debt_stress_flag: true, liquidity_risk_flag: 1, other_flags: ['new', 'legacy'] }
  );

  assert.equal(merged.debt_stress_flag, true);
  assert.equal(merged.liquidity_risk_flag, true);
  assert.deepEqual(merged.other_flags.sort(), ['legacy', 'new']);
});

test('mapQualityLabel buckets scores into descriptive labels', () => {
  assert.equal(mapQualityLabel(9.2), 'World Class');
  assert.equal(mapQualityLabel(6.3), 'Strong');
  assert.equal(mapQualityLabel(4.4), 'Average');
  assert.equal(mapQualityLabel(1.2), 'Horrific');
});

test('buildMetaFromScores overwrites and fills missing labels', () => {
  const meta = buildMetaFromScores({ risk_label: 'Medium' }, { risk: 8, quality: 7, timing: 2.5, composite: 6 });
  assert.equal(meta.risk_label, 'Low');
  assert.equal(meta.quality_label, 'Very Strong');
  assert.equal(meta.timing_label, 'Avoid');
  assert.equal(meta.composite_score, 6);
});

test('deriveNumericScoresFromMeta maps labels to representative numbers', () => {
  const numeric = deriveNumericScoresFromMeta({
    risk_label: 'High',
    quality_label: 'Excellent',
    timing_label: 'Wait',
    composite_score: 7.3
  });

  assert.equal(numeric.risk, 3);
  assert.equal(numeric.quality, 8.5);
  assert.equal(numeric.timing, 4);
  assert.equal(numeric.composite, 7.3);
});
