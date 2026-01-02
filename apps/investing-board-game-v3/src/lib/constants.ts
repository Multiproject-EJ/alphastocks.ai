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
export const MULTIPLIERS = [1, 5, 10, 25, 50, 100] as const
export type RollMultiplier = typeof MULTIPLIERS[number]

/** Jackpot amount added when passing Start without landing on it */
export const JACKPOT_PASS_START_AMOUNT = 10000

/** Maximum cash reward for owning 100% of a category in portfolio */
export const CATEGORY_OWNERSHIP_MAX_REWARD = 100000

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
