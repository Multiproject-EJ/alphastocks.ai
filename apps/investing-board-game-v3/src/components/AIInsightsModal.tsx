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
import { Sparkle } from '@phosphor-icons/react'

interface AIInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ALL_FILTER_VALUE = 'all'

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

          <p className="text-[11px] text-muted-foreground">
            Showing {visibleInsights.length} insight{visibleInsights.length === 1 ? '' : 's'}
          </p>

          <div className="space-y-2">
            {visibleInsights.length > 0 ? (
              visibleInsights.map((insight) => (
                <div key={insight.id} className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{insight.symbol}</p>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                      {insight.horizon}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-foreground">{insight.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{insight.summary}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                    <span>{new Date(insight.updatedAt).toLocaleString()}</span>
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
