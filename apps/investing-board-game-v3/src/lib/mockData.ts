import { Tile, Stock, ThriftyChallenge, BiasCaseStudy, TileCategory, AIPlayer } from './types'
import { resolveStockPrice } from './stockPricing'

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
  { id: 28, type: 'category', title: 'Value Picks', category: 'value', colorBorder: 'oklch(0.80 0.18 85)' },
  
  // Quick rewards
  { id: 29, type: 'event', title: 'Market Event' },
  { id: 30, type: 'quick-reward', title: 'Bonus Roll', quickRewardType: 'bonus-roll' },
  { id: 31, type: 'event', title: 'News Flash' },
  { id: 32, type: 'learning', title: 'Quiz', learningId: 'quiz-fundamentals' },
  
  // Stock tile
  { id: 33, type: 'category', title: 'Dividend Dreams', category: 'dividends', colorBorder: 'oklch(0.70 0.25 200)' },
  
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
  { id: 202, type: 'category', title: 'Premium Value', category: 'value', colorBorder: 'oklch(0.82 0.18 85)' },
  
  // Quick rewards
  { id: 203, type: 'quick-reward', title: 'Star Storm', quickRewardType: 'stars' },
  { id: 204, type: 'quick-reward', title: 'Gold Coins', quickRewardType: 'coins' },
  
  // Corner - Elevator
  { id: 205, type: 'corner', title: 'Elevator 🛗' },
  
  // Quick rewards
  { id: 206, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  
  // Stock tile
  { id: 207, type: 'category', title: 'Premium Dividends', category: 'dividends', colorBorder: 'oklch(0.74 0.20 220)' },
  
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
  { id: 217, type: 'category', title: 'Premium Moats', category: 'moats', colorBorder: 'oklch(0.70 0.19 235)' },
  
  // Quick rewards
  { id: 218, type: 'special', title: 'Fall Portal', specialAction: 'ring-fall', specialStyle: 'fall-portal', portalStyle: 'blue', colorBorder: 'oklch(0.72 0.2 225)' },
  { id: 219, type: 'quick-reward', title: 'Gold Coins', quickRewardType: 'coins' },
  { id: 220, type: 'event', title: 'Board Meeting' },
  { id: 221, type: 'event', title: 'Wildcard' },
  
  // Stock tile
  { id: 222, type: 'category', title: 'Premium Turnarounds', category: 'turnarounds', colorBorder: 'oklch(0.78 0.18 95)' },
  
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
export const RING_CONFIG = {
  1: { name: 'Street Level', tiles: 35, rewardMultiplier: 1, riskMultiplier: 1 },
  2: { name: 'Executive Floor', tiles: 24, rewardMultiplier: 3, riskMultiplier: 3 },
  3: { name: 'Wealth Run', tiles: 7, rewardMultiplier: 10, riskMultiplier: 10 },
} as const

// Ring 3 Configuration
export const RING_3_CONFIG = {
  maxRolls: 1,  // Only 1 dice roll allowed
  rewardPerWinTile: 250000,  // Baseline high reward (use per-tile overrides)
  minStockScore: 8.0,  // Only show 8.0+ composite score stocks
} as const

// Portal configuration for each ring's start tile
export const PORTAL_CONFIG = {
  ring1: {
    startTileId: 0,
    totalTiles: 35,
    onPass: { action: 'stay', targetRing: 1, targetTile: 0 },
    onLand: { action: 'ascend', targetRing: 2, targetTile: 200 },
  },
  ring2: {
    startTileId: 200,
    totalTiles: 24,
    onPass: { action: 'stay', targetRing: 2, targetTile: 200 },
    onLand: { action: 'stay', targetRing: 2, targetTile: 200 },
  },
  ring3: {
    startTileId: 300,
    totalTiles: 7,
    onPass: { action: 'stay', targetRing: 3, targetTile: 300 },
    onLand: { action: 'stay', targetRing: 3, targetTile: 300 },
  },
} as const

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
  { id: 'mega-cash', label: '$5M Mega Cash', type: 'cash', amount: 5_000_000, icon: '💰' },
  { id: 'star-flood', label: '2M Stars', type: 'stars', amount: 2_000_000, icon: '⭐' },
  { id: 'coin-tsunami', label: '3M Coins', type: 'coins', amount: 3_000_000, icon: '🪙' },
  { id: 'vault-jackpot', label: '$8M Vault Jackpot', type: 'cash', amount: 8_000_000, icon: '🏦' },
  { id: 'legacy-stars', label: '5M Stars', type: 'stars', amount: 5_000_000, icon: '✨' },
  { id: 'mystery-box', label: 'Mystery Box', type: 'mystery', amount: 0, icon: '🎁' },
] as const

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
