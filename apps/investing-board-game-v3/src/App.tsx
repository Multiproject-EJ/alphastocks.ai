import { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Star, ChartLine, Trophy, CalendarBlank, Crown, GearSix } from '@phosphor-icons/react'
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
import { TileCelebration, TileCelebrationEffect } from '@/components/TileCelebrationEffect'
import { CasinoModal } from '@/components/CasinoModal'
import { UserIndicator } from '@/components/UserIndicator'
import { ChallengeTracker } from '@/components/ChallengeTracker'
import { EventBanner } from '@/components/EventBanner'
import { NetWorthGalleryModal } from '@/components/NetWorthGalleryModal'
import { TierUpModal } from '@/components/TierUpModal'
import { ThriftPathStatus } from '@/components/ThriftPathStatus'
import { ThriftPathAura } from '@/components/ThriftPathAura'
import { OutOfRollsModal } from '@/components/OutOfRollsModal'
import { DailyDividendsModal } from '@/components/DailyDividendsModal'
import { BoardZoomControls } from '@/components/BoardZoomControls'
import { Board3DViewport } from '@/components/Board3DViewport'
import { StockTickerRibbon } from '@/components/StockTickerRibbon'
import { CenterSlices } from '@/components/CenterSlices'
import { AchievementsModal } from '@/components/AchievementsModal'
import { MysteryCard } from '@/components/MysteryCard'
import { PortalAnimation } from '@/components/PortalAnimation'

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
const StockExchangeBuilderModal = lazy(() => import('@/components/StockExchangeBuilderModal'))

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

import { GameState, Stock, BiasCaseStudy, WildcardEvent, PortalTransition, RingNumber } from '@/lib/types'
import { RealMoneyRollsPack } from '@/components/OutOfRollsModal'
import {
  BOARD_TILES,
  INNER_TRACK_TILES,
  RING_2_TILES,
  RING_3_TILES,
  getRandomMarketEvent,
  getRandomBiasCaseStudy,
  THRIFTY_CHALLENGES,
  RING_CONFIG,
  PORTAL_CONFIG,
} from '@/lib/mockData'
import { getRandomWildcardEvent, CASH_PERCENTAGE_PENALTY } from '@/lib/wildcardEvents'
import { SHOP_ITEMS } from '@/lib/shopItems'
import {
  DAILY_ROLL_LIMIT,
  AUTO_SAVE_DEBOUNCE_MS,
  AUTO_SAVE_TIMEOUT_MS,
  getNextMidnight,
  ENERGY_MAX,
  MULTIPLIERS,
  JACKPOT_PASS_START_AMOUNT,
  calculateCategoryOwnershipReward,
} from '@/lib/constants'
import { rollDice, DOUBLES_BONUS } from '@/lib/dice'
import { getResetRollsAmount, ENERGY_CONFIG } from '@/lib/energy'
import { calculateTilePositions, calculateAllRingPositions } from '@/lib/tilePositions'
import { isJackpotWeek } from '@/lib/events'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { useGameSave } from '@/hooks/useGameSave'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/hooks/useSound'
import { useShopInventory } from '@/hooks/useShopInventory'
import { useAchievements } from '@/hooks/useAchievements'
import { useChallenges } from '@/hooks/useChallenges'
import { useEvents } from '@/hooks/useEvents'
import { useHaptics } from '@/hooks/useHaptics'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useGestureArbitration } from '@/hooks/useGestureArbitration'
import { useNetWorthTier } from '@/hooks/useNetWorthTier'
import { useCoins } from '@/hooks/useCoins'
import { useThriftPath } from '@/hooks/useThriftPath'
import { useStockExchangeBuilder } from '@/hooks/useStockExchangeBuilder'
import { useBoardZoom } from '@/hooks/useBoardZoom'
import { useBoardCamera } from '@/hooks/useBoardCamera'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useOverlayManager } from '@/hooks/useOverlayManager'
import { useUIMode } from '@/hooks/useUIMode'
import { useLayoutMode } from '@/hooks/useLayoutMode'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { EventTrackBar } from '@/features/eventTrack/components/EventTrackBar'
import { useEventTrack } from '@/features/eventTrack/useEventTrack'
import { useDailyDividends } from '@/hooks/useDailyDividends'
import { pointsForChallengeComplete, pointsForRoll, pointsForTileLanding } from '@/features/eventTrack/adapter'
import { createEventTrackProgress } from '@/features/eventTrack/store'
import { ThriftPathStatus as ThriftPathStatusType } from '@/lib/thriftPath'
import { COIN_COSTS, COIN_EARNINGS } from '@/lib/coins'
import { getInitialStockExchangeState, StockExchangeBuilderState } from '@/lib/stockExchangeBuilder'
import { calculateXPForLevel } from '@/lib/progression'
import type { UIMode, GamePhase } from '@/lib/uiModeStateMachine'
import type { RollMultiplier } from '@/lib/constants'

// Alias for backward compatibility
type Phase = GamePhase

// Debug helper function - logs only when DEBUG_GAME is enabled in localStorage
const debugGame = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && localStorage.getItem('DEBUG_GAME') === 'true') {
    console.log('[DEBUG]', ...args)
  }
}

// Constants
const LOGO_PANEL_INDEX = 1  // 2nd panel (0-indexed)
const BOARD_CONTAINER_BASE_CLASSES = "relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px] transition-opacity duration-700"

// Ring 3 reveal animation timing (in milliseconds)
// Animation duration per tile: 800ms
// Stagger delay between tiles: 100ms
// Total tiles in Ring 3: 9
// Total animation time: 800ms + (9 tiles × 100ms stagger) = 1700ms, rounded to 1600ms for safety
const RING_3_REVEAL_DURATION = 1600

const formatEventCountdown = (target: Date, now: Date) => {
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'now'

  const totalMinutes = Math.ceil(diffMs / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const stockSourceAnnounced = useRef<'supabase' | 'mock' | null>(null)
  const gameLoadedFromSave = useRef(false)
  const lastSaveTimeRef = useRef<Date | null>(null)
  const lastSyncedCoinsRef = useRef<number>(0)
  const lastSyncedThriftPathRef = useRef<string | null>(null)
  const lastEnergyCheckRef = useRef<Date | null>(null)
  const processedPowerUpsRef = useRef<Set<string>>(new Set())
  const currentRewardMultiplierRef = useRef<number>(1) // Track reward multiplier for current roll
  const eventTrackPointsRef = useRef<(amount: number, source?: string) => void>(() => {})

  // Default initial game state
  const defaultGameState: GameState = {
    cash: 100000,
    position: 0,
    netWorth: 100000,
    portfolioValue: 0,
    stars: 0,
    coins: 100,
    currentRing: 1,
    ring1LapsCompleted: 0,
    hasReachedThrone: false,
    throneCount: 0,
    eventCurrency: {
      eventId: null,
      amount: 0,
    },
    eventTrack: createEventTrackProgress(null),
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
    stockExchangeBuilder: getInitialStockExchangeState(),
    cityLevel: 1, // City level for backward compatibility (defaults to first city)
    jackpot: 0, // Accumulated jackpot from passing Start without landing
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
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  
  // Auto-roll state for Monopoly GO style continuous rolling
  const [isAutoRolling, setIsAutoRolling] = useState(false)
  const [mobileMultiplier, setMobileMultiplier] = useState<RollMultiplier>(1)

  // Ring 3 reveal state
  const [ring3Revealed, setRing3Revealed] = useState(false)
  const [ring3Revealing, setRing3Revealing] = useState(false)

  // Portal state for ring transitions
  const [portalTransition, setPortalTransition] = useState<PortalTransition | null>(null)
  const [isPortalAnimating, setIsPortalAnimating] = useState(false)

  // Overlay manager for coordinated modal display
  const { show: showOverlay, wasRecentlyShown, getCurrentOverlay, closeCurrent } = useOverlayManager()

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
  const { enabled: notificationsEnabled, toggleNotifications } = useNotificationPreferences()

  // Conditional toast wrapper - only shows toasts if notifications are enabled
  const showToast = useCallback((
    type: 'success' | 'error' | 'info',
    message: string,
    options?: Parameters<typeof toast.success>[1]
  ) => {
    if (!notificationsEnabled) {
      return
    }

    switch (type) {
      case 'success':
        return toast.success(message, options)
      case 'error':
        return toast.error(message, options)
      case 'info':
        return toast.info(message, options)
    }
  }, [notificationsEnabled])

  useEffect(() => {
    if (!notificationsEnabled) {
      toast.dismiss()
    }
  }, [notificationsEnabled])

  // Keep state for data that modals need (but not open/closed state)
  const [currentStock, setCurrentStock] = useState<Stock | null>(null)
  const [showCentralStock, setShowCentralStock] = useState(false)
  const [isStockSpinning, setIsStockSpinning] = useState(false)
  const [currentEvent, setCurrentEvent] = useState('')
  const [currentCaseStudy, setCurrentCaseStudy] = useState<BiasCaseStudy | null>(null)
  const [currentWildcardEvent, setCurrentWildcardEvent] = useState<WildcardEvent | null>(null)

  // ProTools overlay state (separate from overlay manager)
  const [proToolsOpen, setProToolsOpen] = useState(false)

  // Mobile UI states
  const [activeSection, setActiveSection] = useState<'home' | 'challenges' | 'shop' | 'leaderboard' | 'settings'>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [dynamicRadius, setDynamicRadius] = useState<number | undefined>(undefined)

  // Calculate viewport-aware radius for desktop to fit all tiles
  const calculateFittingRadius = useCallback(() => {
    if (window.innerWidth < 768 || window.innerWidth < 1024) {
      // Mobile uses existing zoom/pan system, no need for custom radius
      return undefined
    }
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Tile dimensions - tiles are uniform at 112×128px
    const TILE_SIZE = 128
    
    // Space for sidebar buttons (Shop/ProTools on left, Cities/Challenges on right)
    const SIDEBAR_WIDTH = 180 // 90px each side
    
    // Vertical margins (HUD at top, some bottom padding)
    const TOP_MARGIN = 80
    const BOTTOM_MARGIN = 40
    
    // Calculate available space
    const availableWidth = viewportWidth - (SIDEBAR_WIDTH * 2)
    const availableHeight = viewportHeight - TOP_MARGIN - BOTTOM_MARGIN
    const availableSize = Math.min(availableWidth, availableHeight)
    
    // CRITICAL FORMULA:
    // Total board diameter = 2*radius + 2*TILE_SIZE (tiles protrude on ALL sides)
    // Therefore: radius = (availableSize - 2*TILE_SIZE) / 2
    // Simplifies to: radius = (availableSize / 2) - TILE_SIZE
    const radius = (availableSize / 2) - TILE_SIZE
    
    // Safety buffer
    const safeRadius = radius - 20
    
    // Minimum usable radius (below this the board is too small to be playable)
    return Math.max(safeRadius, 120)
  }, [])

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Recalculate radius on mount and window resize
  useEffect(() => {
    const updateRadius = () => {
      const newRadius = calculateFittingRadius()
      setDynamicRadius(newRadius)
    }
    
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [calculateFittingRadius])

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
  const showBoardTiles = isPhone ? true : [0, LOGO_PANEL_INDEX].includes(currentCarouselPanel)


  const [showCelebration, setShowCelebration] = useState(false)
  const [tileCelebrations, setTileCelebrations] = useState<TileCelebration[]>([])
  const [lastLandedTileId, setLastLandedTileId] = useState<number | null>(null)
  
  // Mystery Card state management
  const [activeInnerTile, setActiveInnerTile] = useState<number | null>(null)
  const [innerTileColors, setInnerTileColors] = useState<Map<number, string>>(new Map())
  const [isJackpotCelebrating, setIsJackpotCelebrating] = useState(false)
  
  const BOARD_SIZE = 1200
  const TILE_SIZE = 128
  const boardFrameRef = useRef<HTMLDivElement>(null)
  const [boardRenderSize, setBoardRenderSize] = useState(BOARD_SIZE)

  const rollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const landingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previewCardTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stockModalTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stockSpinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to clear all timeout/interval refs
  const clearAllTimers = () => {
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current)
    if (hopIntervalRef.current) clearInterval(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)
    if (previewCardTimeoutRef.current) clearTimeout(previewCardTimeoutRef.current)
    if (stockModalTimeoutRef.current) clearTimeout(stockModalTimeoutRef.current)
    if (stockSpinTimeoutRef.current) clearTimeout(stockSpinTimeoutRef.current)
  }

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

  const { unlockedAchievements, getAchievementProgress } = useAchievements({
    gameState,
    setGameState,
    playSound,
  })

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

  // Daily Dividends hook
  const {
    status: dailyDividendStatus,
    loading: dividendsLoading,
    canShowPopup: canShowDividendsPopup,
    collectReward: collectDailyReward,
    refreshStatus: refreshDividendStatus,
  } = useDailyDividends()

  // Stock Exchange Builder hook
  const {
    exchanges: stockExchanges,
    stockExchangeState,
    setStockExchangeState,
    selectedExchangeId,
    selectExchange,
    onUpgradePillar,
    onViewStock,
  } = useStockExchangeBuilder({
    initialState: gameState.stockExchangeBuilder,
    availableCapital: gameState.cash,
    onSpendCapital: (amount) => {
      if (gameState.cash < amount) return false
      setGameState(prev => ({
        ...prev,
        cash: prev.cash - amount,
        netWorth: prev.netWorth - amount,
      }))
      return true
    },
  })

  // Sync stockExchangeState to gameState - use ref to prevent infinite loops
  const lastSyncedStockExchangeRef = useRef<StockExchangeBuilderState | null>(null)
  useEffect(() => {
    if (lastSyncedStockExchangeRef.current === stockExchangeState) {
      return
    }

    let shouldUpdate = false

    setGameState(prev => {
      const prevStockExchangeJson = JSON.stringify(prev.stockExchangeBuilder)
      const newStockExchangeJson = JSON.stringify(stockExchangeState)

      if (prevStockExchangeJson === newStockExchangeJson) {
        return prev
      }

      shouldUpdate = true

      return {
        ...prev,
        stockExchangeBuilder: stockExchangeState,
      }
    })

    if (shouldUpdate) {
      lastSyncedStockExchangeRef.current = stockExchangeState
    }
  }, [stockExchangeState])

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
  } = useShopInventory({
    gameState,
    setGameState,
    tierBenefits: activeBenefits,
    onAddRolls: (amount) => {
      setRollsRemaining((prev) => Math.min(prev + amount, ENERGY_MAX))
    },
  })

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
      let newState = {
        ...prev,
        cash: prev.cash - item.price,
      }

      // Apply item effect based on type
      switch (item.effect.type) {
        case 'dice':
          newState = {
            ...newState,
            energyRolls: Math.min(
              (prev.energyRolls ?? DAILY_ROLL_LIMIT) + (item.effect.value as number),
              ENERGY_MAX
            ),
          }
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
      setRollsRemaining(prev => Math.min(prev + (item.effect.value as number), ENERGY_MAX))
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
    onChallengeComplete: (challenge) => {
      if (challenge.type !== 'daily' && challenge.type !== 'weekly') return
      eventTrackPointsRef.current(
        pointsForChallengeComplete(challenge.type),
        `Challenge: ${challenge.title}`
      )
    },
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

  const [rightNowTick, setRightNowTick] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setRightNowTick(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const openEventCalendar = useCallback(() => {
    showOverlay({
      id: 'eventCalendar',
      component: EventCalendar,
      props: {
        activeEvents,
        upcomingEvents,
      },
      priority: 'normal',
    })
  }, [activeEvents, upcomingEvents, showOverlay])

  const openShopOverlay = useCallback(() => {
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
  }, [
    showOverlay,
    gameState,
    purchaseItem,
    isPermanentOwned,
    getItemQuantity,
    canAfford,
    equipCosmetic,
    getFinalPrice,
    shopDiscount,
  ])

  const openStockExchangeOverlay = useCallback(() => {
    showOverlay({
      id: 'stockExchangeBuilder',
      component: StockExchangeBuilderModal,
      props: {
        exchanges: stockExchanges,
        progress: stockExchangeState.exchanges,
        selectedExchangeId,
        onSelectExchange: selectExchange,
        availableCapital: gameState.cash,
        onUpgradePillar,
        onViewStock,
        onPurchaseOffer: (offerId: string) => {
          toast.info('Premium boosts coming soon', {
            description: `Offer ${offerId} will be available later.`,
          })
        },
      },
      priority: 'normal',
    })
  }, [
    showOverlay,
    stockExchanges,
    stockExchangeState.exchanges,
    selectedExchangeId,
    selectExchange,
    gameState.cash,
    onUpgradePillar,
    onViewStock,
  ])

  const currentActiveEvent = [...activeEvents].sort(
    (a, b) => a.endDate.getTime() - b.endDate.getTime()
  )[0]
  const nextEvent = upcomingEvents[0]
  const rightNowEvent = currentActiveEvent ?? nextEvent
  const rightNowCountdownTarget = currentActiveEvent ? currentActiveEvent.endDate : nextEvent?.startDate
  const rightNowStatusLabel = currentActiveEvent ? 'Ends in' : nextEvent ? 'Starts in' : 'Schedule updating'
  const activeEventCurrency = currentActiveEvent?.currency
  const storedEventCurrency = gameState.eventCurrency ?? { eventId: null, amount: 0 }
  const activeEventCurrencyAmount =
    currentActiveEvent && storedEventCurrency.eventId === currentActiveEvent.id
      ? storedEventCurrency.amount
      : 0
  const eventCurrencyGoal = activeEventCurrency?.goal ?? 0
  const eventCurrencyProgressPercent =
    eventCurrencyGoal > 0 ? Math.min((activeEventCurrencyAmount / eventCurrencyGoal) * 100, 100) : 0
  const eventCurrencyToNextReward =
    eventCurrencyGoal > 0 ? Math.max(eventCurrencyGoal - activeEventCurrencyAmount, 0) : 0

  useEffect(() => {
    const activeEventId = currentActiveEvent?.id ?? null
    setGameState(prev => {
      const currentEventId = prev.eventCurrency?.eventId ?? null
      if (currentEventId === activeEventId) return prev
      return {
        ...prev,
        eventCurrency: {
          eventId: activeEventId,
          amount: 0,
        },
      }
    })
  }, [currentActiveEvent?.id])

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

  // Handle Daily Dividends modal - Show on first visit each day
  useEffect(() => {
    // Wait for loading to complete and status to be available
    if (isLoading || dividendsLoading || !dailyDividendStatus) return
    
    // Show popup if user can collect today and hasn't been shown recently (within last 5 minutes)
    const FIVE_MINUTES_MS = 5 * 60 * 1000
    if (canShowDividendsPopup && !wasRecentlyShown('dailyDividends', FIVE_MINUTES_MS)) {
      // Delay slightly to ensure other critical modals are shown first
      const timer = setTimeout(() => {
        showOverlay({
          id: 'dailyDividends',
          component: DailyDividendsModal,
          props: {
            status: dailyDividendStatus,
            onCollect: async () => {
              const reward = await collectDailyReward()
              if (reward) {
                // Add rewards to user's balance
                if (reward.type === 'dice') {
                  setRollsRemaining(prev => prev + reward.amount)
                  setGameState(prev => ({
                    ...prev,
                    energyRolls: (prev.energyRolls ?? DAILY_ROLL_LIMIT) + reward.amount,
                  }))
                  toast.success(`Daily Dividend Collected!`, {
                    description: `+${reward.amount} dice rolls added to your balance`,
                  })
                } else if (reward.type === 'cash') {
                  setGameState(prev => ({
                    ...prev,
                    cash: prev.cash + reward.amount,
                    netWorth: prev.netWorth + reward.amount,
                  }))
                  toast.success(`Daily Dividend Collected!`, {
                    description: `+$${reward.amount.toLocaleString()} cash added to your balance`,
                  })
                }
                
                playSound('level-up')
                hapticSuccess()
                
                // Refresh status
                await refreshDividendStatus()
              }
            },
          },
          priority: 'high', // Show early but after critical modals
        })
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [
    isLoading,
    dividendsLoading,
    dailyDividendStatus,
    canShowDividendsPopup,
    wasRecentlyShown,
    showOverlay,
    collectDailyReward,
    setRollsRemaining,
    setGameState,
    playSound,
    hapticSuccess,
    refreshDividendStatus,
  ])

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

  const {
    definition: eventTrackDefinition,
    progress: eventTrackProgress,
    cta: eventTrackCTA,
    addPoints: addEventTrackPoints,
    claimMilestone,
    purchaseCTA,
  } = useEventTrack({
    gameState,
    setGameState,
    setRollsRemaining,
    addCoins,
    spendCoins,
    activeEvent: currentActiveEvent ?? null,
    notify: showToast,
  })

  useEffect(() => {
    eventTrackPointsRef.current = addEventTrackPoints
  }, [addEventTrackPoints])

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
        eventCurrency: savedGameState.eventCurrency ?? {
          eventId: null,
          amount: 0,
        },
        eventTrack: savedGameState.eventTrack ?? createEventTrackProgress(currentActiveEvent?.id ?? null),
      }
      setGameState(loadedState)
      // Initialize Ring 3 revealed state
      setRing3Revealed(savedGameState.ring3Revealed ?? false)
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
      clearAllTimers()
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
        clearAllTimers()
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
    if (uiMode === 'board' && uiPhase !== phase) {
      setUIPhase(phase)
    }
  }, [phase, uiMode, uiPhase, setUIPhase])

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
    if (!isAutoRolling) return

    const attemptRoll = () => {
      // Only roll if we have rolls remaining, not currently rolling, and no modal is open
      const hasActiveOverlay = getCurrentOverlay() !== null || showCentralStock

      if (rollsRemaining > 0 && phase === 'idle' && !hasActiveOverlay) {
        // Call handleRoll with selected multiplier
        handleRoll(mobileMultiplier)
      } else if (rollsRemaining === 0) {
        setIsAutoRolling(false) // Stop when out of dice
      }
    }

    attemptRoll()
    const interval = setInterval(attemptRoll, 3000) // Roll every 3 seconds

    return () => clearInterval(interval)
    // Note: handleRoll is intentionally not in deps to avoid re-creating interval
    // The function uses current state via closures which is acceptable here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoRolling, rollsRemaining, phase, getCurrentOverlay, showCentralStock, mobileMultiplier])

  const toggleAutoRoll = useCallback(() => {
    setIsAutoRolling(prev => !prev)
    if (navigator.vibrate) navigator.vibrate(100)
  }, [])

  const cycleMobileMultiplier = useCallback(() => {
    setMobileMultiplier((prev) => {
      const currentIndex = MULTIPLIERS.indexOf(prev)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MULTIPLIERS.length
      return MULTIPLIERS[nextIndex]
    })
    if (navigator.vibrate) navigator.vibrate(50)
  }, [])

  // Function to trigger Ring 3 reveal animation
  const revealRing3 = useCallback(() => {
    if (ring3Revealed) return // Already revealed
    
    setRing3Revealing(true)
    playSound('level-up') // Using level-up sound for epic reveal
    
    // Heavy haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
    
    // Show toast notification
    showToast('success', '💎 Ring 3 Unlocked!', {
      description: 'The Elite Circle has been revealed!',
      duration: 5000,
    })
    
    // After animation completes, set as revealed
    setTimeout(() => {
      setRing3Revealing(false)
      setRing3Revealed(true)
      setGameState(prev => ({
        ...prev,
        ring3Revealed: true,
        ring3RevealedAt: new Date(),
      }))
    }, RING_3_REVEAL_DURATION)
  }, [ring3Revealed, playSound, showToast])

  // Trigger Ring 3 reveal when player reaches Ring 3 for the first time
  useEffect(() => {
    if (gameState.currentRing === 3 && !ring3Revealed && !ring3Revealing) {
      revealRing3()
    }
  }, [gameState.currentRing, ring3Revealed, ring3Revealing, revealRing3])

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

    // clear any lingering timers from a previous roll to keep movement predictable
    clearAllTimers()

    // Store the reward multiplier for use in handleTileLanding
    currentRewardMultiplierRef.current = multiplier

    // Consume 1 roll (multiplier affects rewards only, not roll count)
    setRollsRemaining((prev) => prev - 1)
    setGameState(prev => ({
      ...prev,
      energyRolls: Math.max(0, (prev.energyRolls ?? DAILY_ROLL_LIMIT) - 1)
    }))

    // DevTools: Log roll event
    logEvent?.('roll_pressed', { multiplier, rollsRemaining })

    // Haptic feedback for rolling
    heavyTap()  // Strong haptic on roll
    
    // Block UI mode transitions during dice roll
    setCanTransition(false)
    
    setPhase('rolling')
    playSound('dice-roll')

    // Roll dice once (multiplier affects rewards, not movement)
    const diceResult = rollDice()
    const rollResults = [diceResult]

    addEventTrackPoints(
      pointsForRoll(diceResult.total, diceResult.isDoubles),
      'Dice roll'
    )
    
    debugGame('Dice roll:', { 
      die1: diceResult.die1, 
      die2: diceResult.die2, 
      total: diceResult.total,
      isDoubles: diceResult.isDoubles,
      rewardMultiplier: multiplier
    })
    
    // Update dice display
    setDice1(diceResult.die1)
    setDice2(diceResult.die2)
    setLastRoll(diceResult.total)
    
    const totalMovement = diceResult.total
    
    // Calculate base rewards (will be multiplied)
    let baseStars = 0
    let baseCoins = COIN_EARNINGS.dice_roll
    let baseXP = 0
    
    // Check for doubles
    if (diceResult.isDoubles) {
      baseStars += DOUBLES_BONUS.stars
      baseCoins += DOUBLES_BONUS.coins
      baseXP += DOUBLES_BONUS.xp
    }
    
    // Check if player will pass Start (position 0)
    const startPosition = gameState.position
    const finalPosition = (startPosition + totalMovement) % BOARD_TILES.length
    const willPassStart = startPosition + totalMovement >= BOARD_TILES.length
    const willLandOnStart = finalPosition === 0
    
    if (willPassStart) {
      baseCoins += COIN_EARNINGS.pass_start
      baseStars += 200 // Pass Start star bonus
    }
    
    // Track challenge progress for rolling
    updateChallengeProgress('roll', diceResult.total)
    
    // Process roll after dice animation
    setTimeout(() => {
      // Apply multiplier to rewards
      const finalStars = baseStars * multiplier
      const finalCoins = baseCoins * multiplier
      const finalXP = baseXP * multiplier
      
      debugGame('Multiplied rewards', { 
        multiplier,
        baseStars, finalStars, 
        baseCoins, finalCoins, 
        baseXP, finalXP 
      })
      
      // Handle jackpot: Add to jackpot when passing Start without landing
      let jackpotChange = 0
      if (willPassStart && !willLandOnStart) {
        jackpotChange = JACKPOT_PASS_START_AMOUNT * multiplier
      }
      
      // Award all rewards with multiplier applied
      setGameState(prev => ({
        ...prev,
        stars: prev.stars + finalStars,
        xp: prev.xp + finalXP,
        jackpot: (prev.jackpot ?? 0) + jackpotChange,
        totalDoubles: (prev.totalDoubles ?? 0) + (diceResult.isDoubles ? 1 : 0),
        doublesStreak: diceResult.isDoubles ? (prev.doublesStreak ?? 0) + 1 : 0,
        rollHistory: [...(prev.rollHistory || []).slice(-9), ...rollResults],
        stats: {
          ...prev.stats,
          totalRolls: prev.stats.totalRolls + 1
        }
      }))
      
      // Award coins
      if (finalCoins > 0) {
        addCoins(finalCoins, multiplier > 1 ? `${multiplier}x Roll Rewards` : 'Roll Rewards')
      }
      
      // Notify about jackpot increase (calculate new total explicitly since setState is async)
      if (jackpotChange > 0) {
        const newJackpotTotal = (gameState.jackpot ?? 0) + jackpotChange
        toast.info('🎰 Jackpot Growing!', {
          description: `+$${jackpotChange.toLocaleString()} added to jackpot (now $${newJackpotTotal.toLocaleString()})`,
        })
      }
      
      // Play sound based on outcome
      if (diceResult.isDoubles) {
        playSound('achievement')
      } else {
        playSound('dice-land')
      }
      
      // Show summary toast
      const description = [
        `Moved ${totalMovement} tiles`,
        multiplier > 1 ? `${multiplier}x rewards!` : null,
        finalStars > 0 ? `+${finalStars} ⭐` : null,
        finalCoins > 0 ? `+${finalCoins} 🪙` : null,
        finalXP > 0 ? `+${finalXP} XP` : null,
        diceResult.isDoubles ? 'Doubles!' : null,
        willPassStart && !willLandOnStart ? 'Passed Start' : null
      ].filter(Boolean).join(' | ')
      
      toast.success(
        multiplier > 1 ? `${multiplier}x Multiplier Active!` : 'Roll Complete!',
        { description }
      )
      
      // Move player after brief delay
      setTimeout(() => {
        debugGame('Movement started', { totalMovement })
        logEvent?.('move_started', { totalMovement, startPosition })
        setPhase('moving')
        const tilesToHop: number[] = []

        for (let j = 1; j <= totalMovement; j++) {
          tilesToHop.push((startPosition + j) % BOARD_TILES.length)
        }

        // Check if player passes Start (position 0) without landing on it
        const passedStart = willPassStart && !willLandOnStart
        
        // Animate camera in immersive mode (mobile only)
        if (isMobile && camera.mode === 'immersive') {
          animateAlongPath(tilesToHop, () => {
            debugGame('Camera animation completed')
          })
        }

        let currentHop = 0
        hopIntervalRef.current = setInterval(() => {
          if (currentHop < tilesToHop.length) {
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
              // Trigger landing event with current reward multiplier
              handleTileLanding(newPosition, passedStart)
              
              // Check for portal transitions
              const currentRing = gameState.currentRing
              const startTileId = PORTAL_CONFIG[`ring${currentRing}` as keyof typeof PORTAL_CONFIG]?.startTileId
              
              if (startTileId !== undefined) {
                const landedOnStartTile = newPosition === startTileId
                const passedStartTile = tilesToHop.includes(startTileId) && !landedOnStartTile
                
                if (passedStartTile || landedOnStartTile) {
                  const transition = handlePortalTransition(currentRing, startTileId, landedOnStartTile)
                  
                  if (transition) {
                    // Trigger portal animation
                    setTimeout(() => {
                      triggerPortalAnimation(transition)
                    }, 1000) // Delay to let tile landing complete
                  }
                }
              }
            }, 200)
          }
        }, 200)
      }, 500)
    }, 800) // Dice roll animation duration
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
    setRollsRemaining((prev) => prev + pack.rolls)
    setGameState(prev => ({
      ...prev,
      energyRolls: (prev.energyRolls ?? DAILY_ROLL_LIMIT) + pack.rolls,
      stats: {
        ...prev.stats,
        rollsPurchased: (prev.stats.rollsPurchased ?? 0) + pack.rolls,
      }
    }))

    toast.success(`Added ${pack.rolls} Dice Rolls`, {
      description: `Purchase: ${pack.priceKr} kr pack applied to your rolls.`
    })

    closeCurrent()
  }

  const boardSize = !isPhone && !isMobile ? boardRenderSize : BOARD_SIZE
  const desktopOuterRadius = boardSize / 2 - TILE_SIZE / 2
  const boardPadding = !isPhone && !isMobile ? 0 : 32
  const boardOuterRadius = !isPhone && !isMobile
    ? desktopOuterRadius
    : (dynamicRadius ?? 456)
  const isCourtOfCapitalTile =
    phase === 'landed' && BOARD_TILES[gameState.position]?.title === 'Court of Capital'
  const isCategoryTileActive = phase === 'landed' && BOARD_TILES[gameState.position]?.type === 'category'

  // Compute which categories the player owns stocks in
  const ownedCategories = useMemo(() => {
    const categories = new Set<string>()
    gameState.holdings.forEach(holding => {
      if (holding.stock.category) {
        categories.add(holding.stock.category)
      }
    })
    return categories
  }, [gameState.holdings])

  const getTileCelebrationPosition = useCallback((tileId: number) => {
    const tileBoardSize = { width: boardSize, height: boardSize }
    const tilePositions = calculateTilePositions(tileBoardSize, 27, boardOuterRadius, false)
    const position = tilePositions.find(p => p.id === tileId)
    if (!position) return null
    return {
      x: position.x - boardPadding,
      y: position.y - boardPadding,
    }
  }, [boardSize, boardOuterRadius, boardPadding])

  const triggerTileCelebration = useCallback((tileId: number, emojis: string[]) => {
    const position = getTileCelebrationPosition(tileId)
    if (!position) return

    const id = Date.now() + Math.random()
    setTileCelebrations((prev) => [
      ...prev,
      {
        id,
        x: position.x,
        y: position.y,
        emojis,
      },
    ])

    window.setTimeout(() => {
      setTileCelebrations((prev) => prev.filter((celebration) => celebration.id !== id))
    }, 1400)
  }, [getTileCelebrationPosition])

  const triggerCelebrationFromLastTile = useCallback((emojis: string[]) => {
    if (lastLandedTileId === null) return
    triggerTileCelebration(lastLandedTileId, emojis)
  }, [lastLandedTileId, triggerTileCelebration])

  const handleEventCurrencyEarned = useCallback((source: string) => {
    if (!currentActiveEvent || !activeEventCurrency) return

    const { earnOnMarketEvent, goal, rewardStars, emoji } = activeEventCurrency
    if (earnOnMarketEvent <= 0 || goal <= 0) return

    let goalsHit = 0
    let starsAwarded = 0

    setGameState(prev => {
      const eventId = currentActiveEvent.id
      const currentAmount = prev.eventCurrency?.eventId === eventId ? prev.eventCurrency.amount : 0
      const updatedAmount = currentAmount + earnOnMarketEvent
      goalsHit = Math.floor(updatedAmount / goal)
      starsAwarded = goalsHit * rewardStars
      const remainder = updatedAmount % goal

      return {
        ...prev,
        stars: prev.stars + starsAwarded,
        eventCurrency: {
          eventId,
          amount: remainder,
        },
      }
    })

    toast.success(`+${earnOnMarketEvent} ${emoji}`, {
      description: `${currentActiveEvent.title} reward from ${source}.`,
    })
    triggerCelebrationFromLastTile([emoji])

    if (goalsHit > 0) {
      toast.success(`${currentActiveEvent.title} prize unlocked!`, {
        description: `Earned ${starsAwarded.toLocaleString()} ⭐`,
      })
      triggerCelebrationFromLastTile(['⭐', '✨'])
    }
  }, [activeEventCurrency, currentActiveEvent, triggerCelebrationFromLastTile])

  // Function to check if a tile is a portal start tile
  const isPortalStartTile = useCallback((tileId: number, ring: RingNumber): boolean => {
    const portalConfig = PORTAL_CONFIG[`ring${ring}` as keyof typeof PORTAL_CONFIG]
    return portalConfig?.startTileId === tileId
  }, [])

  // Function to handle portal transitions
  const handlePortalTransition = useCallback((
    currentRing: RingNumber,
    tileId: number,
    didLandExactly: boolean
  ): PortalTransition | null => {
    const portalConfig = PORTAL_CONFIG[`ring${currentRing}` as keyof typeof PORTAL_CONFIG]
    if (!portalConfig) return null

    // Check if this is the start tile for the current ring
    if (tileId !== portalConfig.startTileId) return null

    // Determine action based on pass vs land
    const action = didLandExactly ? portalConfig.onLand : portalConfig.onPass

    const transition: PortalTransition = {
      direction: action.action === 'ascend' || action.action === 'throne' ? 'up' : 'down',
      fromRing: currentRing,
      toRing: action.targetRing as RingNumber | 0,
      fromTile: tileId,
      toTile: action.targetTile,
      triggeredBy: didLandExactly ? 'land' : 'pass',
    }

    return transition
  }, [])

  // Portal animation trigger
  const triggerPortalAnimation = useCallback((transition: PortalTransition) => {
    setPortalTransition(transition)
    setIsPortalAnimating(true)
    
    // Play appropriate sound
    if (transition.direction === 'up') {
      playSound('portal-ascend')
    } else {
      playSound('portal-descend')
    }
    
    // After animation, update game state
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        // Only update currentRing if not going to throne (toRing !== 0)
        ...(transition.toRing !== 0 && { currentRing: transition.toRing as RingNumber }),
        position: transition.toTile,
        // Track throne if reached
        ...(transition.toRing === 0 && {
          hasReachedThrone: true,
          throneCount: (prev.throneCount || 0) + 1,
        }),
      }))
      
      setIsPortalAnimating(false)
      setPortalTransition(null)
      
      // Show toast message
      if (transition.direction === 'up') {
        if (transition.toRing === 0) {
          toast.success('👑 THRONE REACHED!', {
            description: 'You have conquered the Wealth Spiral!',
            duration: 5000,
          })
        } else {
          toast.success(`⬆️ PORTAL UP!`, {
            description: `Welcome to Ring ${transition.toRing}: ${RING_CONFIG[transition.toRing as RingNumber].name}!`,
            duration: 3000,
          })
        }
      } else {
        toast.info('⬇️ Portal Down', {
          description: 'Back to Street Level. Complete another lap to ascend!',
          duration: 3000,
        })
      }
    }, 1500) // Animation duration
  }, [playSound])

  const handleTileLanding = (position: number, passedStart = false) => {
    playSound('tile-land')

    const tile = BOARD_TILES[position]
    debugGame('handleTileLanding:', { position, tile, passedStart })
    setLastLandedTileId(position)
    setIsStockSpinning(false)
    if (stockSpinTimeoutRef.current) clearTimeout(stockSpinTimeoutRef.current)

    addEventTrackPoints(
      pointsForTileLanding(tile),
      `Landed on ${tile.title}`
    )

    // Haptic feedback on tile landing
    lightTap()

    // Get current reward multiplier and reset it for next roll
    const rewardMultiplier = currentRewardMultiplierRef.current
    currentRewardMultiplierRef.current = 1 // Reset to default after reading

    // DevTools: Log tile landed event
    logEvent?.('tile_landed', { position, tileType: tile.type, passedStart, rewardMultiplier })

    // Track challenge progress for landing on tile
    updateChallengeProgress('land_on_tile', { position, tileType: tile.type })
    
    // Earn coins for landing on tile
    earnFromSource('land_on_tile')
    
    // Track corner landing
    const corners = [0, 6, 13, 19]
    if (corners.includes(position)) {
      updateChallengeProgress('land_on_corner', { position })
    }

    // Check for category ownership cash reward
    if (tile.type === 'category' && tile.category) {
      // Calculate ownership percentage in this category
      const totalPortfolioValue = gameState.portfolioValue || 0
      const categoryValue = gameState.holdings
        .filter(h => h.stock.category === tile.category)
        .reduce((sum, h) => sum + h.totalCost, 0)
      
      if (categoryValue > 0 && totalPortfolioValue > 0) {
        const ownershipPercent = (categoryValue / totalPortfolioValue) * 100
        const baseCashReward = calculateCategoryOwnershipReward(ownershipPercent)
        const cashReward = baseCashReward * rewardMultiplier
        
        if (cashReward > 0) {
          setGameState(prev => ({
            ...prev,
            cash: prev.cash + cashReward,
            netWorth: prev.netWorth + cashReward,
          }))
          
          playSound('cash-register')
          hapticSuccess()
          triggerTileCelebration(position, ['💰', '💵'])
          
          toast.success(`💰 Category Ownership Bonus!`, {
            description: `You own ${tile.category} stocks! +$${cashReward.toLocaleString()}${rewardMultiplier > 1 ? ` (${rewardMultiplier}x)` : ''}`,
          })
        }
      }
    }

    // Activate inner mystery card when landing on category tile
    if (tile.type === 'category' && tile.category) {
      // Calculate which inner tile to activate (aligned with outer tile)
      const innerTileIndex = Math.floor((position / 27) * 12)
      const innerTileId = 100 + innerTileIndex
      
      setActiveInnerTile(innerTileId)
      setInnerTileColors(prev => new Map(prev).set(innerTileId, tile.colorBorder || 'oklch(0.60 0.15 85)'))
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActiveInnerTile(null)
      }, 3000)
    }

    // NOTE: Pass Start bonuses are now handled in handleRoll with multiplier applied
    // This section is kept for backwards compatibility but won't trigger from normal rolls
    // Only used if handleTileLanding is called directly (not from handleRoll)

    if (tile.type === 'category' && tile.category) {
      debugGame('Category tile - showing stock card')
      const stock = getStockForCategory(tile.category)
      setCurrentStock(stock)

      const stockSpinDuration = 1200

      setIsStockSpinning(true)

      if (stockSpinTimeoutRef.current) clearTimeout(stockSpinTimeoutRef.current)
      stockSpinTimeoutRef.current = setTimeout(() => {
        setIsStockSpinning(false)
        setShowCentralStock(true)
      }, stockSpinDuration)

      // Clear any existing timeouts
      if (previewCardTimeoutRef.current) clearTimeout(previewCardTimeoutRef.current)
      if (stockModalTimeoutRef.current) clearTimeout(stockModalTimeoutRef.current)

      setShowCentralStock(false)

      // Hide preview card after 1.5 seconds
      previewCardTimeoutRef.current = setTimeout(() => {
        setShowCentralStock(false)
      }, stockSpinDuration + 1500)

      // Open purchase modal after preview disappears (2 seconds total delay)
      stockModalTimeoutRef.current = setTimeout(() => {
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
      }, stockSpinDuration + 2000)
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
        handleEventCurrencyEarned('Market Event tile')
        
        // Check if Market Shield is active
        if (hasPowerUp('market-shield')) {
          consumePowerUp('market-shield')
          toast.success('Market Shield Activated!', {
            description: '🛡️ Protected from market event',
          })
          playSound('button-click')
          // Immediately transition back to idle (no modal to show)
          debugGame('Phase transition: landed -> idle (market shield blocked event)')
          setPhase('idle')
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
        // Immediately transition back to idle (no modal to show)
        debugGame('Phase transition: landed -> idle (event fallback)')
        setPhase('idle')
      }
    } else if (tile.type === 'corner') {
      debugGame('Corner tile:', tile.title)
      if (tile.title === 'Start / ThriftyPath') {
        // Check if it's Jackpot Week and player landed on Start
        if (position === 0) {
          const isJackpotWeekNow = isJackpotWeek()
          const currentJackpot = gameState.jackpot ?? 0
          
          if (isJackpotWeekNow && currentJackpot > 0) {
            // Award the jackpot!
            const jackpotWin = currentJackpot * rewardMultiplier
            setGameState(prev => ({
              ...prev,
              cash: prev.cash + jackpotWin,
              netWorth: prev.netWorth + jackpotWin,
              jackpot: 0, // Reset jackpot
            }))
            
            playSound('level-up')
            hapticSuccess()
            triggerTileCelebration(position, ['🎰', '💰', '🎉'])
            setShowCelebration(true)
            
            // Trigger inner circle celebration
            setIsJackpotCelebrating(true)
            
            // All inner tiles rainbow for 5 seconds
            const rainbowColors = ['oklch(0.60 0.20 0)', 'oklch(0.65 0.22 60)', 'oklch(0.70 0.20 120)', 
                                   'oklch(0.65 0.22 180)', 'oklch(0.60 0.25 240)', 'oklch(0.70 0.20 300)']
            
            INNER_TRACK_TILES.forEach((tile, index) => {
              setInnerTileColors(prev => new Map(prev).set(tile.id, rainbowColors[index % rainbowColors.length]))
            })
            
            setTimeout(() => {
              setIsJackpotCelebrating(false)
              setInnerTileColors(new Map()) // Reset all colors
            }, 5000)
            
            toast.success(`🎰 JACKPOT WIN!`, {
              description: `You landed on Start during Jackpot Week! +$${jackpotWin.toLocaleString()}${rewardMultiplier > 1 ? ` (${rewardMultiplier}x)` : ''}`,
            })
          } else if (isJackpotWeekNow) {
            toast.info('🎰 Jackpot Week!', {
              description: 'Land on Start to win the jackpot! Keep passing Start to build it up.',
            })
          } else {
            toast.info('You\'re on Start!', {
              description: 'Great place to plan your next move',
            })
          }
        }
        // Immediately transition back to idle (no modal to show)
        debugGame('Phase transition: landed -> idle (Start corner)')
        setPhase('idle')
      } else if (tile.title === 'Casino') {
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
        // Immediately transition back to idle (no modal to show)
        debugGame('Phase transition: landed -> idle (Court corner)')
        setPhase('idle')
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
    triggerCelebrationFromLastTile(['⭐', '✨'])
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
    triggerCelebrationFromLastTile(['💰', '🪙'])
  }

  const handleWildcardEvent = (event: WildcardEvent) => {
    debugGame('Applying wildcard event:', event.id)
    playSound('button-click')

    const shouldCelebrateCash = (event.effect.cash ?? 0) > 0
    const shouldCelebrateStars = (event.effect.stars ?? 0) > 0
    
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

    if (shouldCelebrateCash && shouldCelebrateStars) {
      triggerCelebrationFromLastTile(['⭐', '💰'])
    } else if (shouldCelebrateCash) {
      triggerCelebrationFromLastTile(['💰', '🪙'])
    } else if (shouldCelebrateStars) {
      triggerCelebrationFromLastTile(['⭐', '✨'])
    }
    
    // Transition back to idle after a short delay
    setTimeout(() => {
      debugGame('Phase transition: landed -> idle (wildcard event completed)')
      setPhase('idle')
    }, 1000)
  }

  const netWorthChange = ((gameState.netWorth - 100000) / 100000) * 100

  useEffect(() => {
    if (isPhone || isMobile) {
      return
    }

    const node = boardFrameRef.current
    if (!node) {
      return
    }

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      const nextSize = Math.round(Math.min(rect.width, rect.height))
      if (nextSize > 0) {
        setBoardRenderSize(prev => (prev === nextSize ? prev : nextSize))
      }
    }

    updateSize()

    const observer = new ResizeObserver(() => updateSize())
    observer.observe(node)
    window.addEventListener('resize', updateSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [isPhone, isMobile])

  // Board center classes - circular glass container
  const boardCenterClasses = [
    'relative bg-gradient-to-br from-white/15 via-white/8 to-white/12',
    'backdrop-blur-2xl border border-white/25',
    'shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)]',
    `${!isPhone && !isMobile ? 'p-0' : 'p-8'} transition-all duration-700`,
    // Circular container to match the board shape
    'rounded-full aspect-square',
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

  const activeEventCurrencyEmoji = activeEventCurrency?.emoji ?? '⭐'
  const activeEventRewardStars = activeEventCurrency?.rewardStars ?? 0
  const eventCurrencyProgress = activeEventCurrencyAmount

  const centralStockCard = (
    <CentralStockCard
      stock={currentStock}
      isVisible={showCentralStock}
      onClose={() => setShowCentralStock(false)}
    />
  )

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

        {/* Hide DiceHUD on mobile - shown in BottomNav instead */}
        {!isMobile && (
          <div data-tutorial="dice">
            <DiceHUD
              onRoll={handleRoll}
              lastRoll={lastRoll}
              phase={phase}
              rollsRemaining={rollsRemaining}
              nextResetTime={nextResetTime}
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
        
        {/* Event Banner - Shows active events at top */}
        {!isPhone && (
          <EventBanner
            events={activeEvents}
            onOpenCalendar={openEventCalendar}
          />
        )}

      {/* Layout wrapper - Three column layout for non-phone, regular for phone */}
      <div
        className={`relative z-10 ${!isPhone ? 'h-[calc(100vh-2rem)] w-full' : 'max-w-[1600px] mx-auto'}`}
        ref={boardContainerRef}
      >
        {!isPhone && !isMobile && (
          <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
            <img
              src="/board-game-v3/Chance.webp"
              alt="Chance cards"
              className="h-auto w-32 max-w-[18vw] drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
            />
          </div>
        )}
        {/* Left Column - Action buttons (desktop/tablet only) */}
        {!isPhone && (
          <div className={`absolute left-4 top-4 flex flex-col gap-6 items-start justify-start pt-4 transition-opacity duration-500 flex-shrink-0 z-20 ${
            isLogoPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="flex flex-col items-start gap-3">
              <UserIndicator 
                saving={saving} 
                lastSaved={lastSavedTime} 
                currentTier={currentTier}
                stars={gameState.stars}
                coins={gameState.coins}
              />
              <div className="w-72 rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="text-lg">{activeEventCurrencyEmoji}</span>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">Goal Rush</p>
                    <p className="text-sm font-semibold">
                      {currentActiveEvent
                        ? `${currentActiveEvent.title} Rewards`
                        : 'No active event'}
                    </p>
                    <p className="text-xs text-emerald-100/80">
                      {currentActiveEvent && activeEventRewardStars > 0 && eventCurrencyGoal > 0
                        ? `+${activeEventRewardStars.toLocaleString()} ⭐ every ${eventCurrencyGoal.toLocaleString()} ${activeEventCurrencyEmoji}`
                        : 'Event rewards update when an event begins.'}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>
                      {eventCurrencyGoal > 0
                        ? `${eventCurrencyProgress.toLocaleString()} / ${eventCurrencyGoal.toLocaleString()} ${activeEventCurrencyEmoji}`
                        : 'Event currency paused'}
                    </span>
                    <span>
                      {eventCurrencyGoal > 0
                        ? `${eventCurrencyToNextReward.toLocaleString()} to prize`
                        : 'Waiting on schedule'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300"
                      style={{ width: `${eventCurrencyProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-72">
                <EventTrackBar
                  definition={eventTrackDefinition}
                  progress={eventTrackProgress}
                  onClaim={claimMilestone}
                  onCTA={purchaseCTA}
                  ctaLabel={eventTrackCTA?.label ?? null}
                  ctaDisabled={!eventTrackCTA}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
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
              <Button
                onClick={() => {
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
                      onOpenStockExchangeBuilder: openStockExchangeOverlay,
                    },
                    priority: 'normal',
                  })
                }}
                className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Stars Hub"
              >
                <Star size={20} weight="fill" />
                Stars
              </Button>
              <Button
                onClick={() => {
                  showOverlay({
                    id: 'portfolio',
                    component: PortfolioModal,
                    props: {
                      gameState,
                    },
                    priority: 'normal',
                  })
                }}
                className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Portfolio"
                data-tutorial="portfolio"
              >
                <ChartLine size={20} weight="bold" />
                Portfolio
              </Button>
              <Button
                onClick={() => setAchievementsOpen(true)}
                className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Achievements"
              >
                <Trophy size={20} weight="fill" />
                Achievements
              </Button>
              <Button
                onClick={openEventCalendar}
                className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Events"
              >
                <CalendarBlank size={20} weight="fill" />
                Events
              </Button>
              <Button
                onClick={() => {
                  showOverlay({
                    id: 'netWorthGallery',
                    component: NetWorthGalleryModal,
                    props: {
                      currentNetWorth: gameState.netWorth,
                    },
                    priority: 'normal',
                  })
                }}
                className="bg-accent/90 hover:bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Net Worth Gallery"
              >
                <Crown size={20} weight="fill" />
                Net Worth Gallery
              </Button>
            </div>
          </div>
        )}

        {!isPhone && (
          <div className={`absolute right-4 top-4 z-30 transition-opacity duration-500 ${
            isLogoPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <Button
              onClick={() => handleBottomNavigation('settings')}
              className="h-12 w-12 rounded-full border border-white/15 bg-slate-900/80 text-white shadow-lg backdrop-blur hover:bg-slate-900"
              aria-label="Open Settings"
            >
              <GearSix size={22} weight="bold" />
            </Button>
          </div>
        )}

        {/* Board Container - Centered and scaled to fit viewport height */}
        <div className={`relative ${!isPhone ? 'flex-shrink flex items-center justify-center overflow-hidden' : ''}`} style={{
          ...((!isPhone) ? {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            height: '100%',
            maxHeight: `min(calc(100vh - 4rem), ${BOARD_SIZE}px)`,
            maxWidth: `${BOARD_SIZE}px`,
            aspectRatio: '1 / 1',
          } : {
            width: `${boardSize}px`,
            height: `${boardSize}px`,
          })
        }} ref={boardFrameRef}>
        {/* Board wrapper with 3D camera or classic zoom support */}
        <Board3DViewport
          camera={camera}
          isMobile={isMobile && !isPhone}
          boardStyle={camera3DStyle}
          containerStyle={camera3DContainerStyle}
          playerPosition={gameState.position}
          boardSize={boardSize}
        >
          <BoardViewport
            boardSize={{ width: boardSize, height: boardSize }}
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
          {/* Decorative center slices and stock ticker ribbon - Desktop only */}
          {!isPhone && !isMobile && (
            <>
              <CenterSlices radius={600} />
              <StockTickerRibbon
                radius={boardOuterRadius}
                isActive={isCategoryTileActive}
                isSpinning={isStockSpinning}
              />
            </>
          )}

          {/* Center Content - Main Carousel - HIDDEN on phone layout */}
          {!isPhone && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4">
            <CenterCarousel
              gameState={gameState}
              netWorthChange={netWorthChange}
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

          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 pointer-events-none z-30">
                <TileCelebrationEffect celebrations={tileCelebrations} />
              </div>
              <div
                className={`transition-opacity duration-500 ${
                  showBoardTiles ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-hidden={!showBoardTiles}
              >
                {/* Outer Ring - Main Board Layout */}
                {(() => {
                  // Calculate tile positions for circular layout
                  const tileBoardSize = { width: boardSize, height: boardSize }
                  const tilePositions = calculateTilePositions(tileBoardSize, 27, boardOuterRadius, false)
                  
                  return BOARD_TILES.map((tile) => {
                    const position = tilePositions.find(p => p.id === tile.id)
                    if (!position) return null
                    
                    // Calculate position relative to the board container padding
                    const left = position.x - boardPadding
                    const top = position.y - boardPadding
                    
                    // Rotate tile to face outward from center
                    // Add 90 degrees because tiles are naturally "upright" and we want them perpendicular to radius
                    const rotation = position.angle + 90
                    
                    return (
                      <div
                        key={tile.id}
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${left}px`,
                          top: `${top}px`,
                          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <Tile
                          tile={tile}
                          isActive={tile.id === gameState.position}
                          isHopping={hoppingTiles.includes(tile.id)}
                          isLanded={tile.id === gameState.position && phase === 'landed'}
                          hasOwnership={tile.category ? ownedCategories.has(tile.category) : false}
                          ringNumber={1}
                          onClick={() => {
                            if (phase === 'idle') {
                              handleTileLanding(tile.id)
                            }
                          }}
                        />
                      </div>
                    )
                  })
                })()}
                
                {/* Inner Mystery Cards - Always visible */}
                {(() => {
                  const tileBoardSize = { width: boardSize, height: boardSize }
                  const innerPositions = calculateTilePositions(tileBoardSize, 12, boardOuterRadius, true)
                  
                  // Mobile scaling adjustment
                  const mobileScale = isPhone ? 0.6 : 0.75
                  
                  return INNER_TRACK_TILES.map((tile, index) => {
                    const position = innerPositions[index]
                    if (!position) return null
                    
                    const left = position.x - boardPadding
                    const top = position.y - boardPadding
                    const rotation = position.angle + 90
                    
                    return (
                      <div
                        key={tile.id}
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${left}px`,
                          top: `${top}px`,
                          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${mobileScale})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <MysteryCard
                          isActive={activeInnerTile === tile.id}
                          color={innerTileColors.get(tile.id) || tile.colorBorder || 'oklch(0.35 0.02 250)'}
                          isJackpotCelebrating={isJackpotCelebrating}
                          index={index}
                        />
                      </div>
                    )
                  })
                })()}
                
                {/* Ring 2, Ring 3, and Wealth Throne */}
                {(() => {
                  // Ring configuration constants
                  const RING_2_ID_OFFSET = 200  // Ring 2 tile IDs start at 200
                  const RING_3_ID_OFFSET = 300  // Ring 3 tile IDs start at 300
                  const RING_2_SCALE = 0.8      // Scale Ring 2 tiles to 80%
                  const RING_3_SCALE = 0.6      // Scale Ring 3 tiles to 60%
                  
                  const tileBoardSize = { width: boardSize, height: boardSize }
                  const { ring2, ring3, thronePosition } = calculateAllRingPositions(tileBoardSize, boardOuterRadius)
                  
                  return (
                    <>
                      {/* Ring 2 - Executive Floor (18 tiles) */}
                      {RING_2_TILES.map((tile) => {
                        const position = ring2.find(p => p.id === (tile.id - RING_2_ID_OFFSET))
                        if (!position) return null
                        
                        const left = position.x - boardPadding
                        const top = position.y - boardPadding
                        const rotation = position.angle + 90
                        
                        return (
                          <div
                            key={tile.id}
                            className="absolute pointer-events-auto"
                            style={{
                              left: `${left}px`,
                              top: `${top}px`,
                              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${RING_2_SCALE})`,
                              transformOrigin: 'center center',
                              opacity: gameState.currentRing >= 2 ? 1 : 0.4, // Dim if not unlocked
                            }}
                          >
                            <Tile
                              tile={tile}
                              isActive={gameState.currentRing === 2 && tile.id === gameState.position}
                              isHopping={false}
                              isLanded={false}
                              ringNumber={2}
                              onClick={() => {
                                if (phase === 'idle' && gameState.currentRing === 2) {
                                  handleTileLanding(tile.id)
                                }
                              }}
                            />
                          </div>
                        )
                      })}

                      {/* Ring 3 - Elite Circle (9 tiles) */}
                      {RING_3_TILES.map((tile) => {
                        const position = ring3.find(p => p.id === (tile.id - RING_3_ID_OFFSET))
                        if (!position) return null
                        
                        const left = position.x - boardPadding
                        const top = position.y - boardPadding
                        const rotation = position.angle + 90
                        
                        return (
                          <div
                            key={tile.id}
                            className="absolute pointer-events-auto"
                            style={{
                              left: `${left}px`,
                              top: `${top}px`,
                              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${RING_3_SCALE})`,
                              transformOrigin: 'center center',
                              opacity: gameState.currentRing >= 3 ? 1 : 0.3, // More dim if not unlocked
                            }}
                          >
                            <Tile
                              tile={tile}
                              isActive={gameState.currentRing === 3 && tile.id === gameState.position}
                              isHopping={false}
                              isLanded={false}
                              ringNumber={3}
                              isRing3Revealed={ring3Revealed}
                              isRing3Revealing={ring3Revealing}
                              onClick={() => {
                                if (phase === 'idle' && gameState.currentRing === 3) {
                                  handleTileLanding(tile.id)
                                }
                              }}
                            />
                          </div>
                        )
                      })}

                      {/* Wealth Throne - Center */}
                      <div
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${thronePosition.x - boardPadding}px`,
                          top: `${thronePosition.y - boardPadding}px`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className={`
                          w-20 h-20 rounded-full 
                          flex items-center justify-center 
                          transition-all duration-500
                          ${ring3Revealed 
                            ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-2xl shadow-yellow-500/50 border-2 border-yellow-300 animate-pulse' 
                            : 'bg-gradient-to-br from-gray-600 to-gray-800 shadow-lg border-2 border-gray-500 opacity-50'
                          }
                        `}>
                          <span className="text-3xl">{ring3Revealed ? '👑' : '🔒'}</span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </BoardViewport>
        </Board3DViewport>

        {!isPhone && (
          <div className="absolute bottom-6 left-6 z-40 pointer-events-none">
            <img
              src={`${import.meta.env.BASE_URL}Fraud.webp`}
              alt="Fraud character appears during Court of Capital"
              className={`w-28 sm:w-32 md:w-40 transition-all duration-300 ease-out origin-bottom-right ${
                isCourtOfCapitalTile
                  ? 'opacity-100 scale-100 translate-y-0 drop-shadow-[0_0_25px_rgba(255,180,60,0.85)] animate-[pulse_2.4s_ease-in-out_infinite]'
                  : 'opacity-0 scale-75 translate-y-6'
              }`}
            />
          </div>
        )}
        
        {/* Board Zoom Controls for mobile */}
        <BoardZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onFitToScreen={fitToScreen}
          onViewFullBoard={zoomOutTemporarily}
          autoFollow={autoFollow}
          onToggleAutoFollow={toggleAutoFollow}
          isMobile={isMobile && !isPhone}
          cameraMode={camera.mode}
        />
        </div>

        {/* Right Column - Action buttons (desktop/tablet only) */}
        {!isPhone && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center transition-opacity duration-500 flex-shrink-0 z-20 ${
            isLogoPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {/* Shop Button */}
            <Button
              onClick={openShopOverlay}
              className="bg-transparent hover:bg-transparent shadow-lg hover:shadow-xl transition-all rounded-full p-0 flex items-center justify-center"
              aria-label="Open Shop"
              data-tutorial="shop"
            >
              <img
                src={`${import.meta.env.BASE_URL}Shop.webp`}
                alt="Shop"
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </Button>
            {/* Stock Exchange Builder Button */}
            <Button
              onClick={openStockExchangeOverlay}
              className="bg-transparent hover:bg-transparent shadow-lg hover:shadow-xl transition-all rounded-full p-0 flex items-center justify-center"
              aria-label="Open Stock Exchange Builder"
            >
              <img
                src={`${import.meta.env.BASE_URL}Build.webp`}
                alt="Stock Exchange Builder"
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </Button>
            {/* Challenges Button via ChallengeTracker */}
            <div data-tutorial="challenges">
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
            <div className="flex items-center gap-2">
              <Button
                onClick={openEventCalendar}
                className="relative bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-2xl px-5 py-3 text-left min-h-14"
                aria-label="Open Right Now"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    {rightNowEvent?.icon && <span className="text-base">{rightNowEvent.icon}</span>}
                    {rightNowEvent ? rightNowEvent.title : 'No event scheduled'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                    {rightNowCountdownTarget
                      ? `${rightNowStatusLabel} ${formatEventCountdown(rightNowCountdownTarget, rightNowTick)}`
                      : 'Schedule updating'}
                  </span>
                </div>
              </Button>
              <Button
                onClick={openEventCalendar}
                className="bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-12 w-12 p-0 flex items-center justify-center"
                aria-label="Open Event Calendar"
              >
                <CalendarBlank size={20} weight="fill" />
              </Button>
            </div>
          </div>
        )}
      </div>

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

    </div>
  )

  const overlayContent = (
    <>
      {/* Toaster - positioned outside transformed containers with high z-index for phone */}
      {notificationsEnabled && (
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
      )}

      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Tutorial for first-time users */}
      {!isLoading && <TutorialTooltip />}

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
        stockExchangeBuilderProps={{
          exchanges: stockExchanges,
          progress: stockExchangeState.exchanges,
          selectedExchangeId,
          onSelectExchange: selectExchange,
          availableCapital: gameState.cash,
          onUpgradePillar,
          onViewStock,
          onPurchaseOffer: (offerId: string) => {
            toast.info('Premium boosts coming soon', {
              description: `Offer ${offerId} will be available later.`,
            })
          },
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

      <AchievementsModal
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        unlockedAchievements={unlockedAchievements}
        getAchievementProgress={getAchievementProgress}
      />

      {/* Portal Animation */}
      <PortalAnimation 
        transition={portalTransition}
        isAnimating={isPortalAnimating}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* DevTools: Tap Test Overlay (dev mode only) */}
      {TapTestOverlay && (
        <Suspense fallback={null}>
          <TapTestOverlay />
        </Suspense>
      )}
    </>
  )

  // Render with appropriate layout based on screen size
  if (isPhone) {
    return (
      <>
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
          onRollDice={(multiplier) => handleRoll(multiplier)}
          multiplier={mobileMultiplier}
          onCycleMultiplier={cycleMobileMultiplier}
          isRolling={phase === 'rolling'}
          isAutoRolling={isAutoRolling}
          onToggleAutoRoll={toggleAutoRoll}
          lastEnergyCheck={gameState.lastEnergyCheck}
          dice1={dice1}
          dice2={dice2}
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
          onOpenShop={openShopOverlay}
          onOpenStockExchangeBuilder={openStockExchangeOverlay}
          onOpenRightNow={openEventCalendar}
          eventTrackNode={(
            <EventTrackBar
              definition={eventTrackDefinition}
              progress={eventTrackProgress}
              onClaim={claimMilestone}
              onCTA={purchaseCTA}
              ctaLabel={eventTrackCTA?.label ?? null}
              ctaDisabled={!eventTrackCTA}
              compactByDefault
            />
          )}
        >
          {mainContent}
        </PhoneLayout>
        {centralStockCard}
        {isPhone && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
            <img
              src={`${import.meta.env.BASE_URL}Fraud.webp`}
              alt="Fraud character appears during Court of Capital"
              className={`w-36 sm:w-40 transition-all duration-300 ease-out ${
                isCourtOfCapitalTile
                  ? 'opacity-100 scale-100 translate-y-0 drop-shadow-[0_0_35px_rgba(255,180,60,0.9)] animate-[pulse_2.4s_ease-in-out_infinite]'
                  : 'opacity-0 scale-75 translate-y-6'
              }`}
            />
          </div>
        )}
        {overlayContent}
      </>
    )
  }

  // Desktop/Tablet layout with existing MobileGameLayout wrapper
  return (
    <>
      <MobileGameLayout showBottomNav={!isPhone}>
        {mainContent}
      </MobileGameLayout>
      {centralStockCard}
      {overlayContent}
    </>
  )
}

export default App
