import type { CasinoBlackjackConfig, CasinoBlackjackSideBet } from '@/config/casino'

export type MarketBlackjackOddsSummary = {
  winChance: number
  blackjackChance: number
  pushChance: number
  lossChance: number
  adjustedWinChance: number
  adjustedLossChance: number
  expectedMainPayout: number
  expectedMainNet: number
}

export type MarketBlackjackSideBetSummary = {
  sideBetCost: number
  sideBetWinChance: number
  sideBetExpectedPayout: number
  sideBetExpectedNet: number
}

const clampProbability = (value: number) => Math.max(0, Math.min(1, value))

export const getMarketBlackjackOddsSummary = (
  config: CasinoBlackjackConfig,
  betAmount: number,
  luckBoost = 0,
): MarketBlackjackOddsSummary => {
  const safeBet = Math.max(0, Math.floor(betAmount))
  const winChance = clampProbability(config.odds.baseWinChance)
  const blackjackChance = clampProbability(config.odds.blackjackChance)
  const pushChance = clampProbability(config.odds.pushChance)
  const lossChance = clampProbability(1 - winChance - blackjackChance - pushChance)

  const adjustedWinChance = clampProbability(winChance + (1 - winChance) * clampProbability(luckBoost) * 0.1)
  const adjustedLossChance = clampProbability(1 - adjustedWinChance - blackjackChance - pushChance)

  const expectedMainPayout =
    safeBet *
    (adjustedWinChance * config.payouts.win +
      blackjackChance * config.payouts.blackjack +
      pushChance * config.payouts.push)

  const expectedMainNet = expectedMainPayout - safeBet

  return {
    winChance,
    blackjackChance,
    pushChance,
    lossChance,
    adjustedWinChance,
    adjustedLossChance,
    expectedMainPayout,
    expectedMainNet,
  }
}

export const getMarketBlackjackSideBetSummary = (
  config: CasinoBlackjackConfig,
  sideBet: CasinoBlackjackSideBet | null,
  betAmount: number,
): MarketBlackjackSideBetSummary => {
  const safeBet = Math.max(0, Math.floor(betAmount))
  const sideBetCost = sideBet ? Math.max(1, Math.round(safeBet * config.sideBetCostRate)) : 0
  const sideBetWinChance = sideBet ? clampProbability(config.odds.sideBetWinChances[sideBet.id] ?? 0) : 0
  const sideBetExpectedPayout = sideBet ? sideBetCost * sideBet.payout * sideBetWinChance : 0
  const sideBetExpectedNet = sideBetExpectedPayout - sideBetCost

  return {
    sideBetCost,
    sideBetWinChance,
    sideBetExpectedPayout,
    sideBetExpectedNet,
  }
}
