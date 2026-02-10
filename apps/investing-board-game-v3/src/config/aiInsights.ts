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
  autoRefresh: {
    helperTemplate: string
    cooldownTemplate: string
    cooldownRowClass: string
    statusTones: {
      onTrackLabel: string
      dueNowLabel: string
      onTrackIcon: string
      dueNowIcon: string
      onTrackColorClass: string
      dueNowColorClass: string
      onTrackChipClass: string
      dueNowChipClass: string
      onTrackHelperClass: string
      dueNowHelperClass: string
      onTrackDescription: string
      dueNowDescription: string
      onTrackDescriptionClass: string
      dueNowDescriptionClass: string
      dueNowCountdownEmphasis: string
      dueNowCountdownSeparator: string
      dueNowCountdownTemplate: string
    }
  }
  ctaLabel: string
  resetFiltersLabel: string
  freshness: {
    label: string
    freshLabel: string
    staleLabel: string
    staleAfterMinutes: number
    relativeAge: {
      updatedLabel: string
      justNowLabel: string
      minutesAgoTemplate: string
      unavailableLabel: string
    }
    staleCallout: {
      title: string
      description: string
    }
  }
  emptyState: {
    title: string
    description: string
    ctaLabel: string
  }
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
    autoRefresh: {
      helperTemplate: 'Auto-refreshes every {minutes}m while this panel is open.',
      cooldownTemplate: 'Next refresh in {minutes}m',
      cooldownRowClass: 'mt-1.5 flex items-center',
      statusTones: {
        onTrackLabel: 'On track',
        dueNowLabel: 'Due now',
        onTrackIcon: '⏱️',
        dueNowIcon: '⚠️',
        onTrackColorClass: 'text-emerald-200',
        dueNowColorClass: 'text-amber-200',
        onTrackChipClass: 'border border-emerald-400/40 bg-emerald-500/10',
        dueNowChipClass: 'border border-amber-400/50 bg-amber-500/10',
        onTrackHelperClass: 'text-muted-foreground',
        dueNowHelperClass: 'text-amber-100/90',
        onTrackDescription: 'Data is still within the refresh window.',
        dueNowDescription: 'Refresh now to keep signals timely.',
        onTrackDescriptionClass: 'text-muted-foreground',
        dueNowDescriptionClass: 'text-amber-100/90',
        dueNowCountdownEmphasis: 'Refresh now',
        dueNowCountdownSeparator: ' · ',
        dueNowCountdownTemplate: '{emphasis}{separator}{countdown}',
      },
    },
    ctaLabel: 'Request fresh insight',
    resetFiltersLabel: 'Reset all filters',
    freshness: {
      label: 'Data freshness',
      freshLabel: 'Fresh',
      staleLabel: 'Stale',
      staleAfterMinutes: 60,
      relativeAge: {
        updatedLabel: 'Updated',
        justNowLabel: 'Just now',
        minutesAgoTemplate: '{minutes}m ago',
        unavailableLabel: 'Time unavailable',
      },
      staleCallout: {
        title: 'Some insights are getting stale',
        description: 'Request a fresh insight when cards are older than this window.',
      },
    },
    emptyState: {
      title: 'No insights match these filters yet',
      description: 'Try widening your filters to bring fixture insights back.',
      ctaLabel: 'Reset filters',
    },
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
      autoRefresh: {
        helperTemplate: coerceString(
          candidate.surface?.autoRefresh?.helperTemplate,
          DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.helperTemplate,
        ),
        cooldownTemplate: coerceString(
          candidate.surface?.autoRefresh?.cooldownTemplate,
          DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.cooldownTemplate,
        ),
        cooldownRowClass: coerceString(
          candidate.surface?.autoRefresh?.cooldownRowClass,
          DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.cooldownRowClass,
        ),
        statusTones: {
          onTrackLabel: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackLabel,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackLabel,
          ),
          dueNowLabel: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowLabel,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowLabel,
          ),
          onTrackIcon: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackIcon,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackIcon,
          ),
          dueNowIcon: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowIcon,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowIcon,
          ),
          onTrackColorClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackColorClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackColorClass,
          ),
          dueNowColorClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowColorClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowColorClass,
          ),
          onTrackChipClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackChipClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackChipClass,
          ),
          dueNowChipClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowChipClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowChipClass,
          ),
          onTrackHelperClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackHelperClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackHelperClass,
          ),
          dueNowHelperClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowHelperClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowHelperClass,
          ),
          onTrackDescription: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackDescription,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackDescription,
          ),
          dueNowDescription: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowDescription,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowDescription,
          ),
          onTrackDescriptionClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.onTrackDescriptionClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.onTrackDescriptionClass,
          ),
          dueNowDescriptionClass: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowDescriptionClass,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowDescriptionClass,
          ),
          dueNowCountdownEmphasis: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowCountdownEmphasis,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowCountdownEmphasis,
          ),
          dueNowCountdownSeparator: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowCountdownSeparator,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowCountdownSeparator,
          ),
          dueNowCountdownTemplate: coerceString(
            candidate.surface?.autoRefresh?.statusTones?.dueNowCountdownTemplate,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.autoRefresh.statusTones.dueNowCountdownTemplate,
          ),
        },
      },
      ctaLabel: coerceString(candidate.surface?.ctaLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.ctaLabel),
      resetFiltersLabel: coerceString(candidate.surface?.resetFiltersLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.resetFiltersLabel),
      freshness: {
        label: coerceString(candidate.surface?.freshness?.label, DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.label),
        freshLabel: coerceString(candidate.surface?.freshness?.freshLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.freshLabel),
        staleLabel: coerceString(candidate.surface?.freshness?.staleLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.staleLabel),
        staleAfterMinutes: Math.max(
          5,
          coerceNumber(candidate.surface?.freshness?.staleAfterMinutes, DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.staleAfterMinutes),
        ),
        relativeAge: {
          updatedLabel: coerceString(
            candidate.surface?.freshness?.relativeAge?.updatedLabel,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.relativeAge.updatedLabel,
          ),
          justNowLabel: coerceString(
            candidate.surface?.freshness?.relativeAge?.justNowLabel,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.relativeAge.justNowLabel,
          ),
          minutesAgoTemplate: coerceString(
            candidate.surface?.freshness?.relativeAge?.minutesAgoTemplate,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.relativeAge.minutesAgoTemplate,
          ),
          unavailableLabel: coerceString(
            candidate.surface?.freshness?.relativeAge?.unavailableLabel,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.relativeAge.unavailableLabel,
          ),
        },
        staleCallout: {
          title: coerceString(
            candidate.surface?.freshness?.staleCallout?.title,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.staleCallout.title,
          ),
          description: coerceString(
            candidate.surface?.freshness?.staleCallout?.description,
            DEFAULT_AI_INSIGHTS_CONFIG.surface.freshness.staleCallout.description,
          ),
        },
      },
      emptyState: {
        title: coerceString(candidate.surface?.emptyState?.title, DEFAULT_AI_INSIGHTS_CONFIG.surface.emptyState.title),
        description: coerceString(candidate.surface?.emptyState?.description, DEFAULT_AI_INSIGHTS_CONFIG.surface.emptyState.description),
        ctaLabel: coerceString(candidate.surface?.emptyState?.ctaLabel, DEFAULT_AI_INSIGHTS_CONFIG.surface.emptyState.ctaLabel),
      },
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
