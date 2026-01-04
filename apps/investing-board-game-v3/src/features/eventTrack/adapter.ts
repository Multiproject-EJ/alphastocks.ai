import type { Tile } from '@/lib/types'

export const pointsForRoll = (total: number, isDoubles: boolean) => {
  const base = 2 + Math.ceil(total / 2)
  const doublesBonus = isDoubles ? 4 : 0
  return base + doublesBonus
}

export const pointsForTileLanding = (tile: Tile) => {
  switch (tile.type) {
    case 'category':
      return 10
    case 'event':
      return 12
    case 'corner':
      return 8
    case 'mystery':
      return 6
    default:
      return 4
  }
}

export const pointsForChallengeComplete = (challengeType: 'daily' | 'weekly') =>
  challengeType === 'daily' ? 20 : 35
