export interface CoinsTransaction {
  amount: number
  source: string
  timestamp: Date
}

// Earning sources
export const COIN_EARNINGS = {
  dice_roll: 10,
  land_on_tile: 15,
  quick_action: 20,
  daily_login: 50,
  complete_challenge: 30,
  win_scratchcard: 100,
  pass_start: 25,
  complete_quiz: 40
} as const

// Spending costs
export const COIN_COSTS = {
  reroll_dice: 100,
  skip_event: 150,
  peek_next_tile: 75,
  extra_roll: 200,
  hint_quiz: 50,
  fast_forward: 100,
  // Rolls purchase packs
  rolls_small: 500,    // 10 rolls
  rolls_medium: 1000,  // 25 rolls
  rolls_large: 1500,   // 50 rolls
} as const

// Helper: Can afford?
export const canAffordCoins = (current: number, cost: number): boolean => {
  return current >= cost
}

// Helper: Format coins display
export const formatCoins = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`
  }
  return amount.toString()
}
