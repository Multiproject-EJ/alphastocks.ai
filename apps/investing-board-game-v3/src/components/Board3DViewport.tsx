import { ReactNode, useMemo } from 'react'
import { CameraState, isCameraStateValid } from '@/hooks/useBoardCamera'
import { calculateTilePositions } from '@/lib/tilePositions'

// Board dimensions (must match the board size used in App.tsx)
const BOARD_WIDTH = 1200
const BOARD_HEIGHT = 1200
const Y_OFFSET_FOR_TILT = 60 // Y-offset to improve view in tilted mode

interface Board3DViewportProps {
  children: ReactNode
  camera: CameraState
  isMobile: boolean
  boardStyle?: React.CSSProperties
  containerStyle?: React.CSSProperties
  playerPosition?: number
  boardSize?: number
}

/**
 * Board3DViewport - Wrapper component that applies 3D transforms
 * 
 * This component creates a 3D perspective container that:
 * - Tilts the board in perspective view (immersive mode)
 * - Zooms in to show only nearby tiles
 * - Follows the player's position
 * - Handles smooth camera animations
 * 
 * For classic mode or desktop, it renders children without transformation.
 */
export function Board3DViewport({ 
  children, 
  camera, 
  isMobile,
  boardStyle = {},
  containerStyle = {},
  playerPosition = 0,
  boardSize = BOARD_WIDTH,
}: Board3DViewportProps) {
  // Calculate tile positions for camera centering using circular layout
  const playerTilePos = useMemo(() => {
    const positions = calculateTilePositions({ width: boardSize, height: boardSize })
    const currentTile = positions.find(p => p.id === playerPosition)
    
    if (!currentTile) {
      return { x: 0, y: 0 }
    }
    
    // Calculate offset from center
    const centerX = boardSize / 2
    const centerY = boardSize / 2
    
    return {
      x: currentTile.x - centerX,
      y: currentTile.y - centerY
    }
  }, [playerPosition, boardSize]);
  
  // Desktop or classic mode: render without 3D transforms
  if (!isMobile || camera.mode === 'classic') {
    return <>{children}</>
  }
  
  // Camera settings for mobile immersive mode
  const mobileCamera = {
    perspective: camera.perspective || 800,        // Closer perspective for more 3D effect
    rotateX: camera.rotateX || 28,                 // Tilt angle (25-35 degrees works well)
    scale: camera.scale || 2.5,                    // Zoom in significantly (show ~6-8 tiles)
    translateX: camera.translateX ?? -playerTilePos.x,  // Center on player X
    translateY: camera.translateY ?? (-playerTilePos.y + Y_OFFSET_FOR_TILT),  // Center on player Y (offset for tilt)
  };
  
  // Safety checks for camera values to prevent invalid transforms
  const safeScale = Math.max(0.2, Math.min(3, mobileCamera.scale))
  const safeTransX = Math.max(-2000, Math.min(2000, mobileCamera.translateX))
  const safeTransY = Math.max(-2000, Math.min(2000, mobileCamera.translateY))
  const safeRotateX = Math.max(0, Math.min(45, mobileCamera.rotateX))
  const safePerspective = Math.max(500, Math.min(2000, mobileCamera.perspective))
  
  // Use shared validation function
  if (!isCameraStateValid({ scale: safeScale, translateX: safeTransX, translateY: safeTransY })) {
    console.error('❌ Board3DViewport: Invalid camera values detected', {
      scale: mobileCamera.scale,
      translateX: mobileCamera.translateX,
      translateY: mobileCamera.translateY,
      rotateX: mobileCamera.rotateX,
    })
    return <>{children}</>
  }
  
  // Immersive mode: apply 3D perspective wrapper with transforms
  return (
    <div 
      className="board-3d-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'visible',  // Changed from 'hidden' to 'visible' to prevent clipping
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: `${safePerspective}px`,
        perspectiveOrigin: '50% 60%',  // Look slightly down at board
        zIndex: 10,  // Ensure above background
        opacity: 1,
        visibility: 'visible',
        ...containerStyle,
      }}
    >
      <div 
        className="board-3d-transform"
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          transformStyle: 'preserve-3d',
          transform: `
            rotateX(${safeRotateX}deg)
            scale(${safeScale})
            translate(${safeTransX}px, ${safeTransY}px)
          `.replace(/\s+/g, ' ').trim(),
          transformOrigin: 'center center',
          transition: 'transform 0.5s ease-out',  // Smooth camera movement
          willChange: camera.isAnimating ? 'transform' : 'auto',
          backfaceVisibility: 'visible',  // Ensure board face is visible
          opacity: 1,
          visibility: 'visible',
          ...boardStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
