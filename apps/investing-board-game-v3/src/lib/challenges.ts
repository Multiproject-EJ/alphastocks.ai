/**
 * Challenges System
 * Daily and weekly challenges to drive engagement and retention
 */

export interface Challenge {
  id: string
  type: 'daily' | 'weekly' | 'event'
  tier: 'easy' | 'medium' | 'hard'
  title: string
  description: string
  reward: {
    stars: number
    xp: number
    seasonPoints: number
  }
  requirement: {
    action: 'roll' | 'buy_stock' | 'land_on_tile' | 'earn_stars' | 'complete_quiz' | 'win_scratchcard' | 'reach_net_worth' | 'buy_from_shop' | 'land_on_corner' | 'complete_thrifty' | 'complete_daily_challenge'
    target: number // how many times or what value
    condition?: any // specific conditions (e.g., tile position, dice value, category)
  }
  progress: number // current progress
  completed: boolean
  claimedReward: boolean
  expiresAt: Date
}

// Daily challenges pool (3 assigned per day: 1 easy, 1 medium, 1 hard)
export const DAILY_CHALLENGES_POOL: Omit<Challenge, 'progress' | 'completed' | 'claimedReward' | 'expiresAt'>[] = [
  // Easy tier (50-100 stars, 50-100 XP, 50-100 SP)
  {
    id: 'first_roll',
    type: 'daily',
    tier: 'easy',
    title: 'First Roll',
    description: 'Roll the dice once',
    reward: { stars: 50, xp: 50, seasonPoints: 50 },
    requirement: { action: 'roll', target: 1 }
  },
  {
    id: 'big_spender',
    type: 'daily',
    tier: 'easy',
    title: 'Big Spender',
    description: 'Purchase any stock',
    reward: { stars: 75, xp: 75, seasonPoints: 75 },
    requirement: { action: 'buy_stock', target: 1 }
  },
  {
    id: 'lucky_seven',
    type: 'daily',
    tier: 'easy',
    title: 'Lucky Seven',
    description: 'Land on tile position 7, 14, or 21',
    reward: { stars: 60, xp: 60, seasonPoints: 60 },
    requirement: { action: 'land_on_tile', target: 1, condition: { positions: [7, 14, 21] } }
  },
  {
    id: 'corner_hopper',
    type: 'daily',
    tier: 'easy',
    title: 'Corner Hopper',
    description: 'Land on any corner tile',
    reward: { stars: 75, xp: 75, seasonPoints: 75 },
    requirement: { action: 'land_on_corner', target: 1 }
  },
  {
    id: 'star_collector_daily',
    type: 'daily',
    tier: 'easy',
    title: 'Star Collector',
    description: 'Earn 50 stars from any source',
    reward: { stars: 50, xp: 50, seasonPoints: 50 },
    requirement: { action: 'earn_stars', target: 50 }
  },
  {
    id: 'early_bird',
    type: 'daily',
    tier: 'easy',
    title: 'Early Bird',
    description: 'Roll the dice 3 times',
    reward: { stars: 60, xp: 60, seasonPoints: 60 },
    requirement: { action: 'roll', target: 3 }
  },
  {
    id: 'thrifty_player',
    type: 'daily',
    tier: 'easy',
    title: 'Thrifty Player',
    description: 'Complete a Thrifty Path challenge',
    reward: { stars: 80, xp: 80, seasonPoints: 80 },
    requirement: { action: 'complete_thrifty', target: 1 }
  },

  // Medium tier (100-200 stars, 100-200 XP, 100-200 SP)
  {
    id: 'triple_threat',
    type: 'daily',
    tier: 'medium',
    title: 'Triple Threat',
    description: 'Buy 3 stocks in one session',
    reward: { stars: 150, xp: 150, seasonPoints: 150 },
    requirement: { action: 'buy_stock', target: 3 }
  },
  {
    id: 'high_roller',
    type: 'daily',
    tier: 'medium',
    title: 'High Roller',
    description: 'Roll a 6',
    reward: { stars: 100, xp: 100, seasonPoints: 100 },
    requirement: { action: 'roll', target: 1, condition: { value: 6 } }
  },
  {
    id: 'snake_eyes',
    type: 'daily',
    tier: 'medium',
    title: 'Snake Eyes',
    description: 'Roll a 1',
    reward: { stars: 100, xp: 100, seasonPoints: 100 },
    requirement: { action: 'roll', target: 1, condition: { value: 1 } }
  },
  {
    id: 'category_master',
    type: 'daily',
    tier: 'medium',
    title: 'Category Master',
    description: 'Land on 3 different category tiles',
    reward: { stars: 150, xp: 150, seasonPoints: 150 },
    requirement: { action: 'land_on_tile', target: 3, condition: { uniqueCategories: true } }
  },
  {
    id: 'quiz_champion',
    type: 'daily',
    tier: 'medium',
    title: 'Quiz Champion',
    description: 'Complete a Bias Sanctuary quiz',
    reward: { stars: 150, xp: 150, seasonPoints: 150 },
    requirement: { action: 'complete_quiz', target: 1 }
  },
  {
    id: 'portfolio_builder',
    type: 'daily',
    tier: 'medium',
    title: 'Portfolio Builder',
    description: 'Reach 5 holdings in your portfolio',
    reward: { stars: 175, xp: 175, seasonPoints: 175 },
    requirement: { action: 'buy_stock', target: 5 }
  },
  {
    id: 'cash_flow',
    type: 'daily',
    tier: 'medium',
    title: 'Cash Flow',
    description: 'Have $100k cash on hand',
    reward: { stars: 150, xp: 150, seasonPoints: 150 },
    requirement: { action: 'reach_net_worth', target: 100000 }
  },
  {
    id: 'shopping_spree',
    type: 'daily',
    tier: 'medium',
    title: 'Shopping Spree',
    description: 'Buy an item from the shop',
    reward: { stars: 125, xp: 125, seasonPoints: 125 },
    requirement: { action: 'buy_from_shop', target: 1 }
  },

  // Hard tier (200-300 stars, 200-300 XP, 200-300 SP)
  {
    id: 'perfect_score',
    type: 'daily',
    tier: 'hard',
    title: 'Perfect Score',
    description: 'Get 100% on a Bias Sanctuary quiz',
    reward: { stars: 250, xp: 250, seasonPoints: 250 },
    requirement: { action: 'complete_quiz', target: 1, condition: { perfectScore: true } }
  },
  {
    id: 'marathon_runner',
    type: 'daily',
    tier: 'hard',
    title: 'Marathon Runner',
    description: 'Roll the dice 10 times in one session',
    reward: { stars: 200, xp: 200, seasonPoints: 200 },
    requirement: { action: 'roll', target: 10 }
  },
  {
    id: 'millionaire_daily',
    type: 'daily',
    tier: 'hard',
    title: 'Millionaire',
    description: 'Reach $1M net worth',
    reward: { stars: 300, xp: 300, seasonPoints: 300 },
    requirement: { action: 'reach_net_worth', target: 1000000 }
  },
  {
    id: 'casino_royale',
    type: 'daily',
    tier: 'hard',
    title: 'Casino Royale',
    description: 'Win 3 scratchcards in one day',
    reward: { stars: 250, xp: 250, seasonPoints: 250 },
    requirement: { action: 'win_scratchcard', target: 3 }
  },
  {
    id: 'diverse_portfolio',
    type: 'daily',
    tier: 'hard',
    title: 'Diverse Portfolio',
    description: 'Own stocks from all 5 categories',
    reward: { stars: 275, xp: 275, seasonPoints: 275 },
    requirement: { action: 'buy_stock', target: 5, condition: { allCategories: true } }
  },
  {
    id: 'star_hoarder_daily',
    type: 'daily',
    tier: 'hard',
    title: 'Star Hoarder',
    description: 'Accumulate 1000+ stars',
    reward: { stars: 300, xp: 300, seasonPoints: 300 },
    requirement: { action: 'earn_stars', target: 1000 }
  },
  {
    id: 'lucky_streak',
    type: 'daily',
    tier: 'hard',
    title: 'Lucky Streak',
    description: 'Win 2 scratchcards in a row',
    reward: { stars: 225, xp: 225, seasonPoints: 225 },
    requirement: { action: 'win_scratchcard', target: 2 }
  }
]

// Weekly challenges (2 assigned per week, reset Monday midnight)
export const WEEKLY_CHALLENGES_POOL: Omit<Challenge, 'progress' | 'completed' | 'claimedReward' | 'expiresAt'>[] = [
  {
    id: 'weekly_warrior',
    type: 'weekly',
    tier: 'hard',
    title: 'Weekly Warrior',
    description: 'Complete 15 daily challenges this week',
    reward: { stars: 500, xp: 500, seasonPoints: 500 },
    requirement: { action: 'complete_daily_challenge', target: 15 }
  },
  {
    id: 'win_streak',
    type: 'weekly',
    tier: 'hard',
    title: 'Win Streak',
    description: 'Complete all 3 daily challenges 3 days in a row',
    reward: { stars: 600, xp: 600, seasonPoints: 600 },
    requirement: { action: 'complete_daily_challenge', target: 9, condition: { consecutive: 3 } }
  },
  {
    id: 'grand_total',
    type: 'weekly',
    tier: 'hard',
    title: 'Grand Total',
    description: 'Earn 2000 stars this week',
    reward: { stars: 750, xp: 750, seasonPoints: 750 },
    requirement: { action: 'earn_stars', target: 2000 }
  },
  {
    id: 'investment_guru',
    type: 'weekly',
    tier: 'hard',
    title: 'Investment Guru',
    description: 'Buy 20 stocks this week',
    reward: { stars: 500, xp: 500, seasonPoints: 500 },
    requirement: { action: 'buy_stock', target: 20 }
  },
  {
    id: 'casino_king',
    type: 'weekly',
    tier: 'hard',
    title: 'Casino King',
    description: 'Win 10 scratchcards this week',
    reward: { stars: 600, xp: 600, seasonPoints: 600 },
    requirement: { action: 'win_scratchcard', target: 10 }
  },
  {
    id: 'knowledge_seeker',
    type: 'weekly',
    tier: 'hard',
    title: 'Knowledge Seeker',
    description: 'Complete 5 Bias Sanctuary quizzes this week',
    reward: { stars: 550, xp: 550, seasonPoints: 550 },
    requirement: { action: 'complete_quiz', target: 5 }
  }
]

/**
 * Get the next midnight timestamp
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow
}

/**
 * Get the next Monday at midnight
 */
export function getNextMonday(): Date {
  const date = new Date()
  const day = date.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  date.setDate(date.getDate() + daysUntilMonday)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Generate daily challenges for today (1 easy, 1 medium, 1 hard)
 * Avoids repeating challenges from yesterday
 */
export function generateDailyChallenges(previousIds: string[] = []): Challenge[] {
  const easyPool = DAILY_CHALLENGES_POOL.filter(
    c => c.tier === 'easy' && !previousIds.includes(c.id)
  )
  const mediumPool = DAILY_CHALLENGES_POOL.filter(
    c => c.tier === 'medium' && !previousIds.includes(c.id)
  )
  const hardPool = DAILY_CHALLENGES_POOL.filter(
    c => c.tier === 'hard' && !previousIds.includes(c.id)
  )

  // Fallback to full pool if we've exhausted non-repeating options
  const easyOptions = easyPool.length > 0 ? easyPool : DAILY_CHALLENGES_POOL.filter(c => c.tier === 'easy')
  const mediumOptions = mediumPool.length > 0 ? mediumPool : DAILY_CHALLENGES_POOL.filter(c => c.tier === 'medium')
  const hardOptions = hardPool.length > 0 ? hardPool : DAILY_CHALLENGES_POOL.filter(c => c.tier === 'hard')

  const expiresAt = getNextMidnight()

  return [
    {
      ...easyOptions[Math.floor(Math.random() * easyOptions.length)],
      progress: 0,
      completed: false,
      claimedReward: false,
      expiresAt,
    },
    {
      ...mediumOptions[Math.floor(Math.random() * mediumOptions.length)],
      progress: 0,
      completed: false,
      claimedReward: false,
      expiresAt,
    },
    {
      ...hardOptions[Math.floor(Math.random() * hardOptions.length)],
      progress: 0,
      completed: false,
      claimedReward: false,
      expiresAt,
    },
  ]
}

/**
 * Generate weekly challenges (2 random)
 */
export function generateWeeklyChallenges(): Challenge[] {
  const expiresAt = getNextMonday()
  
  // Shuffle and pick 2
  const shuffled = [...WEEKLY_CHALLENGES_POOL].sort(() => Math.random() - 0.5)
  
  return shuffled.slice(0, 2).map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
    claimedReward: false,
    expiresAt,
  }))
}
