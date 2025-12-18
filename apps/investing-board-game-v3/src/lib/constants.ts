// Game configuration constants

/** Maximum number of dice rolls allowed per day (bonus rolls) */
export const DAILY_ROLL_LIMIT = 10

/** Maximum energy rolls that can be stored */
export const ENERGY_MAX = 50

/** Time in minutes between energy regenerations */
export const ENERGY_REGEN_MINUTES = 30

/** Debounce delay for auto-save in milliseconds */
export const AUTO_SAVE_DEBOUNCE_MS = 2000

/** Timeout delay for triggering auto-save after state changes in milliseconds */
export const AUTO_SAVE_TIMEOUT_MS = 1000

/** Starting cash amount for new games */
export const STARTING_CASH = 100000

/** Starting net worth for new games */
export const STARTING_NET_WORTH = 100000

/** Available roll multipliers */
export const MULTIPLIERS = [1, 5, 10, 25, 50] as const
export type RollMultiplier = typeof MULTIPLIERS[number]

/**
 * Calculate the next midnight time for daily roll reset
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow
}
