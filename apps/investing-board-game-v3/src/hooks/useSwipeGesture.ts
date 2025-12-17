import { useEffect, RefObject } from 'react'

export const useSwipeGesture = (
  ref: RefObject<HTMLElement>,
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void,
  threshold: number = 50
) => {
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    let startX = 0
    let startY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      
      // Determine direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          onSwipe(deltaX > 0 ? 'right' : 'left')
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          onSwipe(deltaY > 0 ? 'down' : 'up')
        }
      }
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, onSwipe, threshold])
}
