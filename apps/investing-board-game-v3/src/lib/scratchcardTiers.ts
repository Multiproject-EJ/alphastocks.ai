export type ScratchcardPrize = {
  label: string
  minAmount: number
  maxAmount: number
  weight: number
  currency: 'cash' | 'stars' | 'coins' | 'xp'
}

export type ScratchcardTierId = 'bronze' | 'silver' | 'gold' | 'legendary'

export type ScratchcardTier = {
  id: ScratchcardTierId
  name: string
  entryCost: { currency: 'coins' | 'stars' | 'cash'; amount: number }
  symbolPool: string[]
  grid: { rows: number; columns: number }
  prizeSlots: number
  winPatterns: Array<'row' | 'diagonal' | 'bonus' | 'multiplier'>
  odds: {
    winChance: number
    jackpotChance: number
    multiplierChance: number
  }
  prizes: ScratchcardPrize[]
}

export const scratchcardTiers: ScratchcardTier[] = [
  {
    id: 'bronze',
    name: 'Lucky 3',
    entryCost: { currency: 'coins', amount: 50 },
    symbolPool: ['💎', '⭐', '🎰', '🍀', '💰', '🎲'],
    grid: { rows: 3, columns: 3 },
    prizeSlots: 3,
    winPatterns: ['row', 'diagonal'],
    odds: { winChance: 0.25, jackpotChance: 0.02, multiplierChance: 0.05 },
    prizes: [
      { label: 'Small Cash', minAmount: 500, maxAmount: 2000, weight: 60, currency: 'cash' },
      { label: 'Mid Cash', minAmount: 2000, maxAmount: 7500, weight: 30, currency: 'cash' },
      { label: 'Top Cash', minAmount: 7500, maxAmount: 25000, weight: 10, currency: 'cash' },
    ],
  },
  {
    id: 'silver',
    name: 'Triple Star',
    entryCost: { currency: 'coins', amount: 150 },
    symbolPool: ['⭐', '🎯', '💵', '🍀', '🎲', '🪙'],
    grid: { rows: 3, columns: 4 },
    prizeSlots: 5,
    winPatterns: ['row', 'diagonal', 'bonus'],
    odds: { winChance: 0.3, jackpotChance: 0.03, multiplierChance: 0.08 },
    prizes: [
      { label: 'Cash', minAmount: 1500, maxAmount: 6000, weight: 55, currency: 'cash' },
      { label: 'Stars', minAmount: 10, maxAmount: 40, weight: 25, currency: 'stars' },
      { label: 'Coins', minAmount: 200, maxAmount: 600, weight: 15, currency: 'coins' },
      { label: 'Big Cash', minAmount: 6000, maxAmount: 15000, weight: 5, currency: 'cash' },
    ],
  },
  {
    id: 'gold',
    name: 'Diamond Rush',
    entryCost: { currency: 'coins', amount: 300 },
    symbolPool: ['💎', '👑', '💰', '🎰', '🔥', '⭐'],
    grid: { rows: 4, columns: 4 },
    prizeSlots: 8,
    winPatterns: ['row', 'diagonal', 'bonus', 'multiplier'],
    odds: { winChance: 0.35, jackpotChance: 0.05, multiplierChance: 0.12 },
    prizes: [
      { label: 'Cash', minAmount: 3000, maxAmount: 12000, weight: 50, currency: 'cash' },
      { label: 'Coins', minAmount: 400, maxAmount: 1200, weight: 20, currency: 'coins' },
      { label: 'XP', minAmount: 25, maxAmount: 80, weight: 15, currency: 'xp' },
      { label: 'Big Cash', minAmount: 12000, maxAmount: 50000, weight: 15, currency: 'cash' },
    ],
  },
  {
    id: 'legendary',
    name: 'Jackpot Royale',
    entryCost: { currency: 'coins', amount: 1000 },
    symbolPool: ['💎', '👑', '💰', '🎁', '🃏', '💠'],
    grid: { rows: 4, columns: 5 },
    prizeSlots: 10,
    winPatterns: ['row', 'diagonal', 'bonus', 'multiplier'],
    odds: { winChance: 0.4, jackpotChance: 0.08, multiplierChance: 0.18 },
    prizes: [
      { label: 'Cash', minAmount: 8000, maxAmount: 25000, weight: 45, currency: 'cash' },
      { label: 'Coins', minAmount: 800, maxAmount: 2500, weight: 20, currency: 'coins' },
      { label: 'Stars', minAmount: 40, maxAmount: 120, weight: 15, currency: 'stars' },
      { label: 'Jackpot', minAmount: 25000, maxAmount: 250000, weight: 20, currency: 'cash' },
    ],
  },
]

export const getScratchcardTier = (tierId: ScratchcardTierId) =>
  scratchcardTiers.find((tier) => tier.id === tierId) ?? scratchcardTiers[0]
