/**
 * Shop Items for Board Game V3
 * Defines all purchasable items: power-ups, upgrades, cosmetics, and currency packs
 */

export type ShopCategory = 'utilities' | 'vault';

export interface ShopItemData {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number; // in cash, not stars
  category: ShopCategory;
  effect: {
    type: 'dice' | 'multiplier' | 'shield' | 'move' | 'cosmetic';
    value: number | string;
    duration?: number;  // Number of rolls/uses
  };
}

export interface PropertyVaultItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  image?: string;
  isComplete?: boolean;
}

export const PROPERTY_VAULT_PROGRESS = {
  current: 92,
  total: 161,
  timeLeft: '17d 23h',
};

export const PROPERTY_VAULT_REWARDS = [
  { id: 'reward-cash', label: '1M', icon: '🪙' },
  { id: 'reward-bonus', label: '50B', icon: '💰' },
];

export const PROPERTY_VAULT_ITEMS: PropertyVaultItem[] = [
  {
    id: 'vault-residential',
    name: 'Residential',
    description: 'Starter neighborhoods',
    icon: '🏡',
    price: 300000,
    isComplete: true,
  },
  {
    id: 'vault-luxury-malls',
    name: 'Luxury Malls',
    description: 'Premium retail hubs',
    icon: '🏬',
    price: 440000,
    isComplete: false,
  },
  {
    id: 'vault-fine-dining',
    name: 'Fine Dining',
    description: 'Elite restaurants',
    icon: '🍽️',
    price: 360000,
    isComplete: false,
  },
  {
    id: 'vault-offices',
    name: 'Offices',
    description: 'Corporate towers',
    icon: '🏢',
    price: 420000,
    isComplete: true,
  },
  {
    id: 'vault-resorts',
    name: 'Resorts',
    description: 'Luxury escapes',
    icon: '🏝️',
    price: 480000,
    isComplete: false,
  },
  {
    id: 'vault-skyscrapers',
    name: 'Skyscrapers',
    description: 'Skyline icons',
    icon: '🏙️',
    price: 600000,
    isComplete: false,
  },
  {
    id: 'vault-boutiques',
    name: 'Designer Boutiques',
    description: 'Fashion districts',
    icon: '👜',
    price: 380000,
    isComplete: false,
  },
  {
    id: 'vault-yachts',
    name: 'Yachts',
    description: 'Luxury marinas',
    icon: '🛥️',
    price: 640000,
    isComplete: true,
  },
  {
    id: 'vault-landmarks',
    name: 'Landmarks',
    description: 'World wonders',
    icon: '🗼',
    price: 560000,
    isComplete: false,
  },
];

// Legacy interface for backwards compatibility
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

// Mobile shop items (uses cash instead of stars)
export const SHOP_ITEMS: ShopItemData[] = [
  // Dice Packs
  {
    id: 'dice-5',
    name: '+5 Dice',
    description: 'Small dice pack',
    icon: '🎲',
    price: 100000,
    category: 'utilities',
    effect: { type: 'dice', value: 5 },
  },
  {
    id: 'dice-10',
    name: '+10 Dice',
    description: 'Medium dice pack',
    icon: '🎲',
    price: 180000,
    category: 'utilities',
    effect: { type: 'dice', value: 10 },
  },
  {
    id: 'dice-30',
    name: '+30 Dice',
    description: 'Large dice pack',
    icon: '🎲',
    price: 400000,
    category: 'utilities',
    effect: { type: 'dice', value: 30 },
  },
  {
    id: 'dice-100',
    name: '+100 Dice',
    description: 'Mega dice pack',
    icon: '🎲',
    price: 1000000,
    category: 'utilities',
    effect: { type: 'dice', value: 100 },
  },

  // Power-ups
  {
    id: 'multiplier-2x',
    name: '2x Earnings',
    description: 'Double cash for 3 rolls',
    icon: '📈',
    price: 400000,
    category: 'utilities',
    effect: { type: 'multiplier', value: 2, duration: 3 },
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Block 1 penalty',
    icon: '🛡️',
    price: 600000,
    category: 'utilities',
    effect: { type: 'shield', value: 1, duration: 1 },
  },
  {
    id: 'jump-3',
    name: 'Jump +3',
    description: 'Move forward 3 spaces',
    icon: '🚀',
    price: 300000,
    category: 'utilities',
    effect: { type: 'move', value: 3 },
  },
  {
    id: 'double-roll',
    name: 'Double Roll',
    description: 'Roll 2 dice, pick higher',
    icon: '🎰',
    price: 500000,
    category: 'utilities',
    effect: { type: 'multiplier', value: 'double-roll', duration: 1 },
  },

  // Cosmetics
  {
    id: 'skin-gold',
    name: 'Gold Player',
    description: 'Shiny gold piece',
    icon: '👑',
    price: 1000000,
    category: 'utilities',
    effect: { type: 'cosmetic', value: 'player-gold' },
  },
  {
    id: 'dice-rainbow',
    name: 'Rainbow Dice',
    description: 'Colorful dice skin',
    icon: '🌈',
    price: 600000,
    category: 'utilities',
    effect: { type: 'cosmetic', value: 'dice-rainbow' },
  },
  {
    id: 'theme-night',
    name: 'Night Theme',
    description: 'Dark board theme',
    icon: '🌙',
    price: 800000,
    category: 'utilities',
    effect: { type: 'cosmetic', value: 'theme-night' },
  },
  {
    id: 'theme-gold',
    name: 'Gold Theme',
    description: 'Luxurious board',
    icon: '✨',
    price: 1200000,
    category: 'utilities',
    effect: { type: 'cosmetic', value: 'theme-gold' },
  },
];
