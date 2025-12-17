import { useState, useCallback, useEffect, useRef } from 'react'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { GameState } from '@/lib/types'
import { DAILY_ROLL_LIMIT, getNextMidnight } from '@/lib/constants'

interface BoardGameProfile {
  id: string
  profile_id: string
  cash: number
  position: number
  net_worth: number
  portfolio_value: number
  stars: number
  holdings: GameState['holdings']
  rolls_remaining: number
  rolls_reset_at: string
  created_at: string
  updated_at: string
}

interface UseGameSaveReturn {
  loading: boolean
  saving: boolean
  error: string | null
  savedGameState: GameState | null
  savedRolls: { remaining: number; resetAt: Date } | null
  saveGame: (gameState: GameState, rollsRemaining: number, nextResetTime: Date) => Promise<void>
  loadGame: () => Promise<void>
  clearError: () => void
}

/**
 * Hook for saving and loading board game state to/from Supabase
 * Automatically syncs with the authenticated user's profile
 */
export function useGameSave(): UseGameSaveReturn {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedGameState, setSavedGameState] = useState<GameState | null>(null)
  const [savedRolls, setSavedRolls] = useState<{ remaining: number; resetAt: Date } | null>(null)
  const hasLoadedRef = useRef(false)

  const clearError = useCallback(() => setError(null), [])

  // Convert database row to GameState
  const profileToGameState = useCallback((profile: BoardGameProfile): GameState => {
    return {
      cash: Number(profile.cash),
      position: profile.position,
      netWorth: Number(profile.net_worth),
      portfolioValue: Number(profile.portfolio_value),
      stars: profile.stars,
      holdings: Array.isArray(profile.holdings) ? profile.holdings : [],
    }
  }, [])

  // Load game state from Supabase
  const loadGame = useCallback(async () => {
    if (!supabaseClient || !hasSupabaseConfig || !isAuthenticated || !user) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabaseClient
        .from('board_game_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (queryError) {
        // Table might not exist yet - this is okay
        if (queryError.code === '42P01') {
          console.warn('board_game_profiles table does not exist yet. Run the SQL patch to enable game saving.')
          return
        }
        throw queryError
      }

      if (data) {
        const profile = data as BoardGameProfile
        const gameState = profileToGameState(profile)
        setSavedGameState(gameState)

        // Check if rolls need to be reset
        const resetAt = new Date(profile.rolls_reset_at)
        const now = new Date()
        
        if (now >= resetAt) {
          // Rolls have expired, reset them using the shared getNextMidnight function
          setSavedRolls({ remaining: DAILY_ROLL_LIMIT, resetAt: getNextMidnight() })
        } else {
          setSavedRolls({ remaining: profile.rolls_remaining, resetAt })
        }
      }
    } catch (err) {
      console.error('Failed to load game:', err)
      setError(err instanceof Error ? err.message : 'Failed to load game state')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, profileToGameState])

  // Save game state to Supabase
  const saveGame = useCallback(
    async (gameState: GameState, rollsRemaining: number, nextResetTime: Date) => {
      if (!supabaseClient || !hasSupabaseConfig || !isAuthenticated || !user) {
        return
      }

      setSaving(true)
      setError(null)

      try {
        const payload = {
          profile_id: user.id,
          cash: gameState.cash,
          position: gameState.position,
          net_worth: gameState.netWorth,
          portfolio_value: gameState.portfolioValue,
          stars: gameState.stars,
          holdings: gameState.holdings,
          rolls_remaining: rollsRemaining,
          rolls_reset_at: nextResetTime.toISOString(),
        }

        const { error: upsertError } = await supabaseClient
          .from('board_game_profiles')
          .upsert(payload, { onConflict: 'profile_id' })

        if (upsertError) {
          // Table might not exist yet
          if (upsertError.code === '42P01') {
            console.warn('board_game_profiles table does not exist yet. Run the SQL patch to enable game saving.')
            return
          }
          throw upsertError
        }

        // Update local saved state
        setSavedGameState(gameState)
        setSavedRolls({ remaining: rollsRemaining, resetAt: nextResetTime })
      } catch (err) {
        console.error('Failed to save game:', err)
        setError(err instanceof Error ? err.message : 'Failed to save game state')
      } finally {
        setSaving(false)
      }
    },
    [isAuthenticated, user]
  )

  // Auto-load game when user authenticates
  useEffect(() => {
    if (authLoading || hasLoadedRef.current) return
    
    if (isAuthenticated && user) {
      hasLoadedRef.current = true
      loadGame()
    }
  }, [authLoading, isAuthenticated, user, loadGame])

  // Reset loaded flag when user changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedRef.current = false
      setSavedGameState(null)
      setSavedRolls(null)
    }
  }, [isAuthenticated])

  return {
    loading,
    saving,
    error,
    savedGameState,
    savedRolls,
    saveGame,
    loadGame,
    clearError,
  }
}
