import rawRingsConfig from '../../../../config/rings.json'

const DEFAULT_CONFIG = {
  rings: {
    1: { name: 'Street Level', tiles: 35, rewardMultiplier: 1, riskMultiplier: 1 },
    2: { name: 'Executive Floor', tiles: 24, rewardMultiplier: 3, riskMultiplier: 3 },
    3: { name: 'Wealth Run', tiles: 7, rewardMultiplier: 10, riskMultiplier: 10 }
  },
  ring3: {
    maxRolls: 1,
    rewardPerWinTile: 250000,
    minStockScore: 8
  },
  portals: {
    ring1: {
      startTileId: 0,
      totalTiles: 35,
      onPass: { action: 'stay', targetRing: 1, targetTile: 0 },
      onLand: { action: 'ascend', targetRing: 2, targetTile: 200 }
    },
    ring2: {
      startTileId: 200,
      totalTiles: 24,
      onPass: { action: 'stay', targetRing: 2, targetTile: 200 },
      onLand: { action: 'stay', targetRing: 2, targetTile: 200 }
    },
    ring3: {
      startTileId: 300,
      totalTiles: 7,
      onPass: { action: 'stay', targetRing: 3, targetTile: 300 },
      onLand: { action: 'stay', targetRing: 3, targetTile: 300 }
    }
  }
}

type RingConfig = typeof DEFAULT_CONFIG.rings
type Ring3Config = typeof DEFAULT_CONFIG.ring3
type PortalConfig = typeof DEFAULT_CONFIG.portals

type RingsConfig = {
  rings: RingConfig
  ring3: Ring3Config
  portals: PortalConfig
}

function coerceNumber(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? Number(value) : fallback
}

function normalizeRingConfig(
  config: Partial<RingConfig[keyof RingConfig]> | undefined,
  fallback: RingConfig[keyof RingConfig]
): RingConfig[keyof RingConfig] {
  return {
    name: typeof config?.name === 'string' ? config.name : fallback.name,
    tiles: coerceNumber(config?.tiles, fallback.tiles),
    rewardMultiplier: coerceNumber(config?.rewardMultiplier, fallback.rewardMultiplier),
    riskMultiplier: coerceNumber(config?.riskMultiplier, fallback.riskMultiplier)
  }
}

function normalizeRingsConfig(config: Partial<RingConfig> | undefined): RingConfig {
  return {
    1: normalizeRingConfig(config?.[1], DEFAULT_CONFIG.rings[1]),
    2: normalizeRingConfig(config?.[2], DEFAULT_CONFIG.rings[2]),
    3: normalizeRingConfig(config?.[3], DEFAULT_CONFIG.rings[3])
  }
}

function normalizeRing3Config(config: Partial<Ring3Config> | undefined): Ring3Config {
  return {
    maxRolls: coerceNumber(config?.maxRolls, DEFAULT_CONFIG.ring3.maxRolls),
    rewardPerWinTile: coerceNumber(config?.rewardPerWinTile, DEFAULT_CONFIG.ring3.rewardPerWinTile),
    minStockScore: coerceNumber(config?.minStockScore, DEFAULT_CONFIG.ring3.minStockScore)
  }
}

function normalizePortalAction(
  config: Partial<PortalConfig['ring1']['onPass']> | undefined,
  fallback: PortalConfig['ring1']['onPass']
): PortalConfig['ring1']['onPass'] {
  return {
    action:
      config?.action === 'ascend' || config?.action === 'descend' || config?.action === 'stay'
        ? config.action
        : fallback.action,
    targetRing: coerceNumber(config?.targetRing, fallback.targetRing),
    targetTile: coerceNumber(config?.targetTile, fallback.targetTile)
  }
}

function normalizePortalConfig(
  config: Partial<PortalConfig['ring1']> | undefined,
  fallback: PortalConfig['ring1']
): PortalConfig['ring1'] {
  return {
    startTileId: coerceNumber(config?.startTileId, fallback.startTileId),
    totalTiles: coerceNumber(config?.totalTiles, fallback.totalTiles),
    onPass: normalizePortalAction(config?.onPass, fallback.onPass),
    onLand: normalizePortalAction(config?.onLand, fallback.onLand)
  }
}

function normalizePortalsConfig(config: Partial<PortalConfig> | undefined): PortalConfig {
  return {
    ring1: normalizePortalConfig(config?.ring1, DEFAULT_CONFIG.portals.ring1),
    ring2: normalizePortalConfig(config?.ring2, DEFAULT_CONFIG.portals.ring2),
    ring3: normalizePortalConfig(config?.ring3, DEFAULT_CONFIG.portals.ring3)
  }
}

const ringsConfig: RingsConfig = {
  rings: normalizeRingsConfig(rawRingsConfig?.rings),
  ring3: normalizeRing3Config(rawRingsConfig?.ring3),
  portals: normalizePortalsConfig(rawRingsConfig?.portals)
}

// Central ring configuration for board movement, rewards, and portal behavior.
export const RING_CONFIG = ringsConfig.rings
export const RING_3_CONFIG = ringsConfig.ring3
export const PORTAL_CONFIG = ringsConfig.portals
