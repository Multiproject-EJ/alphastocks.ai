import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from '@phosphor-icons/react'
import { Tile } from '@/components/Tile'
import { DiceHUD } from '@/components/DiceHUD'
import { HubModal } from '@/components/HubModal'
import { CentralStockCard } from '@/components/CentralStockCard'
import { StockModal } from '@/components/StockModal'
import { EventModal } from '@/components/EventModal'
import { ThriftyPathModal } from '@/components/ThriftyPathModal'
import { PortfolioModal } from '@/components/PortfolioModal'
import { ProToolsOverlay } from '@/components/ProToolsOverlay'
import { BiasSanctuaryModal } from '@/components/BiasSanctuaryModal'
import { CenterCarousel } from '@/components/CenterCarousel'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { CasinoModal } from '@/components/CasinoModal'
import { UserIndicator } from '@/components/UserIndicator'
import { SoundControls } from '@/components/SoundControls'
import { ChallengeTracker } from '@/components/ChallengeTracker'
import { EventBanner } from '@/components/EventBanner'
import { NetWorthGalleryModal } from '@/components/NetWorthGalleryModal'
import { TierUpModal } from '@/components/TierUpModal'
import { ThriftPathStatus } from '@/components/ThriftPathStatus'
import { ThriftPathAura } from '@/components/ThriftPathAura'
import { OutOfRollsModal } from '@/components/OutOfRollsModal'

// Mobile-first components
import { MobileGameLayout } from '@/components/MobileGameLayout'
import { BottomNav } from '@/components/BottomNav'
import { InstallPrompt } from '@/components/InstallPrompt'
import { LoadingScreen } from '@/components/LoadingScreen'
import { TutorialTooltip } from '@/components/TutorialTooltip'

// Lazy load heavy modals for better performance
const ShopModal = lazy(() => import('@/components/ShopModal'))
const ChallengesModal = lazy(() => import('@/components/ChallengesModal'))
const EventCalendar = lazy(() => import('@/components/EventCalendar'))
const SettingsModal = lazy(() => import('@/components/SettingsModal'))

import { GameState, Stock, BiasCaseStudy, RollsPack } from '@/lib/types'
import {
  BOARD_TILES,
  getRandomMarketEvent,
  getRandomBiasCaseStudy,
  THRIFTY_CHALLENGES,
} from '@/lib/mockData'
import {
  DAILY_ROLL_LIMIT,
  AUTO_SAVE_DEBOUNCE_MS,
  AUTO_SAVE_TIMEOUT_MS,
  getNextMidnight,
  ENERGY_MAX,
} from '@/lib/constants'
import { rollDice, DOUBLES_BONUS } from '@/lib/dice'
import { calculateRegeneratedRolls } from '@/lib/energy'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { useGameSave } from '@/hooks/useGameSave'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/hooks/useSound'
import { useShopInventory } from '@/hooks/useShopInventory'
import { useChallenges } from '@/hooks/useChallenges'
import { useEvents } from '@/hooks/useEvents'
import { useHaptics } from '@/hooks/useHaptics'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useNetWorthTier } from '@/hooks/useNetWorthTier'
import { useCoins } from '@/hooks/useCoins'
import { useThriftPath } from '@/hooks/useThriftPath'
import { ThriftPathStatus as ThriftPathStatusType } from '@/lib/thriftPath'
import { COIN_COSTS } from '@/lib/coins'

type Phase = 'idle' | 'rolling' | 'moving' | 'landed'

// Debug helper function - logs only when DEBUG_GAME is enabled in localStorage
const debugGame = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && localStorage.getItem('DEBUG_GAME') === 'true') {
    console.log('[DEBUG]', ...args)
  }
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const stockSourceAnnounced = useRef<'supabase' | 'mock' | null>(null)
  const gameLoadedFromSave = useRef(false)
  const lastSaveTimeRef = useRef<Date | null>(null)

  // Default initial game state
  const defaultGameState: GameState = {
    cash: 100000,
    position: 0,
    netWorth: 100000,
    portfolioValue: 0,
    stars: 0,
    coins: 100,
    holdings: [],
    inventory: [],
    activeEffects: [],
    equippedTheme: 'default',
    equippedDiceSkin: 'default',
    equippedTrail: undefined,
    xp: 0,
    level: 1,
    seasonPoints: 0,
    currentSeasonTier: 0,
    hasPremiumPass: false,
    claimedSeasonTiers: [],
    achievements: {
      unlocked: [],
      progress: {},
    },
    stats: {
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
    // Energy regeneration fields
    lastEnergyCheck: new Date(),
    energyRolls: 10,
    rollHistory: [],
    doublesStreak: 0,
    totalDoubles: 0,
    thriftPath: {
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
  }

  const [gameState, setGameState] = useState<GameState>(defaultGameState)

  const [phase, setPhase] = useState<Phase>('idle')
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [rollsRemaining, setRollsRemaining] = useState(DAILY_ROLL_LIMIT)
  const [nextResetTime, setNextResetTime] = useState(getNextMidnight())
  const [hoppingTiles, setHoppingTiles] = useState<number[]>([])
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [currentStock, setCurrentStock] = useState<Stock | null>(null)
  const [showCentralStock, setShowCentralStock] = useState(false)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState('')

  const [thriftyModalOpen, setThriftyModalOpen] = useState(false)

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)

  const [hubModalOpen, setHubModalOpen] = useState(false)

  const [proToolsOpen, setProToolsOpen] = useState(false)

  const [biasSanctuaryModalOpen, setBiasSanctuaryModalOpen] = useState(false)
  const [currentCaseStudy, setCurrentCaseStudy] = useState<BiasCaseStudy | null>(null)

  const [casinoModalOpen, setCasinoModalOpen] = useState(false)

  const [shopModalOpen, setShopModalOpen] = useState(false)

  const [challengesModalOpen, setChallengesModalOpen] = useState(false)
  const [eventCalendarOpen, setEventCalendarOpen] = useState(false)

  const [netWorthGalleryOpen, setNetWorthGalleryOpen] = useState(false)

  const [outOfRollsModalOpen, setOutOfRollsModalOpen] = useState(false)

  // Mobile UI states
  const [activeSection, setActiveSection] = useState<'home' | 'challenges' | 'shop' | 'leaderboard' | 'settings'>('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [diceResetKey, setDiceResetKey] = useState(0)

  const [showCelebration, setShowCelebration] = useState(false)

  const rollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const landingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { getStockForCategory, loading: loadingUniverse, error: universeError, source: stockSource, universeCount } =
    useUniverseStocks()

  // Sound effects hook
  const { play: playSound } = useSound()

  // Haptic feedback hook
  const { roll: hapticRoll, success: hapticSuccess, light: hapticLight } = useHaptics()

  // Net Worth Tier hook
  const {
    currentTier,
    nextTier,
    progress: tierProgress,
    activeBenefits,
    showTierUpModal,
    setShowTierUpModal,
    newTier
  } = useNetWorthTier(gameState.netWorth)

  // Coins and Thrift Path hooks
  const {
    coins,
    setCoins,
    addCoins,
    spendCoins,
    earnFromSource,
    canAfford: canAffordCoins
  } = useCoins(gameState.coins)

  // Convert thriftPath from GameState format to ThriftPathStatus format
  const initialThriftPathStatus: ThriftPathStatusType | undefined = gameState.thriftPath ? {
    ...gameState.thriftPath,
    activatedAt: gameState.thriftPath.activatedAt ? new Date(gameState.thriftPath.activatedAt) : null,
    lastActivityDate: gameState.thriftPath.lastActivityDate ? new Date(gameState.thriftPath.lastActivityDate) : null
  } : undefined

  const {
    thriftPathStatus,
    setThriftPathStatus,
    addThriftPathXP,
    penalizeThriftPath,
    updateStats,
    checkDailyStreak
  } = useThriftPath(initialThriftPathStatus)

  // Swipe gesture hook - for mobile navigation
  const containerRef = useRef<HTMLDivElement>(null)
  useSwipeGesture(containerRef, (direction) => {
    if (direction === 'up' && !shopModalOpen && !challengesModalOpen) {
      setShopModalOpen(true)
      hapticLight()
    }
    if (direction === 'down' && (shopModalOpen || challengesModalOpen)) {
      setShopModalOpen(false)
      setChallengesModalOpen(false)
    }
  })

  // Shop inventory hook
  const {
    purchaseItem,
    isPermanentOwned,
    getItemQuantity,
    canAfford,
    equipCosmetic,
    getFinalPrice,
    shopDiscount,
  } = useShopInventory({ gameState, setGameState, tierBenefits: activeBenefits })

  // Challenges and Events hooks
  const {
    dailyChallenges,
    weeklyChallenges,
    completedToday,
    completedThisWeek,
    updateChallengeProgress,
    checkAndResetChallenges,
  } = useChallenges({
    gameState,
    setGameState,
    playSound,
    addXP: undefined, // Will be set later after we get the function from XP hook if it exists
    addSeasonPoints: undefined, // Will be set later
  })

  // Debug logging for challenge state changes
  useEffect(() => {
    debugGame('Challenge state updated:', {
      dailyChallenges: dailyChallenges?.map(c => ({ id: c.id, title: c.title, completed: c.completed })),
      completedToday: {
        value: completedToday,
        type: typeof completedToday
      },
      completedThisWeek: {
        value: completedThisWeek,
        type: typeof completedThisWeek
      }
    })
  }, [dailyChallenges, completedToday, completedThisWeek])

  const {
    activeEvents,
    upcomingEvents,
    getActiveMultipliers,
    hasGuaranteedCasinoWin,
    getRollsBonus,
    getShopDiscount,
    getCustomEffects,
  } = useEvents({ playSound })

  // Check for challenge resets on load and periodically
  useEffect(() => {
    checkAndResetChallenges()
    
    // Check every minute for resets
    const interval = setInterval(checkAndResetChallenges, 60000)
    return () => clearInterval(interval)
  }, [checkAndResetChallenges])

  // Sync coins state to gameState
  useEffect(() => {
    setGameState(prev => ({ ...prev, coins }))
  }, [coins])

  // Sync thriftPath state to gameState
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      thriftPath: {
        ...thriftPathStatus,
        activatedAt: thriftPathStatus.activatedAt ? thriftPathStatus.activatedAt.toISOString() : null,
        lastActivityDate: thriftPathStatus.lastActivityDate ? thriftPathStatus.lastActivityDate.toISOString() : null
      }
    }))
  }, [thriftPathStatus])

  // Check daily streak on component mount
  useEffect(() => {
    checkDailyStreak()
  }, [checkDailyStreak])

  // Loading screen on initial mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Bottom navigation handler
  const handleBottomNavigation = (section: 'challenges' | 'shop' | 'home' | 'leaderboard' | 'settings') => {
    hapticLight()
    setActiveSection(section)
    
    // Close all modals first
    setShopModalOpen(false)
    setChallengesModalOpen(false)
    setPortfolioModalOpen(false)
    setSettingsOpen(false)
    
    // Open corresponding modal based on section
    if (section === 'challenges') {
      setChallengesModalOpen(true)
    } else if (section === 'shop') {
      setShopModalOpen(true)
    } else if (section === 'leaderboard') {
      // Open leaderboard (will need to add LeaderboardModal integration)
      toast.info('Leaderboard coming soon!')
    } else if (section === 'settings') {
      setSettingsOpen(true)
    } else if (section === 'home') {
      // Just close all modals - already done above
    }
  }

  // Authentication and game save hooks
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    loading: saveLoading,
    saving,
    savedGameState,
    savedRolls,
    saveGame,
  } = useGameSave()

  // Helper function to check if a power-up is active
  const hasPowerUp = useCallback((itemId: string): boolean => {
    return gameState.activeEffects.some(effect => effect.itemId === itemId && effect.activated)
  }, [gameState.activeEffects])

  // Helper function to consume a power-up effect
  const consumePowerUp = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      activeEffects: prev.activeEffects.filter(effect => effect.itemId !== itemId)
    }))
  }, [])

  // Helper function to get effective daily roll limit (with upgrades and tier bonuses)
  const getEffectiveDailyRollLimit = useCallback((): number => {
    const hasExtraRoll = isPermanentOwned('extra-daily-roll')
    const eventBonus = getRollsBonus()
    const tierBonus = activeBenefits.get('daily_rolls') || 0
    return (hasExtraRoll ? DAILY_ROLL_LIMIT + 1 : DAILY_ROLL_LIMIT) + eventBonus + tierBonus
  }, [isPermanentOwned, getRollsBonus, activeBenefits])

  // Helper function to apply star multiplier (including event multipliers and tier bonuses)
  const applyStarMultiplier = useCallback((baseStars: number): number => {
    const hasStarMultiplier = isPermanentOwned('star-multiplier')
    const shopMultiplier = hasStarMultiplier ? 1.5 : 1
    const { starsMultiplier } = getActiveMultipliers()
    const tierStarBonus = activeBenefits.get('star_bonus') || 0
    const tierMultiplier = 1 + tierStarBonus
    return Math.floor(baseStars * shopMultiplier * starsMultiplier * tierMultiplier)
  }, [isPermanentOwned, getActiveMultipliers, activeBenefits])

  // Load saved game state when available
  useEffect(() => {
    if (saveLoading || authLoading || gameLoadedFromSave.current) return
    
    if (savedGameState && isAuthenticated) {
      debugGame('Loading saved game state:', savedGameState)
      setGameState(savedGameState)
      gameLoadedFromSave.current = true
      toast.success('Welcome back!', {
        description: 'Your game progress has been restored.',
      })
    }
  }, [savedGameState, saveLoading, authLoading, isAuthenticated])

  // Load saved rolls when available
  useEffect(() => {
    if (saveLoading || authLoading || !savedRolls) return
    
    const now = new Date()
    if (now >= savedRolls.resetAt) {
      // Rolls have expired, reset them
      setRollsRemaining(getEffectiveDailyRollLimit())
      setNextResetTime(getNextMidnight())
    } else {
      setRollsRemaining(savedRolls.remaining)
      setNextResetTime(savedRolls.resetAt)
    }
  }, [savedRolls, saveLoading, authLoading, getEffectiveDailyRollLimit])

  // Auto-save game state when it changes (debounced)
  const debouncedSave = useCallback(() => {
    if (!isAuthenticated || phase !== 'idle') return
    
    // Debounce saves to avoid excessive API calls
    const now = Date.now()
    const lastSave = lastSaveTimeRef.current?.getTime() || 0
    const timeSinceLastSave = now - lastSave
    
    // Only save if enough time has passed since last save
    if (timeSinceLastSave < AUTO_SAVE_DEBOUNCE_MS) {
      debugGame('Skipping save - too soon since last save')
      return
    }
    
    debugGame('Auto-saving game state...')
    lastSaveTimeRef.current = new Date()
    setLastSavedTime(lastSaveTimeRef.current)
    saveGame(gameState, rollsRemaining, nextResetTime)
  }, [isAuthenticated, phase, gameState, rollsRemaining, nextResetTime, saveGame])

  // Trigger auto-save when game state changes and player is idle
  useEffect(() => {
    if (!isAuthenticated || phase !== 'idle' || authLoading || saveLoading) return
    
    // Don't save if we just loaded the game
    if (!gameLoadedFromSave.current && savedGameState) return
    
    const saveTimeout = setTimeout(() => {
      debouncedSave()
    }, AUTO_SAVE_TIMEOUT_MS)

    return () => clearTimeout(saveTimeout)
  }, [gameState, phase, isAuthenticated, authLoading, saveLoading, savedGameState, debouncedSave])

  useEffect(() => {
    const checkReset = setInterval(() => {
      const now = new Date()
      if (now >= nextResetTime) {
        const effectiveLimit = getEffectiveDailyRollLimit()
        setRollsRemaining(effectiveLimit)
        setNextResetTime(getNextMidnight())
        toast.info('Daily dice rolls refreshed!', {
          description: `You have ${effectiveLimit} new rolls available`,
        })
      }
    }, 1000)

    return () => clearInterval(checkReset)
  }, [nextResetTime, getEffectiveDailyRollLimit])

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
      if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
      if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)
    }
  }, [])

  // Fix dice responsiveness bug: Reset dice state when page becomes visible
  // This handles the case when user navigates to ProTools and back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debugGame('Page visible - resetting dice state')
        setPhase('idle')
        // Clear any lingering timers
        if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
        if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
        if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (universeError) {
      toast.error('Unable to load your Supabase universe', {
        description: universeError,
      })
    }
  }, [universeError])

  useEffect(() => {
    if (loadingUniverse || universeError || !stockSource) return
    if (stockSourceAnnounced.current === stockSource) return

    if (stockSource === 'supabase') {
      toast.success('Using your Supabase investment universe', {
        description: universeCount
          ? `Loaded ${universeCount} saved stocks for board draws.`
          : 'Add stocks to your universe to personalize the board.',
      })
    } else {
      toast.info('Using built-in demo stocks', {
        description: 'Connect Supabase and add symbols to see your picks here.',
      })
    }

    stockSourceAnnounced.current = stockSource
  }, [loadingUniverse, stockSource, universeCount, universeError])

  useEffect(() => {
    const noActiveOverlays =
      !stockModalOpen &&
      !eventModalOpen &&
      !thriftyModalOpen &&
      !biasSanctuaryModalOpen &&
      !casinoModalOpen &&
      !showCentralStock

    if (phase === 'landed' && noActiveOverlays) {
      debugGame('Phase transition: landed -> idle (no active overlays)')
      setPhase('idle')
    }
  }, [stockModalOpen, eventModalOpen, thriftyModalOpen, biasSanctuaryModalOpen, casinoModalOpen, showCentralStock, phase])

  // Helper function to check extra dice roll power-up
  useEffect(() => {
    if (hasPowerUp('extra-dice-rolls')) {
      setRollsRemaining(prev => prev + 3)
      consumePowerUp('extra-dice-rolls')
      toast.success('Extra Dice Rolls Activated!', {
        description: '+3 rolls added',
      })
    }
  }, [hasPowerUp, consumePowerUp])

  // Energy regeneration system
  useEffect(() => {
    const checkEnergyRegen = () => {
      if (!gameState.lastEnergyCheck) {
        // Initialize if not set
        setGameState(prev => ({
          ...prev,
          lastEnergyCheck: new Date(),
          energyRolls: prev.energyRolls ?? 10
        }))
        return
      }
      
      const regenRolls = calculateRegeneratedRolls(gameState.lastEnergyCheck)
      
      if (regenRolls > 0) {
        const currentEnergy = gameState.energyRolls ?? 10
        const newEnergy = Math.min(currentEnergy + regenRolls, ENERGY_MAX)
        
        setGameState(prev => ({
          ...prev,
          energyRolls: newEnergy,
          lastEnergyCheck: new Date()
        }))
        
        setRollsRemaining(prev => Math.min(prev + regenRolls, ENERGY_MAX))
        
        debugGame('Energy regenerated:', { regenRolls, newEnergy })
        
        toast.info(`+${regenRolls} roll${regenRolls !== 1 ? 's' : ''} regenerated!`, {
          description: `Energy: ${newEnergy}/${ENERGY_MAX}`
        })
      }
    }
    
    // Check immediately on mount
    checkEnergyRegen()
    
    // Check every minute
    const interval = setInterval(checkEnergyRegen, 60000)
    
    return () => clearInterval(interval)
  }, [gameState.lastEnergyCheck, gameState.energyRolls])

  const handleRoll = (multiplier: number = 1) => {
    if (phase !== 'idle') {
      debugGame('Cannot roll - phase is not idle:', { phase, currentPosition: gameState.position })
      toast.info('Finish your current action first', {
        description: 'Close any open cards or modals before rolling again.',
      })
      return
    }

    // NEW: Open purchase modal instead of error toast when out of rolls
    if (rollsRemaining <= 0) {
      setOutOfRollsModalOpen(true)
      playSound('error')
      return
    }

    if (rollsRemaining < multiplier) {
      debugGame('Not enough rolls:', { rollsRemaining, needed: multiplier })
      playSound('error')
      toast.error(`Need ${multiplier} rolls`, {
        description: `You only have ${rollsRemaining} roll${rollsRemaining !== 1 ? 's' : ''} remaining.`,
      })
      setOutOfRollsModalOpen(true)
      return
    }

    // clear any lingering timers from a previous roll to keep movement predictable
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)

    // ✅ BUG FIX #1: Consume rolls IMMEDIATELY before processing
    setRollsRemaining((prev) => prev - multiplier)

    // Haptic feedback for rolling
    hapticRoll()
    
    setPhase('rolling')
    playSound('dice-roll')

    // Initialize accumulators for the multiplier sequence
    let totalMovement = 0
    let totalStarsEarned = 0
    let totalCoinsEarned = 0
    let totalXP = 0
    let doublesCount = 0
    let passedStartCount = 0
    const rollResults: typeof gameState.rollHistory = []

    // Process all rolls with staggered animations
    for (let i = 0; i < multiplier; i++) {
      setTimeout(() => {
        const diceResult = rollDice()
        rollResults.push(diceResult)
        
        debugGame('Dice roll:', { 
          rollNumber: i + 1, 
          die1: diceResult.die1, 
          die2: diceResult.die2, 
          total: diceResult.total,
          isDoubles: diceResult.isDoubles 
        })
        
        // Update dice display
        setDice1(diceResult.die1)
        setDice2(diceResult.die2)
        setLastRoll(diceResult.total)
        
        // Accumulate distance
        totalMovement += diceResult.total
        
        // Calculate base rewards for THIS individual roll (NOT multiplied yet)
        const rollCoins = 10 // Base coins per roll (from COIN_EARNINGS.dice_roll)
        const rollStars = 0  // Base stars per roll (no base stars for rolling)
        const rollXP = 0     // Base XP per roll (no base XP for rolling)
        
        totalCoinsEarned += rollCoins
        totalStarsEarned += rollStars
        totalXP += rollXP
        
        // Check for doubles
        if (diceResult.isDoubles) {
          doublesCount++
          totalStarsEarned += DOUBLES_BONUS.stars
          totalCoinsEarned += DOUBLES_BONUS.coins
          totalXP += DOUBLES_BONUS.xp
        }
        
        // Check if this roll would pass Start (position 0)
        // Calculate position after each individual roll in the sequence
        let runningPosition = gameState.position
        for (let j = 0; j < i; j++) {
          runningPosition = (runningPosition + rollResults[j].total) % BOARD_TILES.length
        }
        const newPosAfterThisRoll = (runningPosition + diceResult.total) % BOARD_TILES.length
        const crossedStart = runningPosition + diceResult.total >= BOARD_TILES.length
        
        if (crossedStart) {
          passedStartCount++
          totalCoinsEarned += 25 // Pass Start coin bonus (from COIN_EARNINGS.pass_start)
          totalStarsEarned += 200 // Pass Start star bonus
        }
        
        // Track challenge progress for rolling (each individual roll)
        updateChallengeProgress('roll', diceResult.total)
        
        // Only move on last roll
        if (i === multiplier - 1) {
          setTimeout(() => {
            debugGame('Final roll in sequence', { 
              totalMovement, 
              totalStarsEarned, 
              totalCoinsEarned,
              totalXP,
              doublesCount,
              passedStartCount,
              multiplier 
            })
            
            // ✅ BUG FIX #2: Apply multiplier to ALL accumulated rewards
            const finalStars = totalStarsEarned * multiplier
            const finalCoins = totalCoinsEarned * multiplier
            const finalXP = totalXP * multiplier
            
            debugGame('Multiplied rewards', { 
              finalStars, 
              finalCoins, 
              finalXP 
            })
            
            // Award all rewards with multiplier applied
            setGameState(prev => ({
              ...prev,
              stars: prev.stars + finalStars,
              xp: prev.xp + finalXP,
              totalDoubles: (prev.totalDoubles ?? 0) + doublesCount,
              doublesStreak: doublesCount > 0 ? (prev.doublesStreak ?? 0) + 1 : 0,
              rollHistory: [...(prev.rollHistory || []).slice(-9), ...rollResults],
              stats: {
                ...prev.stats,
                totalRolls: prev.stats.totalRolls + multiplier // Count each individual roll
              }
            }))
            
            // Award coins (already multiplied)
            if (finalCoins > 0) {
              addCoins(finalCoins, `${multiplier}x Roll Rewards`)
            }
            
            // Play sound based on outcome
            if (doublesCount > 0) {
              playSound('achievement')
            } else {
              playSound('dice-land')
            }
            
            // Show summary toast
            const description = [
              `Moved ${totalMovement} tiles`,
              finalStars > 0 ? `+${finalStars} ⭐` : null,
              finalCoins > 0 ? `+${finalCoins} 🪙` : null,
              finalXP > 0 ? `+${finalXP} XP` : null,
              doublesCount > 0 ? `${doublesCount} doubles!` : null,
              passedStartCount > 0 ? `Passed Start ${passedStartCount}x` : null
            ].filter(Boolean).join(' | ')
            
            toast.success(
              multiplier > 1 ? `${multiplier}x Roll Complete!` : 'Roll Complete!',
              { description }
            )
            
            // Move player after brief delay
            setTimeout(() => {
              debugGame('Movement started', { totalMovement })
              setPhase('moving')
              const startPosition = gameState.position
              const tilesToHop: number[] = []

              for (let j = 1; j <= totalMovement; j++) {
                tilesToHop.push((startPosition + j) % BOARD_TILES.length)
              }

              // Check if player passes Start (position 0) - detect wrapping around the board
              const passedStart = startPosition + totalMovement > BOARD_TILES.length - 1 && tilesToHop[tilesToHop.length - 1] !== 0

              let currentHop = 0
              hopIntervalRef.current = setInterval(() => {
                if (currentHop < tilesToHop.length) {
                  // Capture position value before incrementing to avoid closure issues
                  const nextPosition = tilesToHop[currentHop]
                  setHoppingTiles([nextPosition])
                  setGameState((prev) => ({ ...prev, position: nextPosition }))
                  currentHop++
                } else {
                  if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
                  setHoppingTiles([])

                  landingTimeoutRef.current = setTimeout(() => {
                    const newPosition = tilesToHop[tilesToHop.length - 1]
                    debugGame('Landing on tile:', { position: newPosition, tile: BOARD_TILES[newPosition] })
                    setPhase('landed')
                    // Trigger landing event ONCE at final position only
                    handleTileLanding(newPosition, passedStart)
                  }, 200)
                }
              }, 200)
            }, 500)
          }, 800) // Dice roll animation duration
        }
      }, i * 600) // Stagger animations
    }
  }

  const handleReroll = () => {
    if (!canAffordCoins(COIN_COSTS.reroll_dice)) {
      return
    }
    
    if (spendCoins(COIN_COSTS.reroll_dice, 'Reroll dice')) {
      // Reroll the dice
      handleRoll()
    }
  }

  const handleSkipEvent = (): boolean => {
    if (!canAffordCoins(COIN_COSTS.skip_event)) {
      return false
    }
    
    return spendCoins(COIN_COSTS.skip_event, 'Skip event')
  }

  const handlePurchaseRolls = (pack: RollsPack) => {
    if (!canAffordCoins(pack.cost)) {
      toast.error('Insufficient coins!', {
        description: `You need ${pack.cost} coins but only have ${gameState.coins}`
      })
      playSound('error')
      return
    }
    
    // Spend coins
    if (spendCoins(pack.cost, `Purchase ${pack.rolls} rolls`)) {
      // Grant rolls (can exceed 50 from purchases)
      setRollsRemaining(prev => prev + pack.rolls)
      
      // Update stats
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          rollsPurchased: (prev.stats.rollsPurchased || 0) + pack.rolls,
          coinsSpentOnRolls: (prev.stats.coinsSpentOnRolls || 0) + pack.cost
        }
      }))
      
      // Success feedback
      toast.success(`+${pack.rolls} Rolls!`, {
        description: `Spent ${pack.cost} coins`
      })
      playSound('cash-register')
      
      // Close modal
      setOutOfRollsModalOpen(false)
    }
  }

  const handleTileLanding = (position: number, passedStart = false) => {
    setDiceResetKey((prev) => prev + 1)
    playSound('tile-land')

    const tile = BOARD_TILES[position]
    debugGame('handleTileLanding:', { position, tile, passedStart })

    // Track challenge progress for landing on tile
    updateChallengeProgress('land_on_tile', { position, tileType: tile.type })
    
    // Earn coins for landing on tile
    earnFromSource('land_on_tile')
    
    // Track corner landing
    const corners = [0, 6, 13, 19]
    if (corners.includes(position)) {
      updateChallengeProgress('land_on_corner', { position })
    }

    // NOTE: Pass Start bonuses are now handled in handleRoll with multiplier applied
    // This section is kept for backwards compatibility but won't trigger from normal rolls
    // Only used if handleTileLanding is called directly (not from handleRoll)

    if (tile.type === 'category' && tile.category) {
      debugGame('Category tile - showing stock card')
      const stock = getStockForCategory(tile.category)
      setCurrentStock(stock)

      setShowCentralStock(true)

      setTimeout(() => {
        const showThrifty = Math.random() > 0.6
        if (showThrifty) {
          debugGame('Opening Thrifty Path modal')
          setThriftyModalOpen(true)
        } else {
          debugGame('Opening Stock modal')
          setStockModalOpen(true)
        }
      }, 2000)
    } else if (tile.type === 'event') {
      debugGame('Event tile:', tile.title)
      if (tile.title === 'Quiz') {
        debugGame('Opening Thrifty Path modal for Quiz')
        setThriftyModalOpen(true)
      } else if (tile.title === 'Market Event') {
        debugGame('Opening Event modal')
        
        // Check if Market Shield is active
        if (hasPowerUp('market-shield')) {
          consumePowerUp('market-shield')
          toast.success('Market Shield Activated!', {
            description: '🛡️ Protected from market event',
          })
          playSound('button-click')
          setTimeout(() => {
            debugGame('Phase transition: landed -> idle (market shield blocked event)')
            setPhase('idle')
          }, 1000)
        } else {
          const event = getRandomMarketEvent()
          setCurrentEvent(event)
          setEventModalOpen(true)
        }
      } else {
        // Fallback for event tiles without specific handlers (Wildcard, "?", etc.)
        debugGame('Event tile without handler - showing generic message and returning to idle')
        toast.info(tile.title, {
          description: 'This feature is coming soon!',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (event fallback)')
          setPhase('idle')
        }, 1000)
      }
    } else if (tile.type === 'corner') {
      debugGame('Corner tile:', tile.title)
      if (tile.title === 'Start / ThriftyPath') {
        setGameState((prev) => ({
          ...prev,
          cash: prev.cash + 20000,
          netWorth: prev.netWorth + 20000,
        }))
        toast.success('Passed Start! Collected $20,000', {
          description: 'Keep building your portfolio',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (Start corner)')
          setPhase('idle')
        }, 1000)
      } else if (tile.title === 'Casino') {
        setShowCelebration(true)
        toast.info('🎰 Welcome to the Casino!', {
          description: 'Feeling lucky today?',
        })
        debugGame('Opening Casino modal')
        setTimeout(() => {
          setCasinoModalOpen(true)
        }, 1000)
      } else if (tile.title === 'Court of Capital') {
        toast.info('Court of Capital', {
          description: 'Feature coming soon',
        })
        // Transition back to idle after a short delay
        setTimeout(() => {
          debugGame('Phase transition: landed -> idle (Court corner)')
          setPhase('idle')
        }, 1000)
      } else if (tile.title === 'Bias Sanctuary') {
        debugGame('Opening Bias Sanctuary modal')
        const caseStudy = getRandomBiasCaseStudy()
        setCurrentCaseStudy(caseStudy)
        setBiasSanctuaryModalOpen(true)
      }
    }
  }

  const handleBuyStock = (multiplier: number) => {
    if (!currentStock) return

    const baseShares = 10
    const shares = Math.floor(baseShares * multiplier)
    let totalCost = currentStock.price * shares
    
    // Apply Portfolio Booster upgrade if owned (increases portfolio value by 10%)
    const hasPortfolioBooster = isPermanentOwned('portfolio-booster')

    if (gameState.cash < totalCost) {
      playSound('error')
      toast.error('Insufficient funds', {
        description: `You need $${totalCost.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
      })
      return
    }

    playSound('cash-register')
    
    // Track challenge progress for buying stock
    updateChallengeProgress('buy_stock', { ticker: currentStock.ticker, category: currentStock.category })
    
    setGameState((prev) => {
      const newCash = prev.cash - totalCost
      // Apply 10% boost to portfolio value if upgrade owned
      const portfolioValueIncrease = hasPortfolioBooster ? totalCost * 1.1 : totalCost
      const newPortfolioValue = prev.portfolioValue + portfolioValueIncrease
      const newNetWorth = newCash + newPortfolioValue

      return {
        ...prev,
        cash: newCash,
        portfolioValue: newPortfolioValue,
        netWorth: newNetWorth,
        holdings: [
          ...prev.holdings,
          {
            stock: currentStock,
            shares,
            totalCost,
          },
        ],
      }
    })

    toast.success(`Purchased ${shares} shares of ${currentStock.ticker}`, {
      description: `Total cost: $${totalCost.toLocaleString()}`,
    })

    debugGame('Stock purchased - closing modals and returning to idle')
    setStockModalOpen(false)
    setShowCentralStock(false)
    setCurrentStock(null)
    setTimeout(() => {
      debugGame('Phase transition: landed -> idle (after stock purchase)')
      setPhase('idle')
    }, 500)
  }

  const handleChooseChallenge = (challenge: typeof THRIFTY_CHALLENGES[0]) => {
    playSound('celebration')
    
    // Track challenge progress for thrifty path
    updateChallengeProgress('complete_thrifty')
    
    // Add Thrift Path XP for completing challenge
    addThriftPathXP('complete_thrifty_challenge')
    updateStats('totalChallengesCompleted')
    
    // Apply double reward card if active
    const hasDoubleReward = hasPowerUp('double-reward-card')
    let starsToAward = challenge.reward
    
    if (hasDoubleReward) {
      starsToAward *= 2
      consumePowerUp('double-reward-card')
      toast.info('Double Reward Card Applied! 2x Stars!', { duration: 2000 })
    }
    
    // Apply star multiplier upgrade if owned
    starsToAward = applyStarMultiplier(starsToAward)
    
    // Apply Thrift Path star multiplier if active
    if (thriftPathStatus.active) {
      starsToAward = Math.floor(starsToAward * thriftPathStatus.benefits.starMultiplier)
    }
    
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + starsToAward,
    }))

    toast.success(`Challenge accepted: ${challenge.title}`, {
      description: `Earned ${starsToAward} stars! ⭐`,
    })

    debugGame('Challenge chosen - checking if stock modal should open')
    setTimeout(() => {
      if (currentStock) {
        debugGame('Opening stock modal after challenge')
        setStockModalOpen(true)
      } else {
        debugGame('Phase transition: landed -> idle (after challenge, no stock)')
        setPhase('idle')
      }
    }, 500)
  }

  const handleBiasQuizComplete = (correct: number, total: number) => {
    const percentage = (correct / total) * 100
    const isPerfect = correct === total
    
    // Track challenge progress for quiz completion
    updateChallengeProgress('complete_quiz', { score: correct, total, isPerfect })
    
    let starsEarned = isPerfect ? 5 : correct >= total / 2 ? 3 : 1
    
    // Apply star multiplier upgrade if owned
    starsEarned = applyStarMultiplier(starsEarned)

    playSound('celebration')
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + starsEarned,
    }))

    toast.success(`Quiz complete: ${correct}/${total} correct`, {
      description: `Earned ${starsEarned} stars! ⭐ ${percentage >= 100 ? 'Perfect score!' : ''}`,
    })
  }

  const handleCasinoWin = (amount: number) => {
    // Track challenge progress for scratchcard win
    updateChallengeProgress('win_scratchcard')
    
    playSound('level-up')
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      netWorth: prev.netWorth + amount,
    }))
  }

  const netWorthChange = ((gameState.netWorth - 100000) / 100000) * 100

  return (
    <MobileGameLayout showBottomNav={true}>
      <div ref={containerRef} className="relative isolate min-h-screen bg-background p-8 overflow-hidden game-board">
        <LoadingScreen show={isLoading} />
        
        <div
          className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
          aria-hidden="true"
        />
        <Toaster position="top-center" />
        <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
        
        {/* Tutorial for first-time users */}
        {!isLoading && <TutorialTooltip />}
        
        {/* Event Banner - Shows active events at top */}
        <EventBanner
          events={activeEvents}
          onOpenCalendar={() => setEventCalendarOpen(true)}
        />

      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div
          ref={boardRef}
          className="relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px]"
        >
          <header className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <CenterCarousel
              gameState={gameState}
              netWorthChange={netWorthChange}
              onStarsClick={() => setHubModalOpen(true)}
              onPortfolioClick={() => setPortfolioModalOpen(true)}
            />
          </header>

          <CentralStockCard
            stock={currentStock}
            isVisible={showCentralStock}
            onClose={() => setShowCentralStock(false)}
          />

          {/* User Indicator - Top Left */}
          <div className="absolute top-4 left-4 z-40">
            <UserIndicator 
              saving={saving} 
              lastSaved={lastSavedTime} 
              currentTier={currentTier}
              stars={gameState.stars}
              coins={gameState.coins}
            />
          </div>

          {/* Challenge Tracker - Below User Indicator */}
          <div className="absolute top-20 left-4 z-40">
            <ChallengeTracker
              dailyChallenges={dailyChallenges}
              onOpenModal={() => setChallengesModalOpen(true)}
            />
          </div>

          {/* Thrift Path Status Widget - Below Challenge Tracker */}
          <div className="absolute top-44 left-4 z-40">
            <ThriftPathStatus
              status={thriftPathStatus}
              onClick={() => {
                // Could open a detailed Thrift Path info modal in the future
                toast.info('Thrift Path', {
                  description: `Your disciplined choices earn XP and unlock benefits!`
                })
              }}
            />
          </div>

          {/* Sound Controls - Top Right */}
          <div className="absolute top-4 right-4 z-40">
            <SoundControls />
          </div>

          {/* Shop Button - Bottom Left */}
          <div className="absolute bottom-8 left-8 z-40">
            <Button
              onClick={() => setShopModalOpen(true)}
              className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
              aria-label="Open Shop"
            >
              <ShoppingBag size={20} weight="bold" />
              Shop
            </Button>
          </div>

          {/* Pro Tools Button */}
          <div className="absolute bottom-8 right-8 z-40">
            <Button
              onClick={() => {
                const proToolsUrl = 'https://www.alphastocks.ai/?proTools=1'
                if (typeof window !== 'undefined') {
                  window.location.href = proToolsUrl
                  return
                }
                setProToolsOpen(true)
              }}
              className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold"
              aria-label="Open Pro Tools"
            >
              ProTools
            </Button>
          </div>

          <div data-tutorial="dice">
            <DiceHUD
              onRoll={handleRoll}
              lastRoll={lastRoll}
              phase={phase}
              rollsRemaining={rollsRemaining}
              nextResetTime={nextResetTime}
              boardRef={boardRef}
              resetPositionKey={diceResetKey}
              coins={gameState.coins}
              canAffordReroll={canAffordCoins(COIN_COSTS.reroll_dice)}
              onReroll={handleReroll}
              dice1={dice1}
              dice2={dice2}
              energyRolls={gameState.energyRolls ?? 10}
              lastEnergyCheck={gameState.lastEnergyCheck}
              rollHistory={gameState.rollHistory}
            />
          </div>

          <div className="absolute inset-8 pointer-events-none">
            <div className="relative w-full h-full">
              <div className="absolute bottom-0 left-0 right-0 flex gap-0 pointer-events-auto">
                {BOARD_TILES.slice(0, 8).map((tile, index) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="bottom"
                  />
                ))}
              </div>

              <div className="absolute top-[140px] bottom-[140px] right-0 flex flex-col-reverse gap-0 pointer-events-auto">
                {BOARD_TILES.slice(8, 13).map((tile) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="right"
                  />
                ))}
              </div>

              <div className="absolute top-0 left-0 right-0 flex flex-row-reverse gap-0 pointer-events-auto">
                {BOARD_TILES.slice(13, 22).map((tile, index) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="top"
                  />
                ))}
              </div>

              <div className="absolute top-[140px] bottom-[140px] left-0 flex flex-col gap-0 pointer-events-auto">
                {BOARD_TILES.slice(22).map((tile) => (
                  <Tile
                    key={tile.id}
                    tile={tile}
                    isActive={tile.id === gameState.position}
                    isHopping={hoppingTiles.includes(tile.id)}
                    isLanded={tile.id === gameState.position && phase === 'landed'}
                    onClick={() => {
                      if (phase === 'idle') {
                        handleTileLanding(tile.id)
                      }
                    }}
                    side="left"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HubModal
        open={hubModalOpen}
        onOpenChange={setHubModalOpen}
        gameState={gameState}
        onOpenChallenges={() => setChallengesModalOpen(true)}
        onOpenEventCalendar={() => setEventCalendarOpen(true)}
        onOpenNetWorthGallery={() => setNetWorthGalleryOpen(true)}
      />

      <StockModal
        open={stockModalOpen}
        onOpenChange={(open) => {
          debugGame('Stock modal open change:', open)
          setStockModalOpen(open)
          if (!open) {
            debugGame('Stock modal closed - cleaning up')
            setShowCentralStock(false)
            setCurrentStock(null)
            // Consume stock insight if it was active
            if (hasPowerUp('stock-insight')) {
              consumePowerUp('stock-insight')
            }
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (stock modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        stock={currentStock}
        onBuy={handleBuyStock}
        cash={gameState.cash}
        showInsights={hasPowerUp('stock-insight')}
      />

      <EventModal
        open={eventModalOpen}
        onOpenChange={(open) => {
          debugGame('Event modal open change:', open)
          setEventModalOpen(open)
          if (!open) {
            debugGame('Event modal closed')
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (event modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        eventText={currentEvent}
        coins={gameState.coins}
        canAffordSkip={canAffordCoins(COIN_COSTS.skip_event)}
        onSkip={handleSkipEvent}
      />

      <ThriftyPathModal
        open={thriftyModalOpen}
        onOpenChange={(open) => {
          debugGame('Thrifty modal open change:', open)
          setThriftyModalOpen(open)
          if (!open) {
            debugGame('Thrifty modal closed - checking if stock modal should open')
            if (currentStock) {
              setTimeout(() => {
                debugGame('Opening stock modal after Thrifty modal close')
                setStockModalOpen(true)
              }, 300)
            } else {
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (thrifty modal closed, no stock)')
                setPhase('idle')
              }, 300)
            }
          }
        }}
        challenges={THRIFTY_CHALLENGES}
        onChoose={handleChooseChallenge}
        thriftPathStatus={thriftPathStatus}
      />

      <PortfolioModal
        open={portfolioModalOpen}
        onOpenChange={setPortfolioModalOpen}
        gameState={gameState}
      />

      <ProToolsOverlay
        open={proToolsOpen}
        onOpenChange={setProToolsOpen}
        gameState={gameState}
      />

      <BiasSanctuaryModal
        open={biasSanctuaryModalOpen}
        onOpenChange={(open) => {
          debugGame('Bias Sanctuary modal open change:', open)
          setBiasSanctuaryModalOpen(open)
          if (!open) {
            debugGame('Bias Sanctuary modal closed')
            setCurrentCaseStudy(null)
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (bias sanctuary closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        caseStudy={currentCaseStudy}
        onComplete={handleBiasQuizComplete}
      />

      <CasinoModal
        open={casinoModalOpen}
        onOpenChange={(open) => {
          debugGame('Casino modal open change:', open)
          setCasinoModalOpen(open)
          if (!open) {
            debugGame('Casino modal closed')
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (casino modal closed)')
              setPhase('idle')
            }, 300)
          }
        }}
        onWin={handleCasinoWin}
        luckBoost={isPermanentOwned('casino-luck') ? 0.2 : 0}
      />

      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-muted-foreground">Loading...</div></div>}>
        <ShopModal
          open={shopModalOpen}
          onOpenChange={setShopModalOpen}
          gameState={gameState}
          onPurchase={purchaseItem}
          isPermanentOwned={isPermanentOwned}
          getItemQuantity={getItemQuantity}
          canAfford={canAfford}
          onEquipCosmetic={equipCosmetic}
          getFinalPrice={getFinalPrice}
          shopDiscount={shopDiscount}
        />

        <ChallengesModal
          open={challengesModalOpen}
          onOpenChange={setChallengesModalOpen}
          dailyChallenges={dailyChallenges}
          weeklyChallenges={weeklyChallenges}
        />

        <EventCalendar
          open={eventCalendarOpen}
          onOpenChange={setEventCalendarOpen}
          activeEvents={activeEvents}
          upcomingEvents={upcomingEvents}
        />
        
        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </Suspense>

      {/* Net Worth Gallery Modal */}
      <NetWorthGalleryModal
        open={netWorthGalleryOpen}
        onOpenChange={setNetWorthGalleryOpen}
        currentNetWorth={gameState.netWorth}
      />

      {/* Tier Up Celebration Modal */}
      {newTier && (
        <TierUpModal
          open={showTierUpModal}
          onOpenChange={setShowTierUpModal}
          tier={newTier}
        />
      )}

      {/* Out of Rolls Purchase Modal */}
      <OutOfRollsModal
        open={outOfRollsModalOpen}
        onOpenChange={setOutOfRollsModalOpen}
        currentCoins={gameState.coins}
        onPurchase={handlePurchaseRolls}
        nextResetTime={nextResetTime}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onNavigate={handleBottomNavigation}
        activeSection={activeSection}
        badges={{
          challenges: dailyChallenges?.filter(c => !c.completed).length || 0,
          shop: 0, // Could add new shop items count here
        }}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
    </MobileGameLayout>
  )
}

export default App
