import { useEffect, useRef, useCallback } from 'react'

/**
 * Gesture types in priority order (highest to lowest):
 * 1. pinch - Two-finger zoom/scale gestures
 * 2. swipe - Fast directional gestures
 * 3. pan - Slow drag/pan gestures
 * 4. tap - Single touch/click
 */
export type GestureType = 'pinch' | 'swipe' | 'pan' | 'tap' | 'none'

interface GestureState {
  type: GestureType
  startTime: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  touchCount: number
  initialDistance?: number
}

interface UseGestureArbitrationOptions {
  onPinch?: (scale: number, centerX: number, centerY: number) => void
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void
  onPan?: (deltaX: number, deltaY: number) => void
  onTap?: (x: number, y: number) => void
  enabled?: boolean
  swipeThreshold?: number // Minimum distance to trigger swipe
  swipeVelocityThreshold?: number // Minimum velocity to be a swipe vs pan
  panThreshold?: number // Minimum movement to start pan
}

/**
 * Hook that implements gesture arbitration for mobile touch interactions
 * Priority: pinch > swipe > pan > tap
 * 
 * This ensures that:
 * - Two-finger gestures (pinch) always take priority
 * - Fast swipes are detected before slow pans
 * - Pans don't accidentally trigger taps
 * - Taps are only fired when no movement occurs
 */
export function useGestureArbitration(
  elementRef: React.RefObject<HTMLElement>,
  options: UseGestureArbitrationOptions = {}
) {
  const {
    onPinch,
    onSwipe,
    onPan,
    onTap,
    enabled = true,
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.5,
    panThreshold = 10,
  } = options

  const gestureState = useRef<GestureState>({
    type: 'none',
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    touchCount: 0,
  })

  const activeGestureType = useRef<GestureType>('none')

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Get center point of pinch gesture
  const getPinchCenter = useCallback((touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }, [])

  // Determine gesture type based on touch data
  const determineGestureType = useCallback(
    (state: GestureState, currentTouchCount: number): GestureType => {
      // Priority 1: Pinch (two or more fingers)
      if (currentTouchCount >= 2 || state.touchCount >= 2) {
        return 'pinch'
      }

      const deltaX = state.currentX - state.startX
      const deltaY = state.currentY - state.startY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const duration = Date.now() - state.startTime
      const velocity = duration > 0 ? distance / duration : 0

      // Priority 2: Swipe (fast movement in a direction)
      if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
        return 'swipe'
      }

      // Priority 3: Pan (slower movement)
      if (distance > panThreshold) {
        return 'pan'
      }

      // Priority 4: Tap (no significant movement)
      return 'tap'
    },
    [swipeThreshold, swipeVelocityThreshold, panThreshold]
  )

  // Determine swipe direction
  const getSwipeDirection = useCallback(
    (state: GestureState): 'up' | 'down' | 'left' | 'right' => {
      const deltaX = state.currentX - state.startX
      const deltaY = state.currentY - state.startY

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left'
      } else {
        return deltaY > 0 ? 'down' : 'up'
      }
    },
    []
  )

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return

      const touches = e.touches
      const state = gestureState.current

      state.touchCount = touches.length
      state.startTime = Date.now()
      state.startX = touches[0].clientX
      state.startY = touches[0].clientY
      state.currentX = touches[0].clientX
      state.currentY = touches[0].clientY

      // Initialize pinch distance for two-finger gestures
      if (touches.length >= 2) {
        state.initialDistance = getTouchDistance(touches)
        state.type = 'pinch'
        activeGestureType.current = 'pinch'
      } else {
        state.type = 'none'
        activeGestureType.current = 'none'
      }
    },
    [enabled, getTouchDistance]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return

      const touches = e.touches
      const state = gestureState.current

      state.currentX = touches[0].clientX
      state.currentY = touches[0].clientY

      // Once a gesture is locked, don't change it
      if (activeGestureType.current !== 'none' && activeGestureType.current !== 'pinch') {
        // Handle the locked gesture
        if (activeGestureType.current === 'pan' && onPan) {
          const deltaX = state.currentX - state.startX
          const deltaY = state.currentY - state.startY
          onPan(deltaX, deltaY)
          e.preventDefault()
        }
        return
      }

      // Handle pinch gesture
      if (touches.length >= 2) {
        if (state.initialDistance && onPinch) {
          const currentDistance = getTouchDistance(touches)
          const scale = currentDistance / state.initialDistance
          const center = getPinchCenter(touches)
          
          activeGestureType.current = 'pinch'
          onPinch(scale, center.x, center.y)
          e.preventDefault()
        }
        return
      }

      // Determine gesture type if not yet locked
      if (activeGestureType.current === 'none') {
        const gestureType = determineGestureType(state, touches.length)

        // Lock the gesture once determined
        if (gestureType === 'swipe' || gestureType === 'pan') {
          activeGestureType.current = gestureType
          state.type = gestureType
        }

        // Handle pan gesture
        if (gestureType === 'pan' && onPan) {
          const deltaX = state.currentX - state.startX
          const deltaY = state.currentY - state.startY
          onPan(deltaX, deltaY)
          e.preventDefault()
        }
      }
    },
    [enabled, onPinch, onPan, getTouchDistance, getPinchCenter, determineGestureType]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return

      const state = gestureState.current
      const lockedGestureType = activeGestureType.current

      // Determine final gesture type if not already determined
      const finalGestureType =
        lockedGestureType !== 'none'
          ? lockedGestureType
          : determineGestureType(state, e.touches.length)

      // Execute appropriate callback
      if (finalGestureType === 'swipe' && onSwipe) {
        const direction = getSwipeDirection(state)
        const duration = Date.now() - state.startTime
        const deltaX = state.currentX - state.startX
        const deltaY = state.currentY - state.startY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const velocity = duration > 0 ? distance / duration : 0
        onSwipe(direction, velocity)
        e.preventDefault()
      } else if (finalGestureType === 'tap' && onTap) {
        onTap(state.startX, state.startY)
      }

      // Reset gesture state
      gestureState.current = {
        type: 'none',
        startTime: 0,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        touchCount: 0,
      }
      activeGestureType.current = 'none'
    },
    [enabled, onSwipe, onTap, determineGestureType, getSwipeDirection]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, elementRef])

  return {
    currentGesture: activeGestureType.current,
  }
}
