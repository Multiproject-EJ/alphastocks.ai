export interface NetWorthTier {
  tier: number
  name: string
  minNetWorth: number
  icon: string // emoji or icon name
  description: string
  unlocks: string[] // Feature unlocks at this tier
  benefits: TierBenefit[]
  color: string // Theme color for this tier
  particleEffect?: string // Celebration effect when unlocked
}

export interface TierBenefit {
  type: 'star_bonus' | 'crash_protection' | 'shop_discount' | 'xp_multiplier' | 'daily_rolls' | 'feature_unlock'
  value: number | string
  description: string
}

// 7 Net Worth Tiers (exponential progression)
export const NET_WORTH_TIERS: NetWorthTier[] = [
  {
    tier: 1,
    name: "Street Investor",
    minNetWorth: 0,
    icon: "👤",
    description: "Every empire begins with a single step. Welcome to the market.",
    unlocks: [
      "Access to basic board",
      "Thrifty Path challenges",
      "Bias Sanctuary quizzes"
    ],
    benefits: [
      { type: 'feature_unlock', value: 'basic_game', description: 'Core game access' }
    ],
    color: "#64748B", // Slate
    particleEffect: 'small'
  },
  {
    tier: 2,
    name: "Portfolio Builder",
    minNetWorth: 500000, // $500K
    icon: "📊",
    description: "You're building momentum. The market is starting to notice.",
    unlocks: [
      "Enhanced quiz rewards (+10%)",
      "Shop discount (5%)",
      "Daily challenge bonus (+1 star per completion)"
    ],
    benefits: [
      { type: 'star_bonus', value: 0.1, description: '+10% stars from quizzes' },
      { type: 'shop_discount', value: 0.05, description: '5% off all shop items' }
    ],
    color: "#10B981", // Green
    particleEffect: 'medium'
  },
  {
    tier: 3,
    name: "Market Player",
    minNetWorth: 1000000, // $1M (Millionaire)
    icon: "💼",
    description: "Millionaire status achieved. You're playing with the big leagues now.",
    unlocks: [
      "Reduced crash damage (-15%)",
      "Mini-game: Market Heist Vault (coming soon)",
      "Exclusive 'Millionaire' badge",
      "XP multiplier (1.1x)"
    ],
    benefits: [
      { type: 'crash_protection', value: 0.15, description: 'Take 15% less damage from market crashes' },
      { type: 'xp_multiplier', value: 1.1, description: '10% bonus XP on all actions' }
    ],
    color: "#3B82F6", // Blue
    particleEffect: 'large'
  },
  {
    tier: 4,
    name: "Wealth Accumulator",
    minNetWorth: 5000000, // $5M
    icon: "💎",
    description: "Your wealth compounds exponentially. Passive income accelerates.",
    unlocks: [
      "Advanced stock mechanics (dividend reinvestment)",
      "Shop discount increased to 10%",
      "Thrift Path aura visual unlocked",
      "+1 daily dice roll"
    ],
    benefits: [
      { type: 'shop_discount', value: 0.10, description: '10% off all shop items' },
      { type: 'daily_rolls', value: 1, description: '+1 daily roll permanently' },
      { type: 'feature_unlock', value: 'thrift_aura', description: 'Unlock Thrift Path visual aura' }
    ],
    color: "#8B5CF6", // Purple
    particleEffect: 'large'
  },
  {
    tier: 5,
    name: "Market Tycoon",
    minNetWorth: 10000000, // $10M
    icon: "👑",
    description: "You've reached elite status. The market moves when you do.",
    unlocks: [
      "Prestige board theme (Gold Edition)",
      "VIP daily challenges (higher rewards)",
      "Exclusive 'Tycoon' title",
      "Star multiplier (1.25x)",
      "Crash protection increased to 25%"
    ],
    benefits: [
      { type: 'star_bonus', value: 0.25, description: '+25% stars from all sources' },
      { type: 'crash_protection', value: 0.25, description: 'Take 25% less damage from market crashes' },
      { type: 'feature_unlock', value: 'prestige_theme', description: 'Unlock Gold Edition board theme' }
    ],
    color: "#F59E0B", // Amber/Gold
    particleEffect: 'epic'
  },
  {
    tier: 6,
    name: "Empire Builder",
    minNetWorth: 50000000, // $50M
    icon: "🏰",
    description: "Your empire spans the market. Competitors study your moves.",
    unlocks: [
      "Legendary 'Diamond' dice skin",
      "Exclusive seasonal events access",
      "Shop discount increased to 15%",
      "XP multiplier increased to 1.5x",
      "+2 daily dice rolls (total)"
    ],
    benefits: [
      { type: 'shop_discount', value: 0.15, description: '15% off all shop items' },
      { type: 'xp_multiplier', value: 1.5, description: '50% bonus XP on all actions' },
      { type: 'daily_rolls', value: 2, description: '+2 daily rolls permanently' },
      { type: 'feature_unlock', value: 'diamond_dice', description: 'Unlock Diamond dice skin' }
    ],
    color: "#06B6D4", // Cyan
    particleEffect: 'epic'
  },
  {
    tier: 7,
    name: "Market Monarch",
    minNetWorth: 100000000, // $100M
    icon: "🌟",
    description: "Legendary. The pinnacle of market mastery. You have ascended.",
    unlocks: [
      "Exclusive 'Crown' cosmetic effect",
      "All features permanently unlocked",
      "Special leaderboard icon",
      "Star multiplier increased to 1.5x",
      "Crash immunity (50% reduction)",
      "Prestige title: 'Market Monarch'"
    ],
    benefits: [
      { type: 'star_bonus', value: 0.5, description: '+50% stars from all sources' },
      { type: 'crash_protection', value: 0.5, description: 'Take 50% less damage from market crashes' },
      { type: 'feature_unlock', value: 'crown_effect', description: 'Unlock Crown visual effect' },
      { type: 'feature_unlock', value: 'all_unlocked', description: 'All game features permanently unlocked' }
    ],
    color: "#EC4899", // Pink/Magenta (Legendary)
    particleEffect: 'epic'
  }
]

// Helper: Get current tier based on net worth
export const getCurrentTier = (netWorth: number): NetWorthTier => {
  // Find highest tier where netWorth >= minNetWorth
  const tier = [...NET_WORTH_TIERS]
    .reverse()
    .find(t => netWorth >= t.minNetWorth)
  
  return tier || NET_WORTH_TIERS[0]
}

// Helper: Get next tier
export const getNextTier = (netWorth: number): NetWorthTier | null => {
  const currentTierIndex = NET_WORTH_TIERS.findIndex(t => netWorth < t.minNetWorth)
  return currentTierIndex >= 0 ? NET_WORTH_TIERS[currentTierIndex] : null
}

// Helper: Get progress to next tier (0-1)
export const getTierProgress = (netWorth: number): number => {
  const currentTier = getCurrentTier(netWorth)
  const nextTier = getNextTier(netWorth)
  
  if (!nextTier) return 1 // Max tier reached
  
  const progress = (netWorth - currentTier.minNetWorth) / (nextTier.minNetWorth - currentTier.minNetWorth)
  return Math.max(0, Math.min(1, progress))
}

// Helper: Calculate total benefits for current tier
export const getActiveBenefits = (netWorth: number): Map<string, number> => {
  const currentTier = getCurrentTier(netWorth)
  const benefits = new Map<string, number>()
  
  // Accumulate all benefits from tier 1 to current tier
  for (const tier of NET_WORTH_TIERS) {
    if (tier.tier > currentTier.tier) break
    
    for (const benefit of tier.benefits) {
      if (typeof benefit.value === 'number') {
        const existing = benefits.get(benefit.type) || 0
        benefits.set(benefit.type, Math.max(existing, benefit.value))
      }
    }
  }
  
  return benefits
}
