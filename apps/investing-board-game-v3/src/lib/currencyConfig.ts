export type CurrencyType = 'cash' | 'stars' | 'coins'

export interface CurrencyConfig {
  id: CurrencyType
  name: string
  emoji: string
  color: string
  glowColor: string
  baseValue: number
}

export const CURRENCIES: Record<CurrencyType, CurrencyConfig> = {
  coins: {
    id: 'coins',
    name: 'Coins',
    emoji: '🪙',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    baseValue: 1,
  },
  stars: {
    id: 'stars',
    name: 'Stars',
    emoji: '⭐',
    color: 'from-yellow-400 to-amber-500',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    baseValue: 10,
  },
  cash: {
    id: 'cash',
    name: 'Cash',
    emoji: '💵',
    color: 'from-green-500 to-emerald-600',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    baseValue: 100,
  },
}

// Exchange: 100 coins = 10 stars = $1000
export const EXCHANGE_RATES: Record<CurrencyType, Record<CurrencyType, number>> = {
  coins: { coins: 1, stars: 0.1, cash: 10 },
  stars: { coins: 10, stars: 1, cash: 100 },
  cash: { coins: 0.1, stars: 0.01, cash: 1 },
}

export const MIN_EXCHANGE: Record<CurrencyType, number> = {
  coins: 100,
  stars: 10,
  cash: 1000,
}

export const EXCHANGE_FEE = 0.05

export function calculateExchange(
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType,
  amount: number
): { toAmount: number; fee: number; rate: number; isValid: boolean; error?: string } {
  if (fromCurrency === toCurrency) {
    return { toAmount: amount, fee: 0, rate: 1, isValid: true }
  }
  if (amount < MIN_EXCHANGE[fromCurrency]) {
    return { toAmount: 0, fee: 0, rate: 0, isValid: false, error: `Minimum ${MIN_EXCHANGE[fromCurrency]} ${CURRENCIES[fromCurrency].name}` }
  }
  const rate = EXCHANGE_RATES[fromCurrency][toCurrency]
  const grossAmount = amount * rate
  const fee = grossAmount * EXCHANGE_FEE
  return { toAmount: Math.floor(grossAmount - fee), fee: Math.ceil(fee), rate, isValid: true }
}

export function formatCurrency(type: CurrencyType, amount: number): string {
  const config = CURRENCIES[type]
  return type === 'cash' ? `${config.emoji} $${amount.toLocaleString()}` : `${config.emoji} ${amount.toLocaleString()}`
}
