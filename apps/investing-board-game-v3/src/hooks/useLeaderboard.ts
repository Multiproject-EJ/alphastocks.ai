/**
 * useLeaderboard Hook
 * Manages leaderboard data fetching and player rank tracking
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { LeaderboardEntry, RingNumber } from '@/lib/types'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface UseLeaderboardProps {
  gameState: {
    netWorth: number
    level: number
    currentSeasonTier: number
    currentRing?: number
    throneCount?: number
    highestRingReached?: number
    stats?: { totalStarsEarned?: number }
  }
}

interface UseLeaderboardReturn {
  globalLeaderboard: LeaderboardEntry[]
  weeklyLeaderboard: LeaderboardEntry[]
  ringLeaders: LeaderboardEntry[]
  playerRank: number | null
  loading: boolean
  fetchLeaderboard: (type: 'global' | 'weekly' | 'seasonal', sortBy?: 'net_worth' | 'level' | 'season_tier' | 'stars') => Promise<void>
  fetchRingLeaders: () => Promise<void>
  updatePlayerStats: () => Promise<void>
  refreshLeaderboard: () => Promise<void>
}

export function useLeaderboard({ gameState }: UseLeaderboardProps): UseLeaderboardReturn {
  const { user, isAuthenticated } = useAuth()
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [ringLeaders, setRingLeaders] = useState<LeaderboardEntry[]>([])
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const lastUpdateRef = useRef<Date | null>(null)

  // Debounce: only update every 30 seconds
  const shouldUpdate = useCallback(() => {
    if (!lastUpdateRef.current) return true
    const timeSince = Date.now() - lastUpdateRef.current.getTime()
    return timeSince >= 30000 // 30 seconds
  }, [])

  // Helper function to map database row to LeaderboardEntry
  const mapToLeaderboardEntry = useCallback((row: any, index?: number): LeaderboardEntry => ({
    userId: row.user_id,
    username: row.username,
    netWorth: row.net_worth || 0,
    level: row.level || 1,
    seasonTier: row.season_tier || 0,
    totalStarsEarned: row.total_stars_earned || 0,
    currentRing: (row.current_ring || 1) as RingNumber,
    throneCount: row.throne_count || 0,
    highestRingReached: (row.highest_ring_reached || 1) as RingNumber,
    avatarUrl: row.avatar_url,
    rank: index !== undefined ? index + 1 : row.rank,
    isCurrentUser: user ? row.user_id === user.id : false,
  }), [user])

  // Update player stats to leaderboard
  const updatePlayerStats = useCallback(async () => {
    if (!supabaseClient || !hasSupabaseConfig || !isAuthenticated || !user) {
      return
    }

    if (!shouldUpdate()) {
      return
    }

    try {
      // Get username from user metadata or email
      const username = (user as any).user_metadata?.username || 
                      (user as any).user_metadata?.full_name || 
                      user.email || 
                      'Player'

      const payload = {
        user_id: user.id,
        username,
        net_worth: gameState.netWorth,
        level: gameState.level,
        season_tier: gameState.currentSeasonTier,
        total_stars_earned: gameState.stats?.totalStarsEarned || 0,
        current_ring: gameState.currentRing || 1,
        throne_count: gameState.throneCount || 0,
        highest_ring_reached: Math.max(
          gameState.highestRingReached || 1,
          gameState.currentRing || 1
        ),
      }

      const { error } = await supabaseClient
        .from('leaderboard')
        .upsert(payload, { onConflict: 'user_id' })

      if (error && error.code !== '42P01') {
        console.error('Failed to update leaderboard:', error)
      } else {
        lastUpdateRef.current = new Date()
      }
    } catch (err) {
      console.error('Error updating leaderboard:', err)
    }
  }, [user, isAuthenticated, gameState, shouldUpdate])

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (type: 'global' | 'weekly' | 'seasonal', sortBy: 'net_worth' | 'level' | 'season_tier' | 'stars' = 'net_worth') => {
      if (!supabaseClient || !hasSupabaseConfig) {
        return
      }

      setLoading(true)

      try {
        if (type === 'weekly') {
          // Fetch weekly leaderboard
          const { data, error } = await supabaseClient
            .from('weekly_leaderboard')
            .select('*')
            .order('stars_earned_this_week', { ascending: false })
            .limit(100)

          if (error && error.code !== '42P01') {
            throw error
          }

          if (data) {
            const entries: LeaderboardEntry[] = data.map((row: any, index: number) => ({
              userId: row.user_id,
              username: row.username,
              netWorth: 0,
              level: 0,
              seasonTier: 0,
              totalStarsEarned: row.stars_earned_this_week || 0,
              currentRing: (row.current_ring || 1) as RingNumber,
              throneCount: 0,
              highestRingReached: (row.current_ring || 1) as RingNumber, // Weekly table only has current_ring
              rank: index + 1,
              isCurrentUser: user ? row.user_id === user.id : false,
            }))

            setWeeklyLeaderboard(entries)

            // Find player's rank
            if (user) {
              const playerIndex = entries.findIndex(e => e.userId === user.id)
              if (playerIndex >= 0) {
                setPlayerRank(playerIndex + 1)
              }
            }
          }
        } else {
          // Fetch global or seasonal leaderboard
          let orderColumn = 'net_worth'
          
          if (sortBy === 'level') orderColumn = 'level'
          else if (sortBy === 'season_tier') orderColumn = 'season_tier'
          else if (sortBy === 'stars') orderColumn = 'total_stars_earned'

          const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order(orderColumn, { ascending: false })
            .limit(100)

          if (error && error.code !== '42P01') {
            throw error
          }

          if (data) {
            const entries: LeaderboardEntry[] = data.map((row: any, index: number) => mapToLeaderboardEntry(row, index))

            setGlobalLeaderboard(entries)

            // Find player's rank
            if (user) {
              const playerIndex = entries.findIndex(e => e.userId === user.id)
              if (playerIndex >= 0) {
                setPlayerRank(playerIndex + 1)
              } else {
                // Player is not in top 100, fetch their rank
                try {
                  const { data: rankData } = await supabaseClient
                    .rpc('get_player_rank', { 
                      player_id: user.id,
                      rank_type: sortBy 
                    })
                  
                  if (rankData) {
                    setPlayerRank(rankData)
                  }
                } catch (rankError) {
                  console.error('Failed to get player rank:', rankError)
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        toast.error('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    },
    [user, mapToLeaderboardEntry]
  )

  // Refresh leaderboard (convenience method)
  const refreshLeaderboard = useCallback(async () => {
    await fetchLeaderboard('global', 'net_worth')
  }, [fetchLeaderboard])

  // Fetch Ring Leaders (Ring 1-3 leaderboards)
  const fetchRingLeaders = useCallback(async () => {
    if (!supabaseClient || !hasSupabaseConfig) return
    
    try {
      const ringQueries = [1, 2, 3].map((ring) =>
        supabaseClient
          .from('leaderboard')
          .select('*')
          .eq('current_ring', ring)
          .order('net_worth', { ascending: false })
          .order('throne_count', { ascending: false })
          .limit(50)
      )

      const results = await Promise.all(ringQueries)
      const entries = results.flatMap(({ data, error }) => {
        if (error && error.code !== '42P01') {
          throw error
        }

        return data ? data.map((row: any) => mapToLeaderboardEntry(row)) : []
      })

      setRingLeaders(entries)
    } catch (err) {
      console.error('Error fetching ring leaders:', err)
    }
  }, [mapToLeaderboardEntry])

  // Auto-update player stats when game state changes (debounced)
  useEffect(() => {
    if (isAuthenticated && shouldUpdate()) {
      const timer = setTimeout(() => {
        updatePlayerStats()
      }, 5000) // Wait 5 seconds after state change

      return () => clearTimeout(timer)
    }
  }, [gameState.netWorth, gameState.level, gameState.currentSeasonTier, isAuthenticated, updatePlayerStats, shouldUpdate])

  return {
    globalLeaderboard,
    weeklyLeaderboard,
    ringLeaders,
    playerRank,
    loading,
    fetchLeaderboard,
    fetchRingLeaders,
    updatePlayerStats,
    refreshLeaderboard,
  }
}
