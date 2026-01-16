import { RING_CONFIG } from './mockData'
import type { RingNumber } from './types'

/**
 * Get the reward multiplier for a given ring
 */
export function getRewardMultiplier(ring: RingNumber): number {
  return RING_CONFIG[ring]?.rewardMultiplier ?? 1
}

/**
 * Get the risk multiplier for a given ring (affects negative events)
 */
export function getRiskMultiplier(ring: RingNumber): number {
  return RING_CONFIG[ring]?.riskMultiplier ?? 1
}

/**
 * Apply ring multiplier to a reward value
 */
export function applyRingMultiplier(baseReward: number, ring: RingNumber): number {
  const multiplier = getRewardMultiplier(ring)
  return Math.floor(baseReward * multiplier)
}

/**
 * Apply ring multiplier to risk/penalty value
 */
export function applyRiskMultiplier(basePenalty: number, ring: RingNumber): number {
  const multiplier = getRiskMultiplier(ring)
  return Math.floor(basePenalty * multiplier)
}

/**
 * Get display text for current multiplier (e.g., "3×" or "10×")
 */
export function getMultiplierDisplay(ring: RingNumber): string {
  const multiplier = getRewardMultiplier(ring)
  if (multiplier === 1) return ''
  return `${multiplier}×`
}
