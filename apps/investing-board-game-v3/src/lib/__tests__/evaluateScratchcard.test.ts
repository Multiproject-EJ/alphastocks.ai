import { describe, expect, it } from 'vitest'

import { evaluateScratchcardResults } from '@/lib/evaluateScratchcard'
import type { ScratchcardTier } from '@/lib/scratchcardTiers'

const createRng = (values: number[]) => {
  let index = 0
  return () => {
    const value = values[Math.min(index, values.length - 1)]
    index += 1
    return value
  }
}

describe('evaluateScratchcardResults', () => {
  it('returns no prizes when no patterns match', () => {
    const tier: ScratchcardTier = {
      id: 'bronze',
      name: 'Test',
      entryCost: { currency: 'coins', amount: 10 },
      symbolPool: ['🍀', '💎'],
      grid: { rows: 1, columns: 3 },
      prizeSlots: 1,
      winPatterns: ['row'],
      odds: { winChance: 0, jackpotChance: 0, multiplierChance: 0 },
      prizes: [
        { label: 'Small', minAmount: 10, maxAmount: 10, weight: 1, currency: 'coins' },
      ],
    }

    const grid = ['🍀', '💎', '🍀']

    const results = evaluateScratchcardResults(grid, tier, createRng([0.2]))

    expect(results).toEqual([])
  })

  it('selects a weighted prize when a row matches', () => {
    const tier: ScratchcardTier = {
      id: 'bronze',
      name: 'Test',
      entryCost: { currency: 'coins', amount: 10 },
      symbolPool: ['🍀', '💎'],
      grid: { rows: 1, columns: 3 },
      prizeSlots: 1,
      winPatterns: ['row'],
      odds: { winChance: 0, jackpotChance: 0, multiplierChance: 0 },
      prizes: [
        { label: 'Small', minAmount: 10, maxAmount: 10, weight: 1, currency: 'coins' },
        { label: 'Big', minAmount: 50, maxAmount: 50, weight: 9, currency: 'coins' },
      ],
    }

    const grid = ['💎', '💎', '💎']

    const results = evaluateScratchcardResults(grid, tier, createRng([0.9, 0.1]))

    expect(results).toEqual([
      {
        label: 'Big',
        amount: 50,
        currency: 'coins',
        pattern: 'row',
      },
    ])
  })

  it('applies a multiplier when enabled', () => {
    const tier: ScratchcardTier = {
      id: 'gold',
      name: 'Test',
      entryCost: { currency: 'coins', amount: 10 },
      symbolPool: ['🍀', '💎'],
      grid: { rows: 1, columns: 3 },
      prizeSlots: 1,
      winPatterns: ['row', 'multiplier'],
      odds: { winChance: 0, jackpotChance: 1, multiplierChance: 1 },
      prizes: [
        { label: 'Jackpot', minAmount: 100, maxAmount: 100, weight: 1, currency: 'coins' },
      ],
    }

    const grid = ['🍀', '🍀', '🍀']

    const results = evaluateScratchcardResults(grid, tier, createRng([0, 0.5, 0, 0]))

    expect(results).toEqual([
      {
        label: 'Jackpot',
        amount: 300,
        currency: 'coins',
        pattern: 'row',
        multiplier: 3,
      },
    ])
  })
})
