import type { GameState } from './types'

export type PortfolioRewardBuff = {
  multiplier: number
  bonusPercent: number
  label: string
  categoryCount: number
  holdingsCount: number
}

const BUFF_TIERS = [
  { minCategories: 5, bonusPercent: 8, label: 'Portfolio Mastery' },
  { minCategories: 4, bonusPercent: 6, label: 'Wide Diversification' },
  { minCategories: 3, bonusPercent: 4, label: 'Balanced Mix' },
  { minCategories: 2, bonusPercent: 2, label: 'Diversified Start' },
]

export function getPortfolioRewardBuff(
  holdings: GameState['holdings']
): PortfolioRewardBuff {
  const holdingsCount = holdings.length
  const categoryCount = new Set(holdings.map((holding) => holding.stock.category)).size

  if (holdingsCount < 2 || categoryCount < 2) {
    return {
      multiplier: 1,
      bonusPercent: 0,
      label: 'No Portfolio Buff',
      categoryCount,
      holdingsCount,
    }
  }

  const tier = BUFF_TIERS.find((entry) => categoryCount >= entry.minCategories)
  const bonusPercent = tier?.bonusPercent ?? 0

  return {
    multiplier: 1 + bonusPercent / 100,
    bonusPercent,
    label: tier?.label ?? 'No Portfolio Buff',
    categoryCount,
    holdingsCount,
  }
}
