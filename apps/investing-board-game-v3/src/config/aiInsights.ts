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
  filters: {
    horizonLabel: string
    confidenceLabel: string
    allHorizonLabel: string
    allConfidenceLabel: string
    horizons: { id: InsightHorizon, label: string }[]
    confidenceTiers: { id: string, label: string, min: number, max: number }[]
  }
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
    filters: {
      horizonLabel: 'Horizon',
      confidenceLabel: 'Confidence',
      allHorizonLabel: 'All horizons',
      allConfidenceLabel: 'All confidence',
      horizons: [
        { id: 'intraday', label: 'Intraday' },
        { id: 'swing', label: 'Swing' },
        { id: 'position', label: 'Position' },
      ],
      confidenceTiers: [
        { id: 'high', label: 'High', min: 0.75, max: 1 },
        { id: 'medium', label: 'Medium', min: 0.6, max: 0.74 },
        { id: 'watch', label: 'Watch', min: 0, max: 0.59 },
      ],
    },
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

const coerceHorizonOptions = (value: unknown): { id: InsightHorizon, label: string }[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.horizons
  }

  const options = value
    .map((option) => {
      if (!option || typeof option !== 'object') {
        return null
      }

      const candidate = option as { id?: unknown, label?: unknown }
      if (!ALLOWED_HORIZONS.includes(candidate.id as InsightHorizon)) {
        return null
      }

      return {
        id: candidate.id as InsightHorizon,
        label: coerceString(candidate.label, String(candidate.id)),
      }
    })
    .filter((option): option is { id: InsightHorizon, label: string } => option !== null)

  return options.length > 0 ? options : DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.horizons
}

const coerceConfidenceTiers = (value: unknown): { id: string, label: string, min: number, max: number }[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.confidenceTiers
  }

  const tiers = value
    .map((tier) => {
      if (!tier || typeof tier !== 'object') {
        return null
      }

      const candidate = tier as { id?: unknown, label?: unknown, min?: unknown, max?: unknown }
      const id = coerceString(candidate.id, '')
      if (!id) {
        return null
      }

      const min = Math.min(1, Math.max(0, coerceNumber(candidate.min, 0)))
      const max = Math.min(1, Math.max(min, coerceNumber(candidate.max, 1)))

      return {
        id,
        label: coerceString(candidate.label, id),
        min,
        max,
      }
    })
    .filter((tier): tier is { id: string, label: string, min: number, max: number } => tier !== null)

  return tiers.length > 0 ? tiers : DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.confidenceTiers
}

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
      filters: {
        horizonLabel: coerceString(candidate.surface?.filters?.horizonLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.horizonLabel),
        confidenceLabel: coerceString(candidate.surface?.filters?.confidenceLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.confidenceLabel),
        allHorizonLabel: coerceString(candidate.surface?.filters?.allHorizonLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.allHorizonLabel),
        allConfidenceLabel: coerceString(candidate.surface?.filters?.allConfidenceLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.filters.allConfidenceLabel),
        horizons: coerceHorizonOptions(candidate.surface?.filters?.horizons),
        confidenceTiers: coerceConfidenceTiers(candidate.surface?.filters?.confidenceTiers),
      },
    },
    fixtures: fixtures.length > 0 ? fixtures : DEFAULT_AI_INSIGHTS_CONFIG.fixtures,
  }
}

const aiInsightsConfig = normalizeConfig(rawAiInsightsConfig)

export const AI_INSIGHTS_SURFACE = aiInsightsConfig.surface
export const AI_INSIGHTS_FIXTURES = aiInsightsConfig.fixtures
