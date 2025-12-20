import { useContext } from 'react'
import { UIModeContext, UIModeContextValue } from '@/context/UIModeContext'

/**
 * Hook to access UI mode state and actions
 * 
 * @throws Error if used outside UIModeProvider
 */
export function useUIMode(): UIModeContextValue {
  const context = useContext(UIModeContext)
  if (!context) {
    throw new Error('useUIMode must be used within UIModeProvider')
  }
  return context
}

/**
 * Convenience hook to check if in board mode
 */
export function useBoardMode(): boolean {
  const { mode } = useUIMode()
  return mode === 'board'
}

/**
 * Convenience hook for game phase state
 */
export function useGamePhase() {
  const { phase, setPhase } = useUIMode()
  return [phase, setPhase] as const
}
