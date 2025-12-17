/**
 * useChallenges Hook
 * Manages daily and weekly challenges, progress tracking, and rewards
 */

import { useState, useCallback, useEffect } from 'react'
import { GameState } from '@/lib/types'
import { 
  Challenge, 
  generateDailyChallenges, 
  generateWeeklyChallenges,
  getNextMidnight,
  getNextMonday
} from '@/lib/challenges'
import { toast } from 'sonner'

interface UseChallengesProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  playSound?: (sound: string) => void
  addXP?: (amount: number, source: string) => void
  addSeasonPoints?: (amount: number) => void
}

interface UseChallengesReturn {
  dailyChallenges: Challenge[]
  weeklyChallenges: Challenge[]
  completedToday: number
  completedThisWeek: number
  updateChallengeProgress: (action: string, value?: any) => void
  checkAndResetChallenges: () => void
}

/**
 * Check if it's a new day compared to last reset
 */
function isNewDay(lastReset: string, now: Date): boolean {
  const last = new Date(lastReset)
  return (
    now.getDate() !== last.getDate() ||
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  )
}

/**
 * Check if it's Monday
 */
function isMonday(date: Date): boolean {
  return date.getDay() === 1
}

/**
 * Check if it's a new week (Monday after last reset)
 */
function isNewWeek(lastReset: string, now: Date): boolean {
  const last = new Date(lastReset)
  // Check if we've passed into a new Monday
  if (!isMonday(now)) return false
  
  // If current is Monday and last reset was before this Monday
  const currentMonday = new Date(now)
  currentMonday.setHours(0, 0, 0, 0)
  while (currentMonday.getDay() !== 1) {
    currentMonday.setDate(currentMonday.getDate() - 1)
  }
  
  return last < currentMonday
}

export function useChallenges({
  gameState,
  setGameState,
  playSound,
  addXP,
  addSeasonPoints,
}: UseChallengesProps): UseChallengesReturn {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([])
  const [completedToday, setCompletedToday] = useState(0)
  const [completedThisWeek, setCompletedThisWeek] = useState(0)

  // Initialize challenges from game state or generate new ones
  useEffect(() => {
    if (gameState.challenges) {
      setDailyChallenges(gameState.challenges.daily || [])
      setWeeklyChallenges(gameState.challenges.weekly || [])
      setCompletedToday(gameState.challenges.completedToday || 0)
      setCompletedThisWeek(gameState.challenges.completedThisWeek || 0)
    } else {
      // First time - generate initial challenges
      const newDaily = generateDailyChallenges([])
      const newWeekly = generateWeeklyChallenges()
      setDailyChallenges(newDaily)
      setWeeklyChallenges(newWeekly)
      setCompletedToday(0)
      setCompletedThisWeek(0)
    }
  }, [gameState.challenges])

  // Check for challenge resets (daily at midnight, weekly on Monday)
  const checkAndResetChallenges = useCallback(() => {
    const now = new Date()
    const lastDailyReset = gameState.challenges?.lastDailyReset
    const lastWeeklyReset = gameState.challenges?.lastWeeklyReset

    let needsUpdate = false
    let newDailyChallenges = dailyChallenges
    let newWeeklyChallenges = weeklyChallenges
    let newCompletedToday = completedToday
    let newCompletedThisWeek = completedThisWeek

    // Check for daily reset
    if (!lastDailyReset || isNewDay(lastDailyReset, now)) {
      const previousIds = dailyChallenges.map(c => c.id)
      newDailyChallenges = generateDailyChallenges(previousIds)
      newCompletedToday = 0
      needsUpdate = true
      
      toast.info('New daily challenges available! 🎯', {
        description: 'Complete them to earn rewards'
      })
    }

    // Check for weekly reset
    if (!lastWeeklyReset || isNewWeek(lastWeeklyReset, now)) {
      newWeeklyChallenges = generateWeeklyChallenges()
      newCompletedThisWeek = 0
      needsUpdate = true
      
      toast.info('New weekly challenges available! 📅', {
        description: 'Complete them for bonus rewards'
      })
    }

    if (needsUpdate) {
      setDailyChallenges(newDailyChallenges)
      setWeeklyChallenges(newWeeklyChallenges)
      setCompletedToday(newCompletedToday)
      setCompletedThisWeek(newCompletedThisWeek)

      // Update game state
      setGameState(prev => ({
        ...prev,
        challenges: {
          daily: newDailyChallenges,
          weekly: newWeeklyChallenges,
          completedToday: newCompletedToday,
          completedThisWeek: newCompletedThisWeek,
          lastDailyReset: now.toISOString(),
          lastWeeklyReset: lastWeeklyReset || now.toISOString(),
        }
      }))
    }
  }, [dailyChallenges, weeklyChallenges, completedToday, completedThisWeek, gameState.challenges, setGameState])

  // Update challenge progress based on player actions
  const updateChallengeProgress = useCallback(
    (action: string, value?: any) => {
      const allChallenges = [...dailyChallenges, ...weeklyChallenges]
      let challengesUpdated = false
      let newDailyChallenges = [...dailyChallenges]
      let newWeeklyChallenges = [...weeklyChallenges]
      let totalStarsAwarded = 0
      let totalXPAwarded = 0
      let totalSPAwarded = 0
      let newCompletedToday = completedToday
      let newCompletedThisWeek = completedThisWeek

      // Process each challenge
      allChallenges.forEach((challenge, index) => {
        if (challenge.completed || challenge.requirement.action !== action) return

        let shouldIncrement = false
        let incrementAmount = 1

        // Check if action matches and conditions are met
        switch (action) {
          case 'roll':
            if (challenge.requirement.condition?.value) {
              // Specific dice value required
              shouldIncrement = value === challenge.requirement.condition.value
            } else {
              shouldIncrement = true
            }
            break

          case 'buy_stock':
            if (challenge.requirement.condition?.allCategories) {
              // Check if player owns stocks from all 5 categories
              const categories = new Set(gameState.holdings.map(h => h.stock.category))
              shouldIncrement = categories.size >= 5
            } else {
              shouldIncrement = true
            }
            break

          case 'land_on_tile':
            if (challenge.requirement.condition?.positions) {
              // Specific positions required
              shouldIncrement = challenge.requirement.condition.positions.includes(value?.position)
            } else if (challenge.requirement.condition?.uniqueCategories) {
              // Track unique categories landed on (needs state tracking)
              shouldIncrement = true // Simplified for now
            } else {
              shouldIncrement = true
            }
            break

          case 'land_on_corner':
            // Corner tiles are positions 0, 6, 13, 19
            const corners = [0, 6, 13, 19]
            shouldIncrement = corners.includes(value?.position)
            break

          case 'earn_stars':
            // Cumulative progress
            shouldIncrement = true
            incrementAmount = value || 0
            break

          case 'complete_quiz':
            if (challenge.requirement.condition?.perfectScore) {
              shouldIncrement = value?.isPerfect === true
            } else {
              shouldIncrement = true
            }
            break

          case 'win_scratchcard':
            shouldIncrement = true
            break

          case 'reach_net_worth':
            // Check current net worth
            shouldIncrement = gameState.netWorth >= challenge.requirement.target
            if (shouldIncrement) {
              incrementAmount = challenge.requirement.target // Complete immediately
            }
            break

          case 'buy_from_shop':
            shouldIncrement = true
            break

          case 'complete_thrifty':
            shouldIncrement = true
            break

          case 'complete_daily_challenge':
            shouldIncrement = true
            break

          default:
            break
        }

        if (shouldIncrement) {
          const newProgress = Math.min(
            challenge.progress + incrementAmount,
            challenge.requirement.target
          )

          // Check if challenge is now completed
          if (newProgress >= challenge.requirement.target && !challenge.completed) {
            // Mark as completed and auto-claim reward
            const updatedChallenge: Challenge = {
              ...challenge,
              progress: newProgress,
              completed: true,
              claimedReward: true,
            }

            // Update the appropriate array
            if (challenge.type === 'daily') {
              const dailyIndex = dailyChallenges.findIndex(c => c.id === challenge.id)
              if (dailyIndex !== -1) {
                newDailyChallenges[dailyIndex] = updatedChallenge
                newCompletedToday++
              }
            } else {
              const weeklyIndex = weeklyChallenges.findIndex(c => c.id === challenge.id)
              if (weeklyIndex !== -1) {
                newWeeklyChallenges[weeklyIndex] = updatedChallenge
                newCompletedThisWeek++
              }
            }

            // Accumulate rewards
            totalStarsAwarded += challenge.reward.stars
            totalXPAwarded += challenge.reward.xp
            totalSPAwarded += challenge.reward.seasonPoints

            challengesUpdated = true

            // Show notification
            toast.success(`Challenge Complete! 🎯`, {
              description: `${challenge.title} - Earned ${challenge.reward.stars} stars!`
            })

            // Play sound
            if (playSound) {
              playSound('celebration')
            }
          } else if (newProgress !== challenge.progress) {
            // Just update progress
            const updatedChallenge: Challenge = {
              ...challenge,
              progress: newProgress,
            }

            if (challenge.type === 'daily') {
              const dailyIndex = dailyChallenges.findIndex(c => c.id === challenge.id)
              if (dailyIndex !== -1) {
                newDailyChallenges[dailyIndex] = updatedChallenge
              }
            } else {
              const weeklyIndex = weeklyChallenges.findIndex(c => c.id === challenge.id)
              if (weeklyIndex !== -1) {
                newWeeklyChallenges[weeklyIndex] = updatedChallenge
              }
            }

            challengesUpdated = true
          }
        }
      })

      // Apply updates if any challenges changed
      if (challengesUpdated) {
        setDailyChallenges(newDailyChallenges)
        setWeeklyChallenges(newWeeklyChallenges)
        setCompletedToday(newCompletedToday)
        setCompletedThisWeek(newCompletedThisWeek)

        // Update game state with rewards and new challenge state
        setGameState(prev => ({
          ...prev,
          stars: prev.stars + totalStarsAwarded,
          challenges: {
            daily: newDailyChallenges,
            weekly: newWeeklyChallenges,
            completedToday: newCompletedToday,
            completedThisWeek: newCompletedThisWeek,
            lastDailyReset: prev.challenges?.lastDailyReset || new Date().toISOString(),
            lastWeeklyReset: prev.challenges?.lastWeeklyReset || new Date().toISOString(),
          },
          stats: {
            ...prev.stats,
            totalStarsEarned: (prev.stats?.totalStarsEarned || 0) + totalStarsAwarded,
          } as any
        }))

        // Grant XP and Season Points
        if (addXP && totalXPAwarded > 0) {
          addXP(totalXPAwarded, 'challenge')
        }
        if (addSeasonPoints && totalSPAwarded > 0) {
          addSeasonPoints(totalSPAwarded)
        }

        // Check if all daily challenges completed
        if (newCompletedToday === 3 && completedToday !== 3) {
          toast.success('All Daily Challenges Complete! 🌟', {
            description: 'Come back tomorrow for new challenges!'
          })
          if (playSound) {
            playSound('level-up')
          }
        }
      }
    },
    [dailyChallenges, weeklyChallenges, completedToday, completedThisWeek, gameState, setGameState, playSound, addXP, addSeasonPoints]
  )

  return {
    dailyChallenges,
    weeklyChallenges,
    completedToday,
    completedThisWeek,
    updateChallengeProgress,
    checkAndResetChallenges,
  }
}
