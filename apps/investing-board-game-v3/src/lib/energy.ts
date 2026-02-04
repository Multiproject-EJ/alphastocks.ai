/**
 * Energy regeneration system for dice rolls
 * Implements periodic full reset of dice rolls (30 dice every 2 hours)
 */

import { ENERGY_CONFIG, VAULT_REGEN_BONUS_CONFIG } from './economyConfig'

export function getVaultRegenBonusRolls(vaultLevel: number): number {
  const safeLevel = Math.max(1, Math.floor(vaultLevel))
  const steps = Math.floor((safeLevel - 1) / VAULT_REGEN_BONUS_CONFIG.LEVEL_STEP)
  return Math.min(VAULT_REGEN_BONUS_CONFIG.MAX_BONUS, steps * VAULT_REGEN_BONUS_CONFIG.BONUS_PER_STEP)
}

export function getEnergyResetAmount(vaultLevel: number): number {
  return Math.min(
    ENERGY_CONFIG.RESET_AMOUNT + getVaultRegenBonusRolls(vaultLevel),
    ENERGY_CONFIG.MAX_ROLLS
  )
}

/**
 * Calculate how many rolls should be regenerated based on time elapsed
 * Every 2 hours, player gets a full reset of 30 dice rolls
 * @param lastCheckTime - The last time energy was checked/regenerated
 * @param currentRolls - Current number of rolls the player has
 * @returns Number of rolls to add (capped at MAX_ROLLS)
 */
export function calculateRegeneratedRolls(
  lastCheckTime: Date,
  currentRolls: number = 0,
  bonusRolls: number = 0
): number {
  const now = new Date()
  const minutesElapsed = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60)
  const resetCycles = Math.floor(minutesElapsed / ENERGY_CONFIG.REGEN_INTERVAL_MINUTES)
  const safeBonus = Math.max(0, bonusRolls)
  
  // If at least one 2-hour cycle has passed, reset to RESET_AMOUNT (30 dice)
  if (resetCycles >= 1) {
    // Calculate how many rolls to add to reach the reset amount (capped at MAX_ROLLS)
    const targetRolls = Math.min(ENERGY_CONFIG.RESET_AMOUNT + safeBonus, ENERGY_CONFIG.MAX_ROLLS)
    return Math.max(0, targetRolls - currentRolls)
  }
  
  return 0
}

/**
 * Calculate the rolls to set after a reset (not add, but set)
 * @param lastCheckTime - The last time energy was checked/regenerated  
 * @returns The number of rolls to set to, or null if no reset needed
 */
export function getResetRollsAmount(lastCheckTime: Date, bonusRolls: number = 0): number | null {
  const now = new Date()
  const minutesElapsed = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60)
  const resetCycles = Math.floor(minutesElapsed / ENERGY_CONFIG.REGEN_INTERVAL_MINUTES)
  const safeBonus = Math.max(0, bonusRolls)
  
  // If at least one 2-hour cycle has passed, return the reset amount
  if (resetCycles >= 1) {
    return Math.min(ENERGY_CONFIG.RESET_AMOUNT + safeBonus, ENERGY_CONFIG.MAX_ROLLS)
  }
  
  return null
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
