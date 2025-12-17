/**
 * Season Pass System Configuration
 */

import { Season, Reward } from './types'

// Helper to create season tiers
function createSeasonTiers(count: number = 30): Array<{
  tier: number
  pointsRequired: number
  freeReward: Reward
  premiumReward: Reward
}> {
  const tiers = []
  
  for (let i = 1; i <= count; i++) {
    // Points scale exponentially
    const pointsRequired = Math.floor(100 * Math.pow(i, 1.5))
    
    // Create varied rewards
    let freeReward: Reward
    let premiumReward: Reward
    
    // Every 5 tiers: bigger rewards
    if (i % 10 === 0) {
      freeReward = { type: 'stars', value: i * 500 }
      premiumReward = { type: 'stars', value: i * 1500 }
    } else if (i % 5 === 0) {
      freeReward = { type: 'cash', value: i * 20000 }
      premiumReward = { type: i % 15 === 0 ? 'theme' : 'cash', value: i % 15 === 0 ? `season_tier_${i}` : i * 50000 }
    } else if (i % 3 === 0) {
      freeReward = { type: 'stars', value: i * 100 }
      premiumReward = { type: 'stars', value: i * 400 }
    } else {
      freeReward = { type: 'cash', value: i * 10000 }
      premiumReward = { type: 'cash', value: i * 30000 }
    }
    
    // Special rewards for final tiers
    if (i === count) {
      freeReward = { type: 'stars', value: 25000 }
      premiumReward = { type: 'badge', value: 'season_master' }
    } else if (i === count - 5) {
      premiumReward = { type: 'dice_skin', value: 'season_legendary' }
    }
    
    tiers.push({
      tier: i,
      pointsRequired,
      freeReward,
      premiumReward,
    })
  }
  
  return tiers
}

// Current and upcoming seasons
export const SEASONS: Season[] = [
  {
    id: 'spring-2025',
    name: 'Bull Run Spring',
    theme: 'Growth & Prosperity',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-05-31'),
    isActive: true,
    tiers: createSeasonTiers(30),
  },
  {
    id: 'summer-2025',
    name: 'Summer Rally',
    theme: 'Momentum & Energy',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-08-31'),
    isActive: false,
    tiers: createSeasonTiers(30),
  },
  {
    id: 'autumn-2025',
    name: 'Autumn Harvest',
    theme: 'Dividends & Rewards',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-11-30'),
    isActive: false,
    tiers: createSeasonTiers(30),
  },
  {
    id: 'winter-2025',
    name: 'Winter Bear',
    theme: 'Value & Resilience',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2026-02-28'),
    isActive: false,
    tiers: createSeasonTiers(30),
  },
]

// Get the currently active season
export function getActiveSeason(): Season | null {
  const now = new Date()
  return SEASONS.find(s => s.startDate <= now && now <= s.endDate) || null
}

// Get season by ID
export function getSeasonById(id: string): Season | undefined {
  return SEASONS.find(s => s.id === id)
}

// Calculate days remaining in season
export function getDaysRemaining(season: Season): number {
  const now = new Date()
  const end = new Date(season.endDate)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Get current tier from points
export function getCurrentTier(points: number, season: Season): number {
  let tier = 0
  for (const t of season.tiers) {
    if (points >= t.pointsRequired) {
      tier = t.tier
    } else {
      break
    }
  }
  return tier
}

// Get progress to next tier
export function getProgressToNextTier(points: number, season: Season): {
  currentPoints: number
  pointsNeeded: number
  percentage: number
} {
  const currentTier = getCurrentTier(points, season)
  
  if (currentTier >= season.tiers.length) {
    return { currentPoints: points, pointsNeeded: 0, percentage: 100 }
  }
  
  const currentTierData = season.tiers[currentTier - 1]
  const nextTierData = season.tiers[currentTier]
  
  const currentTierPoints = currentTierData?.pointsRequired || 0
  const nextTierPoints = nextTierData.pointsRequired
  
  const pointsInTier = points - currentTierPoints
  const pointsNeeded = nextTierPoints - currentTierPoints
  const percentage = Math.min(100, (pointsInTier / pointsNeeded) * 100)
  
  return {
    currentPoints: pointsInTier,
    pointsNeeded,
    percentage,
  }
}

// Check if tier can be claimed
export function canClaimTier(
  tier: number,
  currentTier: number,
  claimedTiers: number[],
  isPremium: boolean
): boolean {
  // Must have reached this tier
  if (tier > currentTier) return false
  
  // Must not have claimed it yet
  const claimKey = isPremium ? tier : -tier // negative for free, positive for premium
  return !claimedTiers.includes(claimKey)
}
