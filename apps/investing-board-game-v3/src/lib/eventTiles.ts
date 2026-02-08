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
    description: 'A top analyst just upgraded your watchlist. Choose the play.',
    options: [
      {
        id: 'rating-upgrade',
        title: 'Top Pick Alert',
        description: 'Lean into the upgrade and stack prestige stars.',
        emoji: '⭐',
        rewardPreview: '⭐ 16–28 Stars',
        reward: {
          type: 'stars',
          min: 16,
          max: 28,
        },
      },
      {
        id: 'earnings-beat',
        title: 'Flash Guidance Beat',
        description: 'Ride the surprise beat for a fast cash bump.',
        emoji: '💰',
        rewardPreview: '💰 $950–$1,650',
        reward: {
          type: 'cash',
          min: 950,
          max: 1650,
        },
      },
    ],
  },
  {
    title: 'News Flash',
    icon: '📰',
    description: 'A headline just hit the tape. Pick your market stance.',
    options: [
      {
        id: 'safe-haven',
        title: 'Safe Haven Sweep',
        description: 'Rotate to safety and bank extra coins.',
        emoji: '🪙',
        rewardPreview: '🪙 26–55 Coins',
        reward: {
          type: 'coins',
          min: 26,
          max: 55,
        },
      },
      {
        id: 'momentum-play',
        title: 'Volatility Flip',
        description: 'Trade the whipsaw for a bonus roll.',
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
    description: 'An executive shakeup rattles sentiment. Choose your play.',
    options: [
      {
        id: 'equity-grant',
        title: 'Equity Grant',
        description: 'Lock in prestige stars from the insider perk.',
        emoji: '⭐',
        rewardPreview: '⭐ 32–60 Stars',
        reward: {
          type: 'stars',
          min: 32,
          max: 60,
        },
      },
      {
        id: 'exec-bonus',
        title: 'Executive Bonus',
        description: 'Take the cash bonus while the buzz is hot.',
        emoji: '💰',
        rewardPreview: '💰 $2,300–$3,900',
        reward: {
          type: 'cash',
          min: 2300,
          max: 3900,
        },
      },
    ],
  },
  {
    title: 'Board Meeting',
    icon: '🏛️',
    description: 'The board convenes. Choose the headline-worthy outcome.',
    options: [
      {
        id: 'strategic-vote',
        title: 'Strategic Vote',
        description: 'Earn XP for steering the long-term vision.',
        emoji: '⚡',
        rewardPreview: '⚡ 42–88 XP',
        reward: {
          type: 'xp',
          min: 42,
          max: 88,
        },
      },
      {
        id: 'budget-approval',
        title: 'Budget Approval',
        description: 'Secure fresh coins for your next board move.',
        emoji: '🪙',
        rewardPreview: '🪙 64–120 Coins',
        reward: {
          type: 'coins',
          min: 64,
          max: 120,
        },
      },
    ],
  },
]

export const getEventTileDefinition = (title: string): EventTileDefinition | undefined =>
  EVENT_TILE_DEFINITIONS.find((definition) => definition.title === title)

const MARKET_EVENT_OPTIONS: EventTileOption[] = [
  {
    id: 'risk-on-surge',
    title: 'Risk-On Surge',
    description: 'Lean into the rally for a punchy cash spike.',
    emoji: '💰',
    rewardPreview: '💰 $1,200–$2,200',
    reward: {
      type: 'cash',
      min: 1200,
      max: 2200,
    },
  },
  {
    id: 'safe-harbor',
    title: 'Safe Harbor Reserve',
    description: 'Play defense and stack steady coins.',
    emoji: '🪙',
    rewardPreview: '🪙 48–96 Coins',
    reward: {
      type: 'coins',
      min: 48,
      max: 96,
    },
  },
  {
    id: 'macro-masterclass',
    title: 'Macro Masterclass',
    description: 'Convert the headline into XP momentum.',
    emoji: '⚡',
    rewardPreview: '⚡ 60–120 XP',
    reward: {
      type: 'xp',
      min: 60,
      max: 120,
    },
  },
]

export const getMarketEventTileDefinition = (headline: string): EventTileDefinition => ({
  title: 'Market Event',
  icon: '📊',
  description: headline,
  options: MARKET_EVENT_OPTIONS,
})

export const EVENT_TILE_REWARD_LABELS: Record<EventTileRewardType, string> = {
  cash: 'Cash',
  stars: 'Stars',
  coins: 'Coins',
  xp: 'XP',
  'bonus-roll': 'Bonus Roll',
}
