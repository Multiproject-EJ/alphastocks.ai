import type { RingNumber } from './types'
import { CURRENCIES, CurrencyType } from './currencyConfig'

export type MysteryBoxRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface MysteryBoxReward {
  rarity: MysteryBoxRarity
  type: 'currency' | 'item' | 'jackpot'
  currencyType?: CurrencyType
  amount?: number
  itemId?: string
  itemName?: string
  emoji: string
  description: string
}

export const RARITY_CHANCES: Record<MysteryBoxRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 12,
  epic: 2.5,
  legendary: 0.5,
}

export const RARITY_CONFIG: Record<MysteryBoxRarity, { name: string; color: string; emoji: string }> = {
  common: { name: 'Common', color: 'from-gray-500 to-gray-600', emoji: '⚪' },
  uncommon: { name: 'Uncommon', color: 'from-green-500 to-green-600', emoji: '🟢' },
  rare: { name: 'Rare', color: 'from-blue-500 to-blue-600', emoji: '🔵' },
  epic: { name: 'Epic', color: 'from-purple-500 to-purple-600', emoji: '🟣' },
  legendary: { name: 'LEGENDARY', color: 'from-yellow-400 to-amber-500', emoji: '🌟' },
}

function rollRarity(): MysteryBoxRarity {
  const roll = Math.random() * 100
  let cumulative = 0
  for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
    cumulative += chance
    if (roll < cumulative) return rarity as MysteryBoxRarity
  }
  return 'common'
}

export function openMysteryBox(ringNumber: RingNumber): MysteryBoxReward {
  const rarity = rollRarity()
  const multiplier = ringNumber === 3 ? 10 : ringNumber === 2 ? 3 : 1

  switch (rarity) {
    case 'common': {
      const amount = Math.floor((50 + Math.random() * 150) * multiplier)
      return { rarity, type: 'currency', currencyType: 'coins', amount, emoji: '🪙', description: `${amount} Coins` }
    }
    case 'uncommon': {
      const amount = Math.floor((20 + Math.random() * 30) * multiplier)
      return { rarity, type: 'currency', currencyType: 'stars', amount, emoji: '⭐', description: `${amount} Stars` }
    }
    case 'rare': {
      const amount = Math.floor((1000 + Math.random() * 4000) * multiplier)
      return { rarity, type: 'currency', currencyType: 'cash', amount, emoji: '💵', description: `$${amount.toLocaleString()}` }
    }
    case 'epic': {
      const items = ['dice_skin_gold', 'trail_sparkle', 'theme_dark', 'lucky_charm', 'shield_1_turn']
      const itemId = items[Math.floor(Math.random() * items.length)]
      return { rarity, type: 'item', itemId, emoji: '🎁', description: `Free Item: ${itemId}` }
    }
    case 'legendary': {
      const coins = 500 * multiplier
      const stars = 100 * multiplier
      const cash = 10000 * multiplier
      return { 
        rarity, 
        type: 'jackpot', 
        emoji: '🌟', 
        description: `JACKPOT! ${coins}🪙 + ${stars}⭐ + $${cash.toLocaleString()}💵 + Premium Item!` 
      }
    }
  }
}
