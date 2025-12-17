import { useCallback } from 'react'

export const useHaptics = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator
  
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!isSupported) return
    
    // Check user preference (can be disabled in settings)
    const hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false'
    if (!hapticsEnabled) return
    
    try {
      navigator.vibrate(pattern)
    } catch (e) {
      console.error('Haptic feedback failed:', e)
    }
  }, [isSupported])
  
  // Predefined patterns
  const light = useCallback(() => vibrate(10), [vibrate])
  const medium = useCallback(() => vibrate(20), [vibrate])
  const heavy = useCallback(() => vibrate(30), [vibrate])
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate])
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate])
  const roll = useCallback(() => vibrate([5, 10, 15, 20]), [vibrate])
  const celebration = useCallback(() => vibrate([10, 50, 10, 50, 10]), [vibrate])
  const doubleClick = useCallback(() => vibrate([5, 30, 5]), [vibrate])
  
  return {
    isSupported,
    vibrate,
    light,
    medium,
    heavy,
    success,
    error,
    roll,
    celebration,
    doubleClick,
  }
}
