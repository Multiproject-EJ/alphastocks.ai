/**
 * useXP Hook
 * Manages XP tracking, leveling, and level rewards
 */

import { useState, useCallback, useEffect } from 'react'
import { GameState, LevelReward } from '@/lib/types'
import {
  calculateXPForLevel,
  getLevelFromXP,
  getXPForNextLevel,
  getXPProgress,
  getLevelReward,
  hasLevelReward,
} from '@/lib/progression'

interface UseXPProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  playSound?: (sound: string) => void
}

interface UseXPReturn {
  xp: number
  level: number
  showLevelUp: boolean
  levelUpData: { newLevel: number; reward: LevelReward | null } | null
  addXP: (amount: number, source: string) => void
  getLevelProgress: () => { current: number; needed: number; percentage: number }
  setShowLevelUp: (show: boolean) => void
}

export function useXP({ gameState, setGameState, playSound }: UseXPProps): UseXPReturn {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; reward: LevelReward | null } | null>(null)

  const xp = gameState.xp || 0
  const level = gameState.level || 1

  // Add XP and check for level ups
  const addXP = useCallback(
    (amount: number, source: string) => {
      setGameState(prev => {
        const newXP = (prev.xp || 0) + amount
        const newLevel = getLevelFromXP(newXP)
        const oldLevel = prev.level || 1

        // Check if we leveled up
        if (newLevel > oldLevel) {
          // Play sound
          if (playSound) {
            playSound('level-up')
          }

          // Get reward for the new level (if any)
          const reward = getLevelReward(newLevel)

          // Show level up modal
          setLevelUpData({ newLevel, reward })
          setShowLevelUp(true)

          // Apply level rewards
          let updatedState = {
            ...prev,
            xp: newXP,
            level: newLevel,
          }

          // Apply rewards based on type
          if (reward) {
            switch (reward.type) {
              case 'cash':
                updatedState.cash = prev.cash + Number(reward.value)
                break
              case 'stars':
                updatedState.stars = prev.stars + Number(reward.value)
                break
              case 'daily_rolls':
                // This will be handled by App.tsx
                break
              case 'theme':
                // Unlock theme (handled by shop system)
                break
              case 'dice_skin':
                // Unlock dice skin (handled by shop system)
                break
              case 'badge':
                // Grant badge and stars
                if (reward.value === 'legend') {
                  updatedState.stars = prev.stars + 10000
                }
                break
              default:
                break
            }
          }

          return updatedState
        }

        return {
          ...prev,
          xp: newXP,
        }
      })
    },
    [setGameState, playSound]
  )

  // Get level progress percentage
  const getLevelProgress = useCallback((): { current: number; needed: number; percentage: number } => {
    const currentLevelXP = calculateXPForLevel(level)
    const nextLevelXP = getXPForNextLevel(level)
    const xpInLevel = xp - currentLevelXP
    const xpNeeded = nextLevelXP - currentLevelXP
    const percentage = getXPProgress(xp, level)

    return {
      current: xpInLevel,
      needed: xpNeeded,
      percentage,
    }
  }, [xp, level])

  return {
    xp,
    level,
    showLevelUp,
    levelUpData,
    addXP,
    getLevelProgress,
    setShowLevelUp,
  }
}
