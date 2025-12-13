export type TileType = 'corner' | 'category' | 'event'

export type TileCategory = 'turnarounds' | 'dividends' | 'growth' | 'moats' | 'value'

export interface Tile {
  id: number
  type: TileType
  title: string
  category?: TileCategory
  description?: string
  colorBorder?: string
}

export interface Stock {
  name: string
  ticker: string
  category: TileCategory
  price: number
  description: string
}

export interface ThriftyChallenge {
  id: string
  title: string
  description: string
  reward: number
}

export interface GameState {
  cash: number
  position: number
  netWorth: number
  portfolioValue: number
  stars: number
  holdings: Array<{
    stock: Stock
    shares: number
    totalCost: number
  }>
}