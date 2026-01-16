import { useState, useEffect, useCallback } from 'react'
import { 
  getActiveMiniGames, 
  getUpcomingMiniGames, 
  getTimeRemaining,
  MiniGameSchedule 
} from '../lib/miniGameSchedule'

interface MiniGameUsage {
  [gameId: string]: {
    playsToday: number
    lastPlayedAt: Date | null
  }
}

export function useMiniGames() {
  const [activeMiniGames, setActiveMiniGames] = useState<MiniGameSchedule[]>([])
  const [upcomingMiniGames, setUpcomingMiniGames] = useState<Array<MiniGameSchedule & { startsAt: Date }>>([])
  const [usage, setUsage] = useState<MiniGameUsage>({})
  
  // Refresh active games every minute
  useEffect(() => {
    const updateGames = () => {
      setActiveMiniGames(getActiveMiniGames())
      setUpcomingMiniGames(getUpcomingMiniGames(24))
    }
    
    updateGames()
    const interval = setInterval(updateGames, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [])
  
  // Check if player can play a game
  const canPlay = useCallback((gameId: string): { allowed: boolean; reason?: string } => {
    const game = activeMiniGames.find(g => g.id === gameId)
    if (!game) {
      return { allowed: false, reason: 'Game not currently available' }
    }
    
    const gameUsage = usage[gameId]
    
    // Check daily limit
    if (game.dailyLimit && gameUsage && gameUsage.playsToday >= game.dailyLimit) {
      return { allowed: false, reason: `Daily limit reached (${game.dailyLimit}/${game.dailyLimit})` }
    }
    
    // Check cooldown
    if (game.cooldownMinutes && gameUsage?.lastPlayedAt) {
      const cooldownEnd = new Date(gameUsage.lastPlayedAt.getTime() + game.cooldownMinutes * 60000)
      if (new Date() < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000)
        return { allowed: false, reason: `Cooldown: ${remaining}m remaining` }
      }
    }
    
    return { allowed: true }
  }, [activeMiniGames, usage])
  
  // Record a game play
  const recordPlay = useCallback((gameId: string) => {
    setUsage(prev => ({
      ...prev,
      [gameId]: {
        playsToday: (prev[gameId]?.playsToday || 0) + 1,
        lastPlayedAt: new Date(),
      },
    }))
  }, [])
  
  // Get remaining plays for a game
  const getRemainingPlays = useCallback((gameId: string): number | null => {
    const game = activeMiniGames.find(g => g.id === gameId)
    if (!game?.dailyLimit) return null
    
    const gameUsage = usage[gameId]
    return game.dailyLimit - (gameUsage?.playsToday || 0)
  }, [activeMiniGames, usage])
  
  return {
    activeMiniGames,
    upcomingMiniGames,
    canPlay,
    recordPlay,
    getRemainingPlays,
    getTimeRemaining,
  }
}
