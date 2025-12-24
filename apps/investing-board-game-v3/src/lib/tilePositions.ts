/**
 * Tile Position Calculator
 * 
 * Calculates the center position of each tile on the board for camera targeting.
 * Based on a circular layout with 27 tiles (0-26) arranged in a ring.
 */

// Tile dimension constants (based on Tile.tsx component)
const MAX_TILE_SIZE = 140 // Corner tiles are 140px × 140px (largest)
const TILE_PADDING = 20   // Extra padding to prevent edge clipping
const RADIUS_SCALE_FACTOR = 0.90 // Use 90% of available space for visual balance

export interface TilePosition {
  id: number
  x: number      // center X relative to board center
  y: number      // center Y relative to board center
  angle: number  // angle in degrees (0-360)
  radius: number // distance from center
}

/**
 * Calculate positions of all tiles on the board
 * 
 * Board layout: 27 tiles arranged in a circular/ring pattern
 * - Tiles are evenly distributed around a circle
 * - Tile 0 (Start) is at the bottom (270° or 6 o'clock position)
 * - Corner tiles (0, 7, 13, 21) are positioned at quadrant markers
 * 
 * Total: 27 tiles (0-26)
 */
export function calculateTilePositions(
  boardSize: { width: number; height: number },
  tileCount: number = 27
): TilePosition[] {
  const positions: TilePosition[] = []
  
  // Board center
  const centerX = boardSize.width / 2
  const centerY = boardSize.height / 2
  
  // Tile dimensions (corner tiles are largest at 140px, others ~100-120px)
  const maxTileSize = MAX_TILE_SIZE
  const tilePadding = TILE_PADDING
  
  // Calculate radius dynamically to ensure all tiles fit within board bounds
  // Radius should be: (boardSize / 2) - (maxTileSize / 2) - padding
  const maxRadius = Math.min(boardSize.width, boardSize.height) / 2 - maxTileSize / 2 - tilePadding
  
  // Use configured scale factor for visual spacing while ensuring fit
  const radius = maxRadius * RADIUS_SCALE_FACTOR
  
  // Starting angle - position tile 0 at the bottom (270 degrees / 6 o'clock)
  const startAngle = 270
  
  // Calculate angle step between tiles
  const angleStep = 360 / tileCount
  
  for (let i = 0; i < tileCount; i++) {
    // Calculate angle for this tile (in degrees)
    const angle = startAngle + (i * angleStep)
    
    // Convert to radians for trigonometry
    const angleRad = (angle * Math.PI) / 180
    
    // Calculate x, y position relative to board center
    const x = centerX + radius * Math.cos(angleRad)
    const y = centerY + radius * Math.sin(angleRad)
    
    positions.push({ 
      id: i, 
      x, 
      y, 
      angle,
      radius 
    })
  }
  
  return positions
}

/**
 * Get position for a specific tile
 */
export function getTilePosition(
  tileId: number,
  boardSize: { width: number; height: number }
): TilePosition | undefined {
  const positions = calculateTilePositions(boardSize)
  return positions.find(pos => pos.id === tileId)
}

/**
 * Get the distance between two tile positions
 */
export function getTileDistance(
  tile1: TilePosition,
  tile2: TilePosition
): number {
  const dx = tile2.x - tile1.x
  const dy = tile2.y - tile1.y
  return Math.sqrt(dx * dx + dy * dy)
}
