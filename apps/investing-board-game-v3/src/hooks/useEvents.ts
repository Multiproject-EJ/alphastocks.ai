/**
 * useEvents Hook
 * Manages game events, including recurring and special events
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  GameEvent, 
  getActiveEvents, 
  getUpcomingEvents, 
  checkEventStart, 
  checkEventEnd,
  updateEventStatus 
} from '@/lib/events'
import { toast } from 'sonner'

interface UseEventsProps {
  playSound?: (sound: string) => void
}

interface UseEventsReturn {
  activeEvents: GameEvent[]
  upcomingEvents: GameEvent[]
  getActiveMultipliers: () => { starsMultiplier: number; xpMultiplier: number }
  hasGuaranteedCasinoWin: () => boolean
  getRollsBonus: () => number
  getShopDiscount: () => number
  getCustomEffects: () => string[]
}

export function useEvents({ playSound }: UseEventsProps = {}): UseEventsReturn {
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<GameEvent[]>([])

  // Update events (check for starts/ends)
  const updateEvents = useCallback(() => {
    const now = new Date()
    
    // Check for event starts
    const startingEvent = checkEventStart(now)
    if (startingEvent) {
      handleEventStart(startingEvent)
    }
    
    // Check for event ends
    const endingEvent = checkEventEnd(now)
    if (endingEvent) {
      handleEventEnd(endingEvent)
    }
    
    // Update active and upcoming events
    setActiveEvents(getActiveEvents(now))
    setUpcomingEvents(getUpcomingEvents(45, now))
  }, [])

  // Handle event start
  const handleEventStart = useCallback((event: GameEvent) => {
    updateEventStatus(event.id, true)
    
    // Show notification
    toast.success(`🎉 ${event.title} Has Begun!`, {
      description: event.description,
      duration: 5000,
    })
    
    // Play sound
    if (playSound) {
      playSound('celebration')
    }
  }, [playSound])

  // Handle event end
  const handleEventEnd = useCallback((event: GameEvent) => {
    updateEventStatus(event.id, false)
    
    // Show notification
    toast.info(`${event.icon} ${event.title} has ended`, {
      description: 'See you next time!',
    })
  }, [])

  // Check every minute for event changes
  useEffect(() => {
    // Initial check
    updateEvents()
    
    // Set up interval
    const interval = setInterval(updateEvents, 60000) // 1 minute
    
    return () => clearInterval(interval)
  }, [updateEvents])

  // Get combined multipliers from all active events
  const getActiveMultipliers = useCallback(() => {
    let starsMultiplier = 1
    let xpMultiplier = 1
    
    activeEvents.forEach(event => {
      if (event.effects.starsMultiplier) {
        starsMultiplier *= event.effects.starsMultiplier
      }
      if (event.effects.xpMultiplier) {
        xpMultiplier *= event.effects.xpMultiplier
      }
    })
    
    return { starsMultiplier, xpMultiplier }
  }, [activeEvents])

  // Check if casino has guaranteed win
  const hasGuaranteedCasinoWin = useCallback(() => {
    return activeEvents.some(event => event.effects.guaranteedWin === true)
  }, [activeEvents])

  // Get total rolls bonus from active events
  const getRollsBonus = useCallback(() => {
    let bonus = 0
    activeEvents.forEach(event => {
      if (event.effects.rollsBonus) {
        bonus += event.effects.rollsBonus
      }
    })
    return bonus
  }, [activeEvents])

  // Get shop discount percentage
  const getShopDiscount = useCallback(() => {
    let maxDiscount = 0
    activeEvents.forEach(event => {
      if (event.effects.shopDiscount && event.effects.shopDiscount > maxDiscount) {
        maxDiscount = event.effects.shopDiscount
      }
    })
    return maxDiscount
  }, [activeEvents])

  // Get custom effect identifiers
  const getCustomEffects = useCallback(() => {
    const effects: string[] = []
    activeEvents.forEach(event => {
      if (event.effects.customEffect) {
        effects.push(event.effects.customEffect)
      }
    })
    return effects
  }, [activeEvents])

  return {
    activeEvents,
    upcomingEvents,
    getActiveMultipliers,
    hasGuaranteedCasinoWin,
    getRollsBonus,
    getShopDiscount,
    getCustomEffects,
  }
}
