/**
 * Tile Position Calculator
 * 
 * Calculates the center position of each tile on the board for camera targeting.
 * Based on the board layout in App.tsx with 27 tiles (0-26).
 */

export interface TilePosition {
  id: number
  x: number  // center X relative to board
  y: number  // center Y relative to board
  side: 'bottom' | 'right' | 'top' | 'left'
}

/**
 * Calculate positions of all tiles on the board
 * 
 * Board layout (from mockData.ts):
 * - Bottom: tiles 0-7 (8 tiles, left to right)
 * - Right: tiles 8-12 (5 tiles, bottom to top)
 * - Top: tiles 13-21 (9 tiles, right to left)
 * - Left: tiles 22-26 (5 tiles, top to bottom)
 * 
 * Total: 27 tiles (0-26)
 */
export function calculateTilePositions(
  boardSize: { width: number; height: number },
  tileCount: number = 27
): TilePosition[] {
  const positions: TilePosition[] = []
  
  // Tile dimensions (approximate from board layout)
  const tileSize = 140 // Approximate tile width/height
  const padding = 32 // Board padding (p-8 = 2rem = 32px)
  
  // Calculate tile centers with half-tile offset for center positioning
  const halfTile = tileSize / 2
  
  // Bottom edge: tiles 0-7 (8 tiles)
  for (let i = 0; i <= 7; i++) {
    const x = padding + i * tileSize + halfTile
    const y = boardSize.height - padding - halfTile
    positions.push({ id: i, x, y, side: 'bottom' })
  }
  
  // Right edge: tiles 8-12 (5 tiles)
  for (let i = 8; i <= 12; i++) {
    const x = boardSize.width - padding - halfTile
    const y = boardSize.height - padding - (i - 7) * tileSize - halfTile
    positions.push({ id: i, x, y, side: 'right' })
  }
  
  // Top edge: tiles 13-21 (9 tiles)
  for (let i = 13; i <= 21; i++) {
    const x = boardSize.width - padding - (i - 13) * tileSize - halfTile
    const y = padding + halfTile
    positions.push({ id: i, x, y, side: 'top' })
  }
  
  // Left edge: tiles 22-26 (5 tiles)
  for (let i = 22; i <= 26; i++) {
    const x = padding + halfTile
    const y = padding + (i - 22) * tileSize + halfTile
    positions.push({ id: i, x, y, side: 'left' })
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
