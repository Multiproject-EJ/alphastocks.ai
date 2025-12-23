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
  totalTiles = 27, // Updated to match actual board layout
  boardSize = 1200, // Match default board size used throughout app
}: MobileBoard3DProps) {
  // Touch pan gesture hook
  const { panOffset, handlers } = useBoardPan();

  // Calculate where player is on the board - FIXED calculation for 27-tile board
  const playerOffset = useMemo(() => {
    // Board layout: 27 tiles arranged as:
    // Bottom: 0-7 (8 tiles)
    // Right: 8-12 (5 tiles)
    // Top: 13-21 (9 tiles)
    // Left: 22-26 (5 tiles)
    
    const totalTiles = 27;
    const tileSize = boardSize / 10; // Approximate tile size
    const halfBoard = boardSize / 2;
    
    let x = 0, y = 0;
    
    if (currentPosition >= 0 && currentPosition <= 7) {
      // Bottom edge - positions 0-7, moving left to right
      const posOnSide = currentPosition;
      x = -halfBoard + (posOnSide + 0.5) * tileSize * (8 / 8); // Distribute across bottom
      y = halfBoard - tileSize * 0.5;
    } else if (currentPosition >= 8 && currentPosition <= 12) {
      // Right edge - positions 8-12, moving bottom to top
      const posOnSide = currentPosition - 8;
      x = halfBoard - tileSize * 0.5;
      y = halfBoard - (posOnSide + 2) * tileSize * (8 / 5); // Adjust spacing
    } else if (currentPosition >= 13 && currentPosition <= 21) {
      // Top edge - positions 13-21, moving right to left
      const posOnSide = currentPosition - 13;
      x = halfBoard - (posOnSide + 0.5) * tileSize * (9 / 9);
      y = -halfBoard + tileSize * 0.5;
    } else if (currentPosition >= 22 && currentPosition <= 26) {
      // Left edge - positions 22-26, moving top to bottom
      const posOnSide = currentPosition - 22;
      x = -halfBoard + tileSize * 0.5;
      y = -halfBoard + (posOnSide + 2) * tileSize * (8 / 5); // Adjust spacing
    }
    
    // Negate to move board opposite direction (centers player)
    // Apply slight damping to keep more tiles visible
    return { x: -x * 0.85, y: -y * 0.85 };
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
