/**
 * Games Configuration
 * Central configuration for all mini-games in the hub
 */

export interface GameConfig {
  id: string
  name: string
  emoji: string
  description: string
  counter: string
  status: 'coming-soon' | 'playable'
  accentColor: string
}

export const GAMES_CONFIG: GameConfig[] = [
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    emoji: '🎡',
    description: 'Spin to win cash & prizes',
    counter: '1 of 10',
    status: 'coming-soon',
    accentColor: 'from-purple-500 to-pink-500',
  },
  {
    id: 'stock-rush',
    name: 'Stock Rush',
    emoji: '📈',
    description: 'Fast-paced stock picking',
    counter: '2 of 10',
    status: 'coming-soon',
    accentColor: 'from-green-500 to-emerald-500',
  },
  {
    id: 'vault-heist',
    name: 'Vault Heist',
    emoji: '🏦',
    description: 'Crack the vault mini-game',
    counter: '3 of 10',
    status: 'coming-soon',
    accentColor: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'market-mayhem',
    name: 'Market Mayhem',
    emoji: '📊',
    description: 'Chaos trading challenge',
    counter: '4 of 10',
    status: 'coming-soon',
    accentColor: 'from-red-500 to-orange-500',
  },
  {
    id: 'portfolio-poker',
    name: 'Portfolio Poker',
    emoji: '🃏',
    description: 'Card-based investing',
    counter: '5 of 10',
    status: 'coming-soon',
    accentColor: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dividend-derby',
    name: 'Dividend Derby',
    emoji: '🏇',
    description: 'Race your dividends',
    counter: '6 of 10',
    status: 'coming-soon',
    accentColor: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'bull-run',
    name: 'Bull Run',
    emoji: '🐂',
    description: 'Ride the bull market',
    counter: '7 of 10',
    status: 'coming-soon',
    accentColor: 'from-lime-500 to-green-500',
  },
  {
    id: 'bear-trap',
    name: 'Bear Trap',
    emoji: '🐻',
    description: 'Survive the bear market',
    counter: '8 of 10',
    status: 'coming-soon',
    accentColor: 'from-slate-500 to-gray-600',
  },
  {
    id: 'ipo-frenzy',
    name: 'IPO Frenzy',
    emoji: '🚀',
    description: 'Hot IPO investment game',
    counter: '9 of 10',
    status: 'coming-soon',
    accentColor: 'from-rose-500 to-pink-500',
  },
  {
    id: 'merger-mania',
    name: 'Merger Mania',
    emoji: '🤝',
    description: 'M&A deal making',
    counter: '10 of 10',
    status: 'coming-soon',
    accentColor: 'from-teal-500 to-cyan-500',
  },
]
