import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBoardPan } from '@/hooks/useBoardPan';
import { calculateTilePositions } from '@/lib/tilePositions';

interface MobileBoard3DProps {
  children: React.ReactNode;
  currentPosition: number;
  currentRing?: number; // Current ring player is on (1, 2, or 3)
  totalTiles?: number;
  boardSize?: number;
  leftOffset?: number;   // Width of left UI elements (buttons, panels)
  rightOffset?: number;  // Width of right UI elements (ProTools panel)
}

/**
 * Mobile 3D Board - Circular Layout with Multi-Ring Support
 * 
 * Creates a tilted view of the circular board that:
 * - Tilts the board on X axis for 3D perspective
 * - Shows 6-8 tiles at once for optimal visibility
 * - Centers on the player's current position
 * - Smoothly animates when player moves
 * - Supports touch pan gestures
 * - Handles camera zoom for different rings (Ring 2 is 20% more zoomed in)
 * - Smooth, slow transitions when teleporting between rings
 */
export function MobileBoard3D({
  children,
  currentPosition,
  currentRing = 1,
  totalTiles = 27,
  boardSize = 1200,
  leftOffset = 0,
  rightOffset = 0,
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

  // Determine which ring's tile positions to use based on current position
  const getRingFromPosition = (position: number): number => {
    if (position >= 0 && position < 100) return 1
    if (position >= 200 && position < 300) return 2
    if (position >= 300 && position < 400) return 3
    return 1 // default to ring 1
  }

  const actualRing = currentRing || getRingFromPosition(currentPosition);

  // Get tile count for the current ring (matches RING_CONFIG)
  const getTileCountForRing = (ring: number): number => {
    if (ring === 1) return 35 // Ring 1: Street Level
    if (ring === 2) return 24 // Ring 2: Executive Floor
    if (ring === 3) return 9  // Ring 3: Elite Circle
    return 35
  }

  // Get the normalized position index within the ring (0-based)
  const getNormalizedPosition = (position: number, ring: number): number => {
    if (ring === 1) return position % 35
    if (ring === 2) return (position - 200) % 24
    if (ring === 3) return (position - 300) % 9
    return position % 35
  }

  const ringTileCount = getTileCountForRing(actualRing);
  const normalizedPosition = getNormalizedPosition(currentPosition, actualRing);

  // Constants for ring radius calculations
  const RING_2_RADIUS_FACTOR = 0.5  // Ring 2 uses 50% of outer radius
  const RING_3_INNER_SCALE = 0.6    // Ring 3 is 60% of Ring 2's radius
  const BASE_RADIUS_SCALE = 0.38    // Base board radius scale

  // Calculate where player is on the circular board
  const playerPosition = useMemo(() => {
    // For ring 2 and 3, use inner track positioning
    const isInnerTrack = actualRing === 2
    const isInnermost = actualRing === 3
    
    let tilePositions;
    if (isInnermost) {
      // Ring 3 uses smaller radius (60% of Ring 2's radius)
      const ring2Positions = calculateTilePositions({ width: boardSize, height: boardSize }, 24, undefined, true)
      const ring2Radius = Math.min(boardSize, boardSize) * BASE_RADIUS_SCALE * RING_2_RADIUS_FACTOR
      const ring3Radius = ring2Radius * RING_3_INNER_SCALE
      tilePositions = calculateTilePositions({ width: boardSize, height: boardSize }, ringTileCount, ring3Radius, false)
    } else {
      tilePositions = calculateTilePositions({ width: boardSize, height: boardSize }, ringTileCount, undefined, isInnerTrack)
    }
    
    const currentTile = tilePositions.find(t => t.id === normalizedPosition)
    
    if (!currentTile) {
      return { x: 0, y: 0, offsetX: 0, offsetY: 0 }
    }
    
    // Calculate offset from center
    const centerX = boardSize / 2
    const centerY = boardSize / 2
    const x = currentTile.x - centerX
    const y = currentTile.y - centerY
    
    // Dampen the camera movement to reduce oval effect
    // Instead of following the full circular path, reduce movement to keep camera closer to center
    const CAMERA_DAMPING_FACTOR = 0.6 // 0 = no movement, 1 = full circular path
    
    // Negate to move board opposite direction (centers player)
    return { x, y, offsetX: -x * CAMERA_DAMPING_FACTOR, offsetY: -y * CAMERA_DAMPING_FACTOR }
  }, [currentPosition, boardSize, actualRing, ringTileCount, normalizedPosition]);

  const verticalOffset = useMemo(() => -boardSize * 0.05, [boardSize]);

  // Base camera settings
  const BASE_SCALE = 0.75;
  const RING_2_ZOOM_MULTIPLIER = 1.2; // 20% more zoom for Ring 2
  const RING_3_ZOOM_MULTIPLIER = 1.4; // 40% more zoom for Ring 3 (relative to Ring 1)
  
  // Calculate scale based on current ring
  const targetScale = useMemo(() => {
    if (actualRing === 2) return BASE_SCALE * RING_2_ZOOM_MULTIPLIER;
    if (actualRing === 3) return BASE_SCALE * RING_3_ZOOM_MULTIPLIER;
    return BASE_SCALE;
  }, [actualRing]);

  // Camera configuration constants
  const CAMERA_PERSPECTIVE = 1000;
  const CAMERA_ROTATE_X = 45;

  // Static camera settings - reduced tilt to minimize oval effect
  const camera = useMemo(() => ({
    perspective: CAMERA_PERSPECTIVE,
    rotateX: CAMERA_ROTATE_X,
    scale: targetScale, // Dynamic scale based on ring
  }), [targetScale]);

  const clampedTranslation = useMemo(() => {
    const { width, height } = viewportSize;
    const margin = 36;
    if (!width || !height) {
      return {
        x: playerPosition.offsetX + panOffset.x,
        y: playerPosition.offsetY + panOffset.y + verticalOffset,
      };
    }

    // Calculate the available width between UI elements
    const availableWidth = width - leftOffset - rightOffset;
    
    // Calculate horizontal shift to center board in available space
    // Simplified: (leftOffset - rightOffset) / 2
    const horizontalShift = (leftOffset - rightOffset) / 2;

    const scaledHalfWidth = availableWidth / (2 * camera.scale);
    const scaledHalfHeight = height / (2 * camera.scale);
    const marginScaled = margin / camera.scale;

    const minX = -(scaledHalfWidth - marginScaled) - playerPosition.x;
    const maxX = scaledHalfWidth - marginScaled - playerPosition.x;
    const minY = -(scaledHalfHeight - marginScaled) - playerPosition.y;
    const maxY = scaledHalfHeight - marginScaled - playerPosition.y;

    const desiredX = playerPosition.offsetX + panOffset.x + horizontalShift;
    const desiredY = playerPosition.offsetY + panOffset.y + verticalOffset;

    return {
      x: Math.min(Math.max(desiredX, minX), maxX),
      y: Math.min(Math.max(desiredY, minY), maxY),
    };
  }, [camera.scale, panOffset.x, panOffset.y, playerPosition, verticalOffset, viewportSize, leftOffset, rightOffset]);

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
          // Smooth, SLOW animation when moving or transitioning between rings
          // Use longer duration (1.5s) for ring transitions to be smooth and not snappy
          transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
