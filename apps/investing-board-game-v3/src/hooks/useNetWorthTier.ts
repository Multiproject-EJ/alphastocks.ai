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
  
  const previousNetWorthRef = useRef(0)
  
  useEffect(() => {
    const newCurrentTier = getCurrentTier(netWorth)
    const previousTier = getCurrentTier(previousNetWorthRef.current)
    
    // Check for tier up
    if (newCurrentTier.tier > previousTier.tier) {
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
