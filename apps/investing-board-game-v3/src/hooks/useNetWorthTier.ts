import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  NetWorthTier,
  getCurrentTier,
  getNextTier,
  getTierProgress,
  getActiveBenefits
} from '@/lib/netWorthTiers'

export const useNetWorthTier = (netWorth: number) => {
  const [currentTier, setCurrentTier] = useState<NetWorthTier>(getCurrentTier(0))
  const [showTierUpModal, setShowTierUpModal] = useState(false)
  const [newTier, setNewTier] = useState<NetWorthTier | null>(null)
  
  const previousNetWorthRef = useRef(netWorth) // Initialize with current net worth to prevent false tier-up on first render
  const isInitialMount = useRef(true)
  
  useEffect(() => {
    const newCurrentTier = getCurrentTier(netWorth)
    const previousTier = getCurrentTier(previousNetWorthRef.current)
    
    // Check for tier up (skip on initial mount to prevent false notifications)
    if (!isInitialMount.current && newCurrentTier.tier > previousTier.tier) {
      setNewTier(newCurrentTier)
      setShowTierUpModal(true)
      
      // Play celebration sound
      // Show particles
      // Grant unlocks
      
      toast.success(`🎉 Tier Up! You are now a ${newCurrentTier.name}!`, {
        description: `You've unlocked new benefits and features!`,
        duration: 5000
      })
    }
    
    setCurrentTier(newCurrentTier)
    previousNetWorthRef.current = netWorth
    isInitialMount.current = false
  }, [netWorth])
  
  const nextTier = getNextTier(netWorth)
  const progress = getTierProgress(netWorth)
  const activeBenefits = getActiveBenefits(netWorth)
  
  return {
    currentTier,
    nextTier,
    progress,
    activeBenefits,
    showTierUpModal,
    setShowTierUpModal,
    newTier
  }
}
