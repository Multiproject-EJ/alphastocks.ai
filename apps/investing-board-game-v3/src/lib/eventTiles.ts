export type EventTileRewardType = 'cash' | 'stars' | 'coins' | 'xp' | 'bonus-roll'

export interface EventTileReward {
  type: EventTileRewardType
  min: number
  max: number
}

export interface EventTileOption {
  id: string
  title: string
  description: string
  emoji: string
  rewardPreview: string
  reward: EventTileReward
}

export interface EventTileDefinition {
  title: string
  icon: string
  description: string
  options: EventTileOption[]
}

const EVENT_TILE_DEFINITIONS: EventTileDefinition[] = [
  {
    title: 'Analyst Call',
    icon: '📞',
    description: 'An analyst call just dropped. How do you want to play it?',
    options: [
      {
        id: 'rating-upgrade',
        title: 'Rating Upgrade',
        description: 'Lean into the upgrade and grab momentum.',
        emoji: '⭐',
        rewardPreview: '⭐ 12–22 Stars',
        reward: {
          type: 'stars',
          min: 12,
          max: 22,
        },
      },
      {
        id: 'earnings-beat',
        title: 'Earnings Beat',
        description: 'Ride the surprise beat for quick cash.',
        emoji: '💰',
        rewardPreview: '💰 $800–$1,400',
        reward: {
          type: 'cash',
          min: 800,
          max: 1400,
        },
      },
    ],
  },
  {
    title: 'News Flash',
    icon: '📰',
    description: 'Breaking news rattles the market. Pick your stance.',
    options: [
      {
        id: 'safe-haven',
        title: 'Safe Haven',
        description: 'Shift to safety and stack coins.',
        emoji: '🪙',
        rewardPreview: '🪙 20–45 Coins',
        reward: {
          type: 'coins',
          min: 20,
          max: 45,
        },
      },
      {
        id: 'momentum-play',
        title: 'Momentum Play',
        description: 'Act fast and take an extra roll.',
        emoji: '🎲',
        rewardPreview: '🎲 +1 Bonus Roll',
        reward: {
          type: 'bonus-roll',
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    title: 'Executive Event',
    icon: '🧾',
    description: 'A leadership move shakes the floor. Choose your play.',
    options: [
      {
        id: 'equity-grant',
        title: 'Equity Grant',
        description: 'Lock in extra stars from executive perks.',
        emoji: '⭐',
        rewardPreview: '⭐ 28–55 Stars',
        reward: {
          type: 'stars',
          min: 28,
          max: 55,
        },
      },
      {
        id: 'exec-bonus',
        title: 'Executive Bonus',
        description: 'Take the cash bonus while it’s hot.',
        emoji: '💰',
        rewardPreview: '💰 $2,000–$3,500',
        reward: {
          type: 'cash',
          min: 2000,
          max: 3500,
        },
      },
    ],
  },
  {
    title: 'Board Meeting',
    icon: '🏛️',
    description: 'The board convenes. Decide how to steer the outcome.',
    options: [
      {
        id: 'strategic-vote',
        title: 'Strategic Vote',
        description: 'Earn XP for the long-term plan.',
        emoji: '⚡',
        rewardPreview: '⚡ 35–70 XP',
        reward: {
          type: 'xp',
          min: 35,
          max: 70,
        },
      },
      {
        id: 'budget-approval',
        title: 'Budget Approval',
        description: 'Secure extra coins for your next move.',
        emoji: '🪙',
        rewardPreview: '🪙 50–90 Coins',
        reward: {
          type: 'coins',
          min: 50,
          max: 90,
        },
      },
    ],
  },
]

export const getEventTileDefinition = (title: string): EventTileDefinition | undefined =>
  EVENT_TILE_DEFINITIONS.find((definition) => definition.title === title)

export const EVENT_TILE_REWARD_LABELS: Record<EventTileRewardType, string> = {
  cash: 'Cash',
  stars: 'Stars',
  coins: 'Coins',
  xp: 'XP',
  'bonus-roll': 'Bonus Roll',
}
