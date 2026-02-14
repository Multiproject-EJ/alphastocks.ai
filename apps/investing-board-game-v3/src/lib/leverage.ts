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


export function getRollsBasedMultiplierCap(rollsRemaining: number): number {
  if (rollsRemaining >= 100) return 50
  if (rollsRemaining >= 30) return 20
  if (rollsRemaining >= 20) return 10
  if (rollsRemaining >= 10) return 5
  if (rollsRemaining >= 5) return 2
  return 1
}

export function getAvailableMultipliers(level: number, rollsRemaining: number): RollMultiplier[] {
  const unlocked = getUnlockedMultipliers(level)
  const rollsCap = getRollsBasedMultiplierCap(rollsRemaining)
  const filtered = unlocked.filter(multiplier => multiplier <= rollsCap)
  return filtered.length > 0 ? filtered : [MULTIPLIERS[0]]
}

export function clampMultiplierByRollsAndLeverage(multiplier: number, level: number, rollsRemaining: number): RollMultiplier {
  const available = getAvailableMultipliers(level, rollsRemaining)
  if (available.includes(multiplier as RollMultiplier)) {
    return multiplier as RollMultiplier
  }
  return available[available.length - 1] ?? MULTIPLIERS[0]
}
