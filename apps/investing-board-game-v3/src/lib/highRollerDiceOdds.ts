import type { CasinoDiceOption } from '@/config/casino'

export type HighRollerDiceOddsModifiers = {
  luckBoost?: number
  guaranteedWin?: boolean
  streak?: number
  streakCap?: number
}

export type HighRollerDiceOddsSummary = {
  baseWinChance: number
  adjustedWinChance: number
  streakMultiplier: number
  maxStreakMultiplier: number
  payoutPerWin: number
  maxPayout: number
  expectedPayout: number
}

const DICE_TOTALS: Array<{ total: number; weight: number }> = [
  { total: 2, weight: 1 },
  { total: 3, weight: 2 },
  { total: 4, weight: 3 },
  { total: 5, weight: 4 },
  { total: 6, weight: 5 },
  { total: 7, weight: 6 },
  { total: 8, weight: 5 },
  { total: 9, weight: 4 },
  { total: 10, weight: 3 },
  { total: 11, weight: 2 },
  { total: 12, weight: 1 },
]
const TOTAL_OUTCOMES = 36

const clampProbability = (value: number) => Math.max(0, Math.min(1, value))

export const getHighRollerDiceBaseWinChance = (target: number) => {
  if (target <= 2) {
    return 1
  }
  if (target > 12) {
    return 0
  }
  const winningWeight = DICE_TOTALS.reduce((sum, entry) => {
    if (entry.total >= target) {
      return sum + entry.weight
    }
    return sum
  }, 0)
  return winningWeight / TOTAL_OUTCOMES
}

export const getHighRollerDiceStreakMultiplier = (option: CasinoDiceOption, streak: number) =>
  1 + Math.max(0, streak - 1) * option.streakBonus

export const getHighRollerDiceOddsSummary = (
  option: CasinoDiceOption,
  modifiers: HighRollerDiceOddsModifiers = {},
): HighRollerDiceOddsSummary => {
  const baseWinChance = getHighRollerDiceBaseWinChance(option.target)
  const adjustedWinChance = modifiers.guaranteedWin
    ? 1
    : clampProbability(baseWinChance + (1 - baseWinChance) * (modifiers.luckBoost ?? 0))
  const streak = Math.max(1, Math.floor(modifiers.streak ?? 1))
  const streakCap = Math.max(1, Math.floor(modifiers.streakCap ?? 1))
  const streakMultiplier = getHighRollerDiceStreakMultiplier(option, streak)
  const maxStreakMultiplier = getHighRollerDiceStreakMultiplier(option, streakCap)
  const payoutPerWin = Math.round(option.payout * streakMultiplier)
  const maxPayout = Math.round(option.payout * maxStreakMultiplier)
  const expectedPayout = adjustedWinChance * payoutPerWin

  return {
    baseWinChance,
    adjustedWinChance,
    streakMultiplier,
    maxStreakMultiplier,
    payoutPerWin,
    maxPayout,
    expectedPayout,
  }
}
