import type { EconomyState } from '@/lib/economyState'

const MS_PER_MINUTE = 60 * 1000
export const ECONOMY_WINDOW_MIN_MINUTES = 5
export const ECONOMY_WINDOW_MAX_MINUTES = 25
export const ECONOMY_WINDOW_COOLDOWN_MINUTES = 15
export const ECONOMY_WINDOW_MIN_MOMENTUM = 35
export const ECONOMY_WINDOW_MIN_LEVERAGE = 1
export const ECONOMY_WINDOW_RICH_LEVERAGE = 2
export const ECONOMY_WINDOW_HOT_MOMENTUM = 55
export const ECONOMY_WINDOW_HOT_STREAK_DELTA = 15
export const ECONOMY_WINDOW_HOT_NEAR_PEAK_DELTA = 12

export type EconomyWindowType = 'momentum_surge' | 'breakout_run' | 'volatility_spike'

export interface EconomyWindowState {
  id: string
  type: EconomyWindowType
  label: string
  startAt: string
  endAt: string
  durationMinutes: number
  starsMultiplier: number
  xpMultiplier: number
  triggerMomentum: number
  triggerLeverage: number
}

export interface EconomyWindowMultipliers {
  starsMultiplier: number
  xpMultiplier: number
}

function parseIso(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function clampDurationMinutes(value: number): number {
  if (!Number.isFinite(value)) return ECONOMY_WINDOW_MIN_MINUTES
  const rounded = Math.round(value)
  return Math.min(ECONOMY_WINDOW_MAX_MINUTES, Math.max(ECONOMY_WINDOW_MIN_MINUTES, rounded))
}

function clampMultiplier(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1
  return Math.min(3, Math.round(value * 100) / 100)
}

function getWindowType(leverageLevel: number, momentum: number): EconomyWindowType {
  const selector = (leverageLevel + Math.round(momentum)) % 3
  if (selector === 0) return 'momentum_surge'
  if (selector === 1) return 'breakout_run'
  return 'volatility_spike'
}

function getWindowLabel(type: EconomyWindowType): string {
  switch (type) {
    case 'momentum_surge':
      return 'Momentum Surge'
    case 'breakout_run':
      return 'Breakout Run'
    case 'volatility_spike':
    default:
      return 'Volatility Spike'
  }
}

function calculateDurationMinutes(momentum: number, leverageLevel: number): number {
  const momentumBoost = Math.floor(momentum / 8)
  const leverageBoost = leverageLevel * 2
  const rawDuration = ECONOMY_WINDOW_MIN_MINUTES + momentumBoost + leverageBoost
  return clampDurationMinutes(rawDuration)
}

function calculateMultipliers(momentum: number, leverageLevel: number, type: EconomyWindowType): EconomyWindowMultipliers {
  const momentumBand = Math.floor(momentum / 25)
  const leverageBand = Math.max(0, leverageLevel)

  const baseStars = 1.1 + momentumBand * 0.15
  const baseXp = 1.05 + leverageBand * 0.05

  if (type === 'breakout_run') {
    return {
      starsMultiplier: clampMultiplier(baseStars + 0.2),
      xpMultiplier: clampMultiplier(baseXp + 0.1),
    }
  }

  if (type === 'volatility_spike') {
    return {
      starsMultiplier: clampMultiplier(baseStars + leverageBand * 0.05),
      xpMultiplier: clampMultiplier(baseXp + momentumBand * 0.05),
    }
  }

  return {
    starsMultiplier: clampMultiplier(baseStars),
    xpMultiplier: clampMultiplier(baseXp + momentumBand * 0.05),
  }
}

function buildWindow(economy: EconomyState, now: Date): EconomyWindowState {
  const { momentum, leverageLevel } = economy
  const type = getWindowType(leverageLevel, momentum)
  const durationMinutes = calculateDurationMinutes(momentum, leverageLevel)
  const { starsMultiplier, xpMultiplier } = calculateMultipliers(momentum, leverageLevel, type)
  const startAt = now.toISOString()
  const endAt = new Date(now.getTime() + durationMinutes * MS_PER_MINUTE).toISOString()

  return {
    id: `window-${startAt}`,
    type,
    label: getWindowLabel(type),
    startAt,
    endAt,
    durationMinutes,
    starsMultiplier,
    xpMultiplier,
    triggerMomentum: momentum,
    triggerLeverage: leverageLevel,
  }
}

export function getActiveEconomyWindow(economy: EconomyState, now: Date): EconomyWindowState | null {
  const active = economy.activeWindow
  if (!active) return null
  const endAt = parseIso(active.endAt, now)
  return endAt.getTime() > now.getTime() ? active : null
}

export function getEconomyWindowMultipliers(economy: EconomyState, now: Date): EconomyWindowMultipliers {
  const active = getActiveEconomyWindow(economy, now)
  if (!active) {
    return { starsMultiplier: 1, xpMultiplier: 1 }
  }
  return {
    starsMultiplier: clampMultiplier(active.starsMultiplier),
    xpMultiplier: clampMultiplier(active.xpMultiplier),
  }
}

function hasCooldownElapsed(economy: EconomyState, now: Date): boolean {
  const lastEndedAt = economy.lastWindowEndedAt
  if (!lastEndedAt) return true
  const ended = parseIso(lastEndedAt, now)
  const elapsedMinutes = (now.getTime() - ended.getTime()) / MS_PER_MINUTE
  return elapsedMinutes >= ECONOMY_WINDOW_COOLDOWN_MINUTES
}

function isRich(economy: EconomyState): boolean {
  return economy.leverageLevel >= ECONOMY_WINDOW_RICH_LEVERAGE
}

function isHot(economy: EconomyState): boolean {
  const { momentum, momentumFloor, momentumPeak } = economy
  const streakDelta = momentum - momentumFloor
  const nearPeakDelta = Math.max(0, momentumPeak - momentum)
  return (
    momentum >= ECONOMY_WINDOW_HOT_MOMENTUM &&
    streakDelta >= ECONOMY_WINDOW_HOT_STREAK_DELTA &&
    nearPeakDelta <= ECONOMY_WINDOW_HOT_NEAR_PEAK_DELTA
  )
}

function shouldStartWindow(economy: EconomyState): boolean {
  const meetsMinimums =
    economy.momentum >= ECONOMY_WINDOW_MIN_MOMENTUM && economy.leverageLevel >= ECONOMY_WINDOW_MIN_LEVERAGE
  if (!meetsMinimums) return false
  return isRich(economy) && isHot(economy)
}

export function tickEconomyWindows(economy: EconomyState, now: Date): EconomyState {
  const activeWindow = economy.activeWindow
  const nowIso = now.toISOString()

  if (activeWindow) {
    const endAt = parseIso(activeWindow.endAt, now)
    if (endAt.getTime() > now.getTime()) {
      return economy
    }

    return {
      ...economy,
      activeWindow: null,
      lastWindowEndedAt: nowIso,
      lastUpdatedAt: nowIso,
    }
  }

  if (!hasCooldownElapsed(economy, now)) {
    return economy
  }

  if (!shouldStartWindow(economy)) {
    return economy
  }

  const nextWindow = buildWindow(economy, now)
  return {
    ...economy,
    activeWindow: nextWindow,
    lastWindowStartedAt: nextWindow.startAt,
    lastUpdatedAt: nowIso,
  }
}
