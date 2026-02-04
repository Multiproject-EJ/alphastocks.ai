import { Tile, Stock, ThriftyChallenge, BiasCaseStudy, TileCategory, AIPlayer } from './types'
import { resolveStockPrice } from './stockPricing'
import { PORTAL_CONFIG, RING_3_CONFIG, RING_CONFIG } from '@/config/rings'

// Ring 1: Street Level - 35 tiles
// Stock tiles: 7 (positions: 3, 8, 14, 18, 22, 28, 33) - 20% of ring
// Quick reward tiles: 16 - 46% of ring
// Event tiles: 8 - 23% of ring
// Corner tiles: 4 - 11% of ring
export const BOARD_TILES: Tile[] = [
  // Corner - Big Fish Portal (Start)
  {
    id: 0,
    type: 'corner',
    title: 'Big Fish Portal',
    specialAction: 'big-fish-portal',
    portalStyle: 'blue',
    colorBorder: 'oklch(0.72 0.2 225)',
  },
  
  // Quick rewards
  { id: 1, type: 'quick-reward', title: 'Cash Bonus', quickRewardType: 'cash' },
  { id: 2, type: 'quick-reward', title: 'Star Shower', quickRewardType: 'stars' },
  
  // Stock tile
  { id: 3, type: 'category', title: 'Value Vault', category: 'value', colorBorder: 'oklch(0.80 0.18 85)' },
  
  // Quick rewards
  { id: 4, type: 'quick-reward', title: 'Coin Drop', quickRewardType: 'coins' },
  { id: 5, type: 'quick-reward', title: 'XP Boost', quickRewardType: 'xp' },
  { id: 6, type: 'event', title: 'Market Event' },
  
  // Corner - Casino
  { id: 7, type: 'corner', title: 'Casino' },
  
  // Stock tile
  { id: 8, type: 'category', title: 'Dividend Lane', category: 'dividends', colorBorder: 'oklch(0.70 0.25 200)' },
  
  // Quick rewards
  { id: 9, type: 'quick-reward', title: 'Mystery Box', quickRewardType: 'mystery' },
  { id: 10, type: 'quick-reward', title: 'Star Shower', quickRewardType: 'stars' },
  { id: 11, type: 'quick-reward', title: 'Bonus Roll', quickRewardType: 'bonus-roll' },
  { id: 12, type: 'learning', title: 'Quiz', learningId: 'quiz-fundamentals' },
  
  // Corner - Court of Capital
  { id: 13, type: 'corner', title: 'Court of Capital' },
  
  // Stock tile
  { id: 14, type: 'category', title: 'Growth Garden', category: 'growth', colorBorder: 'oklch(0.75 0.22 25)' },
  
  // Quick rewards
  { id: 15, type: 'quick-reward', title: 'Cash Bonus', quickRewardType: 'cash' },
  { id: 16, type: 'quick-reward', title: 'Coin Drop', quickRewardType: 'coins' },
  { id: 17, type: 'quick-reward', title: 'Chameleon', quickRewardType: 'chameleon' },
  
  // Stock tile  
  { id: 18, type: 'category', title: 'Moat Masters', category: 'moats', colorBorder: 'oklch(0.60 0.27 15)' },
  
  // Quick rewards
  { id: 19, type: 'event', title: 'Wildcard' },
  { id: 20, type: 'quick-reward', title: 'XP Boost', quickRewardType: 'xp' },
  
  // Corner - Bias Sanctuary
  { id: 21, type: 'corner', title: 'Bias Sanctuary' },
  
  // Stock tile
  { id: 22, type: 'category', title: 'Turnaround Town', category: 'turnarounds', colorBorder: 'oklch(0.65 0.25 330)' },
  
  // Quick rewards
  { id: 23, type: 'quick-reward', title: 'Star Shower', quickRewardType: 'stars' },
  { id: 24, type: 'event', title: 'Wildcard' },
  { id: 25, type: 'quick-reward', title: 'Cash Bonus', quickRewardType: 'cash' },
  { id: 26, type: 'quick-reward', title: 'Mystery Box', quickRewardType: 'mystery' },
  { id: 27, type: 'event', title: 'Analyst Call' },
  
  // Stock tile
  { id: 28, type: 'category', title: 'IPO Runway', category: 'ipo', colorBorder: 'oklch(0.80 0.25 320)' },
  
  // Quick rewards
  { id: 29, type: 'event', title: 'Market Event' },
  { id: 30, type: 'quick-reward', title: 'Bonus Roll', quickRewardType: 'bonus-roll' },
  { id: 31, type: 'event', title: 'News Flash' },
  { id: 32, type: 'learning', title: 'Quiz', learningId: 'quiz-fundamentals' },
  
  // Stock tile
  { id: 33, type: 'category', title: 'Meme Surge', category: 'meme', colorBorder: 'oklch(0.75 0.30 60)' },
  
  // Quick rewards to finish lap
  { id: 34, type: 'quick-reward', title: 'XP Boost', quickRewardType: 'xp' },
]

// Inner Express Track - Mystery cards that change color based on dice rolls
export const INNER_TRACK_TILES: Tile[] = Array.from({ length: 12 }, (_, i) => ({
  id: 100 + i,
  type: 'mystery',
  title: '?',
  colorBorder: 'oklch(0.35 0.02 250)', // neutral gray default
}))

// Ring 2: Executive Floor - 24 tiles
// Stock tiles: 5 (positions: 202, 207, 212, 217, 222) - 21% of ring
// Quick reward tiles: 11 - 46% of ring
// Event tiles: 5 - 21% of ring
// Corner tiles: 3 - 12% of ring
export const RING_2_TILES: Tile[] = [
  // Fall portals (Ring 2 drop points)
  { id: 200, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  
  // Quick rewards (3× multiplier on Ring 2!)
  { id: 201, type: 'quick-reward', title: 'Premium Cash', quickRewardType: 'cash' },
  
  // Stock tile
  { id: 202, type: 'category', title: 'Crypto Citadel', category: 'crypto', colorBorder: 'oklch(0.70 0.25 280)' },
  
  // Stock tile
  { id: 203, type: 'category', title: 'Global Exchange', category: 'international', colorBorder: 'oklch(0.70 0.20 250)' },
  { id: 204, type: 'quick-reward', title: 'Gold Coins', quickRewardType: 'coins' },
  
  // Corner - Elevator
  { id: 205, type: 'corner', title: 'Elevator 🛗' },
  
  // Quick rewards
  { id: 206, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  
  // Stock tile
  { id: 207, type: 'category', title: 'Penny Rocket', category: 'penny', colorBorder: 'oklch(0.65 0.20 120)' },
  
  // Quick rewards
  { id: 208, type: 'event', title: 'Executive Event' },
  { id: 209, type: 'special', title: 'Chance', specialAction: 'chance', specialStyle: 'chance-card', colorBorder: 'oklch(0.75 0.18 240)' },
  
  // Corner - High Roller Casino
  { id: 210, type: 'corner', title: 'High Roller Casino' },
  
  // Quick rewards
  { id: 211, type: 'quick-reward', title: 'Bonus Roll', quickRewardType: 'bonus-roll' },
  
  // Stock tile
  { id: 212, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  
  // Quick rewards
  { id: 213, type: 'quick-reward', title: 'Star Storm', quickRewardType: 'stars' },
  { id: 214, type: 'quick-reward', title: 'Chameleon', quickRewardType: 'chameleon' },
  { id: 215, type: 'learning', title: 'Insider Quiz', learningId: 'quiz-strategy' },
  { id: 216, type: 'quick-reward', title: 'Mystery Vault', quickRewardType: 'mystery' },
  
  // Stock tile
  { id: 217, type: 'category', title: 'Options War Room', category: 'options', colorBorder: 'oklch(0.70 0.20 180)' },
  
  // Quick rewards
  { id: 218, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  { id: 219, type: 'quick-reward', title: 'Gold Coins', quickRewardType: 'coins' },
  { id: 220, type: 'event', title: 'Board Meeting' },
  { id: 221, type: 'event', title: 'Wildcard' },
  
  // Stock tile
  { id: 222, type: 'category', title: 'Leverage Vault', category: 'leverage', colorBorder: 'oklch(0.60 0.30 0)' },
  
  // Quick rewards
  { id: 223, type: 'quick-reward', title: 'Premium Cash', quickRewardType: 'cash' },
]

// Ring 3: Wealth Run (7 tiles, IDs 300-306)
// Each tile is a super high reward. One roll only per visit.
export const RING_3_TILES: Tile[] = [
  {
    id: 300,
    type: 'special',
    title: 'Wealth Run: Apex Vault',
    ring3Reward: 250000,
    isWinTile: true,
  },
  {
    id: 301,
    type: 'special',
    title: 'Wealth Run: Diamond Surge',
    ring3Reward: 400000,
    isWinTile: true,
  },
  {
    id: 302,
    type: 'special',
    title: 'Wealth Run: Legacy Stack',
    ring3Reward: 600000,
    isWinTile: true,
  },
  {
    id: 303,
    type: 'special',
    title: 'Wealth Run: Titan Fortune',
    ring3Reward: 850000,
    isWinTile: true,
  },
  {
    id: 304,
    type: 'special',
    title: 'Wealth Run: Crown Reserve',
    ring3Reward: 1100000,
    isWinTile: true,
  },
  {
    id: 305,
    type: 'special',
    title: 'Wealth Run: Sovereign Cache',
    ring3Reward: 1500000,
    isWinTile: true,
  },
  {
    id: 306,
    type: 'special',
    title: 'Wealth Run: Omega Prize',
    ring3Reward: 2000000,
    isWinTile: true,
  },
]

// Ring Configuration
export { PORTAL_CONFIG, RING_3_CONFIG, RING_CONFIG }

// Elevator Odds
export const ELEVATOR_ODDS = {
  ring2: {
    ascend: { min: 11, max: 12 },   // ~8% - go to Ring 3
    stay: { min: 5, max: 10 },       // ~72% - stay on Ring 2
    fall: { min: 2, max: 4 },        // ~20% - fall to Ring 1
  },
  ring3: {
    throne: { min: 11, max: 12 },    // ~8% - reach the Throne!
    fall: { min: 2, max: 10 },       // ~92% - fall to Ring 1
  },
} as const

export const ROULETTE_REWARDS = [
  { id: 'mega-cash', label: '$5M Mega Cash', type: 'cash', amount: 5_000_000, icon: '💰', tier: 'mega' },
  { id: 'star-flood', label: '2M Stars', type: 'stars', amount: 2_000_000, icon: '⭐', tier: 'mega' },
  { id: 'coin-tsunami', label: '3M Coins', type: 'coins', amount: 3_000_000, icon: '🪙', tier: 'mega' },
  { id: 'vault-jackpot', label: '$8M Vault Jackpot', type: 'cash', amount: 8_000_000, icon: '🏦', tier: 'mega' },
  { id: 'legacy-stars', label: '5M Stars', type: 'stars', amount: 5_000_000, icon: '✨', tier: 'mega' },
  { id: 'mystery-box', label: 'Mystery Box', type: 'mystery', amount: 0, icon: '🎁', tier: 'mystery' },
  { id: 'cash-surge', label: '$750K Cash', type: 'cash', amount: 750_000, icon: '💵', tier: 'major' },
  { id: 'star-surge', label: '400K Stars', type: 'stars', amount: 400_000, icon: '🌟', tier: 'major' },
  { id: 'coin-surge', label: '500K Coins', type: 'coins', amount: 500_000, icon: '🧿', tier: 'major' },
  { id: 'xp-blast', label: '25K XP', type: 'xp', amount: 25_000, icon: '⚡', tier: 'boost' },
  { id: 'roll-bundle', label: '+8 Rolls', type: 'rolls', amount: 8, icon: '🎲', tier: 'boost' },
  { id: 'cash-spark', label: '$120K Cash', type: 'cash', amount: 120_000, icon: '💳', tier: 'tail' },
  { id: 'star-spark', label: '90K Stars', type: 'stars', amount: 90_000, icon: '✨', tier: 'tail' },
  { id: 'coin-spark', label: '140K Coins', type: 'coins', amount: 140_000, icon: '🪙', tier: 'tail' },
  { id: 'xp-spark', label: '8K XP', type: 'xp', amount: 8_000, icon: '⚡', tier: 'tail' },
  { id: 'roll-burst', label: '+3 Rolls', type: 'rolls', amount: 3, icon: '🎲', tier: 'tail' },
] as const

export type RouletteReward = typeof ROULETTE_REWARDS[number]

export const MOCK_STOCKS: Record<string, Stock[]> = {
  turnarounds: [
    { 
      name: 'Intel Corporation', 
      ticker: 'INTC', 
      category: 'turnarounds', 
      price: 42.50, 
      description: 'Semiconductor manufacturer rebuilding market position',
      scores: { composite: 6.2, quality: 7.0, risk: 7.5, timing: 5.5 }
    },
    { 
      name: 'Ford Motor Company', 
      ticker: 'F', 
      category: 'turnarounds', 
      price: 12.80, 
      description: 'Legacy automaker pivoting to electric vehicles',
      scores: { composite: 5.8, quality: 6.5, risk: 8.0, timing: 6.0 }
    },
    { 
      name: 'Nokia Corporation', 
      ticker: 'NOK', 
      category: 'turnarounds', 
      price: 4.25, 
      description: 'Telecom equipment provider restructuring operations',
      scores: { composite: 5.5, quality: 6.0, risk: 8.5, timing: 5.0 }
    },
    { 
      name: 'Boeing Company', 
      ticker: 'BA', 
      category: 'turnarounds', 
      price: 185.40, 
      description: 'Aerospace giant recovering from production challenges',
      scores: { composite: 6.0, quality: 7.5, risk: 7.0, timing: 5.8 }
    },
  ],
  dividends: [
    { 
      name: 'Coca-Cola Company', 
      ticker: 'KO', 
      category: 'dividends', 
      price: 62.40, 
      description: 'Global beverage leader with consistent dividend growth',
      scores: { composite: 7.8, quality: 8.5, risk: 3.5, timing: 7.0 }
    },
    { 
      name: 'Realty Income Corp', 
      ticker: 'O', 
      category: 'dividends', 
      price: 58.20, 
      description: 'Monthly dividend REIT with retail properties',
      scores: { composite: 7.5, quality: 8.0, risk: 5.0, timing: 7.2 }
    },
    { 
      name: 'AT&T Inc', 
      ticker: 'T', 
      category: 'dividends', 
      price: 18.75, 
      description: 'Telecom provider with high dividend yield',
      scores: { composite: 6.5, quality: 6.8, risk: 6.0, timing: 6.5 }
    },
    { 
      name: 'Verizon Communications', 
      ticker: 'VZ', 
      category: 'dividends', 
      price: 40.30, 
      description: 'Wireless carrier with stable dividend payments',
      scores: { composite: 7.0, quality: 7.5, risk: 4.5, timing: 6.8 }
    },
  ],
  growth: [
    { 
      name: 'NVIDIA Corporation', 
      ticker: 'NVDA', 
      category: 'growth', 
      price: 875.30, 
      description: 'AI chip leader with explosive revenue growth',
      scores: { composite: 9.2, quality: 9.5, risk: 6.5, timing: 8.8 }
    },
    { 
      name: 'MongoDB Inc', 
      ticker: 'MDB', 
      category: 'growth', 
      price: 385.60, 
      description: 'Database platform expanding in cloud infrastructure',
      scores: { composite: 7.8, quality: 8.0, risk: 7.0, timing: 7.5 }
    },
    { 
      name: 'Tesla Inc', 
      ticker: 'TSLA', 
      category: 'growth', 
      price: 248.50, 
      description: 'Electric vehicle and energy company scaling globally',
      scores: { composite: 7.5, quality: 7.8, risk: 8.5, timing: 7.0 }
    },
    { 
      name: 'Shopify Inc', 
      ticker: 'SHOP', 
      category: 'growth', 
      price: 78.90, 
      description: 'E-commerce platform with rapid merchant adoption',
      scores: { composite: 7.2, quality: 7.5, risk: 7.5, timing: 7.0 }
    },
  ],
  moats: [
    { 
      name: 'Visa Inc', 
      ticker: 'V', 
      category: 'moats', 
      price: 285.90, 
      description: 'Payment network with unassailable competitive advantages',
      scores: { composite: 9.0, quality: 9.5, risk: 3.0, timing: 8.5 }
    },
    { 
      name: 'Adobe Inc', 
      ticker: 'ADBE', 
      category: 'moats', 
      price: 565.40, 
      description: 'Creative software monopoly with high switching costs',
      scores: { composite: 8.5, quality: 9.0, risk: 4.0, timing: 8.0 }
    },
    { 
      name: 'Mastercard Inc', 
      ticker: 'MA', 
      category: 'moats', 
      price: 475.20, 
      description: 'Global payment processor with network effects',
      scores: { composite: 8.8, quality: 9.2, risk: 3.5, timing: 8.3 }
    },
    { 
      name: 'Alphabet Inc', 
      ticker: 'GOOGL', 
      category: 'moats', 
      price: 142.80, 
      description: 'Search engine dominance with data moat',
      scores: { composite: 8.7, quality: 9.0, risk: 4.5, timing: 8.0 }
    },
  ],
  value: [
    { 
      name: 'Berkshire Hathaway', 
      ticker: 'BRK.B', 
      category: 'value', 
      price: 425.80, 
      description: 'Conglomerate trading below intrinsic value',
      scores: { composite: 8.5, quality: 9.0, risk: 4.0, timing: 7.5 }
    },
    { 
      name: 'Bank of America', 
      ticker: 'BAC', 
      category: 'value', 
      price: 38.90, 
      description: 'Major bank with strong fundamentals, low P/E ratio',
      scores: { composite: 7.2, quality: 7.5, risk: 5.5, timing: 7.0 }
    },
    { 
      name: 'Citigroup Inc', 
      ticker: 'C', 
      category: 'value', 
      price: 62.15, 
      description: 'Banking giant undervalued relative to book value',
      scores: { composite: 6.8, quality: 7.0, risk: 6.0, timing: 6.8 }
    },
    { 
      name: 'Pfizer Inc', 
      ticker: 'PFE', 
      category: 'value', 
      price: 27.30, 
      description: 'Pharmaceutical company with strong cash flow, low valuation',
      scores: { composite: 7.0, quality: 7.8, risk: 5.0, timing: 6.5 }
    },
  ],
  ipo: [
    {
      name: 'Arm Holdings',
      ticker: 'ARM',
      category: 'ipo',
      price: 128.40,
      description: 'Chip IP powerhouse fresh off IPO with AI demand tailwinds',
      scores: { composite: 7.4, quality: 7.2, risk: 7.8, timing: 7.0 }
    },
    {
      name: 'Instacart',
      ticker: 'CART',
      category: 'ipo',
      price: 33.15,
      description: 'Delivery platform stabilizing margins after its IPO debut',
      scores: { composite: 6.6, quality: 6.5, risk: 7.2, timing: 6.4 }
    },
    {
      name: 'Klaviyo',
      ticker: 'KVYO',
      category: 'ipo',
      price: 25.85,
      description: 'Marketing automation upstart expanding enterprise pipelines',
      scores: { composite: 6.8, quality: 6.7, risk: 7.0, timing: 6.6 }
    },
  ],
  meme: [
    {
      name: 'GameStop',
      ticker: 'GME',
      category: 'meme',
      price: 23.40,
      description: 'Cult-favorite retailer riding social momentum spikes',
      scores: { composite: 6.1, quality: 4.8, risk: 9.0, timing: 6.5 }
    },
    {
      name: 'AMC Entertainment',
      ticker: 'AMC',
      category: 'meme',
      price: 4.90,
      description: 'Cinema chain riding retail-trader waves',
      scores: { composite: 5.4, quality: 4.5, risk: 9.3, timing: 6.0 }
    },
    {
      name: 'Bed Bath & Beyond',
      ticker: 'BBBYQ',
      category: 'meme',
      price: 0.12,
      description: 'Legacy brand revived as a high-risk meme lottery',
      scores: { composite: 4.2, quality: 2.5, risk: 9.8, timing: 4.5 }
    },
  ],
  crypto: [
    {
      name: 'Coinbase Global',
      ticker: 'COIN',
      category: 'crypto',
      price: 214.30,
      description: 'Crypto exchange tied to volume surges and price swings',
      scores: { composite: 7.0, quality: 6.8, risk: 8.2, timing: 7.4 }
    },
    {
      name: 'Marathon Digital',
      ticker: 'MARA',
      category: 'crypto',
      price: 24.60,
      description: 'Bitcoin miner exposed to hash-rate cycles',
      scores: { composite: 6.2, quality: 5.5, risk: 8.8, timing: 6.8 }
    },
    {
      name: 'Riot Platforms',
      ticker: 'RIOT',
      category: 'crypto',
      price: 15.40,
      description: 'Digital mining firm leveraged to crypto cycles',
      scores: { composite: 6.0, quality: 5.2, risk: 9.0, timing: 6.6 }
    },
  ],
  penny: [
    {
      name: 'Plug Power',
      ticker: 'PLUG',
      category: 'penny',
      price: 3.15,
      description: 'Hydrogen tech hopeful trading at penny-stock volatility',
      scores: { composite: 5.6, quality: 4.8, risk: 8.7, timing: 5.8 }
    },
    {
      name: 'Mullen Automotive',
      ticker: 'MULN',
      category: 'penny',
      price: 0.19,
      description: 'Microcap EV maker chasing a high-risk turnaround',
      scores: { composite: 4.8, quality: 3.8, risk: 9.4, timing: 4.9 }
    },
    {
      name: 'Sundial Growers',
      ticker: 'SNDL',
      category: 'penny',
      price: 1.82,
      description: 'Cannabis operator navigating microcap whiplash',
      scores: { composite: 5.1, quality: 4.2, risk: 9.1, timing: 5.2 }
    },
  ],
  leverage: [
    {
      name: 'Direxion S&P Bull 3X',
      ticker: 'SPXL',
      category: 'leverage',
      price: 118.70,
      description: 'Triple-leveraged ETF magnifying S&P 500 moves',
      scores: { composite: 6.7, quality: 6.0, risk: 9.2, timing: 6.8 }
    },
    {
      name: 'ProShares Ultra QQQ',
      ticker: 'QLD',
      category: 'leverage',
      price: 88.40,
      description: 'Leveraged Nasdaq exposure amplifying tech swings',
      scores: { composite: 6.5, quality: 6.2, risk: 8.8, timing: 6.6 }
    },
    {
      name: 'Direxion Daily Tech Bull 3X',
      ticker: 'TECL',
      category: 'leverage',
      price: 70.25,
      description: 'Triple-leveraged tech ETF for momentum chasers',
      scores: { composite: 6.4, quality: 5.8, risk: 9.4, timing: 6.7 }
    },
  ],
  options: [
    {
      name: 'Cboe Global Markets',
      ticker: 'CBOE',
      category: 'options',
      price: 189.60,
      description: 'Options exchange operator thriving on volatility',
      scores: { composite: 7.3, quality: 7.8, risk: 6.2, timing: 7.1 }
    },
    {
      name: 'Robinhood Markets',
      ticker: 'HOOD',
      category: 'options',
      price: 18.95,
      description: 'Retail brokerage with a rising options mix',
      scores: { composite: 6.6, quality: 6.0, risk: 7.4, timing: 6.7 }
    },
    {
      name: 'Interactive Brokers',
      ticker: 'IBKR',
      category: 'options',
      price: 122.30,
      description: 'Global broker powering derivatives access',
      scores: { composite: 7.1, quality: 7.4, risk: 6.5, timing: 6.9 }
    },
  ],
  international: [
    {
      name: 'Toyota Motor Corp',
      ticker: 'TM',
      category: 'international',
      price: 248.10,
      description: 'Global auto leader with diversified revenue',
      scores: { composite: 7.8, quality: 8.2, risk: 4.8, timing: 7.2 }
    },
    {
      name: 'Nestlé',
      ticker: 'NSRGY',
      category: 'international',
      price: 101.40,
      description: 'Consumer staples giant with global brand strength',
      scores: { composite: 7.6, quality: 8.0, risk: 4.5, timing: 7.0 }
    },
    {
      name: 'ASML Holding',
      ticker: 'ASML',
      category: 'international',
      price: 960.75,
      description: 'Dutch chip-gear leader with EUV dominance',
      scores: { composite: 8.7, quality: 9.2, risk: 4.2, timing: 8.4 }
    },
  ],
  elite: [
    { 
      name: 'Berkshire Hathaway A', 
      ticker: 'BRK.A', 
      category: 'elite', 
      price: 685000, // $685,000 per share - Warren Buffett's Class A shares
      description: 'The ultimate blue chip - Warren Buffett\'s masterpiece',
      scores: { composite: 9.5, quality: 10, risk: 2.0, timing: 8.5 }
    },
    { 
      name: 'LVMH', 
      ticker: 'LVMH', 
      category: 'elite', 
      price: 892, 
      description: 'Luxury empire with unmatched brand portfolio',
      scores: { composite: 9.2, quality: 9.5, risk: 3.0, timing: 8.0 }
    },
    { 
      name: 'Saudi Aramco', 
      ticker: 'ARAMCO', 
      category: 'elite', 
      price: 8.50, 
      description: 'World\'s most valuable energy company',
      scores: { composite: 8.8, quality: 9.0, risk: 4.0, timing: 7.5 }
    },
    { 
      name: 'Taiwan Semiconductor', 
      ticker: 'TSM', 
      category: 'elite', 
      price: 178, 
      description: 'The backbone of global chip manufacturing',
      scores: { composite: 9.3, quality: 9.8, risk: 4.5, timing: 8.8 }
    },
  ],
}

export const MARKET_EVENTS = [
  'Federal Reserve cuts interest rates by 0.5% - Market surges!',
  'Unexpected inflation report shakes investor confidence.',
  'Tech earnings season exceeds expectations across the board.',
  'Geopolitical tensions cause market volatility spike.',
  'Major index hits all-time high on economic optimism.',
]

export const THRIFTY_CHALLENGES: ThriftyChallenge[] = [
  {
    id: '1',
    title: 'Brown Bag Week',
    description: 'Pack lunch instead of eating out for 5 days',
    reward: 3,
  },
  {
    id: '2',
    title: 'No-Spend Weekend',
    description: 'Go an entire weekend without discretionary purchases',
    reward: 5,
  },
  {
    id: '3',
    title: 'Cancel Unused Subscription',
    description: 'Identify and cancel one subscription you rarely use',
    reward: 4,
  },
  {
    id: '4',
    title: 'DIY Coffee Month',
    description: 'Make coffee at home instead of café visits for 30 days',
    reward: 6,
  },
  {
    id: '5',
    title: 'Negotiate One Bill',
    description: 'Call and negotiate a lower rate on insurance, internet, or phone',
    reward: 8,
  },
]

export function getRandomStock(category: TileCategory): Stock {
  const stocks = MOCK_STOCKS[category] || []
  const index = Math.floor(Math.random() * stocks.length)
  const stock = stocks[index]
  if (!stock) {
    return {
      name: 'Placeholder Holdings',
      ticker: 'DEMO',
      category,
      price: resolveStockPrice({ ticker: 'DEMO', compositeScore: 5, seedIndex: index }),
      description: 'Demo fallback stock while loading.',
      scores: { composite: 5, quality: 5, risk: 5, timing: 5 },
    }
  }

  return {
    ...stock,
    price: resolveStockPrice({ ticker: stock.ticker, compositeScore: stock.scores?.composite, seedIndex: index }),
  }
}

export function getRandomMarketEvent(): string {
  return MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)]
}

const DEFAULT_BIAS_STORY_ASSETS = {
  basePath: '',
  media: {},
}

export const BIAS_CASE_STUDIES: BiasCaseStudy[] = [
  {
    id: '1',
    title: 'The Confirmation Bias Trap',
    biasType: 'Confirmation Bias',
    description: 'Learn how investors selectively seek information that confirms their existing beliefs.',
    scenario: 'Sarah invested heavily in TechCorp after reading positive news articles. When negative earnings reports surfaced, she dismissed them as "short-term noise" and focused only on bullish analyst opinions that aligned with her initial thesis.',
    context: [
      'Confirmation bias leads investors to seek out information that supports their existing views while ignoring contradictory evidence.',
      'This cognitive bias can prevent proper risk assessment and lead to holding onto losing positions too long.',
      'Successful investors actively seek disconfirming evidence and challenge their own investment theses.',
      'Professional analysts use devil\'s advocate approaches and pre-mortems to combat this bias.',
    ],
    story: {
      badgeLabel: 'Insight Captured',
      takeaway: 'Seek disconfirming evidence before reinforcing a thesis.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '1-1',
          title: 'Hook',
          text: 'Sarah scrolls through glowing TechCorp headlines, feeling her conviction grow with every bullish quote.',
          mood: 'warm',
          audioCue: { sound: 'button-click', caption: 'Soft newsroom hum.' },
        },
        {
          id: '1-2',
          title: 'Tension',
          text: 'A surprise earnings miss lands, but she flips past it to find a fresh analyst upgrade.',
          mood: 'cool',
          decisionCue: 'She dismisses the red flags as noise.',
          audioCue: { sound: 'swipe-no', caption: 'Muted warning tone.' },
        },
        {
          id: '1-3',
          title: 'Decision',
          text: 'She doubles her position, convinced the market is overreacting.',
          mood: 'warm',
        },
        {
          id: '1-4',
          title: 'Consequence',
          text: 'The stock slides again as more issues surface, catching her off guard.',
          mood: 'cool',
        },
        {
          id: '1-5',
          title: 'Reflection',
          text: 'The real lesson: search for evidence that challenges your thesis, not just the headlines that confirm it.',
          mood: 'neutral',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary danger of confirmation bias in investing?',
        options: [
          'It makes you trade too frequently',
          'It prevents you from seeing risks and contradictory evidence',
          'It causes you to diversify too much',
          'It leads to overconfidence in market timing',
        ],
        correctAnswer: 1,
        explanation: 'Confirmation bias causes investors to filter out information that contradicts their beliefs, preventing them from seeing important risks and making balanced decisions.',
      },
      {
        id: 'q2',
        question: 'How can investors best combat confirmation bias?',
        options: [
          'Only read news from one trusted source',
          'Avoid researching stocks entirely',
          'Actively seek out opposing viewpoints and contradictory data',
          'Make decisions based purely on gut feeling',
        ],
        correctAnswer: 2,
        explanation: 'Actively seeking disconfirming evidence and opposing viewpoints helps investors make more balanced, rational decisions rather than falling into echo chambers.',
      },
    ],
  },
  {
    id: '2',
    title: 'Anchoring on Initial Prices',
    biasType: 'Anchoring Bias',
    description: 'Discover how initial price points unduly influence investment decisions.',
    scenario: 'Mike bought shares of RetailCo at $100. When the price dropped to $60, he refused to sell because he was "waiting to get back to even." Meanwhile, the company\'s fundamentals had deteriorated significantly, but Mike remained anchored to his $100 purchase price.',
    context: [
      'Anchoring bias occurs when investors fixate on a specific price point (often their purchase price) as a reference.',
      'This can prevent rational decision-making about current value and future prospects.',
      'The market doesn\'t care what price you paid - each day is a new decision about whether to hold.',
      'Professional investors evaluate positions based on forward prospects, not past prices.',
    ],
    story: {
      badgeLabel: 'Anchor Lifted',
      takeaway: 'Anchor on fundamentals, not a past price.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '2-1',
          title: 'Hook',
          text: 'Mike watches RetailCo bounce between $60 and $70, fixated on the $100 he paid.',
          mood: 'neutral',
          audioCue: { sound: 'button-click', caption: 'Soft ticker chatter.' },
        },
        {
          id: '2-2',
          title: 'Tension',
          text: 'Each dip feels temporary in his mind, even as the fundamentals weaken.',
          mood: 'cool',
          decisionCue: 'He delays action while waiting to break even.',
        },
        {
          id: '2-3',
          title: 'Decision',
          text: 'He ignores the fresh guidance cut because it conflicts with his anchored price.',
          mood: 'cool',
          audioCue: { sound: 'swipe-no', caption: 'Subtle warning pulse.' },
        },
        {
          id: '2-4',
          title: 'Consequence',
          text: 'The stock grinds lower, and his decision window narrows.',
          mood: 'neutral',
        },
        {
          id: '2-5',
          title: 'Reflection',
          text: 'A new day means a new decision: evaluate the business, not the entry price.',
          mood: 'warm',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What mistake is Mike making in the scenario?',
        options: [
          'He\'s not diversified enough',
          'He\'s using his purchase price instead of current fundamentals to make decisions',
          'He\'s trading too frequently',
          'He\'s not using stop-loss orders',
        ],
        correctAnswer: 1,
        explanation: 'Mike is anchored to his $100 purchase price and ignoring the fact that RetailCo\'s fundamentals have deteriorated. The purchase price is irrelevant to the current investment decision.',
      },
      {
        id: 'q2',
        question: 'What should be the primary consideration when deciding whether to hold a stock?',
        options: [
          'Whether you\'re up or down on the position',
          'Your original purchase price',
          'The company\'s current fundamentals and future prospects',
          'How long you\'ve owned it',
        ],
        correctAnswer: 2,
        explanation: 'Investment decisions should be based on current fundamentals and future prospects, not historical prices or psychological reference points.',
      },
    ],
  },
  {
    id: '3',
    title: 'Recency Bias in Market Cycles',
    biasType: 'Recency Bias',
    description: 'Understand how recent events disproportionately influence expectations.',
    scenario: 'After experiencing a strong bull market for three years, Jennifer assumed "this time is different" and that the market would continue rising indefinitely. She ignored historical market cycles and increased her equity allocation to 100% just before a major correction.',
    context: [
      'Recency bias causes investors to overweight recent experiences when making predictions about the future.',
      'This often leads to buying high (after a rally) and selling low (after a decline).',
      'Markets are cyclical, but recency bias makes recent trends feel permanent.',
      'Successful investors study history and understand that market conditions always change.',
    ],
    story: {
      badgeLabel: 'Cycle Awareness',
      takeaway: 'Zoom out before you scale up.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '3-1',
          title: 'Hook',
          text: 'Jennifer celebrates three straight years of gains, assuming the rally is permanent.',
          mood: 'warm',
          audioCue: { sound: 'celebration', caption: 'Faint celebration swell.' },
        },
        {
          id: '3-2',
          title: 'Tension',
          text: 'Historical charts feel irrelevant while the latest headlines promise more upside.',
          mood: 'neutral',
          decisionCue: 'She pushes her portfolio to 100% equities.',
        },
        {
          id: '3-3',
          title: 'Decision',
          text: 'She sidelines her risk plan because the recent past feels like destiny.',
          mood: 'cool',
          audioCue: { sound: 'swipe-no', caption: 'Soft caution chime.' },
        },
        {
          id: '3-4',
          title: 'Consequence',
          text: 'A sharp correction hits, and she realizes she ignored the cycle.',
          mood: 'cool',
        },
        {
          id: '3-5',
          title: 'Reflection',
          text: 'Market cycles repeat. Staying balanced beats chasing the latest streak.',
          mood: 'neutral',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'How does recency bias typically manifest in investing?',
        options: [
          'Assuming recent trends will continue indefinitely',
          'Refusing to sell losing positions',
          'Over-diversifying across sectors',
          'Trading based on company fundamentals',
        ],
        correctAnswer: 0,
        explanation: 'Recency bias leads investors to extrapolate recent trends into the future, whether it\'s assuming a bull market will continue forever or that a correction will never end.',
      },
      {
        id: 'q2',
        question: 'What is the best defense against recency bias?',
        options: [
          'Only invest in index funds',
          'Study historical market cycles and maintain perspective',
          'Increase allocation to cash during bull markets',
          'Follow social media investment advice',
        ],
        correctAnswer: 1,
        explanation: 'Understanding market history and cycles helps investors maintain perspective and avoid assuming that recent conditions represent a "new normal."',
      },
    ],
  },
  {
    id: '4',
    title: 'Loss Aversion in a Downturn',
    biasType: 'Loss Aversion',
    description: 'See how the fear of losses can outweigh rational decision-making.',
    scenario: 'Andre watched his logistics stock fall 25% after a guidance cut. He refused to sell because "locking in the loss feels worse," even though the company’s competitive position had weakened. Meanwhile, he sold a steady dividend stock too early just to feel a quick win.',
    context: [
      'Loss aversion means losses feel more painful than equivalent gains feel good.',
      'Investors may hold losing positions too long to avoid realizing a loss.',
      'It can also cause premature selling of winners to "lock in" small gains.',
      'A disciplined plan with predefined exit rules helps counter emotional decisions.',
    ],
    story: {
      badgeLabel: 'Courage Gained',
      takeaway: 'Let rules, not pain, decide the exit.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '4-1',
          title: 'Hook',
          text: 'Andre watches his logistics stock slide and feels the sting of every red candle.',
          mood: 'cool',
          audioCue: { sound: 'swipe-no', caption: 'Low warning pulse.' },
        },
        {
          id: '4-2',
          title: 'Tension',
          text: 'Selling feels like admitting defeat, so he stays frozen.',
          mood: 'neutral',
          decisionCue: 'He ignores his original exit plan.',
        },
        {
          id: '4-3',
          title: 'Decision',
          text: 'He sells a steady winner early just to feel a win.',
          mood: 'warm',
        },
        {
          id: '4-4',
          title: 'Consequence',
          text: 'The loser keeps sliding while the winner keeps climbing without him.',
          mood: 'cool',
        },
        {
          id: '4-5',
          title: 'Reflection',
          text: 'Pre-committed exit rules keep emotions from hijacking decisions.',
          mood: 'neutral',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Which behavior best illustrates loss aversion?',
        options: [
          'Ignoring company fundamentals to chase momentum',
          'Holding a losing stock to avoid realizing the loss',
          'Buying a stock after a positive earnings surprise',
          'Diversifying across multiple sectors',
        ],
        correctAnswer: 1,
        explanation: 'Loss aversion leads investors to hold onto losing positions because realizing the loss feels worse than the potential benefit of moving on.',
      },
      {
        id: 'q2',
        question: 'What is a practical way to reduce loss aversion?',
        options: [
          'Set exit criteria before buying and follow them',
          'Only invest in companies you love',
          'Avoid reviewing your portfolio',
          'Double down whenever a stock drops',
        ],
        correctAnswer: 0,
        explanation: 'Predefined exit criteria help you make decisions based on rules instead of emotions when a position moves against you.',
      },
    ],
  },
  {
    id: '5',
    title: 'Herding Into Hot IPOs',
    biasType: 'Herding Bias',
    description: 'Explore how crowd behavior can distort risk perception.',
    scenario: 'A flashy fintech IPO doubled on day one. Seeing social media hype, Maya bought without reviewing the prospectus. When lock-up expirations hit and insiders sold, the stock plunged and she realized she had followed the crowd without a plan.',
    context: [
      'Herding bias drives investors to follow the crowd rather than independent analysis.',
      'Social proof can make risky trades feel safer than they are.',
      'Crowded trades can reverse quickly once sentiment shifts.',
      'Independent research and valuation help avoid buying purely on hype.',
    ],
    story: {
      badgeLabel: 'Independent Lens',
      takeaway: 'Pause the hype long enough to verify the fundamentals.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '5-1',
          title: 'Hook',
          text: 'Maya watches a fintech IPO double and feels the crowd’s excitement.',
          mood: 'warm',
          audioCue: { sound: 'celebration', caption: 'Faint crowd cheer.' },
        },
        {
          id: '5-2',
          title: 'Tension',
          text: 'Her feed is full of rocket emojis and hot takes.',
          mood: 'neutral',
          decisionCue: 'She buys before reading the prospectus.',
        },
        {
          id: '5-3',
          title: 'Decision',
          text: 'She leans on social proof instead of her own analysis.',
          mood: 'cool',
          audioCue: { sound: 'swipe-no', caption: 'Soft caution beat.' },
        },
        {
          id: '5-4',
          title: 'Consequence',
          text: 'Lock-up expirations hit, insiders sell, and the stock dives.',
          mood: 'cool',
        },
        {
          id: '5-5',
          title: 'Reflection',
          text: 'Independent research is the antidote to crowded trades.',
          mood: 'neutral',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'Why is herding bias risky?',
        options: [
          'It always leads to over-diversification',
          'It relies on popularity instead of fundamentals',
          'It makes investors too conservative',
          'It eliminates market volatility',
        ],
        correctAnswer: 1,
        explanation: 'Herding bias causes decisions based on popularity, which can ignore fundamentals and inflate risk when sentiment reverses.',
      },
      {
        id: 'q2',
        question: 'What is a healthier response to market hype?',
        options: [
          'Buy immediately before the crowd moves on',
          'Follow social media sentiment indicators only',
          'Pause to review fundamentals and your risk tolerance',
          'Sell all holdings to avoid missing out',
        ],
        correctAnswer: 2,
        explanation: 'Stepping back to evaluate fundamentals and personal risk tolerance helps avoid decisions based purely on crowd behavior.',
      },
    ],
  },
  {
    id: '6',
    title: 'Overconfidence After a Win',
    biasType: 'Overconfidence Bias',
    description: 'Learn how recent success can lead to excessive risk-taking.',
    scenario: 'After a few lucky swing trades, Luis believed he had a special knack for timing the market. He increased his position sizes and stopped using stop-losses. A sudden sector rotation erased months of gains in a week.',
    context: [
      'Overconfidence can make investors overestimate their skill and underestimate risk.',
      'It often leads to larger position sizes, reduced diversification, and reckless timing.',
      'Short-term wins can be random rather than evidence of repeatable skill.',
      'Maintaining risk limits and reviewing performance objectively can reduce this bias.',
    ],
    story: {
      badgeLabel: 'Humility Restored',
      takeaway: 'Treat every win as data, not proof of destiny.',
      assetManifest: DEFAULT_BIAS_STORY_ASSETS,
      panels: [
        {
          id: '6-1',
          title: 'Hook',
          text: 'Luis strings together wins and feels unstoppable.',
          mood: 'warm',
          audioCue: { sound: 'celebration', caption: 'Gentle victory sting.' },
        },
        {
          id: '6-2',
          title: 'Tension',
          text: 'He increases position sizes and abandons his stop-losses.',
          mood: 'neutral',
          decisionCue: 'He assumes skill instead of luck.',
        },
        {
          id: '6-3',
          title: 'Decision',
          text: 'A sudden rotation hits, and his exposure is too large.',
          mood: 'cool',
          audioCue: { sound: 'swipe-no', caption: 'Soft caution chime.' },
        },
        {
          id: '6-4',
          title: 'Consequence',
          text: 'Days of losses wipe out months of gains.',
          mood: 'cool',
        },
        {
          id: '6-5',
          title: 'Reflection',
          text: 'Track outcomes objectively and keep risk limits intact.',
          mood: 'neutral',
        },
      ],
    },
    quiz: [
      {
        id: 'q1',
        question: 'What is a common outcome of overconfidence bias?',
        options: [
          'Lower trading volume',
          'Taking larger, less diversified positions',
          'Avoiding all market risk',
          'Holding only index funds',
        ],
        correctAnswer: 1,
        explanation: 'Overconfidence often leads to taking larger, concentrated positions because investors believe they can predict outcomes better than they can.',
      },
      {
        id: 'q2',
        question: 'Which habit helps guard against overconfidence?',
        options: [
          'Relying on gut instinct only',
          'Ignoring post-trade reviews',
          'Tracking decisions and reviewing outcomes objectively',
          'Doubling down after every win',
        ],
        correctAnswer: 2,
        explanation: 'Tracking decisions and reviewing outcomes objectively helps distinguish skill from luck and maintains discipline.',
      },
    ],
  },
]

export function getRandomBiasCaseStudy(): BiasCaseStudy {
  return BIAS_CASE_STUDIES[Math.floor(Math.random() * BIAS_CASE_STUDIES.length)]
}

export const AI_PLAYERS = [
  {
    id: 'ai-1',
    name: 'Warren Bot',
    avatar: '🤖',
    gameState: {
      cash: 95000,
      position: 15,
      netWorth: 125000,
      portfolioValue: 30000,
      stars: 12,
      holdings: [],
    },
  },
  {
    id: 'ai-2',
    name: 'Cathie AI',
    avatar: '🦾',
    gameState: {
      cash: 88000,
      position: 8,
      netWorth: 142000,
      portfolioValue: 54000,
      stars: 18,
      holdings: [],
    },
  },
  {
    id: 'ai-3',
    name: 'Charlie Chip',
    avatar: '🎯',
    gameState: {
      cash: 102000,
      position: 22,
      netWorth: 118000,
      portfolioValue: 16000,
      stars: 8,
      holdings: [],
    },
  },
  {
    id: 'ai-4',
    name: 'Ray Delta',
    avatar: '📊',
    gameState: {
      cash: 91000,
      position: 4,
      netWorth: 135000,
      portfolioValue: 44000,
      stars: 15,
      holdings: [],
    },
  },
]

// Elite Stock Filter for Ring 3
export function getEliteStocksForRing3(): Stock[] {
  return MOCK_STOCKS.elite.filter(stock => {
    // Only stocks with 8.0+ composite score
    const compositeScore = stock.scores?.composite ?? 0
    return compositeScore >= RING_3_CONFIG.minStockScore
  })
}
