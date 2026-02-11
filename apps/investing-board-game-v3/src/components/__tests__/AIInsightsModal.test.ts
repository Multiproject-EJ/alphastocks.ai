import { afterEach, describe, expect, it, vi } from 'vitest'

import { formatRelativeInsightAge } from '@/components/AIInsightsModal'
import { AI_INSIGHTS_SURFACE } from '@/lib/aiInsightsFixtures'

const DEFAULT_RELATIVE_AGE_CONFIG = {
  fallbackTemplate: AI_INSIGHTS_SURFACE.freshness.relativeAge.fallbackTemplate,
  unavailableLabel: AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel,
  justNowLabel: AI_INSIGHTS_SURFACE.freshness.relativeAge.justNowLabel,
}

describe('AIInsightsModal relative age rendering', () => {
  afterEach(() => {
    vi.useRealTimers()
    AI_INSIGHTS_SURFACE.freshness.relativeAge.dayCountMinimum = 1
    AI_INSIGHTS_SURFACE.freshness.relativeAge.fallbackTemplate = DEFAULT_RELATIVE_AGE_CONFIG.fallbackTemplate
    AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel = DEFAULT_RELATIVE_AGE_CONFIG.unavailableLabel
    AI_INSIGHTS_SURFACE.freshness.relativeAge.justNowLabel = DEFAULT_RELATIVE_AGE_CONFIG.justNowLabel
  })

  it('respects config-first day-count minimum when rendering day-age labels', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'))

    AI_INSIGHTS_SURFACE.freshness.relativeAge.dayCountMinimum = 5

    expect(formatRelativeInsightAge('2026-02-11T12:01:00.000Z')).toBe('5d ago')
  })

  it('renders computed day count when above the configured minimum', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'))

    AI_INSIGHTS_SURFACE.freshness.relativeAge.dayCountMinimum = 2

    expect(formatRelativeInsightAge('2026-02-09T12:00:00.000Z')).toBe('3d ago')
  })

  it('renders the config-first unavailable label when relative-age input is invalid', () => {
    AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel = 'Feed offline'

    expect(formatRelativeInsightAge('not-a-timestamp')).toBe('Feed offline')
  })

  it('applies fallback-template overrides when rendering non-minute relative-age labels', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-12T12:00:00.000Z'))

    AI_INSIGHTS_SURFACE.freshness.relativeAge.fallbackTemplate = 'Updated {label}'
    AI_INSIGHTS_SURFACE.freshness.relativeAge.justNowLabel = 'Just now'
    AI_INSIGHTS_SURFACE.freshness.relativeAge.unavailableLabel = 'Feed offline'

    expect(formatRelativeInsightAge('2026-02-12T12:00:00.000Z')).toBe('Updated Just now')
    expect(formatRelativeInsightAge('not-a-timestamp')).toBe('Updated Feed offline')
  })
})
