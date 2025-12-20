import { useState, useCallback, useRef } from 'react'

/**
 * Camera Animation Hook
 * 
 * Handles animated camera movements during dice rolls and player movement.
 * Creates smooth camera transitions with zoom effects.
 */
export function useCameraAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  
  /**
   * Animate camera during dice roll
   * 
   * Flow:
   * 1. Slight zoom out at roll start
   * 2. Follow each hop with smooth pan
   * 3. Zoom back and settle on landing tile
   * 4. Optional bounce effect on landing
   */
  const animateRoll = useCallback(async (
    startTile: number,
    endTile: number,
    hops: number[], // intermediate tiles to hop through
    options?: {
      onHop?: (tileId: number) => void
      onComplete?: () => void
      zoomOutScale?: number // scale to zoom out to (default 0.9)
      hopDuration?: number // ms per hop (default 400)
    }
  ) => {
    const {
      onHop,
      onComplete,
      zoomOutScale = 0.9,
      hopDuration = 400,
    } = options || {}
    
    setIsAnimating(true)
    
    try {
      // Phase 1: Slight zoom out at start
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Phase 2: Follow each hop
      for (const tileId of hops) {
        onHop?.(tileId)
        await new Promise(resolve => setTimeout(resolve, hopDuration))
      }
      
      // Phase 3: Zoom back in and settle
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Optional: Bounce effect (handled by camera spring animation)
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } finally {
      setIsAnimating(false)
      onComplete?.()
    }
  }, [])
  
  /**
   * Cancel ongoing animation
   */
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }, [])
  
  return {
    isAnimating,
    animateRoll,
    cancelAnimation,
  }
}
