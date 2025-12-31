import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBoardPan } from '@/hooks/useBoardPan';
import { calculateTilePositions } from '@/lib/tilePositions';

interface MobileBoard3DProps {
  children: React.ReactNode;
  currentPosition: number;
  totalTiles?: number;
  boardSize?: number;
}

/**
 * Mobile 3D Board - Circular Layout
 * 
 * Creates a tilted view of the circular board that:
 * - Tilts the board on X axis for 3D perspective
 * - Shows 6-8 tiles at once for optimal visibility
 * - Centers on the player's current position
 * - Smoothly animates when player moves
 * - Supports touch pan gestures
 */
export function MobileBoard3D({
  children,
  currentPosition,
  totalTiles = 27,
  boardSize = 1200,
}: MobileBoard3DProps) {
  // Touch pan gesture hook
  const { panOffset, handlers } = useBoardPan();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate where player is on the circular board
  const playerPosition = useMemo(() => {
    const tilePositions = calculateTilePositions({ width: boardSize, height: boardSize })
    const currentTile = tilePositions.find(t => t.id === currentPosition)
    
    if (!currentTile) {
      return { x: 0, y: 0, offsetX: 0, offsetY: 0 }
    }
    
    // Calculate offset from center
    const centerX = boardSize / 2
    const centerY = boardSize / 2
    const x = currentTile.x - centerX
    const y = currentTile.y - centerY
    
    // Negate to move board opposite direction (centers player)
    // Apply slight damping to keep more tiles visible
    return { x, y, offsetX: -x * 0.85, offsetY: -y * 0.85 }
  }, [currentPosition, boardSize]);

  const verticalOffset = useMemo(() => -boardSize * 0.12, [boardSize]);

  // Static camera settings
  const camera = useMemo(() => ({
    perspective: 800,
    rotateX: 55,        // Tilt forward for 3D effect
    scale: 0.62,        // Zoom to show ~6-8 tiles
  }), []);

  const clampedTranslation = useMemo(() => {
    const { width, height } = viewportSize;
    const margin = 36;
    if (!width || !height) {
      return {
        x: playerPosition.offsetX + panOffset.x,
        y: playerPosition.offsetY + panOffset.y + verticalOffset,
      };
    }

    const scaledHalfWidth = width / (2 * camera.scale);
    const scaledHalfHeight = height / (2 * camera.scale);
    const marginScaled = margin / camera.scale;

    const minX = -(scaledHalfWidth - marginScaled) - playerPosition.x;
    const maxX = scaledHalfWidth - marginScaled - playerPosition.x;
    const minY = -(scaledHalfHeight - marginScaled) - playerPosition.y;
    const maxY = scaledHalfHeight - marginScaled - playerPosition.y;

    const desiredX = playerPosition.offsetX + panOffset.x;
    const desiredY = playerPosition.offsetY + panOffset.y + verticalOffset;

    return {
      x: Math.min(Math.max(desiredX, minX), maxX),
      y: Math.min(Math.max(desiredY, minY), maxY),
    };
  }, [camera.scale, panOffset.x, panOffset.y, playerPosition, verticalOffset, viewportSize]);

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
      ref={containerRef}
      {...handlers}
    >
      {/* Board wrapper - applies the 3D transform */}
      <div
        className="mobile-board-3d-transform"
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          position: 'relative',
          // 3D transform - no Z rotation needed for circular board
          transform: `
            rotateX(${camera.rotateX}deg)
            scale(${camera.scale})
            translate3d(${clampedTranslation.x}px, ${clampedTranslation.y}px, 0)
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
