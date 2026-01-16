export type TileType = 'corner' | 'category' | 'event' | 'mystery' | 'quick-reward' | 'special'

export type TileCategory = 'turnarounds' | 'dividends' | 'growth' | 'moats' | 'value' | 'ipo' | 'meme' | 'crypto' | 'penny' | 'leverage' | 'options' | 'elite'

export type RingNumber = 1 | 2 | 3

export interface RingConfig {
  name: string
  tiles: number
  rewardMultiplier: number
  riskMultiplier: number
}

export interface ElevatorResult {
  action: 'ascend' | 'stay' | 'fall' | 'throne'
  targetRing: RingNumber | 0
  message: string
}

export interface DiceRoll {
  die1: number
  die2: number
  total: number
  isDoubles: boolean
  timestamp?: Date
}

// Portal transition types
export type PortalDirection = 'up' | 'down'

export interface PortalTransition {
  direction: PortalDirection
  fromRing: RingNumber
  toRing: RingNumber | 0  // 0 = Throne
  fromTile: number
  toTile: number
  triggeredBy: 'pass' | 'land'
}

export interface Tile {
  id: number
  type: TileType
  title: string
  category?: TileCategory
  description?: string
  colorBorder?: string
  // Quick reward properties
  quickRewardType?: 'cash' | 'stars' | 'coins' | 'bonus-roll' | 'xp' | 'mystery' | 'chameleon'
  // Ring 3 specific properties
  ring3Reward?: number
  isWinTile?: boolean
  isBlackSwan?: boolean
  consolationReward?: {
    type: 'random' | 'stars' | 'coins'
    stars?: number
    coins?: number
  }
}

export interface Stock {
  name: string
  ticker: string
  category: TileCategory
  price: number
  description: string
  scores?: {
    composite: number // Overall rating 0-10
    quality: number // Quality score 0-10
    risk: number // Risk score 0-10
    timing: number // Timing score 0-10
  }
  // NEW FIELDS - Rich metadata from investment_universe
  risk_label?: string | null
  quality_label?: string | null
  timing_label?: string | null
  ai_model?: string | null
  analyzed_at?: string | null
  addon_flags?: {
    high_debt?: boolean
    liquidity_warning?: boolean
    dividend_risk?: boolean
    fraud_risk?: boolean
    [key: string]: boolean | undefined
  } | null
  image_url?: string | null // Company logo/image URL
}

export interface ThriftyChallenge {
  id: string
  title: string
  description: string
  reward: number
}

export interface WildcardEvent {
  id: string
  title: string
  description: string
  type: 'cash' | 'stars' | 'teleport' | 'penalty' | 'mixed'
  effect: {
    cash?: number // positive or negative
    stars?: number // positive or negative
    teleportTo?: number // tile ID
  }
  icon: string // emoji
}

export interface InventoryItem {
  itemId: string
  quantity: number // for stackable items
  purchasedAt: Date
}

export interface ActiveEffect {
  itemId: string
  expiresAt?: Date // undefined for permanent effects
  activated: boolean
}

export interface GameState {
  cash: number
  position: number
  netWorth: number
  portfolioValue: number
  stars: number
  coins: number // New: Third currency for micro-transactions
  currentRing: RingNumber
  ring1LapsCompleted: number
  hasReachedThrone: boolean
  throneCount: number
  eventCurrency?: {
    eventId: string | null
    amount: number
  }
  eventTrack?: {
    eventId: string | null
    points: number
    claimedMilestones: string[]
    premiumPurchased: boolean
    lastUpdated: string | null
  }
  holdings: Array<{
    stock: Stock
    shares: number
    totalCost: number
  }>
  inventory: InventoryItem[]
  activeEffects: ActiveEffect[]
  equippedTheme?: string
  equippedDiceSkin?: string
  equippedTrail?: string
  // Progression fields
  xp: number
  level: number
  seasonPoints: number
  currentSeasonTier: number
  hasPremiumPass: boolean
  claimedSeasonTiers: number[]
  achievements: {
    unlocked: string[] // achievement IDs
    progress: Record<string, number> // metric tracking
  }
  challenges?: {
    daily: any[] // Challenge[]
    weekly: any[] // Challenge[]
    completedToday: number
    completedThisWeek: number
    lastDailyReset: string
    lastWeeklyReset: string
  }
  stats: {
    totalRolls: number
    stocksPurchased: number
    uniqueStocks: number
    quizzesCompleted: number
    perfectQuizzes: number
    scratchcardsPlayed: number
    scratchcardsWon: number
    scratchcardWinStreak: number
    tilesVisited: number[]
    consecutiveDays: number
    lastLoginDate: string | null
    totalStarsEarned: number
    roll6Streak: number
    rollsPurchased?: number
    coinsSpentOnRolls?: number
  }
  // Energy regeneration fields
  lastEnergyCheck?: Date
  energyRolls?: number
  rollHistory?: DiceRoll[]
  doublesStreak?: number
  totalDoubles?: number
  // Jackpot system
  jackpot?: number // Accumulated jackpot from passing Start without landing
  // Net Worth Tier fields
  currentTier?: number // Track current tier number for easy access
  tierUnlockHistory?: Array<{
    tier: number
    unlockedAt: Date
  }>
  // Thrift Path Status
  thriftPath?: {
    active: boolean
    level: number
    experience: number
    streakDays: number
    activatedAt: string | null
    lastActivityDate: string | null
    benefits: {
      starMultiplier: number
      crashProtection: number
      recoveryBoost: number
    }
    stats: {
      totalChallengesCompleted: number
      perfectQuizzes: number
      disciplinedChoices: number
      impulsiveActions: number
      longTermHoldings: number
    }
  }
  // City Builder State (Monopoly Go style)
  cityBuilder?: {
    currentCityIndex: number
    cities: Array<{
      cityId: string
      buildingProgress: Record<string, number>
      isUnlocked: boolean
      isCompleted: boolean
      unlockedAt?: string
      completedAt?: string
    }>
    lastUpgradeDate: string | null
    totalUpgrades: number
    totalBuildingsCompleted: number
  }
  // Stock Exchange Builder State
  stockExchangeBuilder?: {
    exchanges: Array<{
      exchangeId: string
      level: 1 | 2 | 3
      progress: number
      stocksViewed: string[]
      pillarLevels: Record<
        'capitalInfrastructure' | 'marketActivity' | 'knowledgeDiscovery' | 'investorSkill',
        number
      >
      capitalInvested: number
      isGlossy: boolean
      cardImage: string
      completedAt?: string
    }>
  }
  // City Level (current city index for backward compatibility)
  cityLevel?: number
  // Ring 3 reveal tracking
  ring3Revealed?: boolean  // Has the player ever reached Ring 3?
  ring3RevealedAt?: Date  // When was Ring 3 first revealed?
  // Lifetime stats tracking
  lifetimeCashEarned?: number
  lifetimeStarsEarned?: number
  lifetimeCoinsEarned?: number
  lifetimeXpEarned?: number
  mysteryBoxesOpened?: number
  legendaryItemsFound?: number
}

export interface BiasQuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface BiasCaseStudy {
  id: string
  title: string
  biasType: string
  description: string
  scenario: string
  context: string[]
  quiz: BiasQuizQuestion[]
}

export interface AIPlayer {
  id: string
  name: string
  avatar: string
  gameState: GameState
}

// Progression system types
export type RewardType = 'feature' | 'daily_rolls' | 'theme' | 'star_bonus' | 'dice_skin' | 'cash' | 'shop_discount' | 'badge' | 'stars'

export interface LevelReward {
  type: RewardType
  value: string | number
  description: string
}

export interface Season {
  id: string
  name: string
  theme: string
  startDate: Date
  endDate: Date
  isActive: boolean
  tiers: SeasonTier[]
}

export interface SeasonTier {
  tier: number
  pointsRequired: number
  freeReward: Reward
  premiumReward: Reward
}

export interface Reward {
  type: 'stars' | 'cash' | 'theme' | 'dice_skin' | 'badge'
  value: string | number
}

export interface Achievement {
  id: string
  category: 'dice' | 'investing' | 'stars' | 'challenges' | 'quiz' | 'casino' | 'exploration' | 'time' | 'social' | 'hidden'
  title: string
  description: string
  icon: string
  reward: number
  requirement: {
    type: 'count' | 'threshold' | 'streak' | 'collection' | 'custom'
    metric: string
    target: number
  }
  isHidden: boolean
  isSecret: boolean
}

export interface LeaderboardEntry {
  userId: string
  username: string
  netWorth: number
  level: number
  seasonTier: number
  totalStarsEarned: number
  rank?: number
  change?: 'up' | 'down' | 'same'
}

export interface RollsPack {
  id: 'small' | 'medium' | 'large'
  rolls: number
  cost: number
  badge?: string
}
