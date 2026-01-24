import { GameState } from '@/lib/types'

export const ECONOMY_STATE_VERSION = 1
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
  const rawMomentum = Number.isFinite(state.momentum) ? Number(state.momentum) : base.momentum
  const momentum = Math.min(MOMENTUM_MAX, Math.max(MOMENTUM_MIN, rawMomentum))
  const rawMomentumFloor = Number.isFinite(state.momentumFloor)
    ? Number(state.momentumFloor)
    : Math.min(base.momentumFloor, momentum)
  const rawMomentumPeak = Number.isFinite(state.momentumPeak)
    ? Number(state.momentumPeak)
    : Math.max(base.momentumPeak, momentum)
  const momentumFloor = Math.min(momentum, Math.max(MOMENTUM_MIN, rawMomentumFloor))
  const momentumPeak = Math.max(momentum, Math.min(MOMENTUM_MAX, rawMomentumPeak))

  return {
    version: ECONOMY_STATE_VERSION,
    leverageLevel: Math.max(0, Math.floor(leverageLevel)),
    momentum,
    momentumFloor: Math.min(momentumFloor, momentum),
    momentumPeak: Math.max(momentumPeak, momentum),
    lastUpdatedAt: typeof state.lastUpdatedAt === 'string' ? state.lastUpdatedAt : base.lastUpdatedAt,
  }
}

export function extractEconomyState(gameState: GameState): EconomyState {
  return normalizeEconomyState(gameState.economy)
}
