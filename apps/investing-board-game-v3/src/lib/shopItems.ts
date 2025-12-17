/**
 * Shop Items for Board Game V3
 * Defines all purchasable items: power-ups, upgrades, cosmetics, and currency packs
 */

export interface ShopItem {
  id: string
  name: string
  description: string
  category: 'powerup' | 'upgrade' | 'cosmetic' | 'currency'
  price: number // in stars
  icon: string // emoji or icon name
  isPermanent: boolean // true for upgrades/cosmetics, false for consumables
  isNew?: boolean // badge for new items
  effect?: string // what it does
  stackable?: boolean // can you own multiple (for consumables)
}

// Power-Ups (Consumables)
export const POWER_UPS: ShopItem[] = [
  {
    id: 'extra-dice-rolls',
    name: 'Extra Dice Rolls',
    description: 'Get 3 additional dice rolls to keep exploring the board',
    category: 'powerup',
    price: 500,
    icon: '🎲',
    isPermanent: false,
    stackable: true,
    effect: 'Adds 3 rolls to your current roll count',
  },
  {
    id: 'category-selector',
    name: 'Category Selector',
    description: 'Choose which category tile to land on after your next roll',
    category: 'powerup',
    price: 1000,
    icon: '🎯',
    isPermanent: false,
    stackable: true,
    effect: 'Select your preferred investment category',
  },
  {
    id: 'double-reward-card',
    name: 'Double Reward Card',
    description: 'Earn 2x stars on your next challenge completion',
    category: 'powerup',
    price: 750,
    icon: '💫',
    isPermanent: false,
    stackable: true,
    effect: 'Double stars earned from next challenge',
  },
  {
    id: 'market-shield',
    name: 'Market Shield',
    description: 'Protect yourself from the next negative market event',
    category: 'powerup',
    price: 600,
    icon: '🛡️',
    isPermanent: false,
    stackable: true,
    effect: 'Blocks one negative market event',
  },
  {
    id: 'stock-insight',
    name: 'Stock Insight',
    description: 'Reveal additional stock data before making your next purchase',
    category: 'powerup',
    price: 400,
    icon: '🔍',
    isPermanent: false,
    stackable: true,
    effect: 'Shows P/E ratio, analyst ratings, and more',
  },
]

// Permanent Upgrades
export const UPGRADES: ShopItem[] = [
  {
    id: 'portfolio-booster',
    name: 'Portfolio Booster',
    description: 'Increase all stock purchase returns by 10% permanently',
    category: 'upgrade',
    price: 5000,
    icon: '📈',
    isPermanent: true,
    stackable: false,
    effect: '+10% returns on all stock purchases',
  },
  {
    id: 'starting-cash-boost',
    name: 'Starting Cash Boost',
    description: 'Begin all new games with an extra $50,000 in cash',
    category: 'upgrade',
    price: 3000,
    icon: '💰',
    isPermanent: true,
    stackable: false,
    effect: 'Start with $150,000 instead of $100,000',
  },
  {
    id: 'star-multiplier',
    name: 'Star Multiplier',
    description: 'Earn 50% more stars on all rewards and challenges',
    category: 'upgrade',
    price: 8000,
    icon: '⭐',
    isPermanent: true,
    stackable: false,
    effect: '1.5x stars on all rewards',
  },
  {
    id: 'casino-luck',
    name: 'Casino Luck',
    description: 'Increase your scratchcard win rate by 20% at the Casino',
    category: 'upgrade',
    price: 4000,
    icon: '🍀',
    isPermanent: true,
    stackable: false,
    effect: '+20% win rate on scratchcards',
  },
  {
    id: 'extra-daily-roll',
    name: 'Extra Daily Roll',
    description: 'Permanently gain one additional dice roll per day',
    category: 'upgrade',
    price: 6000,
    icon: '🎰',
    isPermanent: true,
    stackable: false,
    effect: 'Daily roll limit increased to 11',
  },
]

// Cosmetics
export const COSMETICS: ShopItem[] = [
  {
    id: 'theme-dark',
    name: 'Dark Mode Theme',
    description: 'Premium dark board theme with sleek aesthetics',
    category: 'cosmetic',
    price: 2000,
    icon: '🌙',
    isPermanent: true,
    stackable: false,
    effect: 'Changes board appearance to dark mode',
  },
  {
    id: 'theme-gold',
    name: 'Luxury Gold Theme',
    description: 'Gold-accented premium theme for the refined investor',
    category: 'cosmetic',
    price: 2500,
    icon: '✨',
    isPermanent: true,
    stackable: false,
    effect: 'Golden accents and luxury aesthetics',
  },
  {
    id: 'theme-cyber',
    name: 'Cyber Blue Theme',
    description: 'Futuristic blue theme with neon highlights',
    category: 'cosmetic',
    price: 2500,
    icon: '🔷',
    isPermanent: true,
    stackable: false,
    effect: 'Sci-fi inspired blue color scheme',
  },
  {
    id: 'theme-forest',
    name: 'Forest Green Theme',
    description: 'Nature-inspired green theme for organic growth',
    category: 'cosmetic',
    price: 2000,
    icon: '🌲',
    isPermanent: true,
    stackable: false,
    effect: 'Earthy green tones and natural feel',
  },
  {
    id: 'dice-gold',
    name: 'Gold Dice Skin',
    description: 'Shiny gold dice that gleam with every roll',
    category: 'cosmetic',
    price: 1500,
    icon: '🟡',
    isPermanent: true,
    stackable: false,
    effect: 'Golden dice appearance',
  },
  {
    id: 'dice-neon',
    name: 'Neon Dice Skin',
    description: 'Glowing neon dice with vibrant colors',
    category: 'cosmetic',
    price: 1500,
    icon: '🟢',
    isPermanent: true,
    stackable: false,
    effect: 'Neon glowing dice effect',
  },
  {
    id: 'dice-crystal',
    name: 'Crystal Dice Skin',
    description: 'Translucent crystal dice with prismatic effects',
    category: 'cosmetic',
    price: 1800,
    icon: '💎',
    isPermanent: true,
    stackable: false,
    effect: 'Crystal clear dice with light refraction',
  },
  {
    id: 'trail-sparkle',
    name: 'Sparkle Trail',
    description: 'Shimmering particle effect that follows your token',
    category: 'cosmetic',
    price: 1200,
    icon: '✨',
    isPermanent: true,
    stackable: false,
    effect: 'Sparkle particles behind token',
  },
  {
    id: 'trail-fire',
    name: 'Fire Trail',
    description: 'Blazing fire effect that follows your token',
    category: 'cosmetic',
    price: 1200,
    icon: '🔥',
    isPermanent: true,
    stackable: false,
    effect: 'Fire particles behind token',
  },
]

// Currency Packs
export const CURRENCY_PACKS: ShopItem[] = [
  {
    id: 'cash-small',
    name: 'Cash Pack Small',
    description: 'Get $100,000 in immediate cash for investments',
    category: 'currency',
    price: 2000,
    icon: '💵',
    isPermanent: false,
    stackable: true,
    effect: 'Adds $100,000 to your cash balance',
  },
  {
    id: 'cash-medium',
    name: 'Cash Pack Medium',
    description: 'Get $250,000 in immediate cash for bigger plays',
    category: 'currency',
    price: 4500,
    icon: '💴',
    isPermanent: false,
    stackable: true,
    effect: 'Adds $250,000 to your cash balance',
  },
  {
    id: 'cash-large',
    name: 'Cash Pack Large',
    description: 'Get $500,000 in immediate cash for major investments',
    category: 'currency',
    price: 8000,
    icon: '💶',
    isPermanent: false,
    stackable: true,
    effect: 'Adds $500,000 to your cash balance',
  },
]

// All shop items combined
export const ALL_SHOP_ITEMS: ShopItem[] = [
  ...POWER_UPS,
  ...UPGRADES,
  ...COSMETICS,
  ...CURRENCY_PACKS,
]

// Helper function to get item by ID
export function getShopItemById(id: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find((item) => item.id === id)
}

// Helper function to get items by category
export function getShopItemsByCategory(
  category: ShopItem['category']
): ShopItem[] {
  return ALL_SHOP_ITEMS.filter((item) => item.category === category)
}
