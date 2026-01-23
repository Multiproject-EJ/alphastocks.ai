import { PORTAL_CONFIG, RING_CONFIG, BOARD_TILES, RING_2_TILES, RING_3_TILES } from './mockData'
import type { RingNumber, Tile } from './types'

// Constants
const RING_START_INDEX = 0

type PortalAction = {
  action: 'ascend' | 'descend' | 'stay' | 'throne'
  targetRing: RingNumber | 0
  targetTile: number
}

interface PortalOverrideConfig {
  onPass?: PortalAction
  onLand?: PortalAction
}

export interface MovementOptions {
  portalOverrides?: Partial<Record<RingNumber, PortalOverrideConfig>>
}

export interface MovementResult {
  path: Array<{ ring: RingNumber; tileId: number }>
  finalRing: RingNumber
  finalTileId: number
  portalTriggered: boolean
  portalDirection: 'up' | 'down' | 'throne' | null
  landedExactlyOnPortal: boolean
}

/**
 * Get the tile array for a given ring
 */
function getTilesForRing(ring: RingNumber): Tile[] {
  switch (ring) {
    case 1: return BOARD_TILES
    case 2: return RING_2_TILES
    case 3: return RING_3_TILES
  }
}

/**
 * Get the base tile ID offset for a ring
 */
function getRingOffset(ring: RingNumber): number {
  switch (ring) {
    case 1: return 0
    case 2: return 200
    case 3: return 300
  }
}

/**
 * Get the portal configuration for a ring
 */
function getPortalConfig(ring: RingNumber) {
  return PORTAL_CONFIG[`ring${ring}` as keyof typeof PORTAL_CONFIG]
}

/**
 * Helper function to get portal config for a ring (exported for use in App.tsx)
 */
export function getPortalConfigForRing(ring: RingNumber) {
  return PORTAL_CONFIG[`ring${ring}` as keyof typeof PORTAL_CONFIG]
}

/**
 * Calculate the complete movement path, handling ring transitions
 * 
 * @param startRing - The ring the player is currently on
 * @param startPosition - The current tile ID (absolute, e.g., 0, 205, 302)
 * @param diceRoll - The total dice roll
 * @returns MovementResult with the complete path and final position
 */
export function calculateMovement(
  startRing: RingNumber,
  startPosition: number,
  diceRoll: number,
  options?: MovementOptions
): MovementResult {
  const path: Array<{ ring: RingNumber; tileId: number }> = []
  
  let currentRing = startRing
  let remainingSteps = diceRoll
  let currentPositionIndex = startPosition - getRingOffset(currentRing)
  
  let portalTriggered = false
  let portalDirection: 'up' | 'down' | 'throne' | null = null
  let landedExactlyOnPortal = false
  
  while (remainingSteps > 0) {
    const ringConfig = RING_CONFIG[currentRing]
    const portalConfig = getPortalConfig(currentRing)
    const portalOverrides = options?.portalOverrides?.[currentRing]
    const totalTiles = ringConfig.tiles
    const portalIndex = portalConfig.startTileId - getRingOffset(currentRing)
    
    // Move one step
    currentPositionIndex = (currentPositionIndex + 1) % totalTiles
    remainingSteps--
    
    const currentTileId = currentPositionIndex + getRingOffset(currentRing)
    path.push({ ring: currentRing, tileId: currentTileId })
    
    // Check if we hit the portal tile
    if (currentPositionIndex === portalIndex) {
      const isExactLanding = remainingSteps === 0
      landedExactlyOnPortal = isExactLanding
      
      // Determine portal action
      const action = isExactLanding
        ? (portalOverrides?.onLand ?? portalConfig.onLand)
        : (portalOverrides?.onPass ?? portalConfig.onPass)
      
      if (action.action === 'ascend') {
        portalTriggered = true
        portalDirection = 'up'
        currentRing = action.targetRing as RingNumber
        currentPositionIndex = RING_START_INDEX // Start at position 0 of new ring
        
        // Add the portal destination to path if we're continuing
        if (remainingSteps > 0) {
          const newTileId = getRingOffset(currentRing)
          path.push({ ring: currentRing, tileId: newTileId })
        }
      } else if (action.action === 'descend') {
        portalTriggered = true
        portalDirection = 'down'
        currentRing = action.targetRing as RingNumber
        currentPositionIndex = RING_START_INDEX
        
        if (remainingSteps > 0) {
          const newTileId = getRingOffset(currentRing)
          path.push({ ring: currentRing, tileId: newTileId })
        }
      } else if (action.action === 'throne') {
        portalTriggered = true
        portalDirection = 'throne'
        // Throne is the end - no more movement
        remainingSteps = 0
      }
    }
  }
  
  const finalStep = path[path.length - 1]
  
  return {
    path,
    finalRing: finalStep?.ring ?? startRing,
    finalTileId: finalStep?.tileId ?? startPosition,
    portalTriggered,
    portalDirection,
    landedExactlyOnPortal,
  }
}

/**
 * Get the tiles to animate hopping through
 */
export function getHoppingTiles(result: MovementResult): number[] {
  return result.path.map(step => step.tileId)
}
