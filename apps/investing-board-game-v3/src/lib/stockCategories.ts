import { TileCategory } from './types'

export type StockCategoryTier = 'core' | 'expansion' | 'elite' | 'future'

export type StockCategoryPalette = {
  hex: string
  oklch: string
  chip: string
}

export type StockCategoryDefinition = {
  label: string
  tier: StockCategoryTier
  palette: StockCategoryPalette
}

export const CORE_STOCK_CATEGORIES: TileCategory[] = [
  'turnarounds',
  'dividends',
  'growth',
  'moats',
  'value',
]

export const EXPANSION_STOCK_CATEGORIES: TileCategory[] = [
  'ipo',
  'meme',
  'crypto',
  'penny',
  'leverage',
  'options',
  'international',
]

export const SPECIAL_STOCK_CATEGORIES: TileCategory[] = ['elite']

export const ALL_STOCK_CATEGORIES: TileCategory[] = [
  ...CORE_STOCK_CATEGORIES,
  ...EXPANSION_STOCK_CATEGORIES,
  ...SPECIAL_STOCK_CATEGORIES,
]

const FALLBACK_PALETTE: StockCategoryPalette = {
  hex: '#888888',
  oklch: '#888888',
  chip: 'bg-white/40',
}

export const STOCK_CATEGORY_DEFINITIONS: Record<TileCategory, StockCategoryDefinition> = {
  turnarounds: {
    label: 'Turnarounds',
    tier: 'core',
    palette: {
      hex: '#FF6B6B',
      oklch: 'oklch(0.60 0.20 330)',
      chip: 'bg-pink-500/80',
    },
  },
  dividends: {
    label: 'Dividends',
    tier: 'core',
    palette: {
      hex: '#4ECDC4',
      oklch: 'oklch(0.65 0.20 200)',
      chip: 'bg-sky-500/80',
    },
  },
  growth: {
    label: 'Growth',
    tier: 'core',
    palette: {
      hex: '#45B7D1',
      oklch: 'oklch(0.70 0.18 25)',
      chip: 'bg-orange-400/80',
    },
  },
  moats: {
    label: 'Moats',
    tier: 'core',
    palette: {
      hex: '#96CEB4',
      oklch: 'oklch(0.55 0.22 15)',
      chip: 'bg-rose-500/80',
    },
  },
  value: {
    label: 'Value',
    tier: 'core',
    palette: {
      hex: '#FFEAA7',
      oklch: 'oklch(0.75 0.15 85)',
      chip: 'bg-yellow-400/80',
    },
  },
  ipo: {
    label: 'IPO',
    tier: 'expansion',
    palette: {
      hex: '#F38BFF',
      oklch: 'oklch(0.80 0.25 320)',
      chip: 'bg-fuchsia-400/80',
    },
  },
  meme: {
    label: 'Meme',
    tier: 'expansion',
    palette: {
      hex: '#FFD166',
      oklch: 'oklch(0.75 0.30 60)',
      chip: 'bg-yellow-300/80',
    },
  },
  crypto: {
    label: 'Crypto',
    tier: 'expansion',
    palette: {
      hex: '#7F5AF0',
      oklch: 'oklch(0.70 0.25 280)',
      chip: 'bg-violet-400/80',
    },
  },
  penny: {
    label: 'Penny',
    tier: 'expansion',
    palette: {
      hex: '#6BCB77',
      oklch: 'oklch(0.65 0.20 120)',
      chip: 'bg-emerald-400/80',
    },
  },
  leverage: {
    label: 'Leverage',
    tier: 'expansion',
    palette: {
      hex: '#FF6F61',
      oklch: 'oklch(0.60 0.30 0)',
      chip: 'bg-red-400/80',
    },
  },
  options: {
    label: 'Options',
    tier: 'expansion',
    palette: {
      hex: '#5DD9C1',
      oklch: 'oklch(0.70 0.20 180)',
      chip: 'bg-cyan-400/80',
    },
  },
  international: {
    label: 'International',
    tier: 'expansion',
    palette: {
      hex: '#5BA7FF',
      oklch: 'oklch(0.70 0.20 250)',
      chip: 'bg-blue-400/80',
    },
  },
  elite: {
    label: 'Elite',
    tier: 'elite',
    palette: {
      hex: '#FFD700',
      oklch: 'oklch(0.82 0.18 90)',
      chip: 'bg-amber-400/90',
    },
  },
}

export function getStockCategoryDefinition(category: TileCategory): StockCategoryDefinition | undefined {
  return STOCK_CATEGORY_DEFINITIONS[category]
}

export function getStockCategoryLabel(category: TileCategory): string {
  return STOCK_CATEGORY_DEFINITIONS[category]?.label ?? category
}

export function getStockCategoryPalette(category: TileCategory): StockCategoryPalette {
  return STOCK_CATEGORY_DEFINITIONS[category]?.palette ?? FALLBACK_PALETTE
}
