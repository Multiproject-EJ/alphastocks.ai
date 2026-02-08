import rawEventTilesConfig from '../../../../config/event_tiles.json'

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

export interface MarketEventTileConfig {
  title: string
  icon: string
  options: EventTileOption[]
}

interface EventTilesConfig {
  definitions: EventTileDefinition[]
  marketEvent: MarketEventTileConfig
}

const DEFAULT_CONFIG: EventTilesConfig = {
  definitions: [
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
  ],
  marketEvent: {
    title: 'Market Event',
    icon: '📊',
    options: [
      {
        id: 'risk-on-surge',
        title: 'Risk-On Surge',
        description: 'Lean into the rally for a cash jolt.',
        emoji: '💰',
        rewardPreview: '💰 $1,500–$2,800',
        reward: {
          type: 'cash',
          min: 1500,
          max: 2800,
        },
      },
      {
        id: 'safe-harbor',
        title: 'Safe Harbor Reserve',
        description: 'Play defense and stack steady coins.',
        emoji: '🪙',
        rewardPreview: '🪙 60–120 Coins',
        reward: {
          type: 'coins',
          min: 60,
          max: 120,
        },
      },
      {
        id: 'macro-masterclass',
        title: 'Macro Masterclass',
        description: 'Convert the headline into XP momentum.',
        emoji: '⚡',
        rewardPreview: '⚡ 80–150 XP',
        reward: {
          type: 'xp',
          min: 80,
          max: 150,
        },
      },
    ],
  },
}

function coerceNumber(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback
}

function coerceRewardType(value: unknown, fallback: EventTileRewardType): EventTileRewardType {
  return value === 'cash' || value === 'stars' || value === 'coins' || value === 'xp' || value === 'bonus-roll'
    ? value
    : fallback
}

function normalizeReward(
  config: Partial<EventTileReward> | undefined,
  fallback: EventTileReward
): EventTileReward {
  return {
    type: coerceRewardType(config?.type, fallback.type),
    min: coerceNumber(config?.min, fallback.min),
    max: coerceNumber(config?.max, fallback.max),
  }
}

function normalizeOption(
  config: Partial<EventTileOption> | undefined,
  fallback: EventTileOption
): EventTileOption {
  return {
    id: typeof config?.id === 'string' ? config.id : fallback.id,
    title: typeof config?.title === 'string' ? config.title : fallback.title,
    description: typeof config?.description === 'string' ? config.description : fallback.description,
    emoji: typeof config?.emoji === 'string' ? config.emoji : fallback.emoji,
    rewardPreview:
      typeof config?.rewardPreview === 'string' ? config.rewardPreview : fallback.rewardPreview,
    reward: normalizeReward(config?.reward, fallback.reward),
  }
}

function normalizeOptions(
  options: EventTileOption[] | undefined,
  fallback: EventTileOption[]
): EventTileOption[] {
  if (!Array.isArray(options) || options.length === 0) {
    return fallback
  }

  return options.map((option, index) => normalizeOption(option, fallback[index] ?? fallback[0]))
}

function normalizeDefinition(
  config: Partial<EventTileDefinition> | undefined,
  fallback: EventTileDefinition
): EventTileDefinition {
  return {
    title: typeof config?.title === 'string' ? config.title : fallback.title,
    icon: typeof config?.icon === 'string' ? config.icon : fallback.icon,
    description: typeof config?.description === 'string' ? config.description : fallback.description,
    options: normalizeOptions(config?.options, fallback.options),
  }
}

function normalizeDefinitions(
  config: EventTileDefinition[] | undefined,
  fallback: EventTileDefinition[]
): EventTileDefinition[] {
  if (!Array.isArray(config) || config.length === 0) {
    return fallback
  }

  return config.map((definition, index) => normalizeDefinition(definition, fallback[index] ?? fallback[0]))
}

function normalizeMarketEventConfig(
  config: Partial<MarketEventTileConfig> | undefined,
  fallback: MarketEventTileConfig
): MarketEventTileConfig {
  return {
    title: typeof config?.title === 'string' ? config.title : fallback.title,
    icon: typeof config?.icon === 'string' ? config.icon : fallback.icon,
    options: normalizeOptions(config?.options, fallback.options),
  }
}

const eventTilesConfig: EventTilesConfig = {
  definitions: normalizeDefinitions(rawEventTilesConfig?.definitions, DEFAULT_CONFIG.definitions),
  marketEvent: normalizeMarketEventConfig(rawEventTilesConfig?.marketEvent, DEFAULT_CONFIG.marketEvent),
}

export const EVENT_TILE_CONFIG = eventTilesConfig.definitions
export const MARKET_EVENT_CONFIG = eventTilesConfig.marketEvent
