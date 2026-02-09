import type { TileLabelTone } from '@/components/TileLabel'
import rawTileLabelsConfig from '../../../../config/tile_labels.json'

export interface TileLabelEntry {
  label: string
  sublabel?: string
  icon?: string
  tone?: TileLabelTone
}

export interface TileLabelsConfig {
  quickRewards: Record<string, TileLabelEntry>
  specialActions: Record<string, TileLabelEntry>
}

const DEFAULT_CONFIG: TileLabelsConfig = {
  quickRewards: {
    cash: {
      label: 'Cash',
      sublabel: 'Bonus',
      icon: '💰',
      tone: 'success',
    },
    stars: {
      label: 'Stars',
      sublabel: 'Boost',
      icon: '⭐',
      tone: 'premium',
    },
    coins: {
      label: 'Coins',
      sublabel: 'Drop',
      icon: '🪙',
      tone: 'accent',
    },
    'bonus-roll': {
      label: 'Bonus Roll',
      sublabel: 'Extra Turn',
      icon: '🎲',
      tone: 'premium',
    },
    xp: {
      label: 'XP',
      sublabel: 'Boost',
      icon: '⚡',
      tone: 'success',
    },
    mystery: {
      label: 'Mystery',
      sublabel: 'Reveal',
      icon: '🎁',
      tone: 'premium',
    },
    chameleon: {
      label: 'Chameleon',
      sublabel: 'Shifts',
      icon: '🔄',
      tone: 'accent',
    },
  },
  specialActions: {
    'ring-fall': {
      label: 'Fall Portal',
      sublabel: 'Drop',
      icon: '⬇️',
      tone: 'warning',
    },
    chance: {
      label: 'Chance',
      sublabel: 'Draw',
      icon: '🎴',
      tone: 'accent',
    },
    'big-fish-portal': {
      label: 'Big Fish',
      sublabel: 'Portal',
      icon: '🌀',
      tone: 'premium',
    },
    'roulette-reward': {
      label: 'Roulette',
      sublabel: 'Spin',
      icon: '🎡',
      tone: 'premium',
    },
  },
}

const normalizeLabelMap = (
  defaults: Record<string, TileLabelEntry>,
  overrides?: Record<string, Partial<TileLabelEntry>>
): Record<string, TileLabelEntry> => {
  const merged: Record<string, TileLabelEntry> = { ...defaults }

  if (!overrides) {
    return merged
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (!value) continue
    merged[key] = {
      ...(defaults[key] ?? { label: value.label ?? key }),
      ...value,
    }
  }

  return merged
}

const RAW_CONFIG = rawTileLabelsConfig as Partial<TileLabelsConfig>

export const TILE_LABELS_CONFIG: TileLabelsConfig = {
  quickRewards: normalizeLabelMap(DEFAULT_CONFIG.quickRewards, RAW_CONFIG.quickRewards),
  specialActions: normalizeLabelMap(DEFAULT_CONFIG.specialActions, RAW_CONFIG.specialActions),
}

export const getQuickRewardLabelConfig = (type?: string) =>
  type ? TILE_LABELS_CONFIG.quickRewards[type] : undefined

export const getSpecialActionLabelConfig = (action?: string) =>
  action ? TILE_LABELS_CONFIG.specialActions[action] : undefined
