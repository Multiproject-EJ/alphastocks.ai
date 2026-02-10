import { describe, expect, it } from 'vitest'

import { AI_INSIGHTS_FIXTURES, AI_INSIGHTS_SURFACE } from '@/config/aiInsights'

describe('aiInsights config', () => {
  it('loads a usable mobile-first surface config', () => {
    expect(AI_INSIGHTS_SURFACE.title.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.description.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.refreshMinutes).toBeGreaterThanOrEqual(5)

    expect(AI_INSIGHTS_SURFACE.resetFiltersLabel.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.title.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.description.length).toBeGreaterThan(0)
    expect(AI_INSIGHTS_SURFACE.emptyState.ctaLabel.length).toBeGreaterThan(0)
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
