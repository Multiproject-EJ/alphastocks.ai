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
      const parsePx = (value: string): number => {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0 : parsed
      }
      
      setSafeAreas({
        top: parsePx(style.getPropertyValue('--safe-area-top')),
        right: parsePx(style.getPropertyValue('--safe-area-right')),
        bottom: parsePx(style.getPropertyValue('--safe-area-bottom')),
        left: parsePx(style.getPropertyValue('--safe-area-left')),
      })
    }
    
    updateSafeAreas()
    window.addEventListener('resize', updateSafeAreas)
    return () => window.removeEventListener('resize', updateSafeAreas)
  }, [])

  return safeAreas
}
