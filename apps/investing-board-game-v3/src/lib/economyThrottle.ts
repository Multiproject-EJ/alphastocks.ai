import type { EconomyState } from '@/lib/economyState'

const MS_PER_MINUTE = 60 * 1000
const SOFT_THROTTLE_MIN_PERCENT = 0.08
const SOFT_THROTTLE_DURATION_MINUTES = 12
const SOFT_THROTTLE_MIN_MULTIPLIER = 0.6
const SOFT_THROTTLE_MAX_MULTIPLIER = 0.95

function clampThrottleMultiplier(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(1, Math.max(SOFT_THROTTLE_MIN_MULTIPLIER, value))
}

function parseThrottleUntil(throttleUntil: string | null | undefined, now: Date): Date | null {
  if (typeof throttleUntil !== 'string') return null
  const parsed = new Date(throttleUntil)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getTime() <= now.getTime()) return null
  return parsed
}

function calculateThrottleMultiplier(deltaNetWorth: number, baseNetWorth: number): number {
  if (!Number.isFinite(deltaNetWorth) || deltaNetWorth <= 0) return 1
  if (!Number.isFinite(baseNetWorth) || baseNetWorth <= 0) return 1

  const percentGain = deltaNetWorth / baseNetWorth
  if (percentGain < SOFT_THROTTLE_MIN_PERCENT) return 1
  if (percentGain >= 0.25) return 0.6
  if (percentGain >= 0.18) return 0.7
  if (percentGain >= 0.12) return 0.8
  return 0.9
}

export function getSoftThrottleMultiplier(economy: EconomyState, now: Date): number {
  if (!economy.throttleUntil) return 1
  const parsed = parseThrottleUntil(economy.throttleUntil, now)
  if (!parsed) return 1
  return clampThrottleMultiplier(economy.throttleMultiplier)
}

export function applySoftThrottleFromNetWorthChange(
  economy: EconomyState,
  deltaNetWorth: number,
  now: Date,
  baseNetWorth: number
): EconomyState {
  const throttleMultiplier = calculateThrottleMultiplier(deltaNetWorth, baseNetWorth)
  if (throttleMultiplier >= 1) return economy

  const existingUntil = parseThrottleUntil(economy.throttleUntil, now)
  const nextUntil = new Date(now.getTime() + SOFT_THROTTLE_DURATION_MINUTES * MS_PER_MINUTE)
  const nextThrottleUntil = existingUntil && existingUntil > nextUntil ? existingUntil : nextUntil
  const nextMultiplier = clampThrottleMultiplier(Math.min(economy.throttleMultiplier ?? 1, throttleMultiplier))

  if (
    economy.throttleUntil === nextThrottleUntil.toISOString() &&
    economy.throttleMultiplier === nextMultiplier
  ) {
    return economy
  }

  return {
    ...economy,
    throttleUntil: nextThrottleUntil.toISOString(),
    throttleMultiplier: nextMultiplier,
  }
}

export function tickEconomyThrottle(economy: EconomyState, now: Date): EconomyState {
  if (!economy.throttleUntil) return economy
  const parsed = parseThrottleUntil(economy.throttleUntil, now)
  if (parsed) return economy

  return {
    ...economy,
    throttleUntil: null,
    throttleMultiplier: 1,
  }
}
