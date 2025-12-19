/**
 * City Builder System - Monopoly Go Style City/Building Upgrades
 * 
 * Players unlock cities in sequence, each containing 5 buildings.
 * Buildings can be upgraded (1-5 levels) using stars.
 * One upgrade per day limit adds strategic progression.
 * Completing all buildings in a city unlocks the next city.
 */

// Types
export interface BuildingLevel {
  level: number
  cost: number // Stars required
  reward: number // Coins earned on upgrade
  description: string
}

export interface Building {
  id: string
  name: string
  icon: string
  description: string
  levels: BuildingLevel[]
}

export interface City {
  id: string
  name: string
  icon: string
  description: string
  theme: string // Color theme
  unlockRequirement: number // Stars needed to unlock (0 for first city)
  buildings: Building[]
  completionReward: {
    coins: number
    stars: number
    specialItem?: string
  }
}

export interface CityProgress {
  cityId: string
  buildingProgress: Record<string, number> // buildingId -> current level (0-5)
  isUnlocked: boolean
  isCompleted: boolean
  unlockedAt?: string // ISO date string
  completedAt?: string // ISO date string
}

export interface CityBuilderState {
  currentCityIndex: number
  cities: CityProgress[]
  lastUpgradeDate: string | null // ISO date string - for daily limit
  totalUpgrades: number
  totalBuildingsCompleted: number
}

// Building level templates (same for all buildings)
const BUILDING_LEVELS: BuildingLevel[] = [
  { level: 1, cost: 50, reward: 25, description: "Foundation laid" },
  { level: 2, cost: 100, reward: 50, description: "Structure built" },
  { level: 3, cost: 200, reward: 100, description: "Fully operational" },
  { level: 4, cost: 400, reward: 200, description: "Premium upgrade" },
  { level: 5, cost: 800, reward: 500, description: "Maximum level" },
]

// City definitions - Investment-themed cities
export const CITIES: City[] = [
  {
    id: "starter-street",
    name: "Starter Street",
    icon: "🏘️",
    description: "Where every investor begins their journey",
    theme: "#10B981", // Green
    unlockRequirement: 0,
    buildings: [
      {
        id: "savings-bank",
        name: "Savings Bank",
        icon: "🏦",
        description: "Store your first earnings safely",
        levels: BUILDING_LEVELS,
      },
      {
        id: "coffee-shop",
        name: "Coffee Shop",
        icon: "☕",
        description: "Where investors meet for morning tips",
        levels: BUILDING_LEVELS,
      },
      {
        id: "bookstore",
        name: "Investment Bookstore",
        icon: "📚",
        description: "Knowledge is the best investment",
        levels: BUILDING_LEVELS,
      },
      {
        id: "gym",
        name: "Investor Gym",
        icon: "💪",
        description: "Stay fit for the trading floor",
        levels: BUILDING_LEVELS,
      },
      {
        id: "park",
        name: "Community Park",
        icon: "🌳",
        description: "A place to reflect on your portfolio",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 500,
      stars: 100,
    },
  },
  {
    id: "dividend-district",
    name: "Dividend District",
    icon: "💰",
    description: "Steady income flows through these streets",
    theme: "#3B82F6", // Blue
    unlockRequirement: 500,
    buildings: [
      {
        id: "dividend-hq",
        name: "Dividend HQ",
        icon: "🏢",
        description: "The heart of passive income",
        levels: BUILDING_LEVELS,
      },
      {
        id: "utility-plant",
        name: "Utility Plant",
        icon: "⚡",
        description: "Essential services, essential dividends",
        levels: BUILDING_LEVELS,
      },
      {
        id: "reit-tower",
        name: "REIT Tower",
        icon: "🏗️",
        description: "Real estate income stream",
        levels: BUILDING_LEVELS,
      },
      {
        id: "bond-bank",
        name: "Bond Bank",
        icon: "📜",
        description: "Fixed income stability",
        levels: BUILDING_LEVELS,
      },
      {
        id: "pension-plaza",
        name: "Pension Plaza",
        icon: "🏛️",
        description: "Securing the future, one dividend at a time",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 1000,
      stars: 200,
    },
  },
  {
    id: "growth-garden",
    name: "Growth Garden",
    icon: "🌱",
    description: "Where small investments bloom into fortunes",
    theme: "#F59E0B", // Amber
    unlockRequirement: 1500,
    buildings: [
      {
        id: "startup-incubator",
        name: "Startup Incubator",
        icon: "🚀",
        description: "Nurturing tomorrow's giants",
        levels: BUILDING_LEVELS,
      },
      {
        id: "tech-campus",
        name: "Tech Campus",
        icon: "💻",
        description: "Innovation hub for growth stocks",
        levels: BUILDING_LEVELS,
      },
      {
        id: "biotech-lab",
        name: "Biotech Lab",
        icon: "🧬",
        description: "Breakthrough discoveries ahead",
        levels: BUILDING_LEVELS,
      },
      {
        id: "ev-factory",
        name: "EV Factory",
        icon: "🔋",
        description: "The future of transportation",
        levels: BUILDING_LEVELS,
      },
      {
        id: "ai-center",
        name: "AI Research Center",
        icon: "🤖",
        description: "Artificial intelligence investments",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 2000,
      stars: 400,
    },
  },
  {
    id: "moat-manor",
    name: "Moat Manor",
    icon: "🏰",
    description: "Protected by unbreakable competitive advantages",
    theme: "#8B5CF6", // Purple
    unlockRequirement: 3000,
    buildings: [
      {
        id: "brand-castle",
        name: "Brand Castle",
        icon: "👑",
        description: "Legendary brand recognition",
        levels: BUILDING_LEVELS,
      },
      {
        id: "network-nexus",
        name: "Network Nexus",
        icon: "🔗",
        description: "Network effects at scale",
        levels: BUILDING_LEVELS,
      },
      {
        id: "patent-fortress",
        name: "Patent Fortress",
        icon: "🛡️",
        description: "Protected intellectual property",
        levels: BUILDING_LEVELS,
      },
      {
        id: "switching-costs-tower",
        name: "Switching Costs Tower",
        icon: "🔒",
        description: "Customer lock-in advantage",
        levels: BUILDING_LEVELS,
      },
      {
        id: "cost-advantage-mine",
        name: "Cost Advantage Mine",
        icon: "⛏️",
        description: "Lowest cost producer wins",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 4000,
      stars: 800,
    },
  },
  {
    id: "value-village",
    name: "Value Village",
    icon: "💎",
    description: "Undervalued gems waiting to shine",
    theme: "#EF4444", // Red
    unlockRequirement: 5000,
    buildings: [
      {
        id: "bargain-bazaar",
        name: "Bargain Bazaar",
        icon: "🏪",
        description: "Discounted quality companies",
        levels: BUILDING_LEVELS,
      },
      {
        id: "contrarian-corner",
        name: "Contrarian Corner",
        icon: "🔄",
        description: "Going against the crowd",
        levels: BUILDING_LEVELS,
      },
      {
        id: "margin-of-safety-hall",
        name: "Margin of Safety Hall",
        icon: "📊",
        description: "Buffer against uncertainty",
        levels: BUILDING_LEVELS,
      },
      {
        id: "intrinsic-value-lab",
        name: "Intrinsic Value Lab",
        icon: "🔬",
        description: "Calculating true worth",
        levels: BUILDING_LEVELS,
      },
      {
        id: "patience-pagoda",
        name: "Patience Pagoda",
        icon: "🏯",
        description: "Time is the friend of value",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 8000,
      stars: 1500,
      specialItem: "Value Investor Badge",
    },
  },
  {
    id: "turnaround-town",
    name: "Turnaround Town",
    icon: "🔄",
    description: "Where fallen giants rise again",
    theme: "#EC4899", // Pink
    unlockRequirement: 8000,
    buildings: [
      {
        id: "restructuring-center",
        name: "Restructuring Center",
        icon: "🔧",
        description: "Fixing broken companies",
        levels: BUILDING_LEVELS,
      },
      {
        id: "new-management-tower",
        name: "New Management Tower",
        icon: "👔",
        description: "Fresh leadership, new direction",
        levels: BUILDING_LEVELS,
      },
      {
        id: "debt-reduction-dam",
        name: "Debt Reduction Dam",
        icon: "🌊",
        description: "Controlling the cash flow",
        levels: BUILDING_LEVELS,
      },
      {
        id: "pivot-plaza",
        name: "Pivot Plaza",
        icon: "↪️",
        description: "Business model transformation",
        levels: BUILDING_LEVELS,
      },
      {
        id: "comeback-colosseum",
        name: "Comeback Colosseum",
        icon: "🏟️",
        description: "Where champions are reborn",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 15000,
      stars: 3000,
      specialItem: "Turnaround Master Badge",
    },
  },
  {
    id: "wealth-metropolis",
    name: "Wealth Metropolis",
    icon: "🌆",
    description: "The pinnacle of investment mastery",
    theme: "#F59E0B", // Gold
    unlockRequirement: 15000,
    buildings: [
      {
        id: "portfolio-palace",
        name: "Portfolio Palace",
        icon: "🏰",
        description: "The crown jewel of diversification",
        levels: BUILDING_LEVELS,
      },
      {
        id: "compound-cathedral",
        name: "Compound Cathedral",
        icon: "⛪",
        description: "Where money grows exponentially",
        levels: BUILDING_LEVELS,
      },
      {
        id: "hedge-headquarters",
        name: "Hedge Headquarters",
        icon: "🌿",
        description: "Risk management mastery",
        levels: BUILDING_LEVELS,
      },
      {
        id: "alpha-arena",
        name: "Alpha Arena",
        icon: "⚔️",
        description: "Beating the market consistently",
        levels: BUILDING_LEVELS,
      },
      {
        id: "legacy-lighthouse",
        name: "Legacy Lighthouse",
        icon: "🗼",
        description: "Generational wealth beacon",
        levels: BUILDING_LEVELS,
      },
    ],
    completionReward: {
      coins: 30000,
      stars: 5000,
      specialItem: "Wealth Monarch Crown",
    },
  },
]

// Helper functions

/**
 * Get the initial city builder state for a new player
 */
export function getInitialCityBuilderState(): CityBuilderState {
  return {
    currentCityIndex: 0,
    cities: CITIES.map((city, index) => ({
      cityId: city.id,
      buildingProgress: city.buildings.reduce((acc, building) => {
        acc[building.id] = 0
        return acc
      }, {} as Record<string, number>),
      isUnlocked: index === 0, // Only first city is unlocked
      isCompleted: false,
    })),
    lastUpgradeDate: null,
    totalUpgrades: 0,
    totalBuildingsCompleted: 0,
  }
}

/**
 * Check if the player can upgrade today (daily limit)
 */
export function canUpgradeToday(lastUpgradeDate: string | null): boolean {
  if (!lastUpgradeDate) return true
  
  const lastDate = new Date(lastUpgradeDate)
  const today = new Date()
  
  // Compare dates (ignoring time)
  return lastDate.toDateString() !== today.toDateString()
}

/**
 * Get the next upgrade date string
 */
export function getNextUpgradeDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.toISOString()
}

/**
 * Get time remaining until next upgrade is available
 */
export function getTimeUntilNextUpgrade(lastUpgradeDate: string | null): { hours: number; minutes: number } | null {
  if (!lastUpgradeDate || canUpgradeToday(lastUpgradeDate)) return null
  
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return { hours, minutes }
}

/**
 * Get the cost to upgrade a building to the next level
 */
export function getUpgradeCost(cityId: string, buildingId: string, currentLevel: number): number | null {
  const city = CITIES.find(c => c.id === cityId)
  if (!city) return null
  
  const building = city.buildings.find(b => b.id === buildingId)
  if (!building) return null
  
  if (currentLevel >= building.levels.length) return null // Already max level
  
  return building.levels[currentLevel].cost
}

/**
 * Get the reward for upgrading a building
 */
export function getUpgradeReward(cityId: string, buildingId: string, currentLevel: number): number | null {
  const city = CITIES.find(c => c.id === cityId)
  if (!city) return null
  
  const building = city.buildings.find(b => b.id === buildingId)
  if (!building) return null
  
  if (currentLevel >= building.levels.length) return null
  
  return building.levels[currentLevel].reward
}

/**
 * Check if a city is complete (all buildings at max level)
 */
export function isCityComplete(cityProgress: CityProgress): boolean {
  const city = CITIES.find(c => c.id === cityProgress.cityId)
  if (!city) return false
  
  return city.buildings.every(building => {
    const level = cityProgress.buildingProgress[building.id] || 0
    return level >= building.levels.length
  })
}

/**
 * Get city completion percentage
 */
export function getCityCompletionPercentage(cityProgress: CityProgress): number {
  const city = CITIES.find(c => c.id === cityProgress.cityId)
  if (!city) return 0
  
  const maxLevels = city.buildings.length * BUILDING_LEVELS.length
  const currentLevels = city.buildings.reduce((acc, building) => {
    return acc + (cityProgress.buildingProgress[building.id] || 0)
  }, 0)
  
  return Math.round((currentLevels / maxLevels) * 100)
}

/**
 * Check if next city can be unlocked
 */
export function canUnlockNextCity(state: CityBuilderState, totalStars: number): boolean {
  const nextCityIndex = state.cities.findIndex(c => !c.isUnlocked)
  if (nextCityIndex === -1) return false // All cities unlocked
  
  const nextCity = CITIES[nextCityIndex]
  return totalStars >= nextCity.unlockRequirement
}

/**
 * Get the next city to unlock
 */
export function getNextCityToUnlock(state: CityBuilderState): City | null {
  const nextCityIndex = state.cities.findIndex(c => !c.isUnlocked)
  if (nextCityIndex === -1) return null
  
  return CITIES[nextCityIndex]
}

/**
 * Calculate total buildings completed across all cities
 */
export function getTotalBuildingsCompleted(state: CityBuilderState): number {
  return state.cities.reduce((total, cityProgress) => {
    const city = CITIES.find(c => c.id === cityProgress.cityId)
    if (!city) return total
    
    return total + city.buildings.filter(building => {
      const level = cityProgress.buildingProgress[building.id] || 0
      return level >= building.levels.length
    }).length
  }, 0)
}

// Constants for external use
export const MAX_BUILDING_LEVEL = BUILDING_LEVELS.length
export const DAILY_UPGRADE_LIMIT = 1
