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

export interface StockExchangeArchiveEntry {
  exchange: StockExchangeDefinition
  progress: StockExchangeProgress
  completedAt: string
}

export interface StockExchangeUpgradeResult {
  progress: StockExchangeProgress
  cost: number
  wasUpgraded: boolean
}

export type StockExchangePremiumOfferType =
  | 'capitalInfusion'
  | 'pillarAccelerator'
  | 'glossyFinisher'

export interface StockExchangePremiumOffer {
  id: string
  type: StockExchangePremiumOfferType
  title: string
  description: string
  priceLabel: string
  perks: string[]
  badge?: string
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

export const STOCK_EXCHANGE_PREMIUM_OFFERS: StockExchangePremiumOffer[] = [
  {
    id: 'capital-burst',
    type: 'capitalInfusion',
    title: 'Capital Burst Pack',
    description: 'Instant capital infusion to speed up pillar upgrades.',
    priceLabel: '$4.99',
    perks: ['+5,000 capital', 'Unlocks 2 pillar upgrades instantly'],
    badge: 'Best Value',
  },
  {
    id: 'research-pass',
    type: 'pillarAccelerator',
    title: 'Research Pass',
    description: 'Double stock discovery rewards for 24 hours.',
    priceLabel: '$2.99',
    perks: ['2x discovery rewards', 'Bonus glossy chance'],
  },
  {
    id: 'glossy-finish',
    type: 'glossyFinisher',
    title: 'Glossy Finish Kit',
    description: 'Guarantee a glossy card on next exchange completion.',
    priceLabel: '$6.99',
    perks: ['Guaranteed glossy finish', 'Exclusive border'],
  },
]

const BASE_UPGRADE_COST = 10
const LEVEL_PROGRESS_THRESHOLDS: Record<StockExchangeLevel, number> = {
  1: 0,
  2: 50,
  3: 100,
}

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

export function getStockDiscoveryProgressPercentage(
  exchange: StockExchangeDefinition,
  progress: StockExchangeProgress
): number {
  const totalStocks = exchange.stockIds.length
  if (totalStocks === 0) return 0

  const viewedCount = getViewedStockCount(exchange, progress)
  return Math.min(100, Math.round((viewedCount / totalStocks) * 100))
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

export function getOverallProgressPercentage(
  exchange: StockExchangeDefinition,
  progress: StockExchangeProgress
): number {
  const pillarProgress = getPillarProgressPercentage(progress)
  const stockProgress = getStockDiscoveryProgressPercentage(exchange, progress)

  return Math.min(100, Math.round((pillarProgress + stockProgress) / 2))
}

export function resolveExchangeLevel(progressPercentage: number): StockExchangeLevel {
  if (progressPercentage >= LEVEL_PROGRESS_THRESHOLDS[3]) {
    return 3
  }

  if (progressPercentage >= LEVEL_PROGRESS_THRESHOLDS[2]) {
    return 2
  }

  return 1
}

export function updateExchangeProgress(
  exchange: StockExchangeDefinition,
  progress: StockExchangeProgress
): StockExchangeProgress {
  const pillarProgress = getPillarProgressPercentage(progress)
  const stockProgress = getStockDiscoveryProgressPercentage(exchange, progress)
  const overallProgress = getOverallProgressPercentage(exchange, progress)
  const level = resolveExchangeLevel(overallProgress)
  const isCompleted = overallProgress >= 100
  const shouldBeGlossy =
    isCompleted && pillarProgress >= 100 && stockProgress >= 100
  const isGlossy = progress.isGlossy || shouldBeGlossy
  const cardImage =
    isGlossy && exchange.glossyCardArtByLevel?.[level]
      ? exchange.glossyCardArtByLevel[level]
      : exchange.cardArtByLevel[level]

  return {
    ...progress,
    level,
    progress: overallProgress,
    isGlossy,
    cardImage,
    completedAt: isCompleted ? progress.completedAt ?? new Date().toISOString() : progress.completedAt,
  }
}

export function upgradePillar(
  progress: StockExchangeProgress,
  exchange: StockExchangeDefinition,
  pillarKey: StockExchangePillarKey
): StockExchangeUpgradeResult {
  const pillarDefinition = STOCK_EXCHANGE_PILLARS.find(pillar => pillar.key === pillarKey)
  if (!pillarDefinition) {
    return { progress, cost: 0, wasUpgraded: false }
  }

  const currentLevel = progress.pillarLevels[pillarKey] ?? 0
  if (currentLevel >= pillarDefinition.maxLevel) {
    return { progress, cost: 0, wasUpgraded: false }
  }

  const cost = calculateUpgradeCost(exchange, pillarKey, currentLevel)
  const nextProgress = updateExchangeProgress(exchange, {
    ...progress,
    pillarLevels: {
      ...progress.pillarLevels,
      [pillarKey]: currentLevel + 1,
    },
    capitalInvested: progress.capitalInvested + cost,
  })

  return { progress: nextProgress, cost, wasUpgraded: true }
}

export function recordStockView(
  progress: StockExchangeProgress,
  exchange: StockExchangeDefinition,
  stockId: string
): StockExchangeProgress {
  const nextProgress = markStockViewed(progress, stockId)

  return updateExchangeProgress(exchange, nextProgress)
}

export function getArchiveEntries(
  exchanges: StockExchangeDefinition[],
  progressEntries: StockExchangeProgress[]
): StockExchangeArchiveEntry[] {
  const exchangeMap = new Map(exchanges.map(exchange => [exchange.id, exchange]))

  return progressEntries
    .filter(entry => entry.completedAt)
    .map(entry => {
      const exchange = exchangeMap.get(entry.exchangeId)
      if (!exchange || !entry.completedAt) return null

      return {
        exchange,
        progress: entry,
        completedAt: entry.completedAt,
      }
    })
    .filter((entry): entry is StockExchangeArchiveEntry => Boolean(entry))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}
