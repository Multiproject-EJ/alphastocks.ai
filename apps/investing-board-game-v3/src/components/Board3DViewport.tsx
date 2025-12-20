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
  
  // Immersive mode: apply 3D perspective wrapper
  return (
    <div 
      className="board-viewport-3d"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...containerStyle,
      }}
    >
      <div 
        className="board-3d-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          ...boardStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
