/**
 * Tile Position Calculator
 * 
 * Calculates the center position of each tile on the board for camera targeting.
 * Based on a circular layout with 27 tiles (0-26) arranged in a ring.
 */

export interface TilePosition {
  id: number
  x: number      // center X relative to board center
  y: number      // center Y relative to board center
  angle: number  // angle in degrees (0-360)
  radius: number // distance from center
}

/**
 * Calculate optimal radius for circular board to fit viewport
 * 
 * This function ensures ALL tiles are visible without overflow by accounting
 * for tile protrusion on ALL sides of the circle.
 * 
 * Formula: radius = (availableSize / 2) - TILE_SIZE
 * 
 * Where:
 * - availableSize is the minimum of available width and height
 * - TILE_SIZE is the largest tile dimension (corners at 140×140px)
 * - Total board diameter = 2*radius + 2*TILE_SIZE
 * 
 * @param viewportWidth - Window width in pixels
 * @param viewportHeight - Window height in pixels
 * @returns Calculated radius in pixels, or undefined for mobile views
 */
export function calculateFittingRadius(viewportWidth: number, viewportHeight: number): number {
  // Tile dimensions - tiles are uniform at 112×128px
  const TILE_SIZE = 128
  
  // Space for sidebar buttons (Shop/ProTools on left, Cities/Challenges on right)
  const SIDEBAR_WIDTH = 180 // 90px each side
  
  // Vertical margins (HUD at top, some bottom padding)
  const TOP_MARGIN = 80
  const BOTTOM_MARGIN = 40
  
  // Calculate available space
  const availableWidth = viewportWidth - (SIDEBAR_WIDTH * 2)
  const availableHeight = viewportHeight - TOP_MARGIN - BOTTOM_MARGIN
  const availableSize = Math.min(availableWidth, availableHeight)
  
  // CRITICAL FORMULA:
  // Total board diameter = 2*radius + 2*TILE_SIZE (tiles protrude on ALL sides)
  // Therefore: radius = (availableSize - 2*TILE_SIZE) / 2
  // Simplifies to: radius = (availableSize / 2) - TILE_SIZE
  const radius = (availableSize / 2) - TILE_SIZE
  
  // Safety buffer
  const safeRadius = radius - 20
  
  // Minimum usable radius (below this the board is too small to be playable)
  return Math.max(safeRadius, 120)
}

/**
 * Calculate positions of all tiles on the board
 * 
 * Board layout: 27 tiles arranged in a circular/ring pattern
 * - Tiles are evenly distributed around a circle
 * - Tile 0 (Start) is at the bottom (270° or 6 o'clock position)
 * - Corner tiles (0, 7, 13, 21) are positioned at quadrant markers
 * 
 * Supports dual-ring layout for inner express track
 * 
 * Total: 27 tiles (0-26) on outer ring, 12 tiles (100-111) on inner ring
 * 
 * @param boardSize - The dimensions of the board container
 * @param tileCount - Number of tiles to position (default: 27)
 * @param customRadius - Optional custom radius override for viewport-aware scaling
 * @param isInnerTrack - Whether this is the inner express track (smaller radius)
 */
export function calculateTilePositions(
  boardSize: { width: number; height: number },
  tileCount: number = 27,
  customRadius?: number,
  isInnerTrack: boolean = false
): TilePosition[] {
  const positions: TilePosition[] = []
  
  // Board center
  const centerX = boardSize.width / 2
  const centerY = boardSize.height / 2
  
  // Radius of the circular board (leaving space for tiles and padding)
  // Use custom radius if provided, otherwise calculate based on board size
  let radius = customRadius ?? (Math.min(boardSize.width, boardSize.height) * 0.38) // 38% of board size for nice spacing
  
  // Inner track uses 50% of outer radius
  if (isInnerTrack) {
    radius = radius * 0.5
  }
  
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
 * 
 * @param tileId - The ID of the tile to position
 * @param boardSize - The dimensions of the board container
 * @param customRadius - Optional custom radius override for viewport-aware scaling
 */
export function getTilePosition(
  tileId: number,
  boardSize: { width: number; height: number },
  customRadius?: number
): TilePosition | undefined {
  const positions = calculateTilePositions(boardSize, 27, customRadius)
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

/**
 * Calculate positions for all rings (Ring 1, Ring 2, Ring 3) and throne
 * 
 * Creates a multi-ring "Wealth Spiral" layout with concentric circles:
 * - Ring 1: Outer ring (27 tiles) at 100% of base radius
 * - Ring 2: Middle ring (18 tiles) at 65% of base radius
 * - Ring 3: Inner ring (9 tiles) at 35% of base radius
 * - Throne: Center point at (0, 0) relative to board center
 * 
 * @param boardSize - The dimensions of the board container
 * @param outerRadius - Optional custom radius for the outer ring (Ring 1)
 * @returns Object with positions for all rings and throne
 */
export function calculateAllRingPositions(
  boardSize: { width: number; height: number },
  outerRadius?: number
): {
  ring1: TilePosition[]
  ring2: TilePosition[]
  ring3: TilePosition[]
  thronePosition: { x: number; y: number }
} {
  const baseRadius = outerRadius ?? Math.min(boardSize.width, boardSize.height) * 0.38
  
  return {
    // Ring 1: Outer ring - 35 tiles at 100% radius
    ring1: calculateTilePositions(boardSize, 35, baseRadius, false),
    // Ring 2: Middle ring - 24 tiles at 65% of outer radius
    ring2: calculateTilePositions(boardSize, 24, baseRadius * 0.65, false),
    // Ring 3: Inner ring - 7 tiles at 35% of outer radius
    ring3: calculateTilePositions(boardSize, 7, baseRadius * 0.35, false),
    // Throne: Center point
    thronePosition: {
      x: boardSize.width / 2,
      y: boardSize.height / 2
    }
  }
}
