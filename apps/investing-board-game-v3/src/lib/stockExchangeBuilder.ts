/**
 * Stock Exchange Builder data model and helpers.
 * Dual progression: pillar upgrades + stock discovery.
 */

export type StockExchangeLevel = 1 | 2 | 3

export type StockExchangeRegion = 'Americas' | 'Europe' | 'Asia' | 'Global'

export type StockExchangePillarKey =
  | 'capitalInfrastructure'
  | 'marketActivity'
  | 'knowledgeDiscovery'
  | 'investorSkill'

export interface StockExchangePillarDefinition {
  key: StockExchangePillarKey
  name: string
  description: string
  maxLevel: number
}

export interface StockExchangeDefinition {
  id: string
  name: string
  region: StockExchangeRegion
  stockIds: string[]
  cardArtByLevel: Record<StockExchangeLevel, string>
  glossyCardArtByLevel?: Record<StockExchangeLevel, string>
}

export interface StockExchangeProgress {
  exchangeId: string
  level: StockExchangeLevel
  progress: number
  stocksViewed: string[]
  pillarLevels: Record<StockExchangePillarKey, number>
  capitalInvested: number
  isGlossy: boolean
  cardImage: string
  completedAt?: string
}

export interface StockExchangeBuilderState {
  exchanges: StockExchangeProgress[]
}

export const STOCK_EXCHANGE_PILLARS: StockExchangePillarDefinition[] = [
  {
    key: 'capitalInfrastructure',
    name: 'Capital Infrastructure',
    description: 'Foundational systems and trading infrastructure.',
    maxLevel: 5,
  },
  {
    key: 'marketActivity',
    name: 'Market Activity & Liquidity',
    description: 'Depth, volume, and liquidity development.',
    maxLevel: 5,
  },
  {
    key: 'knowledgeDiscovery',
    name: 'Knowledge & Stock Discovery',
    description: 'Research, education, and discovery initiatives.',
    maxLevel: 5,
  },
  {
    key: 'investorSkill',
    name: 'Investor Skill & Analysis',
    description: 'Tools, training, and investor capability growth.',
    maxLevel: 5,
  },
]

export const STOCK_EXCHANGES: StockExchangeDefinition[] = [
  {
    id: 'nyse',
    name: 'New York Stock Exchange',
    region: 'Americas',
    stockIds: ['AAPL', 'MSFT', 'JNJ', 'V', 'BRK.B'],
    cardArtByLevel: {
      1: '/assets/exchanges/nyse-level-1.png',
      2: '/assets/exchanges/nyse-level-2.png',
      3: '/assets/exchanges/nyse-level-3.png',
    },
    glossyCardArtByLevel: {
      1: '/assets/exchanges/nyse-level-1-glossy.png',
      2: '/assets/exchanges/nyse-level-2-glossy.png',
      3: '/assets/exchanges/nyse-level-3-glossy.png',
    },
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq',
    region: 'Americas',
    stockIds: ['NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL'],
    cardArtByLevel: {
      1: '/assets/exchanges/nasdaq-level-1.png',
      2: '/assets/exchanges/nasdaq-level-2.png',
      3: '/assets/exchanges/nasdaq-level-3.png',
    },
    glossyCardArtByLevel: {
      1: '/assets/exchanges/nasdaq-level-1-glossy.png',
      2: '/assets/exchanges/nasdaq-level-2-glossy.png',
      3: '/assets/exchanges/nasdaq-level-3-glossy.png',
    },
  },
]

const BASE_UPGRADE_COST = 10

export function calculateUpgradeCost(
  exchange: StockExchangeDefinition,
  pillar: StockExchangePillarKey,
  currentLevel: number,
  baseCost: number = BASE_UPGRADE_COST
): number {
  const stockCount = exchange.stockIds.length
  const nextLevel = currentLevel + 1
  const levelMultiplier = nextLevel >= 3 ? 4 : 1

  return baseCost * stockCount * levelMultiplier
}

export function createInitialPillarLevels(): Record<StockExchangePillarKey, number> {
  return {
    capitalInfrastructure: 0,
    marketActivity: 0,
    knowledgeDiscovery: 0,
    investorSkill: 0,
  }
}

export function getInitialStockExchangeState(): StockExchangeBuilderState {
  return {
    exchanges: STOCK_EXCHANGES.map(exchange => ({
      exchangeId: exchange.id,
      level: 1,
      progress: 0,
      stocksViewed: [],
      pillarLevels: createInitialPillarLevels(),
      capitalInvested: 0,
      isGlossy: false,
      cardImage: exchange.cardArtByLevel[1],
    })),
  }
}

export function markStockViewed(
  progress: StockExchangeProgress,
  stockId: string
): StockExchangeProgress {
  if (progress.stocksViewed.includes(stockId)) {
    return progress
  }

  return {
    ...progress,
    stocksViewed: [...progress.stocksViewed, stockId],
  }
}

export function getViewedStockCount(
  exchange: StockExchangeDefinition,
  progress: StockExchangeProgress
): number {
  const validViewed = progress.stocksViewed.filter(stockId =>
    exchange.stockIds.includes(stockId)
  )

  return validViewed.length
}

export function getPillarProgressPercentage(
  progress: StockExchangeProgress
): number {
  const maxTotal = STOCK_EXCHANGE_PILLARS.reduce((sum, pillar) => sum + pillar.maxLevel, 0)
  const currentTotal = STOCK_EXCHANGE_PILLARS.reduce(
    (sum, pillar) => sum + (progress.pillarLevels[pillar.key] || 0),
    0
  )

  if (maxTotal === 0) return 0

  return Math.min(100, Math.round((currentTotal / maxTotal) * 100))
}
