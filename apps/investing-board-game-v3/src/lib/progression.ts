/**
 * XP and Leveling System Configuration
 */

import { LevelReward } from './types'

// XP rewards for different actions
export const XP_REWARDS = {
  ROLL_DICE: 10,
  BUY_STOCK: 25,
  LAND_ON_CORNER: 15,
  DAILY_CHALLENGE_EASY: 50,
  DAILY_CHALLENGE_MEDIUM: 100,
  DAILY_CHALLENGE_HARD: 200,
  WIN_QUIZ: 100,
  WIN_SCRATCHCARD: 75,
  PASS_START: 20,
  PURCHASE_SHOP_ITEM: 30,
  COMPLETE_THRIFTY_CHALLENGE: 75,
} as const

// XP required for each level (exponential curve)
export const XP_PER_LEVEL: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 3000,
  15: 8000,
  20: 18000,
  25: 35000,
  30: 60000,
  40: 120000,
  50: 200000,
  75: 450000,
  100: 750000,
}

// Calculate XP needed for any level using formula: (level^2.5) * 40
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0
  if (XP_PER_LEVEL[level]) return XP_PER_LEVEL[level]
  return Math.floor(Math.pow(level, 2.5) * 40)
}

// Get current level from total XP
export function getLevelFromXP(xp: number): number {
  let level = 1
  while (level < 100 && xp >= calculateXPForLevel(level + 1)) {
    level++
  }
  return level
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return calculateXPForLevel(100)
  return calculateXPForLevel(currentLevel + 1)
}

// Get XP progress percentage to next level
export function getXPProgress(xp: number, level: number): number {
  if (level >= 100) return 100
  const currentLevelXP = calculateXPForLevel(level)
  const nextLevelXP = getXPForNextLevel(level)
  const xpInLevel = xp - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  return Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100))
}

// Level rewards granted at milestone levels
export const LEVEL_REWARDS: Record<number, LevelReward> = {
  5: { type: 'feature', value: 'market_insights', description: 'Unlock Market Insights' },
  10: { type: 'daily_rolls', value: 1, description: '+1 Daily Dice Roll' },
  15: { type: 'theme', value: 'premium_dark', description: 'Unlock Premium Dark Theme' },
  20: { type: 'star_bonus', value: 0.1, description: '+10% Star Earnings' },
  25: { type: 'dice_skin', value: 'legendary_gold', description: 'Legendary Gold Dice' },
  30: { type: 'cash', value: 100000, description: '+$100k Starting Cash' },
  35: { type: 'shop_discount', value: 0.15, description: '15% Shop Discount' },
  40: { type: 'daily_rolls', value: 1, description: '+1 Daily Dice Roll' },
  50: { type: 'theme', value: 'platinum', description: 'Platinum Theme' },
  75: { type: 'dice_skin', value: 'diamond', description: 'Diamond Dice Skin' },
  100: { type: 'badge', value: 'legend', description: 'Legend Badge + 10,000 Stars' },
}

// Check if a level has a reward
export function hasLevelReward(level: number): boolean {
  return level in LEVEL_REWARDS
}

// Get reward for a level
export function getLevelReward(level: number): LevelReward | null {
  return LEVEL_REWARDS[level] || null
}

// Season Points rewards
export const SEASON_POINTS_REWARDS = {
  XP_TO_SP_RATIO: 10, // 100 XP = 10 SP
  DAILY_CHALLENGE_EASY: 50,
  DAILY_CHALLENGE_MEDIUM: 100,
  DAILY_CHALLENGE_HARD: 200,
  WEEKLY_CHALLENGE: 500,
  EVENT_WIN: 300,
  EVENT_PARTICIPATE: 100,
} as const
