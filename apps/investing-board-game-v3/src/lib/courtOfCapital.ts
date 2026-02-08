import type { EventTileDefinition } from '@/lib/eventTiles'

export const COURT_OF_CAPITAL_DEFINITION: EventTileDefinition = {
  title: 'Court of Capital',
  icon: '⚖️',
  description: 'Regulators are watching. Pick the headline you want to win.',
  options: [
    {
      id: 'legal-victory',
      title: 'Legal Victory',
      description: 'Bring in elite counsel and secure a decisive ruling.',
      emoji: '🏆',
      rewardPreview: '💰 $2,100–$3,600',
      reward: {
        type: 'cash',
        min: 2100,
        max: 3600,
      },
    },
    {
      id: 'reputation-rebuild',
      title: 'Reputation Rebuild',
      description: 'Own the narrative and restore investor trust.',
      emoji: '⭐',
      rewardPreview: '⭐ 30–52 Stars',
      reward: {
        type: 'stars',
        min: 30,
        max: 52,
      },
    },
  ],
}

export const getCourtOfCapitalDefinition = () => COURT_OF_CAPITAL_DEFINITION
