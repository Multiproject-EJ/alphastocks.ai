/**
 * useAchievements Hook
 * Manages achievement tracking, progress, and unlocking
 */

import { useState, useCallback } from 'react'
import { GameState, Achievement } from '@/lib/types'
import { ACHIEVEMENTS, getAchievementById } from '@/lib/achievements'

interface UseAchievementsProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  playSound?: (sound: string) => void
}

interface UseAchievementsReturn {
  achievements: Achievement[]
  unlockedAchievements: string[]
  checkAchievements: (metric: string, value?: any) => void
  trackProgress: (metric: string, value: number) => void
  showAchievementNotification: boolean
  currentAchievementUnlock: Achievement | null
  setShowAchievementNotification: (show: boolean) => void
  getAchievementProgress: (achievement: Achievement) => number
}

export function useAchievements({
  gameState,
  setGameState,
  playSound,
}: UseAchievementsProps): UseAchievementsReturn {
  const [showAchievementNotification, setShowAchievementNotification] = useState(false)
  const [currentAchievementUnlock, setCurrentAchievementUnlock] = useState<Achievement | null>(null)

  const achievements = ACHIEVEMENTS
  const unlockedAchievements = gameState.achievements?.unlocked || []

  // Get progress for a specific achievement
  const getAchievementProgress = useCallback(
    (achievement: Achievement): number => {
      const progress = gameState.achievements?.progress || {}
      const stats = gameState.stats || {}

      switch (achievement.requirement.type) {
        case 'count':
        case 'threshold':
          const value = (stats as any)[achievement.requirement.metric] || progress[achievement.requirement.metric] || 0
          return Math.min(100, (value / achievement.requirement.target) * 100)

        case 'streak':
          const streakValue = (stats as any)[achievement.requirement.metric] || progress[achievement.requirement.metric] || 0
          return Math.min(100, (streakValue / achievement.requirement.target) * 100)

        case 'collection':
        case 'custom':
          // Custom progress tracking
          return progress[achievement.id] || 0

        default:
          return 0
      }
    },
    [gameState.achievements, gameState.stats]
  )

  // Track progress for a metric
  const trackProgress = useCallback(
    (metric: string, value: number) => {
      setGameState(prev => ({
        ...prev,
        achievements: {
          ...prev.achievements,
          progress: {
            ...(prev.achievements?.progress || {}),
            [metric]: value,
          },
        },
      }))
    },
    [setGameState]
  )

  // Check if achievements should be unlocked
  const checkAchievements = useCallback(
    (metric: string, value?: any) => {
      const unlockedIds = gameState.achievements?.unlocked || []
      const stats = gameState.stats || {}
      const progress = gameState.achievements?.progress || {}

      // Find achievements that match this metric
      const relevantAchievements = ACHIEVEMENTS.filter(
        a => !unlockedIds.includes(a.id) && a.requirement.metric === metric
      )

      for (const achievement of relevantAchievements) {
        let shouldUnlock = false

        switch (achievement.requirement.type) {
          case 'count':
          case 'threshold': {
            const currentValue = (stats as any)[metric] || progress[metric] || 0
            shouldUnlock = currentValue >= achievement.requirement.target
            break
          }

          case 'streak': {
            const currentStreak = (stats as any)[metric] || progress[metric] || 0
            shouldUnlock = currentStreak >= achievement.requirement.target
            break
          }

          case 'collection': {
            // Custom collection logic
            if (metric === 'all_categories') {
              const categories = new Set(gameState.holdings.map(h => h.stock.category))
              shouldUnlock = categories.size >= achievement.requirement.target
            } else if (metric === 'all_corners') {
              const tilesVisited = stats.tilesVisited || []
              const corners = [0, 6, 13, 19] // corner tile IDs
              shouldUnlock = corners.every(c => tilesVisited.includes(c))
            } else if (metric === 'unique_tiles') {
              const tilesVisited = stats.tilesVisited || []
              const uniqueTiles = new Set(tilesVisited).size
              shouldUnlock = uniqueTiles >= achievement.requirement.target
            }
            break
          }

          case 'custom': {
            // Custom achievement logic handled by specific game events
            if (value !== undefined) {
              shouldUnlock = value === true || value >= achievement.requirement.target
            }
            break
          }
        }

        if (shouldUnlock) {
          // Unlock the achievement
          setGameState(prev => {
            const newUnlocked = [...(prev.achievements?.unlocked || []), achievement.id]
            
            // Grant star reward
            const newStars = prev.stars + achievement.reward
            const newTotalStarsEarned = (prev.stats?.totalStarsEarned || 0) + achievement.reward

            return {
              ...prev,
              stars: newStars,
              achievements: {
                ...prev.achievements,
                unlocked: newUnlocked,
              },
              stats: {
                ...prev.stats,
                totalStarsEarned: newTotalStarsEarned,
              } as any,
            }
          })

          // Play sound and show notification
          if (playSound) {
            playSound('celebration')
          }

          setCurrentAchievementUnlock(achievement)
          setShowAchievementNotification(true)

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setShowAchievementNotification(false)
          }, 5000)
        }
      }
    },
    [gameState.achievements, gameState.stats, gameState.holdings, setGameState, playSound]
  )

  return {
    achievements,
    unlockedAchievements,
    checkAchievements,
    trackProgress,
    showAchievementNotification,
    currentAchievementUnlock,
    setShowAchievementNotification,
    getAchievementProgress,
  }
}
