import { describe, expect, it } from 'vitest'

import {
  AI_INSIGHTS_FIXTURES,
  AI_INSIGHTS_SURFACE,
  normalizeDueNowCountdownToken,
  normalizeDueNowCountdownTemplate,
  normalizeDaysTemplate,
  normalizeHoursTemplate,
  normalizeMinutesTemplate,
  normalizeOnTrackCooldownTemplate,
  normalizeRelativeAgeFallbackTemplate,
  normalizeRelativeAgeThresholdMinutes,
  normalizeRelativeAgeDayCountDivisorMinutes,
  formatDueNowCooldownPhrase,
  formatOnTrackCooldownPhrase,
  formatRelativeAgeDaysPhrase,
  formatRelativeAgeFallbackPhrase,
  formatRelativeAgeHoursPhrase,
  formatRelativeAgePhrase,
  normalizeCooldownCountdownValue,
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
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.hoursAgoTemplate).toContain('{hours}')
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.daysAgoTemplate).toContain('{days}')
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.hoursThresholdMinutes).toBeGreaterThanOrEqual(1)
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.daysThresholdMinutes).toBeGreaterThan(
      AI_INSIGHTS_SURFACE.freshness.relativeAge.hoursThresholdMinutes,
    )
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.dayCountDivisorMinutes).toBeGreaterThanOrEqual(1)
    expect(AI_INSIGHTS_SURFACE.freshness.relativeAge.fallbackTemplate).toContain('{label}')
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

  it('applies on-track cooldown template guardrails for placeholder-safe copy', () => {
    const fallback = 'Next refresh in {minutes}m'

    expect(normalizeOnTrackCooldownTemplate('Next refresh in {minutes}m', fallback)).toBe(
      'Next refresh in {minutes}m',
    )
    expect(normalizeOnTrackCooldownTemplate('{minutes} minutes to next refresh', fallback)).toBe(
      '{minutes} minutes to next refresh',
    )
    expect(normalizeOnTrackCooldownTemplate('Refresh soon', fallback)).toBe(fallback)
    expect(normalizeOnTrackCooldownTemplate('', fallback)).toBe(fallback)
  })

  it('applies helper/cooldown minutes template guardrails for placeholder-safe copy', () => {
    const helperFallback = 'Auto-refreshes every {minutes}m while this panel is open.'
    const cooldownFallback = 'Next refresh in {minutes}m'

    expect(normalizeMinutesTemplate('Auto-refreshes every {minutes} minutes.', helperFallback)).toBe(
      'Auto-refreshes every {minutes} minutes.',
    )
    expect(normalizeMinutesTemplate('{minutes}m remaining', cooldownFallback)).toBe('{minutes}m remaining')
    expect(normalizeMinutesTemplate('Auto-refresh active', helperFallback)).toBe(helperFallback)
    expect(normalizeMinutesTemplate('', cooldownFallback)).toBe(cooldownFallback)
  })

  it('applies relative-age minutes template guardrails for placeholder-safe copy', () => {
    const fallback = '{minutes}m ago'

    expect(normalizeMinutesTemplate('{minutes} minutes ago', fallback)).toBe('{minutes} minutes ago')
    expect(normalizeMinutesTemplate('moments ago', fallback)).toBe(fallback)
    expect(normalizeMinutesTemplate('', fallback)).toBe(fallback)
  })


  it('applies relative-age day template guardrails for extra-long-age labels', () => {
    const fallback = '{days}d ago'

    expect(normalizeDaysTemplate('{days} days ago', fallback)).toBe('{days} days ago')
    expect(normalizeDaysTemplate('older', fallback)).toBe(fallback)
    expect(normalizeDaysTemplate('', fallback)).toBe(fallback)
    expect(normalizeDaysTemplate('older', 'days ago')).toBe('{days}d ago')
  })

  it('applies relative-age hour template guardrails for long-age labels', () => {
    const fallback = '{hours}h ago'

    expect(normalizeHoursTemplate('{hours} hours ago', fallback)).toBe('{hours} hours ago')
    expect(normalizeHoursTemplate('older', fallback)).toBe(fallback)
    expect(normalizeHoursTemplate('', fallback)).toBe(fallback)
  })

  it('applies relative-age hour/day threshold guardrails for deterministic long-age switching', () => {
    expect(normalizeRelativeAgeThresholdMinutes({
      hoursThresholdMinutes: 90,
      daysThresholdMinutes: 1800,
    })).toEqual({
      hoursThresholdMinutes: 90,
      daysThresholdMinutes: 1800,
    })

    expect(normalizeRelativeAgeThresholdMinutes({
      hoursThresholdMinutes: 0,
      daysThresholdMinutes: 30,
    })).toEqual({
      hoursThresholdMinutes: 1,
      daysThresholdMinutes: 30,
    })

    expect(normalizeRelativeAgeThresholdMinutes({
      hoursThresholdMinutes: 240,
      daysThresholdMinutes: 120,
    })).toEqual({
      hoursThresholdMinutes: 240,
      daysThresholdMinutes: 241,
    })

    expect(normalizeRelativeAgeThresholdMinutes({
      hoursThresholdMinutes: Number.NaN,
      daysThresholdMinutes: Number.NaN,
    })).toEqual({
      hoursThresholdMinutes: 60,
      daysThresholdMinutes: 1440,
    })
  })

  it('applies relative-age day-count divisor guardrails for deterministic day label math', () => {
    expect(normalizeRelativeAgeDayCountDivisorMinutes({
      dayCountDivisorMinutes: 720,
    })).toBe(720)

    expect(normalizeRelativeAgeDayCountDivisorMinutes({
      dayCountDivisorMinutes: 0,
    })).toBe(1)

    expect(normalizeRelativeAgeDayCountDivisorMinutes({
      dayCountDivisorMinutes: Number.NaN,
      fallbackDayCountDivisorMinutes: 2880,
    })).toBe(2880)

    expect(normalizeRelativeAgeDayCountDivisorMinutes({
      dayCountDivisorMinutes: Number.NaN,
      fallbackDayCountDivisorMinutes: 0,
    })).toBe(1440)
  })

  it('applies relative-age fallback template guardrails for non-minute labels', () => {
    const fallback = '{label}'

    expect(normalizeRelativeAgeFallbackTemplate('Updated: {label}', fallback)).toBe('Updated: {label}')
    expect(normalizeRelativeAgeFallbackTemplate('Updated recently', fallback)).toBe(fallback)
    expect(normalizeRelativeAgeFallbackTemplate('', fallback)).toBe(fallback)
  })


  it('normalizes cooldown countdown values to finite non-negative whole minutes', () => {
    expect(normalizeCooldownCountdownValue(9.8)).toBe(9)
    expect(normalizeCooldownCountdownValue(-2)).toBe(0)
    expect(normalizeCooldownCountdownValue(Number.NaN, 4)).toBe(4)
    expect(normalizeCooldownCountdownValue(Number.POSITIVE_INFINITY, 3)).toBe(3)
    expect(normalizeCooldownCountdownValue(undefined, 2.6)).toBe(2)
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


  it('formats on-track cooldown phrases with centralized token assembly', () => {
    expect(formatOnTrackCooldownPhrase({
      countdownTemplate: 'Next refresh in {minutes}m',
      countdown: 12,
    })).toBe('Next refresh in 12m')

    expect(formatOnTrackCooldownPhrase({
      countdownTemplate: '{minutes} minutes to next refresh',
      countdown: 3,
    })).toBe('3 minutes to next refresh')

    expect(formatOnTrackCooldownPhrase({
      countdownTemplate: 'Next refresh in {minutes}m',
      countdown: Number.NaN,
    })).toBe('Next refresh in 0m')
  })


  it('formats relative-age phrases with centralized token assembly', () => {
    expect(formatRelativeAgePhrase({
      minutesAgoTemplate: '{minutes}m ago',
      minutesAgo: 8,
    })).toBe('8m ago')

    expect(formatRelativeAgePhrase({
      minutesAgoTemplate: '{minutes} minutes ago',
      minutesAgo: 2.9,
    })).toBe('2 minutes ago')

    expect(formatRelativeAgePhrase({
      minutesAgoTemplate: '{minutes}m ago',
      minutesAgo: Number.NaN,
    })).toBe('0m ago')
  })

  it('formats relative-age day phrases with centralized token assembly', () => {
    expect(formatRelativeAgeDaysPhrase({
      daysAgoTemplate: '{days}d ago',
      daysAgo: 3,
    })).toBe('3d ago')

    expect(formatRelativeAgeDaysPhrase({
      daysAgoTemplate: '{days} days ago',
      daysAgo: 1.9,
    })).toBe('1 days ago')

    expect(formatRelativeAgeDaysPhrase({
      daysAgoTemplate: '{days}d ago',
      daysAgo: Number.NaN,
    })).toBe('0d ago')
  })

  it('formats relative-age hour phrases with centralized token assembly', () => {
    expect(formatRelativeAgeHoursPhrase({
      hoursAgoTemplate: '{hours}h ago',
      hoursAgo: 4,
    })).toBe('4h ago')

    expect(formatRelativeAgeHoursPhrase({
      hoursAgoTemplate: '{hours} hours ago',
      hoursAgo: 2.9,
    })).toBe('2 hours ago')

    expect(formatRelativeAgeHoursPhrase({
      hoursAgoTemplate: '{hours}h ago',
      hoursAgo: Number.NaN,
    })).toBe('0h ago')
  })

  it('formats relative-age fallback phrases with centralized label token assembly', () => {
    expect(formatRelativeAgeFallbackPhrase({
      fallbackTemplate: '{label}',
      label: 'Just now',
    })).toBe('Just now')

    expect(formatRelativeAgeFallbackPhrase({
      fallbackTemplate: 'Updated: {label}',
      label: 'Time unavailable',
    })).toBe('Updated: Time unavailable')
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
