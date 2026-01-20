import { useState, useCallback, useEffect } from 'react'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

// Constants
const POSTGRES_ERROR_UNDEFINED_COLUMN = '42703'

export interface DailyDividendStatus {
  currentDay: number // 1-7
  lastCollectionDate: Date | null
  canCollect: boolean
  totalCollected: number
}

export interface DailyDividendBaseReward {
  type: 'dice' | 'cash'
  amount: number
}

export interface DailyDividendReward {
  base: DailyDividendBaseReward
  bonusCash: number
  mysteryGift: number
}

// Reward pattern: alternating dice rolls and cash
const REWARD_PATTERN: DailyDividendBaseReward[] = [
  { type: 'dice', amount: 10 },  // Day 1
  { type: 'cash', amount: 1000 }, // Day 2
  { type: 'dice', amount: 10 },  // Day 3
  { type: 'cash', amount: 1000 }, // Day 4
  { type: 'dice', amount: 10 },  // Day 5
  { type: 'cash', amount: 1000 }, // Day 6
  { type: 'dice', amount: 10 },  // Day 7
]

const BONUS_CASH_BASE = 250
const BONUS_CASH_GROWTH = 1.6

const MYSTERY_GIFT_TABLE = [
  { amount: 10, weight: 400 },
  { amount: 15, weight: 250 },
  { amount: 20, weight: 150 },
  { amount: 30, weight: 100 },
  { amount: 50, weight: 60 },
  { amount: 100, weight: 30 },
  { amount: 200, weight: 9 },
  { amount: 1000, weight: 1 },
]

export function getRewardPreviewForDay(day: number) {
  const index = (day - 1) % 7
  const base = REWARD_PATTERN[index]
  const bonusCash = Math.round(BONUS_CASH_BASE * Math.pow(BONUS_CASH_GROWTH, day - 1))

  return {
    base,
    bonusCash,
  }
}

const rollMysteryGift = (): number => {
  const totalWeight = MYSTERY_GIFT_TABLE.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * totalWeight

  for (const entry of MYSTERY_GIFT_TABLE) {
    if (roll < entry.weight) return entry.amount
    roll -= entry.weight
  }

  return MYSTERY_GIFT_TABLE[MYSTERY_GIFT_TABLE.length - 1].amount
}

export function getRewardForDay(day: number): DailyDividendReward {
  const preview = getRewardPreviewForDay(day)
  return {
    ...preview,
    mysteryGift: rollMysteryGift(),
  }
}

interface UseDailyDividendsReturn {
  status: DailyDividendStatus | null
  loading: boolean
  error: string | null
  canShowPopup: boolean
  collectReward: () => Promise<DailyDividendReward | null>
  refreshStatus: () => Promise<void>
}

/**
 * Hook for managing daily dividends system
 * Tracks user's progress through 7-day dividend cycle
 * Only advances when user collects their reward (not calendar-based)
 */
export function useDailyDividends(): UseDailyDividendsReturn {
  const { user, isAuthenticated } = useAuth()
  const [status, setStatus] = useState<DailyDividendStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canShowPopup, setCanShowPopup] = useState(false)

  // Check if user can collect today
  const canCollectToday = useCallback((lastCollectionDate: Date | null): boolean => {
    if (!lastCollectionDate) return true
    
    const now = new Date()
    const lastCollection = new Date(lastCollectionDate)
    
    // Compare dates in UTC to avoid timezone issues
    const nowDateUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const lastDateUTC = Date.UTC(lastCollection.getUTCFullYear(), lastCollection.getUTCMonth(), lastCollection.getUTCDate())
    
    return nowDateUTC > lastDateUTC
  }, [])

  // Load dividend status from database
  const refreshStatus = useCallback(async () => {
    if (!supabaseClient || !hasSupabaseConfig || !isAuthenticated || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabaseClient
        .from('board_game_profiles')
        .select('daily_dividend_day, daily_dividend_last_collection, daily_dividend_total_collected')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (queryError) {
        // Table might not have dividend columns yet
        if (queryError.code === POSTGRES_ERROR_UNDEFINED_COLUMN) {
          console.warn('Daily dividends columns do not exist yet. Run migration 028_daily_dividends.sql')
          setStatus({
            currentDay: 1,
            lastCollectionDate: null,
            canCollect: true,
            totalCollected: 0,
          })
          setCanShowPopup(true)
          return
        }
        throw queryError
      }

      if (data) {
        const lastCollectionDate = data.daily_dividend_last_collection 
          ? new Date(data.daily_dividend_last_collection)
          : null
        
        const canCollect = canCollectToday(lastCollectionDate)
        
        const dividendStatus: DailyDividendStatus = {
          currentDay: data.daily_dividend_day || 1,
          lastCollectionDate,
          canCollect,
          totalCollected: data.daily_dividend_total_collected || 0,
        }

        setStatus(dividendStatus)
        
        // Show popup if user can collect today
        setCanShowPopup(canCollect)
      } else {
        // No profile yet, will be created on first save
        const dividendStatus: DailyDividendStatus = {
          currentDay: 1,
          lastCollectionDate: null,
          canCollect: true,
          totalCollected: 0,
        }
        setStatus(dividendStatus)
        setCanShowPopup(true)
      }
    } catch (err) {
      console.error('Failed to load daily dividend status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dividend status')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, canCollectToday])

  // Collect today's reward
  const collectReward = useCallback(async (): Promise<DailyDividendReward | null> => {
    if (!supabaseClient || !hasSupabaseConfig || !isAuthenticated || !user || !status) {
      return null
    }

    if (!status.canCollect) {
      console.warn('Cannot collect reward - already collected today')
      return null
    }

    try {
      const reward = getRewardForDay(status.currentDay)
      const nextDay = status.currentDay === 7 ? 1 : status.currentDay + 1
      const now = new Date()

      // Update database
      const { error: updateError } = await supabaseClient
        .from('board_game_profiles')
        .update({
          daily_dividend_day: nextDay,
          daily_dividend_last_collection: now.toISOString(),
          daily_dividend_total_collected: status.totalCollected + 1,
        })
        .eq('profile_id', user.id)

      if (updateError) {
        if (updateError.code === POSTGRES_ERROR_UNDEFINED_COLUMN) {
          console.warn('Daily dividends columns do not exist yet. Run migration 028_daily_dividends.sql')
        } else {
          throw updateError
        }
      }

      // Update local state
      setStatus({
        currentDay: nextDay,
        lastCollectionDate: now,
        canCollect: false,
        totalCollected: status.totalCollected + 1,
      })

      setCanShowPopup(false)

      return reward
    } catch (err) {
      console.error('Failed to collect dividend:', err)
      setError(err instanceof Error ? err.message : 'Failed to collect dividend')
      return null
    }
  }, [isAuthenticated, user, status])

  // Load status on mount
  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    status,
    loading,
    error,
    canShowPopup,
    collectReward,
    refreshStatus,
  }
}
