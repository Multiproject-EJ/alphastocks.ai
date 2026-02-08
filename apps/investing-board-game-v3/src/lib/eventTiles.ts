import {
  EVENT_TILE_CONFIG,
  MARKET_EVENT_CONFIG,
  type EventTileDefinition,
  type EventTileOption,
  type EventTileReward,
  type EventTileRewardType,
} from '@/config/eventTiles'

export type { EventTileDefinition, EventTileOption, EventTileReward, EventTileRewardType }

const EVENT_TILE_DEFINITIONS: EventTileDefinition[] = EVENT_TILE_CONFIG

export const getEventTileDefinition = (title: string): EventTileDefinition | undefined =>
  EVENT_TILE_DEFINITIONS.find((definition) => definition.title === title)

export const getMarketEventTileDefinition = (headline: string): EventTileDefinition => ({
  title: MARKET_EVENT_CONFIG.title,
  icon: MARKET_EVENT_CONFIG.icon,
  description: headline,
  options: MARKET_EVENT_CONFIG.options,
})

export const EVENT_TILE_REWARD_LABELS: Record<EventTileRewardType, string> = {
  cash: 'Cash',
  stars: 'Stars',
  coins: 'Coins',
  xp: 'XP',
  'bonus-roll': 'Bonus Roll',
}
