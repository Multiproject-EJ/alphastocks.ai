import { ReactNode } from 'react'
import { CameraState } from '@/hooks/useBoardCamera'

interface Board3DViewportProps {
  children: ReactNode
  camera: CameraState
  isMobile: boolean
  boardStyle?: React.CSSProperties
  containerStyle?: React.CSSProperties
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
}: Board3DViewportProps) {
  // Desktop or classic mode: render without 3D transforms
  if (!isMobile || camera.mode === 'classic') {
    return <>{children}</>
  }
  
  // Safety checks for camera values to prevent invalid transforms
  const safeScale = Math.max(0.2, Math.min(3, camera?.scale || 1))
  const safeTransX = Math.max(-2000, Math.min(2000, camera?.translateX || 0))
  const safeTransY = Math.max(-2000, Math.min(2000, camera?.translateY || 0))
  const safeRotateX = camera?.rotateX || 0
  const safePerspective = camera?.perspective || 1000
  
  // Check for invalid values
  const isInvalid = 
    isNaN(safeScale) ||
    isNaN(safeTransX) ||
    isNaN(safeTransY) ||
    isNaN(safeRotateX) ||
    safeScale === 0
  
  // If invalid, fall back to no transforms
  if (isInvalid) {
    console.error('❌ Board3DViewport: Invalid camera values detected', {
      scale: camera?.scale,
      translateX: camera?.translateX,
      translateY: camera?.translateY,
      rotateX: camera?.rotateX,
    })
    return <>{children}</>
  }
  
  // Immersive mode: apply 3D perspective wrapper with transforms
  return (
    <div 
      className="board-viewport-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: `${safePerspective}px`,
        perspectiveOrigin: 'center center',
        ...containerStyle,
      }}
    >
      <div 
        className="board-3d-transform"
        style={{
          transform: `rotateX(${safeRotateX}deg) scale(${safeScale}) translate(${safeTransX}px, ${safeTransY}px)`,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          width: '1200px',
          height: '1200px',
          willChange: 'transform',
          ...boardStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
