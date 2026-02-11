import { useMemo, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { AI_INSIGHTS_FIXTURES, AI_INSIGHTS_SURFACE } from '@/lib/aiInsightsFixtures'
import {
  formatDueNowCooldownPhrase,
  formatOnTrackCooldownPhrase,
  formatRelativeAgePhrase,
  normalizeCooldownCountdownValue,
} from '@/config/aiInsights'
import { Sparkle } from '@phosphor-icons/react'

interface AIInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ALL_FILTER_VALUE = 'all'

const getInsightAgeMinutes = (updatedAt: string): number => {
  const updatedTimestamp = new Date(updatedAt).getTime()

  if (!Number.isFinite(updatedTimestamp)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(0, (Date.now() - updatedTimestamp) / 60000)
}

const formatRelativeInsightAge = (updatedAt: string): string => {
  const ageMinutes = getInsightAgeMinutes(updatedAt)

  if (!Number.isFinite(ageMinutes)) {
    return AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel
  }

  const roundedAgeMinutes = Math.floor(ageMinutes)
  if (roundedAgeMinutes <= 0) {
    return AI_INSIGHTS_SURFACE.freshness.relativeAge.justNowLabel
  }

  return formatRelativeAgePhrase({
    minutesAgoTemplate: AI_INSIGHTS_SURFACE.freshness.relativeAge.minutesAgoTemplate,
    minutesAgo: roundedAgeMinutes,
  })
}

const formatAutoRefreshCopy = (template: string, minutes: number): string =>
  template.replace('{minutes}', String(normalizeCooldownCountdownValue(minutes)))

const getCooldownTone = (nextAutoRefreshInMinutes: number): 'on-track' | 'due-now' =>
  nextAutoRefreshInMinutes <= 0 ? 'due-now' : 'on-track'

export function AIInsightsModal({ open, onOpenChange }: AIInsightsModalProps) {
  const dialogClass = useResponsiveDialogClass('medium')
  const [activeHorizon, setActiveHorizon] = useState<string>(ALL_FILTER_VALUE)
  const [activeConfidenceTier, setActiveConfidenceTier] = useState<string>(ALL_FILTER_VALUE)

  const resetFilters = () => {
    setActiveHorizon(ALL_FILTER_VALUE)
    setActiveConfidenceTier(ALL_FILTER_VALUE)
  }

  const hasActiveFilters = activeHorizon !== ALL_FILTER_VALUE || activeConfidenceTier !== ALL_FILTER_VALUE

  const visibleInsights = useMemo(() => {
    return AI_INSIGHTS_FIXTURES.filter((insight) => {
      const horizonMatch = activeHorizon === ALL_FILTER_VALUE || insight.horizon === activeHorizon

      const selectedTier = AI_INSIGHTS_SURFACE.filters.confidenceTiers.find((tier) => tier.id === activeConfidenceTier)
      const confidenceMatch =
        !selectedTier ||
        (insight.confidence >= selectedTier.min && insight.confidence <= selectedTier.max)

      return horizonMatch && confidenceMatch
    })
  }, [activeConfidenceTier, activeHorizon])

  const hasStaleInsights = visibleInsights.some(
    (insight) => getInsightAgeMinutes(insight.updatedAt) >= AI_INSIGHTS_SURFACE.freshness.staleAfterMinutes,
  )

  const nextAutoRefreshInMinutes = useMemo(() => {
    const finiteAges = visibleInsights
      .map((insight) => getInsightAgeMinutes(insight.updatedAt))
      .filter((ageMinutes) => Number.isFinite(ageMinutes))

    if (finiteAges.length === 0) {
      return AI_INSIGHTS_SURFACE.refreshMinutes
    }

    const freshestAge = Math.min(...finiteAges)
    const remainingMinutes = AI_INSIGHTS_SURFACE.refreshMinutes - freshestAge
    return Math.max(0, Math.ceil(remainingMinutes))
  }, [visibleInsights])


  const cooldownTone = getCooldownTone(nextAutoRefreshInMinutes)
  const cooldownToneLabel =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowLabel
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackLabel
  const cooldownToneDescription =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowDescription
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackDescription
  const cooldownToneIcon =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowIcon
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackIcon
  const cooldownToneColorClass =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowColorClass
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackColorClass
  const cooldownToneChipClass =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowChipClass
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackChipClass
  const cooldownToneHelperClass =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowHelperClass
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackHelperClass
  const cooldownToneDescriptionClass =
    cooldownTone === 'due-now'
      ? AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowDescriptionClass
      : AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackDescriptionClass
  const dueNowCountdownEmphasis = AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownEmphasis
  const dueNowCountdownSeparator = AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownSeparator
  const dueNowCountdownTemplate = AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownTemplate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-accent/30 shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-accent">{AI_INSIGHTS_SURFACE.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
            <div className="flex items-start gap-2">
              <Sparkle size={18} className="mt-0.5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">{AI_INSIGHTS_SURFACE.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{AI_INSIGHTS_SURFACE.disclaimer}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
              {hasActiveFilters ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={resetFilters}
                >
                  {AI_INSIGHTS_SURFACE.resetFiltersLabel}
                </Button>
              ) : null}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {AI_INSIGHTS_SURFACE.filters.horizonLabel}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={activeHorizon === ALL_FILTER_VALUE ? 'default' : 'outline'}
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => setActiveHorizon(ALL_FILTER_VALUE)}
                >
                  {AI_INSIGHTS_SURFACE.filters.allHorizonLabel}
                </Button>
                {AI_INSIGHTS_SURFACE.filters.horizons.map((horizon) => (
                  <Button
                    key={horizon.id}
                    size="sm"
                    variant={activeHorizon === horizon.id ? 'default' : 'outline'}
                    className="h-7 rounded-full px-3 text-[11px]"
                    onClick={() => setActiveHorizon(horizon.id)}
                  >
                    {horizon.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {AI_INSIGHTS_SURFACE.filters.confidenceLabel}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={activeConfidenceTier === ALL_FILTER_VALUE ? 'default' : 'outline'}
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => setActiveConfidenceTier(ALL_FILTER_VALUE)}
                >
                  {AI_INSIGHTS_SURFACE.filters.allConfidenceLabel}
                </Button>
                {AI_INSIGHTS_SURFACE.filters.confidenceTiers.map((tier) => (
                  <Button
                    key={tier.id}
                    size="sm"
                    variant={activeConfidenceTier === tier.id ? 'default' : 'outline'}
                    className="h-7 rounded-full px-3 text-[11px]"
                    onClick={() => setActiveConfidenceTier(tier.id)}
                  >
                    {tier.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {hasStaleInsights ? (
            <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold text-amber-200">
                {AI_INSIGHTS_SURFACE.freshness.staleCallout.title}
              </p>
              <p className="mt-1 text-[11px] text-amber-100/90">
                {AI_INSIGHTS_SURFACE.freshness.staleCallout.description}
              </p>
            </div>
          ) : null}

          <p className="text-[11px] text-muted-foreground">
            Showing {visibleInsights.length} insight{visibleInsights.length === 1 ? '' : 's'}
          </p>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
            <p className={`text-[11px] ${cooldownToneHelperClass}`}>
              {formatAutoRefreshCopy(AI_INSIGHTS_SURFACE.autoRefresh.helperTemplate, AI_INSIGHTS_SURFACE.refreshMinutes)}
            </p>
            <p className={AI_INSIGHTS_SURFACE.autoRefresh.cooldownRowClass}>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${cooldownToneChipClass} ${cooldownToneColorClass}`}>
                <span aria-hidden>{cooldownToneIcon}</span>
                <span>
                  {cooldownToneLabel}: {cooldownTone === 'due-now'
                    ? formatDueNowCooldownPhrase({
                      countdownTemplate: dueNowCountdownTemplate,
                      emphasis: dueNowCountdownEmphasis,
                      separator: dueNowCountdownSeparator,
                      countdown: formatAutoRefreshCopy(
                        AI_INSIGHTS_SURFACE.autoRefresh.cooldownTemplate,
                        nextAutoRefreshInMinutes,
                      ),
                    })
                    : formatOnTrackCooldownPhrase({
                      countdownTemplate: AI_INSIGHTS_SURFACE.autoRefresh.cooldownTemplate,
                      countdown: nextAutoRefreshInMinutes,
                    })}
                </span>
              </span>
            </p>
            <p className={`mt-1 text-[11px] ${cooldownToneDescriptionClass}`}>{cooldownToneDescription}</p>
          </div>


          <div className="space-y-2">
            {visibleInsights.length > 0 ? (
              visibleInsights.map((insight) => (
                <div key={insight.id} className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{insight.symbol}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                        {insight.horizon}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getInsightAgeMinutes(insight.updatedAt) >= AI_INSIGHTS_SURFACE.freshness.staleAfterMinutes
                          ? 'border border-amber-400/50 bg-amber-500/10 text-amber-200'
                          : 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                          }`}
                      >
                        {AI_INSIGHTS_SURFACE.freshness.label}:{' '}
                        {getInsightAgeMinutes(insight.updatedAt) >= AI_INSIGHTS_SURFACE.freshness.staleAfterMinutes
                          ? AI_INSIGHTS_SURFACE.freshness.staleLabel
                          : AI_INSIGHTS_SURFACE.freshness.freshLabel}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-foreground">{insight.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{insight.summary}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                    <span>
                      {AI_INSIGHTS_SURFACE.freshness.relativeAge.updatedLabel}:{' '}
                      {formatRelativeInsightAge(insight.updatedAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-center">
                <p className="text-sm font-semibold text-foreground">{AI_INSIGHTS_SURFACE.emptyState.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{AI_INSIGHTS_SURFACE.emptyState.description}</p>
                {hasActiveFilters ? (
                  <Button size="sm" variant="outline" className="mt-3" onClick={resetFilters}>
                    {AI_INSIGHTS_SURFACE.emptyState.ctaLabel}
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full" disabled>
            {AI_INSIGHTS_SURFACE.ctaLabel} (provider wiring next)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
