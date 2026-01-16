import { RingNumber } from './types'

export type QuickRewardType = 
  | 'cash'
  | 'stars'
  | 'coins'
  | 'bonus-roll'
  | 'xp'
  | 'mystery'
  | 'chameleon'

export interface QuickRewardConfig {
  type: QuickRewardType
  emoji: string
  label: string
  minReward: number
  maxReward: number
  celebrationEmoji: string
  color: string
  glowColor: string
}

export interface QuickRewardTileStyle {
  emoji: string
  label: string
  gradient: string
  borderColor: string
  shadowColor: string
}

// EXPONENTIAL: Coins(1x) < Stars(10x) < Cash(100x)
export const QUICK_REWARD_CONFIG: Record<QuickRewardType, QuickRewardConfig> = {
  'cash': {
    type: 'cash',
    emoji: '💰',
    label: 'Cash Bonus',
    minReward: 500,
    maxReward: 2000,
    celebrationEmoji: '💵',
    color: 'from-green-600 to-green-800',
    glowColor: 'rgba(34, 197, 94, 0.6)',
  },
  'stars': {
    type: 'stars',
    emoji: '⭐',
    label: 'Star Shower',
    minReward: 5,
    maxReward: 20,
    celebrationEmoji: '⭐',
    color: 'from-yellow-500 to-amber-700',
    glowColor: 'rgba(234, 179, 8, 0.6)',
  },
  'coins': {
    type: 'coins',
    emoji: '🪙',
    label: 'Coin Drop',
    minReward: 10,
    maxReward: 50,
    celebrationEmoji: '🪙',
    color: 'from-amber-500 to-orange-700',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  'bonus-roll': {
    type: 'bonus-roll',
    emoji: '🎲',
    label: 'Bonus Roll',
    minReward: 1,
    maxReward: 2,
    celebrationEmoji: '🎲',
    color: 'from-purple-600 to-purple-800',
    glowColor: 'rgba(147, 51, 234, 0.6)',
  },
  'xp': {
    type: 'xp',
    emoji: '⚡',
    label: 'XP Boost',
    minReward: 15,
    maxReward: 50,
    celebrationEmoji: '⚡',
    color: 'from-blue-500 to-blue-700',
    glowColor: 'rgba(59, 130, 246, 0.6)',
  },
  'mystery': {
    type: 'mystery',
    emoji: '🎁',
    label: 'Mystery Box',
    minReward: 1,
    maxReward: 1,
    celebrationEmoji: '🎁',
    color: 'from-pink-500 to-purple-700',
    glowColor: 'rgba(236, 72, 153, 0.6)',
  },
  'chameleon': {
    type: 'chameleon',
    emoji: '🔄',
    label: 'Chameleon',
    minReward: 0, // Changes type each visit
    maxReward: 0,
    celebrationEmoji: '✨',
    color: 'from-gray-500 to-gray-700',
    glowColor: 'rgba(156, 163, 175, 0.6)',
  },
}

/**
 * Calculate reward amount for a quick reward tile
 */
export function calculateQuickReward(
  type: QuickRewardType, 
  ringNumber: RingNumber
): { amount: number; emoji: string } {
  const config = QUICK_REWARD_CONFIG[type]
  const multiplier = ringNumber === 3 ? 10 : ringNumber === 2 ? 3 : 1
  
  // Random amount between min and max
  const baseAmount = Math.floor(
    Math.random() * (config.maxReward - config.minReward + 1) + config.minReward
  )
  
  // Apply ring multiplier (except for bonus-roll and chameleon)
  const finalAmount = (type === 'bonus-roll' || type === 'chameleon') 
    ? baseAmount 
    : baseAmount * multiplier
  
  return {
    amount: finalAmount,
    emoji: config.celebrationEmoji,
  }
}

/**
 * Get a random reward type for mystery box
 */
export function getMysteryReward(): QuickRewardType {
  const options: QuickRewardType[] = ['cash', 'stars', 'coins', 'xp', 'bonus-roll']
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Get current chameleon tile type (changes based on lap count or time)
 */
export function getChameleonType(lapCount: number): QuickRewardType {
  const options: QuickRewardType[] = ['cash', 'stars', 'coins', 'xp']
  return options[lapCount % options.length]
}

/**
 * Tile styling configuration for Quick Rewards
 * Maps each reward type to its visual styling properties
 */
export const QUICK_REWARD_TILE_STYLES: Record<QuickRewardType, QuickRewardTileStyle> = {
  coins: {
    emoji: '🪙',
    label: 'Coins',
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-300/50',
    shadowColor: 'shadow-amber-500/30',
  },
  stars: {
    emoji: '⭐',
    label: 'Stars',
    gradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-300/50',
    shadowColor: 'shadow-yellow-500/30',
  },
  cash: {
    emoji: '💰',
    label: 'Cash',
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-300/50',
    shadowColor: 'shadow-green-500/30',
  },
  xp: {
    emoji: '⚡',
    label: 'XP',
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-300/50',
    shadowColor: 'shadow-blue-500/30',
  },
  'bonus-roll': {
    emoji: '🎲',
    label: 'Bonus Roll',
    gradient: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-300/50',
    shadowColor: 'shadow-purple-500/30',
  },
  mystery: {
    emoji: '🎁',
    label: 'Mystery',
    gradient: 'from-pink-500 to-purple-600',
    borderColor: 'border-pink-300/50',
    shadowColor: 'shadow-pink-500/30',
  },
  chameleon: {
    emoji: '🔄',
    label: 'Random',
    gradient: 'from-gray-500 to-slate-600',
    borderColor: 'border-gray-300/50',
    shadowColor: 'shadow-gray-500/30',
  },
}
