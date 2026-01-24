import { MULTIPLIERS, type RollMultiplier } from '@/lib/constants'

export const LEVERAGE_MAX_LEVEL = MULTIPLIERS.length - 1

export function clampLeverageLevel(level: number): number {
  if (!Number.isFinite(level)) return 0
  return Math.max(0, Math.min(LEVERAGE_MAX_LEVEL, Math.floor(level)))
}

export function getUnlockedMultipliers(level: number): RollMultiplier[] {
  const leverageLevel = clampLeverageLevel(level)
  return MULTIPLIERS.slice(0, leverageLevel + 1)
}

export function isMultiplierUnlocked(multiplier: number, level: number): multiplier is RollMultiplier {
  const unlocked = getUnlockedMultipliers(level)
  return unlocked.includes(multiplier as RollMultiplier)
}

export function clampMultiplierToLeverage(multiplier: number, level: number): RollMultiplier {
  const unlocked = getUnlockedMultipliers(level)
  const fallback = unlocked[0] ?? MULTIPLIERS[0]
  if (unlocked.includes(multiplier as RollMultiplier)) {
    return multiplier as RollMultiplier
  }
  return fallback
}
