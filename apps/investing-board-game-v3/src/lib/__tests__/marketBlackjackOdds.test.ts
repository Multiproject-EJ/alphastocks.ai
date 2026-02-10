import { describe, expect, it } from 'vitest'

import { casinoConfig } from '@/config/casino'
import { getMarketBlackjackOddsSummary, getMarketBlackjackSideBetSummary } from '@/lib/marketBlackjackOdds'

describe('marketBlackjackOdds', () => {
  it('calculates expected main payout and keeps probabilities bounded', () => {
    const summary = getMarketBlackjackOddsSummary(casinoConfig.blackjack, 1000)

    expect(summary.winChance).toBeGreaterThanOrEqual(0)
    expect(summary.blackjackChance).toBeGreaterThanOrEqual(0)
    expect(summary.pushChance).toBeGreaterThanOrEqual(0)
    expect(summary.lossChance).toBeGreaterThanOrEqual(0)
    expect(summary.winChance + summary.blackjackChance + summary.pushChance + summary.lossChance).toBeLessThanOrEqual(1)
    expect(summary.expectedMainPayout).toBeGreaterThan(0)
  })

  it('applies luck boost as a win-chance tailwind', () => {
    const base = getMarketBlackjackOddsSummary(casinoConfig.blackjack, 1000, 0)
    const boosted = getMarketBlackjackOddsSummary(casinoConfig.blackjack, 1000, 1)

    expect(boosted.adjustedWinChance).toBeGreaterThan(base.adjustedWinChance)
    expect(boosted.adjustedLossChance).toBeLessThanOrEqual(base.adjustedLossChance)
  })

  it('calculates side bet expected values from config odds', () => {
    const sideBet = casinoConfig.blackjack.sideBets.find((entry) => entry.id === 'earnings-beat') ?? null
    const summary = getMarketBlackjackSideBetSummary(casinoConfig.blackjack, sideBet, 1000)

    expect(summary.sideBetCost).toBe(250)
    expect(summary.sideBetWinChance).toBe(casinoConfig.blackjack.odds.sideBetWinChances['earnings-beat'])
    expect(summary.sideBetExpectedPayout).toBeGreaterThan(0)
  })
})
