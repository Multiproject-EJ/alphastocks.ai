import type { EconomyState } from '@/lib/economyState'

export const MOMENTUM_MAX = 100
export const MOMENTUM_MIN = 0
export const MOMENTUM_DECAY_PER_MINUTE = 1
export const MOMENTUM_GAIN_SCALE = 40
export const DEFAULT_BASE_NET_WORTH = 100000

const MS_PER_MINUTE = 60 * 1000

export interface MomentumSnapshot {
  momentum: number
  momentumFloor: number
  momentumPeak: number
  lastUpdatedAt: string
}

function clampMomentum(value: number): number {
  if (!Number.isFinite(value)) return MOMENTUM_MIN
  return Math.min(MOMENTUM_MAX, Math.max(MOMENTUM_MIN, value))
}

function parseLastUpdatedAt(lastUpdatedAt: string, fallback: Date): Date {
  const parsed = new Date(lastUpdatedAt)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

export function applyMomentumDecay(economy: EconomyState, now: Date): EconomyState {
  const lastUpdated = parseLastUpdatedAt(economy.lastUpdatedAt, now)
  const elapsedMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / MS_PER_MINUTE)

  if (elapsedMinutes <= 0 || economy.momentum <= MOMENTUM_MIN) {
    return economy
  }

  const decayedMomentum = clampMomentum(economy.momentum - elapsedMinutes * MOMENTUM_DECAY_PER_MINUTE)
  const nextFloor = Math.min(economy.momentumFloor, decayedMomentum)
  const nextPeak = Math.max(economy.momentumPeak, decayedMomentum)

  if (
    decayedMomentum === economy.momentum &&
    nextFloor === economy.momentumFloor &&
    nextPeak === economy.momentumPeak
  ) {
    return economy
  }

  return {
    ...economy,
    momentum: decayedMomentum,
    momentumFloor: nextFloor,
    momentumPeak: nextPeak,
    lastUpdatedAt: now.toISOString(),
  }
}

export function calculateMomentumGain(deltaNetWorth: number, baseNetWorth: number): number {
  if (!Number.isFinite(deltaNetWorth) || deltaNetWorth <= 0) return 0

  const safeBase = Number.isFinite(baseNetWorth) && baseNetWorth > 0 ? baseNetWorth : DEFAULT_BASE_NET_WORTH
  const percentGain = deltaNetWorth / safeBase
  return Math.max(1, Math.round(percentGain * MOMENTUM_GAIN_SCALE))
}

export function applyMomentumFromNetWorthChange(
  economy: EconomyState,
  deltaNetWorth: number,
  now: Date,
  baseNetWorth: number
): EconomyState {
  const decayedEconomy = applyMomentumDecay(economy, now)
  const momentumGain = calculateMomentumGain(deltaNetWorth, baseNetWorth)

  if (momentumGain <= 0) {
    return decayedEconomy === economy ? economy : decayedEconomy
  }

  const nextMomentum = clampMomentum(decayedEconomy.momentum + momentumGain)
  const nextFloor = Math.min(decayedEconomy.momentumFloor, nextMomentum)
  const nextPeak = Math.max(decayedEconomy.momentumPeak, nextMomentum)

  if (
    nextMomentum === decayedEconomy.momentum &&
    nextFloor === decayedEconomy.momentumFloor &&
    nextPeak === decayedEconomy.momentumPeak
  ) {
    return decayedEconomy
  }

  return {
    ...decayedEconomy,
    momentum: nextMomentum,
    momentumFloor: nextFloor,
    momentumPeak: nextPeak,
    lastUpdatedAt: now.toISOString(),
  }
}
