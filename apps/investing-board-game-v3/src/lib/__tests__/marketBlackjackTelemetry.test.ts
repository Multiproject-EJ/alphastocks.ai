import {
  createInitialMarketBlackjackSessionStats,
  getMarketBlackjackWinRate,
  updateMarketBlackjackSessionStats,
} from '@/lib/marketBlackjackTelemetry'
import { describe, expect, it } from 'vitest'

describe('marketBlackjackTelemetry', () => {
  it('tracks hands, wins, blackjacks, pushes, and net cash', () => {
    const initial = createInitialMarketBlackjackSessionStats()

    const afterBlackjack = updateMarketBlackjackSessionStats(initial, {
      outcome: 'blackjack',
      payout: 2500,
      stake: 1000,
    })
    const afterPush = updateMarketBlackjackSessionStats(afterBlackjack, {
      outcome: 'push',
      payout: 1000,
      stake: 1000,
    })

    expect(afterPush.hands).toBe(2)
    expect(afterPush.wins).toBe(1)
    expect(afterPush.blackjacks).toBe(1)
    expect(afterPush.pushes).toBe(1)
    expect(afterPush.netCash).toBe(1500)
    expect(afterPush.bestPayout).toBe(2500)
  })

  it('returns 0 win rate when no hands were played', () => {
    expect(getMarketBlackjackWinRate(createInitialMarketBlackjackSessionStats())).toBe(0)
  })

  it('calculates win rate from tracked hands', () => {
    const stats = updateMarketBlackjackSessionStats(createInitialMarketBlackjackSessionStats(), {
      outcome: 'win',
      payout: 2000,
      stake: 1000,
    })
    const next = updateMarketBlackjackSessionStats(stats, {
      outcome: 'loss',
      payout: 0,
      stake: 1000,
    })

    expect(getMarketBlackjackWinRate(next)).toBe(0.5)
  })
})
