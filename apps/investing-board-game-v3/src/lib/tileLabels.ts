import type { Tile as TileType, RingNumber } from '@/lib/types'
import type { TileLabelTone } from '@/components/TileLabel'
import { ROULETTE_REWARDS } from '@/lib/mockData'
import { getStockCategoryDefinition } from '@/lib/stockCategories'
import { getQuickRewardLabelConfig, getSpecialActionLabelConfig } from '@/config/tileLabels'

export interface TileLabelConfig {
  label: string
  tone?: TileLabelTone
  icon?: string
  sublabel?: string
}

export interface TileLabelContext {
  rouletteModeActive: boolean
  compactCurrencyFormatter: Intl.NumberFormat
}

export const getTileLabelConfig = (
  tile: TileType,
  ring: RingNumber,
  context: TileLabelContext
): TileLabelConfig | undefined => {
  if (context.rouletteModeActive) {
    const reward = ROULETTE_REWARDS[(tile.id + ring * 2) % ROULETTE_REWARDS.length]
    return {
      label: reward.type === 'mystery' ? 'Mystery Box' : reward.label,
      tone: 'premium',
      icon: reward.icon,
      sublabel: 'Roulette',
    }
  }

  if (tile.type === 'quick-reward') {
    const quickRewardLabel = tile.quickRewardType ? getQuickRewardLabelConfig(tile.quickRewardType) : undefined
    if (quickRewardLabel) {
      return {
        label: quickRewardLabel.label,
        tone: quickRewardLabel.tone ?? 'accent',
        icon: quickRewardLabel.icon,
        sublabel: quickRewardLabel.sublabel,
      }
    }
  }

  if (tile.specialAction) {
    const specialActionLabel = getSpecialActionLabelConfig(tile.specialAction)
    if (specialActionLabel) {
      return {
        label: specialActionLabel.label,
        tone: specialActionLabel.tone ?? 'accent',
        icon: specialActionLabel.icon,
        sublabel: specialActionLabel.sublabel,
      }
    }
  }

  if (ring === 3 && tile.ring3Reward && tile.isWinTile) {
    return {
      label: `$${context.compactCurrencyFormatter.format(tile.ring3Reward)}`,
      tone: 'premium',
      icon: '👑',
      sublabel: 'Win',
    }
  }

  if (tile.type === 'learning') {
    return {
      label: 'Quiz',
      tone: 'success',
      icon: '📚',
    }
  }

  if (tile.type === 'event') {
    return {
      label: 'Event',
      tone: 'warning',
      icon: '⚡',
    }
  }

  if (tile.type === 'category') {
    const ringBoost = ring === 3 ? 'x10' : ring === 2 ? 'x3' : undefined
    const categoryDefinition = tile.category ? getStockCategoryDefinition(tile.category) : undefined

    if (categoryDefinition?.tier === 'expansion') {
      return {
        label: 'Expansion',
        tone: 'premium',
        icon: '✨',
        sublabel: ringBoost ? `Bonus ${ringBoost}` : 'Bonus',
      }
    }

    return {
      label: 'Stock',
      tone: ring === 3 ? 'premium' : 'accent',
      icon: '📈',
      sublabel: ringBoost,
    }
  }

  return undefined
}
