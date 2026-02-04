// Central ring configuration for board movement, rewards, and portal behavior.
export const RING_CONFIG = {
  1: { name: 'Street Level', tiles: 35, rewardMultiplier: 1, riskMultiplier: 1 },
  2: { name: 'Executive Floor', tiles: 24, rewardMultiplier: 3, riskMultiplier: 3 },
  3: { name: 'Wealth Run', tiles: 7, rewardMultiplier: 10, riskMultiplier: 10 },
} as const

export const RING_3_CONFIG = {
  maxRolls: 1, // Only 1 dice roll allowed
  rewardPerWinTile: 250000, // Baseline high reward (use per-tile overrides)
  minStockScore: 8.0, // Only show 8.0+ composite score stocks
} as const

export const PORTAL_CONFIG = {
  ring1: {
    startTileId: 0,
    totalTiles: 35,
    onPass: { action: 'stay', targetRing: 1, targetTile: 0 },
    onLand: { action: 'ascend', targetRing: 2, targetTile: 200 },
  },
  ring2: {
    startTileId: 200,
    totalTiles: 24,
    onPass: { action: 'stay', targetRing: 2, targetTile: 200 },
    onLand: { action: 'stay', targetRing: 2, targetTile: 200 },
  },
  ring3: {
    startTileId: 300,
    totalTiles: 7,
    onPass: { action: 'stay', targetRing: 3, targetTile: 300 },
    onLand: { action: 'stay', targetRing: 3, targetTile: 300 },
  },
} as const
