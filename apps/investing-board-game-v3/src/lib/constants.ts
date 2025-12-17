// Game configuration constants

/** Maximum number of dice rolls allowed per day */
export const DAILY_ROLL_LIMIT = 10

/** Debounce delay for auto-save in milliseconds */
export const AUTO_SAVE_DEBOUNCE_MS = 2000

/** Timeout delay for triggering auto-save after state changes in milliseconds */
export const AUTO_SAVE_TIMEOUT_MS = 1000

/** Starting cash amount for new games */
export const STARTING_CASH = 100000

/** Starting net worth for new games */
export const STARTING_NET_WORTH = 100000

/**
 * Calculate the next midnight time for daily roll reset
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow
}
