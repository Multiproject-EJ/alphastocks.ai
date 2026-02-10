import rawAiInsightsConfig from '../../../../config/ai_insights.json'

export type InsightHorizon = 'intraday' | 'swing' | 'position'

export type AIInsightFixture = {
  id: string
  symbol: string
  headline: string
  summary: string
  confidence: number
  horizon: InsightHorizon
  signals: string[]
  updatedAt: string
}

export type AIInsightsSurfaceConfig = {
  title: string
  description: string
  disclaimer: string
  refreshMinutes: number
  ctaLabel: string
}

type AIInsightsConfig = {
  surface: AIInsightsSurfaceConfig
  fixtures: AIInsightFixture[]
}

const DEFAULT_AI_INSIGHTS_CONFIG: AIInsightsConfig = {
  surface: {
    title: 'AI Investment Insights',
    description: 'Quick, mobile-first market briefs powered by fixtures.',
    disclaimer: 'Educational only — not investment advice.',
    refreshMinutes: 30,
    ctaLabel: 'Request fresh insight',
  },
  fixtures: [
    {
      id: 'fixture-1',
      symbol: 'SPY',
      headline: 'Fixture insight placeholder',
      summary: 'Replace with live model output when provider wiring is available.',
      confidence: 0.5,
      horizon: 'intraday',
      signals: ['fixture-mode'],
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

const ALLOWED_HORIZONS: InsightHorizon[] = ['intraday', 'swing', 'position']

const coerceString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback

const coerceNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const normalizeFixture = (fixture: unknown, fallback: AIInsightFixture): AIInsightFixture => {
  if (!fixture || typeof fixture !== 'object') {
    return fallback
  }

  const candidate = fixture as Partial<AIInsightFixture>
  const normalizedHorizon = ALLOWED_HORIZONS.includes(candidate.horizon as InsightHorizon)
    ? (candidate.horizon as InsightHorizon)
    : fallback.horizon

  return {
    id: coerceString(candidate.id, fallback.id),
    symbol: coerceString(candidate.symbol, fallback.symbol).toUpperCase(),
    headline: coerceString(candidate.headline, fallback.headline),
    summary: coerceString(candidate.summary, fallback.summary),
    confidence: Math.min(1, Math.max(0, coerceNumber(candidate.confidence, fallback.confidence))),
    horizon: normalizedHorizon,
    signals: Array.isArray(candidate.signals)
      ? candidate.signals.filter((signal): signal is string => typeof signal === 'string' && signal.length > 0)
      : fallback.signals,
    updatedAt: coerceString(candidate.updatedAt, fallback.updatedAt),
  }
}

const normalizeConfig = (config: unknown): AIInsightsConfig => {
  if (!config || typeof config !== 'object') {
    return DEFAULT_AI_INSIGHTS_CONFIG
  }

  const candidate = config as Partial<AIInsightsConfig>

  const fixtures = Array.isArray(candidate.fixtures)
    ? candidate.fixtures.map((fixture, index) =>
      normalizeFixture(fixture, DEFAULT_AI_INSIGHTS_CONFIG.fixtures[Math.min(index, DEFAULT_AI_INSIGHTS_CONFIG.fixtures.length - 1)])
    )
    : DEFAULT_AI_INSIGHTS_CONFIG.fixtures

  return {
    surface: {
      title: coerceString(candidate.surface?.title, DEFAULT_AI_INSIGHTS_CONFIG.surface.title),
      description: coerceString(candidate.surface?.description, DEFAULT_AI_INSIGHTS_CONFIG.surface.description),
      disclaimer: coerceString(candidate.surface?.disclaimer, DEFAULT_AI_INSIGHTS_CONFIG.surface.disclaimer),
      refreshMinutes: Math.max(5, coerceNumber(candidate.surface?.refreshMinutes, DEFAULT_AI_INSIGHTS_CONFIG.surface.refreshMinutes)),
      ctaLabel: coerceString(candidate.surface?.ctaLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.ctaLabel),
    },
    fixtures: fixtures.length > 0 ? fixtures : DEFAULT_AI_INSIGHTS_CONFIG.fixtures,
  }
}

const aiInsightsConfig = normalizeConfig(rawAiInsightsConfig)

export const AI_INSIGHTS_SURFACE = aiInsightsConfig.surface
export const AI_INSIGHTS_FIXTURES = aiInsightsConfig.fixtures
