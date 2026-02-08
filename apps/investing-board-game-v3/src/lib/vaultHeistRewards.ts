export interface VaultPrize {
  type: 'cash' | 'stars' | 'coins' | 'mystery' | 'alarm'
  amount: number
  emoji: string
  label: string
}

export interface VaultPrizeTableEntry {
  prize: VaultPrize
  weight: number
}

export const VAULT_HEIST_PRIZES: VaultPrizeTableEntry[] = [
  { prize: { type: 'cash', amount: 500, emoji: '💰', label: '$500' }, weight: 25 },
  { prize: { type: 'cash', amount: 2000, emoji: '💰', label: '$2,000' }, weight: 20 },
  { prize: { type: 'cash', amount: 10000, emoji: '💰', label: '$10,000' }, weight: 10 },
  { prize: { type: 'cash', amount: 50000, emoji: '💵', label: '$50,000 MEGA!' }, weight: 3 },
  { prize: { type: 'stars', amount: 100, emoji: '⭐', label: '100 Stars' }, weight: 15 },
  { prize: { type: 'stars', amount: 500, emoji: '⭐', label: '500 Stars' }, weight: 7 },
  { prize: { type: 'mystery', amount: 1, emoji: '💎', label: 'Mystery Box' }, weight: 8 },
  { prize: { type: 'coins', amount: 200, emoji: '🪙', label: '200 Coins' }, weight: 7 },
]

export const VAULT_HEIST_ALARM_WEIGHTS = {
  1: 4,
  2: 7,
  3: 10,
} as const
