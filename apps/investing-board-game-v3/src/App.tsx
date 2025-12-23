import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Buildings } from '@phosphor-icons/react'
import { Tile } from '@/components/Tile'
import { DiceHUD } from '@/components/DiceHUD'
import { HubModal } from '@/components/HubModal'
import { CentralStockCard } from '@/components/CentralStockCard'
import { StockModal } from '@/components/StockModal'
import { EventModal } from '@/components/EventModal'
import { ThriftyPathModal } from '@/components/ThriftyPathModal'
import { WildcardEventModal } from '@/components/WildcardEventModal'
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
import { BoardZoomControls } from '@/components/BoardZoomControls'
import { Board3DViewport } from '@/components/Board3DViewport'

// Mobile-first components
import { MobileGameLayout } from '@/components/MobileGameLayout'
import { BottomNav } from '@/components/BottomNav'
import { InstallPrompt } from '@/components/InstallPrompt'
import { LoadingScreen } from '@/components/LoadingScreen'
import { TutorialTooltip } from '@/components/TutorialTooltip'
import { BoardViewport } from '@/components/BoardViewport'
import { OverlayRenderer } from '@/components/OverlayRenderer'
import { UIModeOverlayBridge } from '@/components/UIModeOverlayBridge'

// Phone-optimized layout components
import { PhoneLayout } from '@/components/phone/PhoneLayout'

// Lazy load heavy modals for better performance
const ShopModal = lazy(() => import('@/components/ShopModal'))
const ChallengesModal = lazy(() => import('@/components/ChallengesModal'))
const EventCalendar = lazy(() => import('@/components/EventCalendar'))
const SettingsModal = lazy(() => import('@/components/SettingsModal'))
const CityBuilderModal = lazy(() => import('@/components/CityBuilderModal'))

// DevTools components (only in dev mode)
const TapTestOverlay = import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1' 
  ? lazy(() => import('@/devtools/TapTestOverlay').then(m => ({ default: m.TapTestOverlay })))
  : null

// DevTools event logging (only loads in dev mode)
let logEvent: ((type: string, payload?: Record<string, unknown> | string) => void) | undefined
if (import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1') {
  import('@/devtools/eventBus').then(module => {
    logEvent = module.logEvent
  })
}

import { GameState, Stock, BiasCaseStudy, WildcardEvent } from '@/lib/types'
import { RealMoneyRollsPack } from '@/components/OutOfRollsModal'
import {
  BOARD_TILES,
  getRandomMarketEvent,
  getRandomBiasCaseStudy,
  THRIFTY_CHALLENGES,
} from '@/lib/mockData'
import { getRandomWildcardEvent, CASH_PERCENTAGE_PENALTY } from '@/lib/wildcardEvents'
import { SHOP_ITEMS } from '@/lib/shopItems'
import {
  DAILY_ROLL_LIMIT,
  AUTO_SAVE_DEBOUNCE_MS,
  AUTO_SAVE_TIMEOUT_MS,
  getNextMidnight,
  ENERGY_MAX,
} from '@/lib/constants'
import { rollDice, DOUBLES_BONUS } from '@/lib/dice'
import { getResetRollsAmount, ENERGY_CONFIG } from '@/lib/energy'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { useGameSave } from '@/hooks/useGameSave'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/hooks/useSound'
import { useShopInventory } from '@/hooks/useShopInventory'
import { useChallenges } from '@/hooks/useChallenges'
import { useEvents } from '@/hooks/useEvents'
import { useHaptics } from '@/hooks/useHaptics'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useGestureArbitration } from '@/hooks/useGestureArbitration'
import { useNetWorthTier } from '@/hooks/useNetWorthTier'
import { useCoins } from '@/hooks/useCoins'
import { useThriftPath } from '@/hooks/useThriftPath'
import { useCityBuilder } from '@/hooks/useCityBuilder'
import { useBoardZoom } from '@/hooks/useBoardZoom'
import { useBoardCamera } from '@/hooks/useBoardCamera'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useOverlayManager } from '@/hooks/useOverlayManager'
import { useUIMode } from '@/hooks/useUIMode'
import { useLayoutMode } from '@/hooks/useLayoutMode'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { ThriftPathStatus as ThriftPathStatusType } from '@/lib/thriftPath'
import { COIN_COSTS, COIN_EARNINGS } from '@/lib/coins'
import { getInitialCityBuilderState, CITIES, CityBuilderState } from '@/lib/cityBuilder'
import { calculateXPForLevel } from '@/lib/progression'
import type { UIMode, GamePhase } from '@/lib/uiModeStateMachine'

// Alias for backward compatibility
type Phase = GamePhase

// Debug helper function - logs only when DEBUG_GAME is enabled in localStorage
const debugGame = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && localStorage.getItem('DEBUG_GAME') === 'true') {
    console.log('[DEBUG]', ...args)
  }
}

// Constants
const LOGO_PANEL_INDEX = 3  // 4th panel (0-indexed)
const BOARD_CONTAINER_BASE_CLASSES = "relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px] transition-opacity duration-700"

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const stockSourceAnnounced = useRef<'supabase' | 'mock' | null>(null)
  const gameLoadedFromSave = useRef(false)
  const lastSaveTimeRef = useRef<Date | null>(null)
  const lastSyncedCoinsRef = useRef<number>(0)
  const lastSyncedThriftPathRef = useRef<string | null>(null)
  const lastEnergyCheckRef = useRef<Date | null>(null)
  const processedPowerUpsRef = useRef<Set<string>>(new Set())

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
    },
    cityLevel: 1, // City level for backward compatibility (defaults to first city)
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
  
  // Auto-roll state for Monopoly GO style continuous rolling
  const [isAutoRolling, setIsAutoRolling] = useState(false)

  // Overlay manager for coordinated modal display
  const { show: showOverlay, wasRecentlyShown, getCurrentOverlay } = useOverlayManager()

  // UI Mode management - centralizes "what view/mode are we in?"
  const { 
    mode: uiMode, 
    transitionTo: transitionUIMode,
    setPhase: setUIPhase,
    setCanTransition,
    phase: uiPhase,
  } = useUIMode()

  // Layout mode detection for responsive design
  const { isPhone, isTablet, isDesktop } = useLayoutMode()

  // Notification preferences for phone layout
  const { enabled: notificationsEnabled } = useNotificationPreferences()

  // Keep state for data that modals need (but not open/closed state)
  const [currentStock, setCurrentStock] = useState<Stock | null>(null)
  const [showCentralStock, setShowCentralStock] = useState(false)
  const [currentEvent, setCurrentEvent] = useState('')
  const [currentCaseStudy, setCurrentCaseStudy] = useState<BiasCaseStudy | null>(null)
  const [currentWildcardEvent, setCurrentWildcardEvent] = useState<WildcardEvent | null>(null)

  // ProTools overlay state (separate from overlay manager)
  const [proToolsOpen, setProToolsOpen] = useState(false)

  // Mobile UI states
  const [activeSection, setActiveSection] = useState<'home' | 'challenges' | 'shop' | 'leaderboard' | 'settings'>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Safe area insets
  const safeArea = useSafeArea()

  // Board zoom hook for mobile (classic mode)
  const {
    zoom,
    zoomLimits,
    isPanning,
    autoFollow,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    toggleAutoFollow,
    centerOnPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useBoardZoom({
    isMobile,
    currentPosition: gameState.position,
    boardSize: { width: 1200, height: 1200 },
    safeArea,
  })
  
  // 3D Camera system for immersive mode (mobile only)
  const {
    camera,
    setMode: setCameraMode,
    centerOnTile,
    animateAlongPath,
    zoomOutTemporarily,
    resetCamera,
    boardStyle: camera3DStyle,
    containerStyle: camera3DContainerStyle,
    tilePositions,
  } = useBoardCamera({
    isMobile,
    currentPosition: gameState.position,
    boardSize: { width: 1200, height: 1200 },
  })

  // Carousel panel state
  const [currentCarouselPanel, setCurrentCarouselPanel] = useState(0)
  const isLogoPanel = currentCarouselPanel === LOGO_PANEL_INDEX

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
  const { lightTap, heavyTap, success: hapticSuccess } = useHaptics()

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

  // City Builder hook (Monopoly Go style)
  const {
    cityBuilderState,
    setCityBuilderState,
    currentCity,
    currentCityProgress,
    unlockedCities,
    allCities,
    upgradeBuilding,
    unlockNextCity,
    claimCityReward,
    selectCity,
    canUpgrade: canUpgradeBuilding,
    timeUntilNextUpgrade,
    totalBuildingsCompleted,
    totalCitiesCompleted,
    totalCitiesUnlocked,
    nextCityToUnlock,
    canUnlockNext,
  } = useCityBuilder({
    initialState: gameState.cityBuilder,
    stars: gameState.stars,
    onSpendStars: (amount, reason) => {
      if (gameState.stars < amount) return false
      setGameState(prev => ({ ...prev, stars: prev.stars - amount }))
      return true
    },
    onEarnCoins: (amount, source) => {
      addCoins(amount, source)
    },
    onEarnStars: (amount, source) => {
      setGameState(prev => ({ ...prev, stars: prev.stars + amount }))
      toast.success(`+${amount} ⭐`, { description: source })
    },
  })

  // Sync cityBuilderState to gameState - use ref to prevent infinite loops
  const lastSyncedCityBuilderRef = useRef<CityBuilderState | null>(null)
  useEffect(() => {
    // Skip if we've already synced this exact state reference
    if (lastSyncedCityBuilderRef.current === cityBuilderState) {
      return
    }
    
    let shouldUpdate = false
    
    setGameState(prev => {
      // Compare stringified versions only if needed to detect actual changes
      const prevCityBuilderJson = JSON.stringify(prev.cityBuilder)
      const newCityBuilderJson = JSON.stringify(cityBuilderState)
      
      // Only update if the state has actually changed
      if (prevCityBuilderJson === newCityBuilderJson) {
        return prev
      }
      
      shouldUpdate = true
      
      return {
        ...prev,
        cityBuilder: cityBuilderState,
      }
    })
    
    // Only mark as synced if we actually updated the state
    if (shouldUpdate) {
      lastSyncedCityBuilderRef.current = cityBuilderState
    }
  }, [cityBuilderState])

  // Gesture arbitration hook - Priority: pinch > swipe > pan > tap
  // This replaces the simple swipe gesture hook with a more sophisticated system
  const containerRef = useRef<HTMLDivElement>(null)
  const boardContainerRef = useRef<HTMLDivElement>(null)
  
  // Use gesture arbitration for the main game board area
  useGestureArbitration(boardContainerRef, {
    enabled: isMobile,
    onPinch: (scale, centerX, centerY) => {
      // Pinch zoom on board (highest priority)
      if (camera.mode === 'classic') {
        // In classic mode, pinch zoom should adjust the zoom level
        // This would integrate with the existing zoom system
        debugGame('Pinch detected:', { scale, centerX, centerY })
      }
    },
    onSwipe: (direction, velocity) => {
      // Swipes for navigation (second priority)
      // Note: Shop and challenges are now managed by overlay manager
      // These swipe gestures may need to be redesigned
      debugGame('Swipe detected:', { direction, velocity })
    },
    onPan: (deltaX, deltaY) => {
      // Panning the board (third priority)
      if (camera.mode === 'classic' && !isPanning) {
        // Pan gesture would be handled by the existing touch handlers
        debugGame('Pan detected:', { deltaX, deltaY })
      }
    },
    onTap: (x, y) => {
      // Tap interactions (lowest priority)
      debugGame('Tap detected:', { x, y })
    },
  })
  
  // Fallback: Keep the old swipe gesture for the main container
  // This handles swipes outside the board area
  // Note: Disabled for now since modals are managed by overlay manager
  useSwipeGesture(containerRef, (direction) => {
    // Swipe gestures for showing/hiding modals disabled
    // These will need to be redesigned with overlay manager
    debugGame('Swipe detected (main container):', { direction })
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

  // Mobile shop purchase handler (uses cash instead of stars)
  const handleMobileShopPurchase = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return false

    // Check if can afford with cash
    if (gameState.cash < item.price) {
      toast.error('Not enough cash', {
        description: `You need $${item.price.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
      })
      return false
    }

    // Deduct cash and apply effect
    setGameState((prev) => {
      const newState = {
        ...prev,
        cash: prev.cash - item.price,
      }

      // Apply item effect based on type
      switch (item.effect.type) {
        case 'dice':
          // Add dice rolls - this is done via setRollsRemaining
          toast.success('Dice purchased!', {
            description: `+${item.effect.value} dice rolls added`,
          })
          break
        
        case 'multiplier':
          // Add multiplier buff (would need to be implemented in game logic)
          toast.success('Power-up purchased!', {
            description: item.name + ' activated',
          })
          break
        
        case 'shield':
          // Add shield (would need to be implemented in game logic)
          toast.success('Shield purchased!', {
            description: 'Protection activated',
          })
          break
        
        case 'move':
          // Add immediate move (would need to be implemented in game logic)
          toast.success('Jump purchased!', {
            description: `Move forward ${item.effect.value} spaces`,
          })
          break
        
        case 'cosmetic':
          // Apply cosmetic (would need to be implemented in game logic)
          toast.success('Cosmetic purchased!', {
            description: item.name + ' unlocked',
          })
          break
      }

      return newState
    })

    // Handle dice rolls separately as it's in a different state
    if (item.effect.type === 'dice') {
      setRollsRemaining(prev => prev + (item.effect.value as number))
    }

    playSound('cash-register')
    return true
  }, [gameState.cash, setGameState, setRollsRemaining, playSound])

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
    // Only sync if coins actually changed from external source
    if (coins !== lastSyncedCoinsRef.current) {
      lastSyncedCoinsRef.current = coins
      setGameState(prev => {
        if (prev.coins === coins) return prev  // No change needed
        return { ...prev, coins }
      })
    }
  }, [coins])

  // Sync thriftPath state to gameState
  useEffect(() => {
    const serialized = JSON.stringify(thriftPathStatus)
    if (serialized === lastSyncedThriftPathRef.current) return
    lastSyncedThriftPathRef.current = serialized
    
    setGameState(prev => ({
      ...prev,
      thriftPath: {
        ...thriftPathStatus,
        activatedAt: thriftPathStatus.activatedAt?.toISOString() ?? null,
        lastActivityDate: thriftPathStatus.lastActivityDate?.toISOString() ?? null
      }
    }))
  }, [thriftPathStatus])

  // Check daily streak on component mount
  useEffect(() => {
    checkDailyStreak()
  }, [checkDailyStreak])

  // Handle tier up modal via overlay manager
  useEffect(() => {
    if (showTierUpModal && newTier) {
      showOverlay({
        id: 'tierUp',
        component: TierUpModal,
        props: {
          tier: newTier,
        },
        priority: 'critical', // Tier up is important!
        autoClose: 4000,
        onClose: () => {
          setShowTierUpModal(false)
        }
      })
    }
  }, [showTierUpModal, newTier, showOverlay, setShowTierUpModal])

  // Loading screen on initial mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Bottom navigation handler
  const handleBottomNavigation = (section: 'challenges' | 'shop' | 'home' | 'leaderboard' | 'settings') => {
    lightTap()
    setActiveSection(section)
    
    // Map section to UI mode
    const modeMap: Record<typeof section, UIMode> = {
      'home': 'board',
      'challenges': 'challenges',
      'shop': 'shop',
      'leaderboard': 'leaderboard',
      'settings': 'settings',
    }
    
    const targetMode = modeMap[section]
    
    // Transition to the target mode
    transitionUIMode(targetMode).then(success => {
      if (!success) {
        console.error(`Failed to transition to ${targetMode} mode`)
        return
      }
      
      // Note: closeAll is not exposed yet, so we'll just open the new overlay
      // The overlay manager will coordinate displays
      
      // Open corresponding modal based on section
      if (section === 'challenges') {
        logEvent?.('modal_opened', { modal: 'challenges' })
        showOverlay({
          id: 'challenges',
          component: lazy(() => import('@/components/ChallengesModal')),
          props: {
            dailyChallenges,
            weeklyChallenges,
          },
          priority: 'normal',
          onClose: () => {
            logEvent?.('modal_closed', { modal: 'challenges' })
            // Return to board mode when closing
            transitionUIMode('board')
          }
        })
      } else if (section === 'shop') {
        logEvent?.('modal_opened', { modal: 'shop' })
        showOverlay({
          id: 'shop',
          component: lazy(() => import('@/components/ShopModal')),
          props: {
            gameState,
            onPurchase: purchaseItem,
            isPermanentOwned,
            getItemQuantity,
            canAfford,
            onEquipCosmetic: equipCosmetic,
            getFinalPrice,
            shopDiscount,
          },
          priority: 'normal',
          onClose: () => {
            logEvent?.('modal_closed', { modal: 'shop' })
            // Return to board mode when closing
            transitionUIMode('board')
          }
        })
      } else if (section === 'leaderboard') {
        // Open leaderboard
        showOverlay({
          id: 'leaderboard',
          component: lazy(() => import('@/components/LeaderboardModal')),
          props: {
            currentPlayer: {
              netWorth: gameState.netWorth,
              level: gameState.level,
            }
          },
          priority: 'normal',
          onClose: () => {
            // Return to board mode when closing
            transitionUIMode('board')
          }
        })
      } else if (section === 'settings') {
        logEvent?.('modal_opened', { modal: 'settings' })
        showOverlay({
          id: 'settings',
          component: lazy(() => import('@/components/SettingsModal')),
          props: {},
          priority: 'normal',
          onClose: () => {
            logEvent?.('modal_closed', { modal: 'settings' })
            // Return to board mode when closing
            transitionUIMode('board')
          }
        })
      } else if (section === 'home') {
        // Just close all modals - overlay manager will handle this
      }
    })
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

  // Conditional toast wrapper - only shows toasts if notifications are enabled on phone
  const showToast = useCallback((
    type: 'success' | 'error' | 'info',
    message: string,
    options?: Parameters<typeof toast.success>[1]
  ) => {
    // On phone, respect notification preferences
    if (isPhone && !notificationsEnabled) {
      return;
    }
    
    // Show the toast
    switch (type) {
      case 'success':
        return toast.success(message, options);
      case 'error':
        return toast.error(message, options);
      case 'info':
        return toast.info(message, options);
    }
  }, [isPhone, notificationsEnabled]);

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
      // Ensure cityLevel has a default value when loading saved state
      const loadedState = {
        ...savedGameState,
        cityLevel: savedGameState.cityLevel ?? 1, // Default to 1 if not present
      }
      setGameState(loadedState)
      // Initialize rollsRemaining from energyRolls in savedGameState
      setRollsRemaining(savedGameState.energyRolls ?? DAILY_ROLL_LIMIT)
      // Initialize energy check ref
      lastEnergyCheckRef.current = savedGameState.lastEnergyCheck ? new Date(savedGameState.lastEnergyCheck) : new Date()
      // Initialize coins ref
      lastSyncedCoinsRef.current = savedGameState.coins ?? 100
      gameLoadedFromSave.current = true
      toast.success('Welcome back!', {
        description: 'Your game progress has been restored.',
      })
    }
  }, [savedGameState, saveLoading, authLoading, isAuthenticated])

  // Load saved rolls when available (sync with energyRolls if already loaded)
  useEffect(() => {
    if (saveLoading || authLoading || !savedRolls || gameLoadedFromSave.current) return
    
    const now = new Date()
    if (now >= savedRolls.resetAt) {
      // Rolls have expired, reset them
      const effectiveLimit = getEffectiveDailyRollLimit()
      setRollsRemaining(effectiveLimit)
      setGameState(prev => ({
        ...prev,
        energyRolls: effectiveLimit
      }))
      setNextResetTime(getNextMidnight())
    } else {
      setRollsRemaining(savedRolls.remaining)
      setGameState(prev => ({
        ...prev,
        energyRolls: savedRolls.remaining
      }))
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
        setGameState(prev => ({
          ...prev,
          energyRolls: effectiveLimit
        }))
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
    // Check if there are no active overlays
    const hasActiveOverlay = getCurrentOverlay() !== null || showCentralStock

    if (phase === 'landed' && !hasActiveOverlay) {
      debugGame('Phase transition: landed -> idle (no active overlays)')
      setPhase('idle')
    }
  }, [getCurrentOverlay, showCentralStock, phase])

  // Sync local phase state with UI mode context
  useEffect(() => {
    if (uiMode === 'board') {
      setUIPhase(phase)
    }
  }, [phase, uiMode, setUIPhase])

  // Helper function to check extra dice roll power-up
  useEffect(() => {
    // Check if we have the power-up and haven't processed it yet
    const hasPowerUpActive = gameState.activeEffects.some(
      effect => effect.itemId === 'extra-dice-rolls' && effect.activated
    )
    
    if (hasPowerUpActive && !processedPowerUpsRef.current.has('extra-dice-rolls')) {
      processedPowerUpsRef.current.add('extra-dice-rolls')
      
      setRollsRemaining(prev => prev + 3)
      setGameState(prev => ({
        ...prev,
        energyRolls: Math.min((prev.energyRolls ?? DAILY_ROLL_LIMIT) + 3, ENERGY_MAX),
        activeEffects: prev.activeEffects.filter(effect => effect.itemId !== 'extra-dice-rolls')
      }))
      
      toast.success('Extra Dice Rolls Activated!', {
        description: '+3 rolls added',
      })
    }
    
    // Clean up processed power-ups when they're no longer in activeEffects
    if (!hasPowerUpActive) {
      processedPowerUpsRef.current.delete('extra-dice-rolls')
    }
  }, [gameState.activeEffects])  // Only depend on activeEffects, not callbacks
  
  // Update camera state in DevTools
  useEffect(() => {
    if (import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1') {
      import('@/devtools/eventBus').then(module => {
        module.eventBus.setCameraState(camera)
      })
    }
  }, [camera])

  // Energy regeneration system - Reset 30 dice every 2 hours
  useEffect(() => {
    // Don't run during initial load or auth loading
    if (authLoading || saveLoading || !gameLoadedFromSave.current) return
    
    const checkEnergyReset = () => {
      const currentCheck = lastEnergyCheckRef.current
      if (!currentCheck) {
        const now = new Date()
        lastEnergyCheckRef.current = now
        setGameState(prev => ({
          ...prev,
          lastEnergyCheck: now
        }))
        return
      }
      
      // Check if 2 hours have passed since last reset
      const resetAmount = getResetRollsAmount(currentCheck)
      
      if (resetAmount !== null) {
        // Reset to 30 dice (capped at MAX_ROLLS)
        const newEnergy = Math.min(resetAmount, ENERGY_MAX)
        const now = new Date()
        lastEnergyCheckRef.current = now
        
        setGameState(prev => ({
          ...prev,
          energyRolls: newEnergy,
          lastEnergyCheck: now
        }))
        
        setRollsRemaining(newEnergy)
        
        debugGame('Dice reset!', { newEnergy })
        
        toast.success(`🎲 Dice Reset!`, {
          description: `You now have ${newEnergy} dice rolls! Resets every 2 hours.`
        })
      }
    }
    
    // Check immediately when ready
    checkEnergyReset()
    
    // Check every minute
    const interval = setInterval(checkEnergyReset, 60000)
    
    return () => clearInterval(interval)
  }, [authLoading, saveLoading])  // Remove gameState dependencies!

  // Auto-roll effect - Monopoly GO style
  useEffect(() => {
    if (!isAutoRolling) return;
    
    const interval = setInterval(() => {
      // Only roll if we have rolls remaining, not currently rolling, and no modal is open
      const hasActiveOverlay = getCurrentOverlay() !== null || showCentralStock;
      
      if (rollsRemaining > 0 && phase === 'idle' && !hasActiveOverlay) {
        // Call handleRoll with default multiplier
        handleRoll(1);
      } else if (rollsRemaining === 0) {
        setIsAutoRolling(false);  // Stop when out of dice
      }
    }, 3000);  // Roll every 3 seconds
    
    return () => clearInterval(interval);
    // Note: handleRoll is intentionally not in deps to avoid re-creating interval
    // The function uses current state via closures which is acceptable here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoRolling, rollsRemaining, phase, getCurrentOverlay, showCentralStock]);

  const toggleAutoRoll = useCallback(() => {
    setIsAutoRolling(prev => !prev);
    if (navigator.vibrate) navigator.vibrate(100);
  }, []);

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
      showOverlay({
        id: 'outOfRolls',
        component: OutOfRollsModal,
        props: {
          onPurchase: handlePurchaseRolls,
          lastEnergyCheck: gameState.lastEnergyCheck,
        },
        priority: 'high',
      })
      playSound('error')
      return
    }

    if (rollsRemaining < multiplier) {
      debugGame('Not enough rolls:', { rollsRemaining, needed: multiplier })
      playSound('error')
      toast.error(`Need ${multiplier} rolls`, {
        description: `You only have ${rollsRemaining} roll${rollsRemaining !== 1 ? 's' : ''} remaining.`,
      })
      showOverlay({
        id: 'outOfRolls',
        component: OutOfRollsModal,
        props: {
          onPurchase: handlePurchaseRolls,
          lastEnergyCheck: gameState.lastEnergyCheck,
        },
        priority: 'high',
      })
      return
    }

    // clear any lingering timers from a previous roll to keep movement predictable
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)

    // ✅ BUG FIX #1: Consume rolls IMMEDIATELY before processing
    // Synchronize both rollsRemaining and gameState.energyRolls
    setRollsRemaining((prev) => prev - multiplier)
    setGameState(prev => ({
      ...prev,
      energyRolls: Math.max(0, (prev.energyRolls ?? DAILY_ROLL_LIMIT) - multiplier)
    }))

    // DevTools: Log roll event
    logEvent?.('roll_pressed', { multiplier, rollsRemaining })

    // Haptic feedback for rolling
    heavyTap()  // Strong haptic on roll
    
    // Block UI mode transitions during dice roll
    setCanTransition(false)
    
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
        const rollCoins = COIN_EARNINGS.dice_roll // Import from coins.ts
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
        // Use accumulated totalMovement to track position efficiently
        const positionBeforeThisRoll = (gameState.position + (totalMovement - diceResult.total)) % BOARD_TILES.length
        const crossedStart = positionBeforeThisRoll + diceResult.total >= BOARD_TILES.length
        
        if (crossedStart) {
          passedStartCount++
          totalCoinsEarned += COIN_EARNINGS.pass_start
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
                totalRolls: prev.stats.totalRolls + rollResults.length // Count actual dice rolls performed
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
              const startPosition = gameState.position
              debugGame('Movement started', { totalMovement })
              logEvent?.('move_started', { totalMovement, startPosition })
              setPhase('moving')
              const tilesToHop: number[] = []

              for (let j = 1; j <= totalMovement; j++) {
                tilesToHop.push((startPosition + j) % BOARD_TILES.length)
              }

              // Check if player passes Start (position 0) - detect wrapping around the board
              const passedStart = startPosition + totalMovement > BOARD_TILES.length - 1 && tilesToHop[tilesToHop.length - 1] !== 0
              
              // Animate camera in immersive mode (mobile only)
              if (isMobile && camera.mode === 'immersive') {
                // Start camera animation along the path
                animateAlongPath(tilesToHop, () => {
                  debugGame('Camera animation completed')
                })
              }

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
                    logEvent?.('move_ended', { newPosition, totalMovement })
                    setPhase('landed')
                    // Re-enable UI mode transitions after landing
                    setCanTransition(true)
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

  const handlePurchaseRolls = (pack: RealMoneyRollsPack) => {
    // This is a placeholder for real money purchases
    // In production, this would integrate with Stripe or another payment provider
    
    // For now, show a placeholder message
    toast.info(`Purchase: ${pack.rolls} Dice Rolls for ${pack.priceKr} kr`, {
      description: 'Payment integration coming soon! For now, enjoy the game with free resets every 2 hours.'
    })
    
    // Modal will close automatically via overlay manager's onOpenChange
  }

  const handleTileLanding = (position: number, passedStart = false) => {
    setDiceResetKey((prev) => prev + 1)
    playSound('tile-land')

    const tile = BOARD_TILES[position]
    debugGame('handleTileLanding:', { position, tile, passedStart })

    // Haptic feedback on tile landing
    lightTap()

    // DevTools: Log tile landed event
    logEvent?.('tile_landed', { position, tileType: tile.type, passedStart })

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
        debugGame('Opening Stock modal')
        logEvent?.('modal_opened', { modal: 'stock' })
        showOverlay({
          id: 'stock',
          component: StockModal,
          props: {
            stock: stock,
            onBuy: handleBuyStock,
            cash: gameState.cash,
            showInsights: hasPowerUp('stock-insight'),
          },
          priority: 'normal',
          onClose: () => {
            logEvent?.('modal_closed', { modal: 'stock' })
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
        })
      }, 2000)
    } else if (tile.type === 'event') {
      debugGame('Event tile:', tile.title)
      if (tile.title === 'Thrift Path') {
        debugGame('Opening Thrift Path modal for dedicated Thrift Path tile')
        showOverlay({
          id: 'thriftyPath',
          component: ThriftyPathModal,
          props: {
            challenges: THRIFTY_CHALLENGES,
            onChoose: handleChooseChallenge,
            thriftPathStatus,
          },
          priority: 'normal',
          onClose: () => {
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (thrifty modal closed)')
              setPhase('idle')
            }, 300)
          }
        })
      } else if (tile.title === '?') {
        debugGame('Opening Wildcard Event modal')
        const wildcardEvent = getRandomWildcardEvent()
        setCurrentWildcardEvent(wildcardEvent)
        showOverlay({
          id: 'wildcardEvent',
          component: WildcardEventModal,
          props: {
            event: wildcardEvent,
            onContinue: handleWildcardEvent,
          },
          priority: 'normal',
          onClose: () => {
            debugGame('Wildcard event modal closed')
          }
        })
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
          showOverlay({
            id: 'event',
            component: EventModal,
            props: {
              eventText: event,
              coins: gameState.coins,
              canAffordSkip: canAffordCoins(COIN_COSTS.skip_event),
              onSkip: handleSkipEvent,
            },
            priority: 'normal',
            onClose: () => {
              debugGame('Event modal closed')
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (event modal closed)')
                setPhase('idle')
              }, 300)
            }
          })
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
          showOverlay({
            id: 'casino',
            component: CasinoModal,
            props: {
              onWin: handleCasinoWin,
              luckBoost: isPermanentOwned('casino-luck') ? 0.2 : 0,
            },
            priority: 'normal',
            onClose: () => {
              debugGame('Casino modal closed')
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (casino modal closed)')
                setPhase('idle')
              }, 300)
            }
          })
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
        showOverlay({
          id: 'biasSanctuary',
          component: BiasSanctuaryModal,
          props: {
            caseStudy,
            onComplete: handleBiasQuizComplete,
          },
          priority: 'normal',
          onClose: () => {
            debugGame('Bias Sanctuary modal closed')
            setCurrentCaseStudy(null)
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (bias sanctuary closed)')
              setPhase('idle')
            }, 300)
          }
        })
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
    hapticSuccess()  // Success haptic on purchase
    
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
    // Modal will close automatically via overlay manager's onOpenChange
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

  const handleWildcardEvent = (event: WildcardEvent) => {
    debugGame('Applying wildcard event:', event.id)
    playSound('button-click')
    
    setGameState((prev) => {
      let newCash = prev.cash
      let newStars = prev.stars
      let newPosition = prev.position
      
      // Apply cash effect
      if (event.effect.cash !== undefined) {
        if (event.effect.cash === CASH_PERCENTAGE_PENALTY) {
          // Special case: percentage-based penalty (10% of current cash)
          const penalty = Math.floor(prev.cash * Math.abs(CASH_PERCENTAGE_PENALTY))
          newCash = prev.cash - penalty
          toast.error(`${event.title}`, {
            description: `Lost $${penalty.toLocaleString()} (10% of cash)`,
          })
        } else if (event.effect.cash > 0) {
          newCash = prev.cash + event.effect.cash
          toast.success(`${event.title}`, {
            description: `Gained $${event.effect.cash.toLocaleString()}!`,
          })
        } else {
          newCash = Math.max(0, prev.cash + event.effect.cash)
          toast.error(`${event.title}`, {
            description: `Lost $${Math.abs(event.effect.cash).toLocaleString()}`,
          })
        }
      }
      
      // Apply stars effect
      if (event.effect.stars !== undefined) {
        if (event.effect.stars > 0) {
          newStars = prev.stars + event.effect.stars
          toast.success(`${event.title}`, {
            description: `Gained ${event.effect.stars} stars! ⭐`,
          })
        } else {
          newStars = Math.max(0, prev.stars + event.effect.stars)
          toast.error(`${event.title}`, {
            description: `Lost ${Math.abs(event.effect.stars)} stars`,
          })
        }
      }
      
      // Apply teleport effect
      if (event.effect.teleportTo !== undefined) {
        newPosition = event.effect.teleportTo
        const targetTile = BOARD_TILES.find(t => t.id === event.effect.teleportTo)
        toast.info(`${event.title}`, {
          description: `Teleported to ${targetTile?.title || 'tile ' + event.effect.teleportTo}!`,
        })
      }
      
      return {
        ...prev,
        cash: newCash,
        stars: newStars,
        position: newPosition,
        netWorth: prev.netWorth + (newCash - prev.cash),
      }
    })
    
    // Transition back to idle after a short delay
    setTimeout(() => {
      debugGame('Phase transition: landed -> idle (wildcard event completed)')
      setPhase('idle')
    }, 1000)
  }

  const netWorthChange = ((gameState.netWorth - 100000) / 100000) * 100

  // Board center classes - fade background on logo panel
  const boardCenterClasses = [
    'relative bg-gradient-to-br from-white/15 via-white/8 to-white/12',
    'backdrop-blur-2xl rounded-2xl border border-white/25',
    'shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)]',
    'p-8 min-h-[900px] transition-all duration-700',
    isLogoPanel ? 'bg-opacity-0 backdrop-blur-none' : ''
  ].filter(Boolean).join(' ')

  // Calculate XP for next level for phone HUD
  const xpForNextLevel = gameState.level < 100 
    ? (() => {
        const currentLevelXP = calculateXPForLevel(gameState.level)
        const nextLevelXP = calculateXPForLevel(gameState.level + 1)
        return nextLevelXP - currentLevelXP
      })()
    : 1000

  // Main content that will be wrapped by layout
  const mainContent = (
    <div 
      ref={containerRef} 
      className={`relative isolate game-board ${isPhone ? 'h-full w-full p-0' : 'min-h-screen bg-background p-8 overflow-hidden'}`}
    >
      <LoadingScreen show={isLoading} />
        
        {/* Background - only show if not in phone layout (phone layout has its own) */}
        {!isPhone && (
          <div
            className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
            aria-hidden="true"
          />
        )}
        
        {/* Toaster - positioned outside transformed containers with high z-index for phone */}
        <Toaster 
          position="top-center"
          style={{
            // For phone layout, ensure toasts appear above everything and not affected by transforms
            ...(isPhone ? { 
              zIndex: 9999,
              position: 'fixed',
              top: '60px', // Below CompactHUD
            } : {})
          }}
        />
        
        <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
        
        {/* Tutorial for first-time users */}
        {!isLoading && <TutorialTooltip />}
        
        {/* Event Banner - Shows active events at top */}
        {!isPhone && (
          <EventBanner
            events={activeEvents}
            onOpenCalendar={() => setEventCalendarOpen(true)}
          />
        )}

      {/* Layout wrapper - Three column layout for non-phone, regular for phone */}
      <div className={`relative z-10 ${!isPhone ? 'flex items-center justify-center gap-8 h-[calc(100vh-2rem)] max-w-full px-4' : 'max-w-[1600px] mx-auto'}`} ref={boardContainerRef}>
        {/* Left Column - Action buttons (desktop/tablet only) */}
        {!isPhone && (
          <div className={`flex flex-col gap-4 items-center justify-center transition-opacity duration-500 flex-shrink-0 ${
            isLogoPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {/* Shop Button */}
            <Button
              onClick={() => {
                showOverlay({
                  id: 'shop',
                  component: lazy(() => import('@/components/ShopModal')),
                  props: {
                    gameState,
                    onPurchase: purchaseItem,
                    isPermanentOwned,
                    getItemQuantity,
                    canAfford,
                    onEquipCosmetic: equipCosmetic,
                    getFinalPrice,
                    shopDiscount,
                  },
                  priority: 'normal',
                })
              }}
              className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
              aria-label="Open Shop"
            >
              <ShoppingBag size={20} weight="bold" />
              Shop
            </Button>
            {/* ProTools Button */}
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
        )}

        {/* Board Container - Centered and scaled to fit viewport height */}
        <div className={`relative ${!isPhone ? 'flex-shrink flex items-center justify-center' : ''}`} style={{
          ...((!isPhone) ? {
            height: '100%',
            maxHeight: 'calc(100vh - 4rem)',
            aspectRatio: '1 / 1',
          } : {})
        }}>
        {/* Board wrapper with 3D camera or classic zoom support */}
        <Board3DViewport
          camera={camera}
          isMobile={isMobile && !isPhone}
          boardStyle={camera3DStyle}
          containerStyle={camera3DContainerStyle}
          playerPosition={gameState.position}
          boardSize={1200}
        >
          <BoardViewport
            boardSize={{ width: 1200, height: 1200 }}
            isMobile={isMobile && camera.mode === 'classic'}
            currentPosition={gameState.position}
            safeArea={safeArea}
            zoom={zoom}
            isPanning={isPanning}
            onTouchStart={camera.mode === 'classic' ? handleTouchStart : undefined}
            onTouchMove={camera.mode === 'classic' ? handleTouchMove : undefined}
            onTouchEnd={camera.mode === 'classic' ? handleTouchEnd : undefined}
            boardRef={boardRef}
            boardClassName={boardCenterClasses}
          >
          <CentralStockCard
            stock={currentStock}
            isVisible={showCentralStock}
            onClose={() => setShowCentralStock(false)}
          />

          {/* Sound Controls - Top Right */}
          <div className="absolute top-4 right-4 z-40">
            <SoundControls />
          </div>

          {/* Center Content - User Info and Main Carousel - HIDDEN on phone layout */}
          {!isPhone && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4">
            <UserIndicator 
              saving={saving} 
              lastSaved={lastSavedTime} 
              currentTier={currentTier}
              stars={gameState.stars}
              coins={gameState.coins}
            />
            <CenterCarousel
              gameState={gameState}
              netWorthChange={netWorthChange}
              onStarsClick={() => {
                showOverlay({
                  id: 'hub',
                  component: HubModal,
                  props: {
                    gameState,
                    onOpenChallenges: () => {
                      showOverlay({
                        id: 'challenges',
                        component: lazy(() => import('@/components/ChallengesModal')),
                        props: {
                          dailyChallenges,
                          weeklyChallenges,
                        },
                        priority: 'normal',
                      })
                    },
                    onOpenEventCalendar: () => {
                      showOverlay({
                        id: 'eventCalendar',
                        component: lazy(() => import('@/components/EventCalendar')),
                        props: {
                          activeEvents,
                          upcomingEvents,
                        },
                        priority: 'normal',
                      })
                    },
                    onOpenNetWorthGallery: () => {
                      showOverlay({
                        id: 'netWorthGallery',
                        component: NetWorthGalleryModal,
                        props: {
                          currentNetWorth: gameState.netWorth,
                        },
                        priority: 'normal',
                      })
                    },
                    onOpenCityBuilder: () => {
                      showOverlay({
                        id: 'cityBuilder',
                        component: lazy(() => import('@/components/CityBuilderModal')),
                        props: {
                          stars: gameState.stars,
                          currentCity,
                          currentCityProgress,
                          allCities,
                          citiesProgress: cityBuilderState.cities,
                          canUpgrade: canUpgradeBuilding,
                          timeUntilNextUpgrade,
                          onUpgradeBuilding: upgradeBuilding,
                          onUnlockNextCity: unlockNextCity,
                          onSelectCity: selectCity,
                          nextCityToUnlock,
                          canUnlockNext,
                          totalBuildingsCompleted,
                          totalCitiesCompleted,
                          totalCitiesUnlocked,
                        },
                        priority: 'normal',
                      })
                    },
                  },
                  priority: 'normal',
                })
              }}
              onPortfolioClick={() => {
                showOverlay({
                  id: 'portfolio',
                  component: PortfolioModal,
                  props: {
                    gameState,
                  },
                  priority: 'normal',
                })
              }}
              onPanelChange={setCurrentCarouselPanel}
            />
            
            {/* ThriftPath Status - Moved here from side column */}
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
          )}

          {/* Hide DiceHUD on mobile - shown in BottomNav instead */}
          {!isMobile && (
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
                energyRolls={gameState.energyRolls ?? DAILY_ROLL_LIMIT}
                lastEnergyCheck={gameState.lastEnergyCheck}
                rollHistory={gameState.rollHistory}
              />
            </div>
          )}

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
        </BoardViewport>
        </Board3DViewport>
        
        {/* Board Zoom Controls for mobile */}
        <BoardZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onFitToScreen={fitToScreen}
          onViewFullBoard={zoomOutTemporarily}
          autoFollow={autoFollow}
          onToggleAutoFollow={toggleAutoFollow}
          isMobile={isMobile}
          cameraMode={camera.mode}
        />
        </div>

        {/* Right Column - Action buttons (desktop/tablet only) */}
        {!isPhone && (
          <div className={`flex flex-col gap-4 items-center justify-center transition-opacity duration-500 flex-shrink-0 ${
            isLogoPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {/* Cities Button */}
            <Button
              onClick={() => {
                showOverlay({
                  id: 'cityBuilder',
                  component: lazy(() => import('@/components/CityBuilderModal')),
                  props: {
                    stars: gameState.stars,
                    currentCity,
                    currentCityProgress,
                    allCities,
                    citiesProgress: cityBuilderState.cities,
                    canUpgrade: canUpgradeBuilding,
                    timeUntilNextUpgrade,
                    onUpgradeBuilding: upgradeBuilding,
                    onUnlockNextCity: unlockNextCity,
                    onSelectCity: selectCity,
                    nextCityToUnlock,
                    canUnlockNext,
                    totalBuildingsCompleted,
                    totalCitiesCompleted,
                    totalCitiesUnlocked,
                  },
                  priority: 'normal',
                })
              }}
              className="bg-gradient-to-r from-emerald-500/90 to-teal-500/90 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
              aria-label="Open City Builder"
            >
              <Buildings size={20} weight="bold" />
              Cities
            </Button>
            {/* Challenges Button via ChallengeTracker */}
            <ChallengeTracker
              dailyChallenges={dailyChallenges}
              onOpenModal={() => {
                showOverlay({
                  id: 'challenges',
                  component: lazy(() => import('@/components/ChallengesModal')),
                  props: {
                    dailyChallenges,
                    weeklyChallenges,
                  },
                  priority: 'normal',
                })
              }}
            />
          </div>
        )}
      </div>

      {/* Centralized Overlay Renderer - handles all modals */}
      <OverlayRenderer />

      {/* UIMode to Overlay Bridge - Opens overlays based on UI mode */}
      <UIModeOverlayBridge
        shopProps={{
          gameState,
          onPurchase: purchaseItem,
          onMobilePurchase: handleMobileShopPurchase,
          isPermanentOwned,
          getItemQuantity,
          canAfford,
          onEquipCosmetic: equipCosmetic,
          getFinalPrice,
          shopDiscount,
        }}
        cityBuilderProps={{
          stars: gameState.stars,
          currentCity: currentCity,
          currentCityProgress: currentCityProgress,
          allCities: allCities,
          citiesProgress: cityBuilderState.cities,
          canUpgrade: canUpgradeBuilding,
          timeUntilNextUpgrade: timeUntilNextUpgrade,
          onUpgradeBuilding: upgradeBuilding,
          onUnlockNextCity: unlockNextCity,
          onSelectCity: selectCity,
          nextCityToUnlock: nextCityToUnlock,
          canUnlockNext: canUnlockNext,
          totalBuildingsCompleted: totalBuildingsCompleted,
          totalCitiesCompleted: totalCitiesCompleted,
          totalCitiesUnlocked: totalCitiesUnlocked,
        }}
        leaderboardProps={{
          currentPlayer: {
            netWorth: gameState.netWorth,
            level: gameState.level,
          },
        }}
        challengesProps={{
          challenges: dailyChallenges || [],
          onClaimReward: (challengeId) => {
            logEvent?.('challenge_reward_claimed', { challengeId })
          },
        }}
        portfolioProps={{
          portfolio: gameState.portfolio,
          totalInvested: gameState.totalInvested,
          onViewStock: (symbol) => {
            logEvent?.('stock_viewed_from_portfolio', { symbol })
          },
        }}
      />

      {/* ProToolsOverlay - kept separate as it's not a standard modal */}
      <ProToolsOverlay
        open={proToolsOpen}
        onOpenChange={setProToolsOpen}
        gameState={gameState}
      />

      {/* Mobile Bottom Navigation - Only show on non-phone devices */}
      {!isPhone && (
        <BottomNav
          onNavigate={handleBottomNavigation}
          activeSection={activeSection}
          badges={{
            challenges: dailyChallenges?.filter(c => !c.completed).length || 0,
            shop: 0, // Could add new shop items count here
          }}
          dice1={dice1}
          dice2={dice2}
          isRolling={phase === 'rolling'}
          rollsRemaining={rollsRemaining}
          onRoll={() => handleRoll(1)}
          canRoll={phase === 'idle' && rollsRemaining > 0}
          showDice={isMobile}
        />
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* DevTools: Tap Test Overlay (dev mode only) */}
      {TapTestOverlay && (
        <Suspense fallback={null}>
          <TapTestOverlay />
        </Suspense>
      )}
    </div>
  )

  // Render with appropriate layout based on screen size
  if (isPhone) {
    return (
      <PhoneLayout
        currentPosition={gameState.position}
        gameState={{
          cash: gameState.cash,
          netWorth: gameState.netWorth,
          level: gameState.level,
          xp: gameState.xp,
          xpToNext: xpForNextLevel,
          rolls: rollsRemaining,
          stars: gameState.stars, // Pass stars to CompactHUD
          cityLevel: gameState.cityLevel ?? 1, // Defensive fallback to 1
        }}
        onRollDice={() => handleRoll(1)}
        isRolling={phase === 'rolling'}
        isAutoRolling={isAutoRolling}
        onToggleAutoRoll={toggleAutoRoll}
        onOpenPortfolio={() => {
          showOverlay({
            id: 'portfolio',
            component: PortfolioModal,
            props: {
              gameState,
            },
            priority: 'normal',
          })
        }}
        onOpenProTools={() => {
          const proToolsUrl = 'https://www.alphastocks.ai/?proTools=1'
          if (typeof window !== 'undefined') {
            window.location.href = proToolsUrl
          }
        }}
      >
        {mainContent}
      </PhoneLayout>
    )
  }

  // Desktop/Tablet layout with existing MobileGameLayout wrapper
  return (
    <MobileGameLayout showBottomNav={!isPhone}>
      {mainContent}
    </MobileGameLayout>
  )
}

export default App
