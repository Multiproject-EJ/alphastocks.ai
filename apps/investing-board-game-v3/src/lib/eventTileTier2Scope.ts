import type { EventTileRewardType } from '@/lib/eventTiles'

export interface Tier2EventTileScope {
  title: string
  icon: string
  intent: string
  plannedRewards: EventTileRewardType[]
  experienceNotes: string[]
}

export const TIER_2_EVENT_TILE_SCOPE: Tier2EventTileScope[] = [
  {
    title: 'Market Event',
    icon: '📊',
    intent: 'Turn the macro headline into a quick choice-based pulse with clear upside/downside framing.',
    plannedRewards: ['cash', 'coins', 'xp'],
    experienceNotes: [
      'Replace the single random headline modal with 2-3 actionable macro choices.',
      'Offer at least one “safe harbor” option (coins/XP) and one “risk-on” option (cash spike).',
      'Show the headline summary in the modal header so the choice feels tied to the news.',
    ],
  },
  {
    title: 'Wildcard',
    icon: '🃏',
    intent: 'Route Wildcard tiles into the existing wildcard event flow with ring-aware outcomes.',
    plannedRewards: ['cash', 'stars', 'coins', 'bonus-roll'],
    experienceNotes: [
      'Use the existing wildcard event pool for Ring 1 and Ring 3.',
      'Preserve the Ring 2 split (Hidden Gem vs Fraud Alert) without adding new reward types yet.',
      'Keep messaging aligned with the “chance lift” narrative (bonus rolls, surprise boosts).',
    ],
  },
]
