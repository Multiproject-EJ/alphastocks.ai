import { GameState } from '@/lib/types'
import {
  ECONOMY_WINDOW_MAX_MINUTES,
  ECONOMY_WINDOW_MIN_MINUTES,
  type EconomyWindowState,
} from '@/lib/economyWindows'

export const ECONOMY_STATE_VERSION = 3
export const ECONOMY_LOCAL_STORAGE_KEY = 'board-game-economy-state'
const MOMENTUM_MIN = 0
const MOMENTUM_MAX = 100

export interface EconomyState {
  version: number
  leverageLevel: number
  momentum: number
  momentumFloor: number
  momentumPeak: number
  lastUpdatedAt: string
  throttleMultiplier: number
  throttleUntil: string | null
  activeWindow: EconomyWindowState | null
  lastWindowStartedAt: string | null
  lastWindowEndedAt: string | null
}

function clampMomentum(value: number): number {
  if (!Number.isFinite(value)) return MOMENTUM_MIN
  return Math.min(MOMENTUM_MAX, Math.max(MOMENTUM_MIN, value))
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

function clampThrottleMultiplier(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(1, Math.max(0.6, Math.round(value * 100) / 100))
}

function normalizeThrottleUntil(value: string | null | undefined, now: Date): string | null {
  if (typeof value !== 'string') return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getTime() <= now.getTime()) return null
  return parsed.toISOString()
}

function normalizeWindow(window: EconomyWindowState | null | undefined): EconomyWindowState | null {
  if (!window) return null
  if (typeof window.startAt !== 'string' || typeof window.endAt !== 'string') return null

  const startAt = new Date(window.startAt)
  const endAt = new Date(window.endAt)
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return null
  if (endAt.getTime() <= startAt.getTime()) return null

  return {
    ...window,
    durationMinutes: clampDurationMinutes(window.durationMinutes),
    starsMultiplier: clampMultiplier(window.starsMultiplier),
    xpMultiplier: clampMultiplier(window.xpMultiplier),
  }
}

export function createInitialEconomyState(now: Date = new Date()): EconomyState {
  const isoNow = now.toISOString()
  return {
    version: ECONOMY_STATE_VERSION,
    leverageLevel: 0,
    momentum: 0,
    momentumFloor: 0,
    momentumPeak: 0,
    lastUpdatedAt: isoNow,
    throttleMultiplier: 1,
    throttleUntil: null,
    activeWindow: null,
    lastWindowStartedAt: null,
    lastWindowEndedAt: null,
  }
}

export function normalizeEconomyState(
  state: Partial<EconomyState> | null | undefined,
  now: Date = new Date()
): EconomyState {
  const base = createInitialEconomyState(now)
  if (!state) {
    return base
  }

  const leverageLevel = Number.isFinite(state.leverageLevel) ? Number(state.leverageLevel) : base.leverageLevel
  const momentum = clampMomentum(Number.isFinite(state.momentum) ? Number(state.momentum) : base.momentum)
  const rawMomentumFloor = Number.isFinite(state.momentumFloor)
    ? Number(state.momentumFloor)
    : Math.min(base.momentumFloor, momentum)
  const rawMomentumPeak = Number.isFinite(state.momentumPeak)
    ? Number(state.momentumPeak)
    : Math.max(base.momentumPeak, momentum)
  const momentumFloor = clampMomentum(Math.min(momentum, rawMomentumFloor))
  const momentumPeak = clampMomentum(Math.max(momentum, rawMomentumPeak))
  const throttleUntil = normalizeThrottleUntil(state.throttleUntil, now)
  const throttleMultiplier = throttleUntil
    ? clampThrottleMultiplier(Number.isFinite(state.throttleMultiplier) ? Number(state.throttleMultiplier) : 1)
    : 1

  return {
    version: ECONOMY_STATE_VERSION,
    leverageLevel: Math.max(0, Math.floor(leverageLevel)),
    momentum,
    momentumFloor,
    momentumPeak,
    lastUpdatedAt: typeof state.lastUpdatedAt === 'string' ? state.lastUpdatedAt : base.lastUpdatedAt,
    throttleMultiplier,
    throttleUntil,
    activeWindow: normalizeWindow(state.activeWindow),
    lastWindowStartedAt: typeof state.lastWindowStartedAt === 'string' ? state.lastWindowStartedAt : null,
    lastWindowEndedAt: typeof state.lastWindowEndedAt === 'string' ? state.lastWindowEndedAt : null,
  }
}

export function extractEconomyState(gameState: GameState): EconomyState {
  return normalizeEconomyState(gameState.economy)
}
