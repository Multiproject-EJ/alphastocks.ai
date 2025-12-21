import React, { useMemo } from 'react';

interface MobileBoard3DProps {
  children: React.ReactNode;
  currentPosition: number;
  totalTiles?: number;
  boardSize?: number;
}

/**
 * Mobile 3D Board - Monopoly GO Style
 * 
 * Creates a tilted, zoomed-in view of the board that:
 * - Tilts the board 25-30 degrees on X axis
 * - Zooms in so only 6-8 tiles are visible
 * - Centers on the player's current position
 * - Smoothly animates when player moves
 */
export function MobileBoard3D({
  children,
  currentPosition,
  totalTiles = 40,
  boardSize = 1000,
}: MobileBoard3DProps) {
  // Calculate where player is on the board
  const playerOffset = useMemo(() => {
    // Board is a square with tiles around the perimeter
    // Calculate X/Y offset to center on player's tile
    const tilesPerSide = Math.floor(totalTiles / 4);
    const side = Math.floor(currentPosition / tilesPerSide);
    const posOnSide = currentPosition % tilesPerSide;
    const tileSize = boardSize / (tilesPerSide + 1);
    
    let x = 0, y = 0;
    
    switch (side) {
      case 0: // Bottom edge (GO side) - right to left
        x = boardSize / 2 - (tilesPerSide - posOnSide) * tileSize;
        y = boardSize / 2 - tileSize / 2;
        break;
      case 1: // Left edge - bottom to top
        x = -boardSize / 2 + tileSize / 2;
        y = boardSize / 2 - (posOnSide + 1) * tileSize;
        break;
      case 2: // Top edge - left to right
        x = -boardSize / 2 + (posOnSide + 1) * tileSize;
        y = -boardSize / 2 + tileSize / 2;
        break;
      case 3: // Right edge - top to bottom
        x = boardSize / 2 - tileSize / 2;
        y = -boardSize / 2 + (posOnSide + 1) * tileSize;
        break;
    }
    
    return { x: -x, y: -y };
  }, [currentPosition, totalTiles, boardSize]);

  // 3D Camera settings for mobile
  const camera = {
    perspective: 600,      // Lower = more dramatic 3D effect
    rotateX: 28,           // Tilt angle in degrees
    scale: 2.2,            // Zoom level (2-3 shows ~6-8 tiles)
    translateZ: 0,         // Move towards/away from camera
  };

  return (
    <div 
      className="mobile-board-3d-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // Critical: Perspective on the CONTAINER
        perspective: `${camera.perspective}px`,
        perspectiveOrigin: '50% 60%',
        // Ensure it's above background
        zIndex: 10,
      }}
    >
      {/* Board wrapper - applies the 3D transform */}
      <div
        className="mobile-board-3d-transform"
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          position: 'relative',
          // The magic 3D transform
          transform: `
            rotateX(${camera.rotateX}deg)
            scale(${camera.scale})
            translate3d(${playerOffset.x}px, ${playerOffset.y}px, ${camera.translateZ}px)
          `,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          // Smooth animation when moving
          transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
          // Prevent flicker
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
