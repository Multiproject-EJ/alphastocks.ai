import { useState, useEffect } from 'react'

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Hook to programmatically access safe-area values from CSS custom properties
 * These values are set by either the device's env() values or by the DevicePreview devtools
 */
export function useSafeArea(): SafeAreaInsets {
  const [safeAreas, setSafeAreas] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeAreas = () => {
      const style = getComputedStyle(document.documentElement)
      setSafeAreas({
        top: parseInt(style.getPropertyValue('--safe-area-top')) || 0,
        right: parseInt(style.getPropertyValue('--safe-area-right')) || 0,
        bottom: parseInt(style.getPropertyValue('--safe-area-bottom')) || 0,
        left: parseInt(style.getPropertyValue('--safe-area-left')) || 0,
      })
    }
    
    updateSafeAreas()
    window.addEventListener('resize', updateSafeAreas)
    return () => window.removeEventListener('resize', updateSafeAreas)
  }, [])

  return safeAreas
}
