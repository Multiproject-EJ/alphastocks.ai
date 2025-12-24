import { Tile, Stock, ThriftyChallenge, BiasCaseStudy, TileCategory, AIPlayer } from './types'

export const BOARD_TILES: Tile[] = [
  { id: 0, type: 'corner', title: 'Start / ThriftyPath' },
  { id: 1, type: 'category', title: 'Turnarounds', category: 'turnarounds', colorBorder: 'oklch(0.60 0.20 330)' },
  { id: 2, type: 'event', title: 'Market Event' },
  { id: 3, type: 'category', title: 'Turnarounds', category: 'turnarounds', colorBorder: 'oklch(0.60 0.20 330)' },
  { id: 4, type: 'category', title: 'Dividends', category: 'dividends', colorBorder: 'oklch(0.65 0.20 200)' },
  { id: 5, type: 'event', title: 'Quiz' },
  { id: 6, type: 'category', title: 'Dividends', category: 'dividends', colorBorder: 'oklch(0.65 0.20 200)' },
  { id: 7, type: 'corner', title: 'Casino' },

  { id: 8, type: 'category', title: 'Growth', category: 'growth', colorBorder: 'oklch(0.70 0.18 25)' },
  { id: 9, type: 'event', title: 'Wildcard' },
  { id: 10, type: 'event', title: 'Thrift Path' },
  { id: 11, type: 'category', title: 'Growth', category: 'growth', colorBorder: 'oklch(0.70 0.18 25)' },
  { id: 12, type: 'event', title: 'Quiz' },
  { id: 13, type: 'corner', title: 'Court of Capital' },

  { id: 14, type: 'event', title: '?' },
  { id: 15, type: 'event', title: '?' },
  { id: 16, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 17, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 18, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 19, type: 'event', title: 'Market Event' },
  { id: 20, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 21, type: 'corner', title: 'Bias Sanctuary' },

  { id: 22, type: 'category', title: 'Moats', category: 'moats', colorBorder: 'oklch(0.55 0.22 15)' },
  { id: 23, type: 'event', title: 'Wildcard' },
  { id: 24, type: 'category', title: 'Moats', category: 'moats', colorBorder: 'oklch(0.55 0.22 15)' },
  { id: 25, type: 'event', title: '?' },
  { id: 26, type: 'event', title: 'Quiz' },
]

// Inner Express Track - High-risk, high-reward tiles
export const INNER_TRACK_TILES: Tile[] = [
  { id: 100, type: 'corner', title: 'Express Start' },
  { id: 101, type: 'category', title: 'IPO', category: 'ipo', colorBorder: 'oklch(0.80 0.25 320)' },
  { id: 102, type: 'event', title: 'Margin Call' },
  { id: 103, type: 'category', title: 'Meme Stocks', category: 'meme', colorBorder: 'oklch(0.75 0.30 60)' },
  { id: 104, type: 'corner', title: 'Jackpot' },
  { id: 105, type: 'category', title: 'Crypto', category: 'crypto', colorBorder: 'oklch(0.70 0.25 280)' },
  { id: 106, type: 'event', title: 'Whale Alert' },
  { id: 107, type: 'category', title: 'Penny Stocks', category: 'penny', colorBorder: 'oklch(0.65 0.20 120)' },
  { id: 108, type: 'corner', title: 'Short Squeeze' },
  { id: 109, type: 'category', title: 'Leverage', category: 'leverage', colorBorder: 'oklch(0.60 0.30 0)' },
  { id: 110, type: 'event', title: 'Flash Crash' },
  { id: 111, type: 'category', title: 'Options', category: 'options', colorBorder: 'oklch(0.70 0.20 180)' },
]

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
  return stocks[Math.floor(Math.random() * stocks.length)]
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