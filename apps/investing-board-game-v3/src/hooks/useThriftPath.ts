import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
  ThriftPathStatus,
  THRIFT_PATH_LEVELS,
  THRIFT_PATH_XP_SOURCES,
  THRIFT_PATH_PENALTIES,
  THRIFT_PATH_ACTIVATION_THRESHOLD,
  getThriftPathBenefits,
  calculateLevel
} from '@/lib/thriftPath'

export const useThriftPath = (initialStatus?: ThriftPathStatus) => {
  const [thriftPathStatus, setThriftPathStatus] = useState<ThriftPathStatus>(
    initialStatus || {
      active: false,
      level: 0,
      experience: 0,
      streakDays: 0,
      activatedAt: null,
      lastActivityDate: null,
      benefits: { starMultiplier: 1, crashProtection: 0, recoveryBoost: 1 },
      stats: {
        totalChallengesCompleted: 0,
        perfectQuizzes: 0,
        disciplinedChoices: 0,
        impulsiveActions: 0,
        longTermHoldings: 0
      }
    }
  )
  
  const addThriftPathXP = useCallback((source: keyof typeof THRIFT_PATH_XP_SOURCES, amount?: number) => {
    const xpGain = amount || THRIFT_PATH_XP_SOURCES[source]
    
    setThriftPathStatus(prev => {
      const newXP = prev.experience + xpGain
      const newLevel = calculateLevel(newXP)
      const wasActive = prev.active
      const nowActive = newXP >= THRIFT_PATH_ACTIVATION_THRESHOLD
      
      // Check for level up
      if (newLevel > prev.level && nowActive) {
        toast.success(`🌿 Thrift Path Level Up!`, {
          description: `You've reached ${THRIFT_PATH_LEVELS[newLevel as keyof typeof THRIFT_PATH_LEVELS].title}`
        })
        
        // Play sound
        // Show celebration
      }
      
      // First activation
      if (!wasActive && nowActive) {
        toast.success(`🌿 Thrift Path Activated!`, {
          description: `Your disciplined choices are now rewarded with benefits.`
        })
      }
      
      return {
        ...prev,
        experience: Math.max(0, newXP),
        level: nowActive ? newLevel : 0,
        active: nowActive,
        activatedAt: nowActive && !wasActive ? new Date() : prev.activatedAt,
        lastActivityDate: new Date(),
        benefits: nowActive ? getThriftPathBenefits(newLevel) : { starMultiplier: 1, crashProtection: 0, recoveryBoost: 1 }
      }
    })
  }, [])
  
  const penalizeThriftPath = useCallback((reason: keyof typeof THRIFT_PATH_PENALTIES) => {
    const penalty = THRIFT_PATH_PENALTIES[reason]
    
    setThriftPathStatus(prev => {
      const newXP = prev.experience + penalty
      const newLevel = calculateLevel(Math.max(0, newXP))
      const nowActive = newXP >= THRIFT_PATH_ACTIVATION_THRESHOLD
      
      if (prev.active && !nowActive) {
        toast.error(`🌿 Thrift Path Deactivated`, {
          description: `Your impulsive actions have consequences.`
        })
      }
      
      return {
        ...prev,
        experience: Math.max(0, newXP),
        level: nowActive ? newLevel : 0,
        active: nowActive,
        benefits: nowActive ? getThriftPathBenefits(newLevel) : { starMultiplier: 1, crashProtection: 0, recoveryBoost: 1 }
      }
    })
  }, [])
  
  const updateStats = useCallback((stat: keyof ThriftPathStatus['stats'], increment: number = 1) => {
    setThriftPathStatus(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: prev.stats[stat] + increment
      }
    }))
  }, [])
  
  const checkDailyStreak = useCallback(() => {
    const today = new Date().toDateString()
    const lastActivity = thriftPathStatus.lastActivityDate 
      ? new Date(thriftPathStatus.lastActivityDate).toDateString()
      : null
    
    if (lastActivity !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      
      if (lastActivity === yesterday) {
        // Continue streak
        setThriftPathStatus(prev => ({
          ...prev,
          streakDays: prev.streakDays + 1,
          lastActivityDate: new Date()
        }))
        addThriftPathXP('daily_login_streak')
      } else if (lastActivity) {
        // Streak broken
        setThriftPathStatus(prev => ({
          ...prev,
          streakDays: 1,
          lastActivityDate: new Date()
        }))
        penalizeThriftPath('miss_daily_streak')
      } else {
        // First day
        setThriftPathStatus(prev => ({
          ...prev,
          streakDays: 1,
          lastActivityDate: new Date()
        }))
      }
    }
  }, [addThriftPathXP, penalizeThriftPath, thriftPathStatus.lastActivityDate])
  
  return {
    thriftPathStatus,
    setThriftPathStatus,
    addThriftPathXP,
    penalizeThriftPath,
    updateStats,
    checkDailyStreak
  }
}
