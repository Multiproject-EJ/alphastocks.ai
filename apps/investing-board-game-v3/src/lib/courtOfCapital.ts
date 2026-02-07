import type { EventTileDefinition } from '@/lib/eventTiles'

export const COURT_OF_CAPITAL_DEFINITION: EventTileDefinition = {
  title: 'Court of Capital',
  icon: '⚖️',
  description: 'The regulators are watching. Pick your strategy to protect the brand.',
  options: [
    {
      id: 'legal-victory',
      title: 'Legal Victory',
      description: 'Bring in elite counsel and win a decisive ruling.',
      emoji: '🏆',
      rewardPreview: '💰 $1,800–$3,200',
      reward: {
        type: 'cash',
        min: 1800,
        max: 3200,
      },
    },
    {
      id: 'reputation-rebuild',
      title: 'Reputation Rebuild',
      description: 'Own the narrative and regain investor trust.',
      emoji: '⭐',
      rewardPreview: '⭐ 24–42 Stars',
      reward: {
        type: 'stars',
        min: 24,
        max: 42,
      },
    },
  ],
}

export const getCourtOfCapitalDefinition = () => COURT_OF_CAPITAL_DEFINITION
