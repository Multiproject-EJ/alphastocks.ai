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
  coins: number
  holdings: GameState['holdings']
  inventory: GameState['inventory']
  active_effects: GameState['activeEffects']
  equipped_theme: string
  equipped_dice_skin: string
  equipped_trail: string | null
  rolls_remaining: number
  rolls_reset_at: string
  xp: number
  level: number
  season_points: number
  current_season_tier: number
  has_premium_pass: boolean
  claimed_season_tiers: number[]
  achievements: GameState['achievements']
  challenges?: GameState['challenges']
  stats: GameState['stats']
  thrift_path?: GameState['thriftPath']
  event_track?: GameState['eventTrack']
  // Energy regeneration fields
  last_energy_check?: string
  energy_rolls?: number
  roll_history?: any[]
  doubles_streak?: number
  total_doubles?: number
  // Jackpot system
  jackpot?: number
  // Daily dividends
  daily_dividend_day?: number
  daily_dividend_last_collection?: string
  daily_dividend_total_collected?: number
  // Lifetime stats
  lifetime_cash_earned?: number
  lifetime_stars_earned?: number
  lifetime_coins_earned?: number
  lifetime_xp_earned?: number
  mystery_boxes_opened?: number
  legendary_items_found?: number
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
      coins: profile.coins || 100,
      currentRing: 1,
      ring1LapsCompleted: 0,
      hasReachedThrone: false,
      throneCount: 0,
      holdings: Array.isArray(profile.holdings) ? profile.holdings : [],
      inventory: Array.isArray(profile.inventory) ? profile.inventory : [],
      activeEffects: Array.isArray(profile.active_effects) ? profile.active_effects : [],
      equippedTheme: profile.equipped_theme || 'default',
      equippedDiceSkin: profile.equipped_dice_skin || 'default',
      equippedTrail: profile.equipped_trail || undefined,
      xp: profile.xp || 0,
      level: profile.level || 1,
      seasonPoints: profile.season_points || 0,
      currentSeasonTier: profile.current_season_tier || 0,
      hasPremiumPass: profile.has_premium_pass || false,
      claimedSeasonTiers: Array.isArray(profile.claimed_season_tiers) ? profile.claimed_season_tiers : [],
      achievements: profile.achievements || { unlocked: [], progress: {} },
      challenges: profile.challenges || undefined,
      stats: profile.stats || {
        totalRolls: 0,
        stocksPurchased: 0,
        uniqueStocks: 0,
        quizzesCompleted: 0,
        perfectQuizzes: 0,
        scratchcardsPlayed: 0,
        scratchcardsWon: 0,
        scratchcardWinStreak: 0,
        tilesVisited: [],
        consecutiveDays: 0,
        lastLoginDate: null,
        totalStarsEarned: 0,
        roll6Streak: 0,
      },
      thriftPath: profile.thrift_path || undefined,
      eventTrack: profile.event_track || undefined,
      // Energy regeneration fields with defaults
      lastEnergyCheck: profile.last_energy_check ? new Date(profile.last_energy_check) : new Date(),
      energyRolls: profile.energy_rolls ?? 10,
      rollHistory: Array.isArray(profile.roll_history) ? profile.roll_history : [],
      doublesStreak: profile.doubles_streak ?? 0,
      totalDoubles: profile.total_doubles ?? 0,
      // Jackpot system
      jackpot: profile.jackpot ?? 0,
      // Lifetime stats
      lifetimeCashEarned: profile.lifetime_cash_earned ? Number(profile.lifetime_cash_earned) : 0,
      lifetimeStarsEarned: profile.lifetime_stars_earned ?? 0,
      lifetimeCoinsEarned: profile.lifetime_coins_earned ?? 0,
      lifetimeXpEarned: profile.lifetime_xp_earned ?? 0,
      mysteryBoxesOpened: profile.mystery_boxes_opened ?? 0,
      legendaryItemsFound: profile.legendary_items_found ?? 0,
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
          coins: gameState.coins || 100,
          holdings: gameState.holdings,
          inventory: gameState.inventory || [],
          active_effects: gameState.activeEffects || [],
          equipped_theme: gameState.equippedTheme || 'default',
          equipped_dice_skin: gameState.equippedDiceSkin || 'default',
          equipped_trail: gameState.equippedTrail || null,
          rolls_remaining: rollsRemaining,
          rolls_reset_at: nextResetTime.toISOString(),
          xp: gameState.xp || 0,
          level: gameState.level || 1,
          season_points: gameState.seasonPoints || 0,
          current_season_tier: gameState.currentSeasonTier || 0,
          has_premium_pass: gameState.hasPremiumPass || false,
          claimed_season_tiers: gameState.claimedSeasonTiers || [],
          achievements: gameState.achievements || { unlocked: [], progress: {} },
          challenges: gameState.challenges || undefined,
          stats: gameState.stats || {
            totalRolls: 0,
            stocksPurchased: 0,
            uniqueStocks: 0,
            quizzesCompleted: 0,
            perfectQuizzes: 0,
            scratchcardsPlayed: 0,
            scratchcardsWon: 0,
            scratchcardWinStreak: 0,
            tilesVisited: [],
            consecutiveDays: 0,
            lastLoginDate: null,
            totalStarsEarned: 0,
            roll6Streak: 0,
          },
          thrift_path: gameState.thriftPath || undefined,
          event_track: gameState.eventTrack || undefined,
          // Energy regeneration fields - use rollsRemaining as the source of truth
          last_energy_check: gameState.lastEnergyCheck?.toISOString() || new Date().toISOString(),
          energy_rolls: rollsRemaining,
          roll_history: gameState.rollHistory || [],
          doubles_streak: gameState.doublesStreak ?? 0,
          total_doubles: gameState.totalDoubles ?? 0,
          // Jackpot system
          jackpot: gameState.jackpot ?? 0,
          // Lifetime stats
          lifetime_cash_earned: gameState.lifetimeCashEarned ?? 0,
          lifetime_stars_earned: gameState.lifetimeStarsEarned ?? 0,
          lifetime_coins_earned: gameState.lifetimeCoinsEarned ?? 0,
          lifetime_xp_earned: gameState.lifetimeXpEarned ?? 0,
          mystery_boxes_opened: gameState.mysteryBoxesOpened ?? 0,
          legendary_items_found: gameState.legendaryItemsFound ?? 0,
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
