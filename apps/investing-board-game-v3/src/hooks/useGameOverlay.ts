/**
 * Game Overlay State Management Hook
 * Manages the state for opening/closing game overlays with loading states
 */

import { useState, useCallback } from 'react'

export function useGameOverlay() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const openGame = useCallback((gameId: string) => {
    setIsLoading(true)
    setActiveGame(gameId)
    
    // Simulate loading time (500ms-1s as per requirements)
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }, [])

  const closeGame = useCallback(() => {
    setActiveGame(null)
    setIsLoading(false)
  }, [])

  return {
    activeGame,
    isLoading,
    openGame,
    closeGame,
  }
}
