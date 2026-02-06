import type { GameEvent } from '@/lib/events'
import type { ScratchcardTier } from '@/lib/scratchcardTiers'

export type ScratchcardEventOverride = {
  id: string
  title: string
  description: string
  eventId: string
  symbolPool?: string[]
  oddsBoost?: Partial<ScratchcardTier['odds']>
}

const clampOdds = (value: number) => Math.min(1, Math.max(0, value))

export const scratchcardEventOverrides: ScratchcardEventOverride[] = [
  {
    id: 'casino-happy-hour',
    title: 'Casino Happy Hour',
    description: 'Neon symbols and boosted odds during Happy Hour.',
    eventId: 'casino-happy-hour',
    symbolPool: ['🎰', '💎', '🍀', '💰', '⭐', '🎲'],
    oddsBoost: {
      winChance: 0.1,
      jackpotChance: 0.02,
      multiplierChance: 0.05,
    },
  },
]

export const getScratchcardEventOverride = (
  activeEvents: GameEvent[],
): ScratchcardEventOverride | null => {
  if (!activeEvents.length) return null
  return (
    scratchcardEventOverrides.find((override) =>
      activeEvents.some((event) => event.id === override.eventId),
    ) ?? null
  )
}

export const applyScratchcardEventOverride = (
  tier: ScratchcardTier,
  override: ScratchcardEventOverride | null,
): ScratchcardTier => {
  if (!override) return tier

  return {
    ...tier,
    symbolPool: override.symbolPool ?? tier.symbolPool,
    odds: {
      winChance: clampOdds(tier.odds.winChance + (override.oddsBoost?.winChance ?? 0)),
      jackpotChance: clampOdds(tier.odds.jackpotChance + (override.oddsBoost?.jackpotChance ?? 0)),
      multiplierChance: clampOdds(
        tier.odds.multiplierChance + (override.oddsBoost?.multiplierChance ?? 0),
      ),
    },
  }
}
