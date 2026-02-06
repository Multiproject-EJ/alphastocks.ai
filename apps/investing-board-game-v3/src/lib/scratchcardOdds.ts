import type { ScratchcardPrize, ScratchcardTier } from '@/lib/scratchcardTiers'

export type ScratchcardEvRange = { min: number; max: number }

export type ScratchcardEvEntry = {
  currency: ScratchcardPrize['currency']
  average: number
  min: number
  max: number
}

type ScratchcardOddsSummary = {
  evByCurrency: Record<ScratchcardPrize['currency'], number>
  evRangeByCurrency: Record<ScratchcardPrize['currency'], ScratchcardEvRange>
  evSummary: ScratchcardEvEntry[]
  winChance: number
}

export type ScratchcardOddsModifiers = {
  luckBoost?: number
  guaranteedWin?: boolean
}

const clampProbability = (value: number) => Math.max(0, Math.min(1, value))

export const getScratchcardOddsSummary = (
  tier: ScratchcardTier,
  modifiers: ScratchcardOddsModifiers = {},
): ScratchcardOddsSummary => {
  const winChance = modifiers.guaranteedWin
    ? 1
    : clampProbability(tier.odds.winChance + (modifiers.luckBoost ?? 0))
  const totalWeight = tier.prizes.reduce((sum, prize) => sum + prize.weight, 0)
  const evByCurrency: Record<ScratchcardPrize['currency'], number> = {
    cash: 0,
    coins: 0,
    stars: 0,
    xp: 0,
  }

  if (totalWeight > 0) {
    tier.prizes.forEach((prize) => {
      const average = (prize.minAmount + prize.maxAmount) / 2
      evByCurrency[prize.currency] += (average * prize.weight) / totalWeight
    })
  }

  const evRangeByCurrency = tier.prizes.reduce<
    Record<ScratchcardPrize['currency'], ScratchcardEvRange>
  >(
    (totals, prize) => {
      const current = totals[prize.currency]
      current.min = current.min === 0 ? prize.minAmount : Math.min(current.min, prize.minAmount)
      current.max = Math.max(current.max, prize.maxAmount)
      return totals
    },
    {
      cash: { min: 0, max: 0 },
      coins: { min: 0, max: 0 },
      stars: { min: 0, max: 0 },
      xp: { min: 0, max: 0 },
    },
  )

  const evSummary = (Object.keys(evByCurrency) as ScratchcardPrize['currency'][]).map(
    (currency) => {
      const average = winChance * tier.prizeSlots * evByCurrency[currency]
      const range = evRangeByCurrency[currency]
      const min = winChance * tier.prizeSlots * range.min
      const max = winChance * tier.prizeSlots * range.max
      return { currency, average, min, max }
    },
  )

  return {
    evByCurrency,
    evRangeByCurrency,
    evSummary,
    winChance,
  }
}
