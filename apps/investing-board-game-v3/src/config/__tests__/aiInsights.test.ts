import { describe, expect, it } from 'vitest'

import {
  AI_INSIGHTS_FIXTURES,
  AI_INSIGHTS_SURFACE,
  normalizeDueNowCountdownToken,
  normalizeDueNowCountdownTemplate,
  formatDueNowCooldownPhrase,
} from '@/config/aiInsights'

describe('aiInsights config', () => {
  it('loads a usable mobile-first surface config', () => {
    expect(AI_INSIGHTS_SURFACE.title.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.description.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.refreshMinutes).toBeGreaterThanOrEqual(5)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.helperTemplate).toContain('{minutes}')
    expect(AI_INSIGHTS_SURFACE.autoRefresh.cooldownTemplate).toContain('{minutes}')
    expect(AI_INSIGHTS_SURFACE.autoRefresh.cooldownRowClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackIcon.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowIcon.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackColorClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowColorClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackChipClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowChipClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackHelperClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowHelperClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackDescription.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowDescription.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.onTrackDescriptionClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowDescriptionClass.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownEmphasis.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownSeparator.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.autoRefresh.statusTones.dueNowCountdownTemplate).toContain('{countdown}')

    expect(AI_INSIGHTS_SURFACE.resetFiltersLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.label.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.freshLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.staleLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.staleAfterMinutes).toBeGreaterThanOrEqual(5)
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.updatedLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.justNowLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.minutesAgoTemplate).toContain('{minutes}')
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.staleCallout.title.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.freshness.staleCallout.description.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.title.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.description.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.ctaLabel.length).toBeGreaterThan(0)
  })


  it('applies due-now countdown template guardrails for placeholder-safe copy', () => {
    const fallback = '{emphasis}{separator}{countdown}'

    expect(normalizeDueNowCountdownTemplate('{emphasis}{separator}{countdown}', fallback)).toBe(
      '{emphasis}{separator}{countdown}',
    )
    expect(normalizeDueNowCountdownTemplate('{countdown}', fallback)).toBe(fallback)
    expect(normalizeDueNowCountdownTemplate('{emphasis}{countdown}', fallback)).toBe(fallback)
    expect(normalizeDueNowCountdownTemplate('due soon', fallback)).toBe(fallback)
  })

  it('applies due-now emphasis/separator guardrails for empty-token-safe chip copy', () => {
    expect(normalizeDueNowCountdownToken('Refresh now', 'Refresh now')).toBe('Refresh now')
    expect(normalizeDueNowCountdownToken('', 'Refresh now')).toBe('Refresh now')
    expect(normalizeDueNowCountdownToken('{countdown}', 'Refresh now')).toBe('Refresh now')
    expect(normalizeDueNowCountdownToken('{separator}', ' · ')).toBe(' · ')
  })


  it('formats due-now cooldown phrases with centralized token assembly', () => {
    expect(formatDueNowCooldownPhrase({
      countdownTemplate: '{emphasis}{separator}{countdown}',
      emphasis: 'Refresh now',
      separator: ' · ',
      countdown: 'Next refresh in 0m',
    })).toBe('Refresh now · Next refresh in 0m')

    expect(formatDueNowCooldownPhrase({
      countdownTemplate: '{countdown}{separator}{emphasis}',
      emphasis: 'Refresh now',
      separator: ' — ',
      countdown: 'Next refresh in 0m',
    })).toBe('Next refresh in 0m — Refresh now')
  })

  it('provides config-first filter chips for horizon and confidence tiers', () => {
    expect(AI_INSIGHTS_SURFACE.filters.horizons.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.filters.confidenceTiers.length).toBeGreaterThan(0)

    for (const horizon of AI_INSIGHTS_SURFACE.filters.horizons) {
      expect(['intraday', 'swing', 'position']).toContain(horizon.id)
      expect(horizon.label.length).toBeGreaterThan(0)
    }

    for (const tier of AI_INSIGHTS_SURFACE.filters.confidenceTiers) {
      expect(tier.id.length).toBeGreaterThan(0)
      expect(tier.label.length).toBeGreaterThan(0)
      expect(tier.min).toBeGreaterThanOrEqual(0)
      expect(tier.max).toBeLessThanOrEqual(1)
      expect(tier.max).toBeGreaterThanOrEqual(tier.min)
    }
  })

  it('exposes fixture cards with normalized confidence and symbols', () => {
    expect(AI_INSIGHTS_FIXTURES.length).toBeGreaterThan(0)

    for (const fixture of AI_INSIGHTS_FIXTURES) {
      expect(fixture.symbol).toBe(fixture.symbol.toUpperCase())
      expect(fixture.confidence).toBeGreaterThanOrEqual(0)
      expect(fixture.confidence).toBeLessThanOrEqual(1)
      expect(['intraday', 'swing', 'position']).toContain(fixture.horizon)
    }
  })
})
