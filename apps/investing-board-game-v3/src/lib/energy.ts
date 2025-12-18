/**
 * Energy regeneration system for dice rolls
 * Implements auto-regenerating roll capacity similar to mobile game mechanics
 */

export const ENERGY_CONFIG = {
  /** Maximum number of rolls that can be stored */
  MAX_ROLLS: 50,
  /** Number of rolls regenerated per interval */
  REGEN_RATE: 1,
  /** Time in minutes between each roll regeneration */
  REGEN_INTERVAL_MINUTES: 30,
  /** Bonus rolls awarded daily (separate from energy system) */
  DAILY_BONUS: 10
}

/**
 * Calculate how many rolls should be regenerated based on time elapsed
 * @param lastCheckTime - The last time energy was checked/regenerated
 * @returns Number of rolls to add (capped at MAX_ROLLS)
 */
export function calculateRegeneratedRolls(lastCheckTime: Date): number {
  const now = new Date()
  const minutesElapsed = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60)
  const rollsRegenerated = Math.floor(minutesElapsed / ENERGY_CONFIG.REGEN_INTERVAL_MINUTES) * ENERGY_CONFIG.REGEN_RATE
  
  return Math.min(rollsRegenerated, ENERGY_CONFIG.MAX_ROLLS)
}

/**
 * Calculate time remaining until next roll regeneration
 * @param lastCheckTime - The last time energy was checked/regenerated
 * @returns Object with minutes and seconds until next regen
 */
export function getTimeUntilNextRegen(lastCheckTime: Date): { minutes: number; seconds: number; totalSeconds: number } {
  const now = new Date()
  const minutesElapsed = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60)
  const minutesSinceLastRegen = minutesElapsed % ENERGY_CONFIG.REGEN_INTERVAL_MINUTES
  const minutesUntilNext = ENERGY_CONFIG.REGEN_INTERVAL_MINUTES - minutesSinceLastRegen
  
  const totalSeconds = Math.ceil(minutesUntilNext * 60)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  return { minutes, seconds, totalSeconds }
}
