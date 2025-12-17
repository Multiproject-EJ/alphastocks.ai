/**
 * useSeasonPass Hook
 * Manages season pass progression, tier unlocks, and rewards
 */

import { useState, useCallback, useMemo } from 'react'
import { GameState, Season, Reward } from '@/lib/types'
import { getActiveSeason, getCurrentTier, canClaimTier } from '@/lib/seasons'
import { toast } from 'sonner'

interface UseSeasonPassProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  playSound?: (sound: string) => void
}

interface UseSeasonPassReturn {
  seasonPoints: number
  currentTier: number
  hasPremiumPass: boolean
  claimedTiers: number[]
  activeSeason: Season | null
  addSeasonPoints: (amount: number) => void
  claimReward: (tier: number, isPremium: boolean) => void
  upgradeToPremium: () => void
  canClaimTierReward: (tier: number, isPremium: boolean) => boolean
}

export function useSeasonPass({
  gameState,
  setGameState,
  playSound,
}: UseSeasonPassProps): UseSeasonPassReturn {
  const seasonPoints = gameState.seasonPoints || 0
  const hasPremiumPass = gameState.hasPremiumPass || false
  const claimedTiers = gameState.claimedSeasonTiers || []

  const activeSeason = useMemo(() => getActiveSeason(), [])
  
  const currentTier = useMemo(() => {
    if (!activeSeason) return 0
    return getCurrentTier(seasonPoints, activeSeason)
  }, [seasonPoints, activeSeason])

  // Add season points
  const addSeasonPoints = useCallback(
    (amount: number) => {
      setGameState(prev => {
        const newPoints = (prev.seasonPoints || 0) + amount
        const newTier = activeSeason ? getCurrentTier(newPoints, activeSeason) : 0
        const oldTier = prev.currentSeasonTier || 0

        // Check if we unlocked a new tier
        if (newTier > oldTier) {
          toast.success(`Season Tier ${newTier} Unlocked!`, {
            description: 'Check the Season Pass to claim your rewards',
          })
          
          if (playSound) {
            playSound('star-collect')
          }
        }

        return {
          ...prev,
          seasonPoints: newPoints,
          currentSeasonTier: newTier,
        }
      })
    },
    [setGameState, activeSeason, playSound]
  )

  // Check if a tier reward can be claimed
  const canClaimTierReward = useCallback(
    (tier: number, isPremium: boolean): boolean => {
      if (!activeSeason) return false
      
      // Can't claim premium rewards without premium pass
      if (isPremium && !hasPremiumPass) return false
      
      return canClaimTier(tier, currentTier, claimedTiers, isPremium)
    },
    [activeSeason, currentTier, claimedTiers, hasPremiumPass]
  )

  // Claim a reward
  const claimReward = useCallback(
    (tier: number, isPremium: boolean) => {
      if (!activeSeason) {
        toast.error('No active season')
        return
      }

      if (!canClaimTierReward(tier, isPremium)) {
        toast.error('Cannot claim this reward')
        return
      }

      const tierData = activeSeason.tiers.find(t => t.tier === tier)
      if (!tierData) return

      const reward = isPremium ? tierData.premiumReward : tierData.freeReward

      setGameState(prev => {
        let updatedState = { ...prev }
        
        // Apply reward
        switch (reward.type) {
          case 'stars':
            updatedState.stars = prev.stars + Number(reward.value)
            updatedState.stats = {
              ...prev.stats,
              totalStarsEarned: (prev.stats?.totalStarsEarned || 0) + Number(reward.value),
            } as any
            break
          case 'cash':
            updatedState.cash = prev.cash + Number(reward.value)
            break
          case 'theme':
            // Theme unlocked (handled by shop system)
            toast.success(`Theme unlocked: ${reward.value}`)
            break
          case 'dice_skin':
            // Dice skin unlocked (handled by shop system)
            toast.success(`Dice skin unlocked: ${reward.value}`)
            break
          case 'badge':
            // Badge granted
            toast.success(`Badge earned: ${reward.value}!`)
            break
        }

        // Mark tier as claimed (negative for free, positive for premium)
        const claimKey = isPremium ? tier : -tier
        updatedState.claimedSeasonTiers = [...(prev.claimedSeasonTiers || []), claimKey]

        return updatedState
      })

      // Play sound
      if (playSound) {
        playSound('celebration')
      }

      toast.success('Reward claimed!', {
        description: `You received ${reward.type}: ${reward.value}`,
      })
    },
    [activeSeason, canClaimTierReward, setGameState, playSound]
  )

  // Upgrade to premium pass (costs stars)
  const upgradeToPremium = useCallback(() => {
    const PREMIUM_PASS_COST = 5000 // stars

    if (hasPremiumPass) {
      toast.info('You already have the Premium Pass!')
      return
    }

    if (gameState.stars < PREMIUM_PASS_COST) {
      toast.error('Not enough stars', {
        description: `Premium Pass costs ${PREMIUM_PASS_COST} stars`,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      stars: prev.stars - PREMIUM_PASS_COST,
      hasPremiumPass: true,
    }))

    if (playSound) {
      playSound('celebration')
    }

    toast.success('Premium Pass Unlocked!', {
      description: 'You can now claim premium rewards',
    })
  }, [hasPremiumPass, gameState.stars, setGameState, playSound])

  return {
    seasonPoints,
    currentTier,
    hasPremiumPass,
    claimedTiers,
    activeSeason,
    addSeasonPoints,
    claimReward,
    upgradeToPremium,
    canClaimTierReward,
  }
}
