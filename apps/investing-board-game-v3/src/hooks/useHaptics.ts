import { useCallback } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const haptic = useCallback((type: HapticType = 'light') => {
    if (!isSupported) return;
    
    // Check user preference (can be disabled in settings)
    const hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false';
    if (!hapticsEnabled) return;

    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [10, 50, 10],
      warning: [25, 50, 25],
      error: [50, 100, 50, 100, 50],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (e) {
      // Vibration not supported or blocked
    }
  }, [isSupported]);

  return {
    haptic,
    isSupported,
    // Convenience methods
    lightTap: useCallback(() => haptic('light'), [haptic]),
    mediumTap: useCallback(() => haptic('medium'), [haptic]),
    heavyTap: useCallback(() => haptic('heavy'), [haptic]),
    success: useCallback(() => haptic('success'), [haptic]),
    warning: useCallback(() => haptic('warning'), [haptic]),
    error: useCallback(() => haptic('error'), [haptic]),
    // Legacy methods for backward compatibility
    light: useCallback(() => haptic('light'), [haptic]),
    medium: useCallback(() => haptic('medium'), [haptic]),
    heavy: useCallback(() => haptic('heavy'), [haptic]),
    roll: useCallback(() => haptic('heavy'), [haptic]), // Use heavy for roll
    celebration: useCallback(() => haptic('success'), [haptic]), // Use success for celebration
  };
}
