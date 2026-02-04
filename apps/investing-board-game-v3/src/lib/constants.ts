// Game configuration constants
import {
  CATEGORY_OWNERSHIP_MAX_REWARD,
  DAILY_ROLL_LIMIT,
  ENERGY_MAX,
  ENERGY_REGEN_MINUTES,
  JACKPOT_PASS_START_AMOUNT,
  MULTIPLIERS,
  STARTING_CASH,
  STARTING_NET_WORTH,
} from '@/config/economy'

export {
  CATEGORY_OWNERSHIP_MAX_REWARD,
  DAILY_ROLL_LIMIT,
  ENERGY_MAX,
  ENERGY_REGEN_MINUTES,
  JACKPOT_PASS_START_AMOUNT,
  MULTIPLIERS,
  STARTING_CASH,
  STARTING_NET_WORTH,
}

/** Debounce delay for auto-save in milliseconds */
export const AUTO_SAVE_DEBOUNCE_MS = 2000

/** Timeout delay for triggering auto-save after state changes in milliseconds */
export const AUTO_SAVE_TIMEOUT_MS = 1000

export type RollMultiplier = typeof MULTIPLIERS[number]

/** Tile dimensions for board tiles */
export const TILE_WIDTH = 112
export const TILE_HEIGHT = 128

/**
 * Calculate cash reward for landing on a category tile where player owns stock
 * @param ownershipPercent - Percentage of portfolio in this category (0-100)
 * @returns Cash reward amount (10% = $10,000, 100% = $100,000)
 */
export function calculateCategoryOwnershipReward(ownershipPercent: number): number {
  // Linear scaling: 10% ownership = $10,000, 100% ownership = $100,000
  const clampedPercent = Math.max(0, Math.min(100, ownershipPercent))
  return Math.floor((clampedPercent / 100) * CATEGORY_OWNERSHIP_MAX_REWARD)
}

/**
 * Calculate the next midnight time for daily roll reset
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow
}
