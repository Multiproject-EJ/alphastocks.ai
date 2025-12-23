import React, { useMemo } from 'react';
import { useBoardPan } from '@/hooks/useBoardPan';

interface MobileBoard3DProps {
  children: React.ReactNode;
  currentPosition: number;
  totalTiles?: number;
  boardSize?: number;
}

/**
 * Mobile 3D Board - Monopoly GO Style
 * 
 * Creates a tilted, diamond-shaped (45° rotated) view of the board that:
 * - Rotates the board 45 degrees for diamond layout
 * - Tilts the board 55 degrees on X axis
 * - Shows 6-8 tiles at once for optimal visibility
 * - Centers on the player's current position
 * - Smoothly animates when player moves
 * - Supports touch pan gestures
 */
export function MobileBoard3D({
  children,
  currentPosition,
  totalTiles = 40,
  boardSize = 1200, // Match default board size used throughout app
}: MobileBoard3DProps) {
  // Touch pan gesture hook
  const { panOffset, handlers } = useBoardPan();

  // Calculate where player is on the board - FIXED calculation
  const playerOffset = useMemo(() => {
    const tilesPerSide = 10;
    const tileSize = boardSize / (tilesPerSide + 1);
    
    // Calculate which side of the board (0=bottom, 1=left, 2=top, 3=right)
    const side = Math.floor(currentPosition / tilesPerSide);
    const posOnSide = currentPosition % tilesPerSide;
    
    let x = 0, y = 0;
    const halfBoard = boardSize / 2;
    
    switch (side) {
      case 0: // Bottom edge - moving right (position 0 is Start corner at bottom-left)
        if (posOnSide === 0) {
          // Position 0: Start corner (bottom-left)
          x = -halfBoard + tileSize / 2;
          y = halfBoard - tileSize / 2;
        } else {
          x = -halfBoard + (posOnSide + 1) * tileSize;
          y = halfBoard - tileSize / 2;
        }
        break;
      case 1: // Right edge - moving up
        x = halfBoard - tileSize / 2;
        y = halfBoard - (posOnSide + 1) * tileSize;
        break;
      case 2: // Top edge - moving left
        x = halfBoard - (posOnSide + 1) * tileSize;
        y = -halfBoard + tileSize / 2;
        break;
      case 3: // Left edge - moving down
        x = -halfBoard + tileSize / 2;
        y = -halfBoard + (posOnSide + 1) * tileSize;
        break;
    }
    
    // Negate to move board opposite direction (centers player)
    return { x: -x, y: -y };
  }, [currentPosition, boardSize]);

  // Static camera settings - NO useState to avoid infinite loop!
  const camera = useMemo(() => ({
    perspective: 800,
    rotateX: 55,        // Tilt forward
    rotateZ: 45,        // Diamond rotation!
    scale: 0.62,        // Zoom to show ~6-8 tiles (increased for better visibility on small screens)
  }), []); // Empty deps = never recalculates

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
        perspectiveOrigin: '50% 50%',
        // Ensure it's above background
        zIndex: 10,
      }}
      {...handlers}
    >
      {/* Board wrapper - applies the 3D transform */}
      <div
        className="mobile-board-3d-transform"
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          position: 'relative',
          // The magic 3D transform with diamond rotation
          transform: `
            rotateX(${camera.rotateX}deg)
            rotateZ(${camera.rotateZ}deg)
            scale(${camera.scale})
            translate3d(${playerOffset.x + panOffset.x}px, ${playerOffset.y + panOffset.y}px, 0)
          `,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          // Smooth animation when moving
          transition: 'transform 0.6s ease-out',
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
