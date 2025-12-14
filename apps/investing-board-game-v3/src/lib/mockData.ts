import { Tile, Stock, ThriftyChallenge } from './types'

export const BOARD_TILES: Tile[] = [
  { id: 0, type: 'corner', title: 'Start / ThriftyPath' },
  { id: 1, type: 'category', title: 'Turnarounds', category: 'turnarounds', colorBorder: 'oklch(0.60 0.20 330)' },
  { id: 2, type: 'event', title: 'Market Event' },
  { id: 3, type: 'category', title: 'Turnarounds', category: 'turnarounds', colorBorder: 'oklch(0.60 0.20 330)' },
  { id: 4, type: 'category', title: 'Dividends', category: 'dividends', colorBorder: 'oklch(0.65 0.20 200)' },
  { id: 5, type: 'event', title: 'Quiz' },
  { id: 6, type: 'category', title: 'Dividends', category: 'dividends', colorBorder: 'oklch(0.65 0.20 200)' },
  { id: 7, type: 'corner', title: 'Free Parking' },
  
  { id: 8, type: 'category', title: 'Growth', category: 'growth', colorBorder: 'oklch(0.70 0.18 25)' },
  { id: 9, type: 'category', title: 'Growth', category: 'growth', colorBorder: 'oklch(0.70 0.18 25)' },
  { id: 10, type: 'event', title: 'Quiz' },
  { id: 11, type: 'corner', title: 'Court of Capital' },
  
  { id: 12, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 13, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 14, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 15, type: 'event', title: 'Market Event' },
  { id: 16, type: 'category', title: 'Value', category: 'value', colorBorder: 'oklch(0.75 0.15 85)' },
  { id: 17, type: 'corner', title: 'Bias Sanctuary' },
  
  { id: 18, type: 'category', title: 'Moats', category: 'moats', colorBorder: 'oklch(0.55 0.22 15)' },
  { id: 19, type: 'category', title: 'Moats', category: 'moats', colorBorder: 'oklch(0.55 0.22 15)' },
  { id: 20, type: 'event', title: 'Quiz' },
]

export const MOCK_STOCKS: Record<string, Stock[]> = {
  turnarounds: [
    { name: 'Intel Corporation', ticker: 'INTC', category: 'turnarounds', price: 42.50, description: 'Semiconductor manufacturer rebuilding market position' },
    { name: 'Ford Motor Company', ticker: 'F', category: 'turnarounds', price: 12.80, description: 'Legacy automaker pivoting to electric vehicles' },
    { name: 'Nokia Corporation', ticker: 'NOK', category: 'turnarounds', price: 4.25, description: 'Telecom equipment provider restructuring operations' },
    { name: 'Boeing Company', ticker: 'BA', category: 'turnarounds', price: 185.40, description: 'Aerospace giant recovering from production challenges' },
  ],
  dividends: [
    { name: 'Coca-Cola Company', ticker: 'KO', category: 'dividends', price: 62.40, description: 'Global beverage leader with consistent dividend growth' },
    { name: 'Realty Income Corp', ticker: 'O', category: 'dividends', price: 58.20, description: 'Monthly dividend REIT with retail properties' },
    { name: 'AT&T Inc', ticker: 'T', category: 'dividends', price: 18.75, description: 'Telecom provider with high dividend yield' },
    { name: 'Verizon Communications', ticker: 'VZ', category: 'dividends', price: 40.30, description: 'Wireless carrier with stable dividend payments' },
  ],
  growth: [
    { name: 'NVIDIA Corporation', ticker: 'NVDA', category: 'growth', price: 875.30, description: 'AI chip leader with explosive revenue growth' },
    { name: 'MongoDB Inc', ticker: 'MDB', category: 'growth', price: 385.60, description: 'Database platform expanding in cloud infrastructure' },
    { name: 'Tesla Inc', ticker: 'TSLA', category: 'growth', price: 248.50, description: 'Electric vehicle and energy company scaling globally' },
    { name: 'Shopify Inc', ticker: 'SHOP', category: 'growth', price: 78.90, description: 'E-commerce platform with rapid merchant adoption' },
  ],
  moats: [
    { name: 'Visa Inc', ticker: 'V', category: 'moats', price: 285.90, description: 'Payment network with unassailable competitive advantages' },
    { name: 'Adobe Inc', ticker: 'ADBE', category: 'moats', price: 565.40, description: 'Creative software monopoly with high switching costs' },
    { name: 'Mastercard Inc', ticker: 'MA', category: 'moats', price: 475.20, description: 'Global payment processor with network effects' },
    { name: 'Alphabet Inc', ticker: 'GOOGL', category: 'moats', price: 142.80, description: 'Search engine dominance with data moat' },
  ],
  value: [
    { name: 'Berkshire Hathaway', ticker: 'BRK.B', category: 'value', price: 425.80, description: 'Conglomerate trading below intrinsic value' },
    { name: 'Bank of America', ticker: 'BAC', category: 'value', price: 38.90, description: 'Major bank with strong fundamentals, low P/E ratio' },
    { name: 'Citigroup Inc', ticker: 'C', category: 'value', price: 62.15, description: 'Banking giant undervalued relative to book value' },
    { name: 'Pfizer Inc', ticker: 'PFE', category: 'value', price: 27.30, description: 'Pharmaceutical company with strong cash flow, low valuation' },
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

export function getRandomStock(category: string): Stock {
  const stocks = MOCK_STOCKS[category] || []
  return stocks[Math.floor(Math.random() * stocks.length)]
}

export function getRandomMarketEvent(): string {
  return MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)]
}