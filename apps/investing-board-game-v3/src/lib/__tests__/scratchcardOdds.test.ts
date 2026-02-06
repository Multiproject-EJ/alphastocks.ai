import { describe, expect, it } from 'vitest'

import { getScratchcardOddsSummary } from '@/lib/scratchcardOdds'
import type { ScratchcardTier } from '@/lib/scratchcardTiers'

describe('getScratchcardOddsSummary', () => {
  it('calculates EV summaries and ranges per currency', () => {
    const tier: ScratchcardTier = {
      id: 'bronze',
      name: 'Test Tier',
      entryCost: { currency: 'coins', amount: 25 },
      symbolPool: ['🍀', '💎'],
      grid: { rows: 2, columns: 2 },
      prizeSlots: 2,
      winPatterns: ['row'],
      odds: { winChance: 0.5, jackpotChance: 0, multiplierChance: 0 },
      prizes: [
        { label: 'Coins Small', minAmount: 10, maxAmount: 20, weight: 1, currency: 'coins' },
        { label: 'Coins Large', minAmount: 30, maxAmount: 50, weight: 3, currency: 'coins' },
        { label: 'Cash Flat', minAmount: 100, maxAmount: 100, weight: 2, currency: 'cash' },
      ],
    }

    const summary = getScratchcardOddsSummary(tier)

    expect(summary.evByCurrency.coins).toBeCloseTo(33.75, 2)
    expect(summary.evByCurrency.cash).toBeCloseTo(100, 2)
    expect(summary.evRangeByCurrency.coins).toEqual({ min: 10, max: 50 })
    expect(summary.evRangeByCurrency.cash).toEqual({ min: 100, max: 100 })

    const cashSummary = summary.evSummary.find((entry) => entry.currency === 'cash')
    const coinsSummary = summary.evSummary.find((entry) => entry.currency === 'coins')

    expect(cashSummary).toEqual({ currency: 'cash', average: 100, min: 100, max: 100 })
    expect(coinsSummary).toEqual({ currency: 'coins', average: 33.75, min: 10, max: 50 })
  })
})
