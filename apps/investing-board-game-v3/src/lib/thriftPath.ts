export interface ThriftPathStatus {
  active: boolean
  level: number // 1-5
  experience: number // XP toward next level
  streakDays: number // Consecutive days of discipline
  activatedAt: Date | null
  lastActivityDate: Date | null
  
  benefits: {
    starMultiplier: number    // 1.1x - 1.3x
    crashProtection: number   // 10% - 30%
    recoveryBoost: number     // 1.1x - 1.5x (faster recovery)
  }
  
  stats: {
    totalChallengesCompleted: number
    perfectQuizzes: number
    disciplinedChoices: number
    impulsiveActions: number
    longTermHoldings: number // Stocks held 30+ days
  }
}

// Level thresholds
export const THRIFT_PATH_LEVELS = {
  1: { experience: 0, title: "Mindful Beginner" },
  2: { experience: 100, title: "Disciplined Investor" },
  3: { experience: 300, title: "Patient Accumulator" },
  4: { experience: 600, title: "Wisdom Seeker" },
  5: { experience: 1000, title: "Enlightened Master" }
} as const

// Benefits by level
export const getThriftPathBenefits = (level: number) => {
  const benefits = {
    1: { starMultiplier: 1.1, crashProtection: 0.10, recoveryBoost: 1.1 },
    2: { starMultiplier: 1.15, crashProtection: 0.15, recoveryBoost: 1.2 },
    3: { starMultiplier: 1.2, crashProtection: 0.20, recoveryBoost: 1.3 },
    4: { starMultiplier: 1.25, crashProtection: 0.25, recoveryBoost: 1.4 },
    5: { starMultiplier: 1.3, crashProtection: 0.30, recoveryBoost: 1.5 }
  }
  
  return benefits[level as keyof typeof benefits] || benefits[1]
}

// How to gain Thrift Path XP
export const THRIFT_PATH_XP_SOURCES = {
  complete_thrifty_challenge: 20,
  perfect_quiz: 15,
  disciplined_choice: 10, // Choose patience over greed
  daily_login_streak: 5,
  long_term_hold: 25, // Hold stock 30+ days
  avoid_casino_abuse: 10, // Play <3 scratchcards/day
  cash_flow_positive: 5 // End day with more cash than started
} as const

// How to lose Thrift Path progress
export const THRIFT_PATH_PENALTIES = {
  miss_daily_streak: -50, // Break streak
  impulsive_sell: -20, // Sell at loss within 7 days
  casino_abuse: -15, // Play >5 scratchcards/day
  greedy_choice: -10 // Choose greed over patience in quiz
} as const

// Activation requirement
export const THRIFT_PATH_ACTIVATION_THRESHOLD = 50 // XP needed to activate

// Deactivation: Falls below 0 XP or 7+ days inactive
export const isThriftPathActive = (status: ThriftPathStatus): boolean => {
  if (!status.activatedAt) return false
  
  const daysSinceActivity = status.lastActivityDate 
    ? Math.floor((Date.now() - new Date(status.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  
  return status.experience >= 0 && daysSinceActivity < 7
}

// Calculate current level from XP
export const calculateLevel = (experience: number): number => {
  if (experience < THRIFT_PATH_LEVELS[2].experience) return 1
  if (experience < THRIFT_PATH_LEVELS[3].experience) return 2
  if (experience < THRIFT_PATH_LEVELS[4].experience) return 3
  if (experience < THRIFT_PATH_LEVELS[5].experience) return 4
  return 5
}
