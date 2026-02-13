import { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Star, ChartLine, Trophy, CalendarBlank, Crown, GearSix, GameController } from '@phosphor-icons/react'
import { Tile } from '@/components/Tile'
import { DiceHUD } from '@/components/DiceHUD'
import { EconomyWindowStatus } from '@/components/EconomyWindowStatus'
import { HubModal } from '@/components/HubModal'
import { AIInsightsModal } from '@/components/AIInsightsModal'
import { CentralStockCard } from '@/components/CentralStockCard'
import { StockModal } from '@/components/StockModal'
import { EventChoiceModal } from '@/components/EventChoiceModal'
import { ThriftyPathModal } from '@/components/ThriftyPathModal'
import { WildcardEventModal } from '@/components/WildcardEventModal'
import { ChanceCardModal } from '@/components/ChanceCardModal'
import { ProToolsOverlay } from '@/components/ProToolsOverlay'
import { BiasSanctuaryModal } from '@/components/BiasSanctuaryModal'
import { CenterCarousel } from '@/components/CenterCarousel'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { TileCelebration, TileCelebrationEffect } from '@/components/TileCelebrationEffect'
import { CasinoModal } from '@/components/CasinoModal'
import { CasinoModePanel } from '@/components/CasinoModePanel'
import { UserIndicator } from '@/components/UserIndicator'
import { ChallengeTracker } from '@/components/ChallengeTracker'
import { EventBanner } from '@/components/EventBanner'
import { NetWorthGalleryModal } from '@/components/NetWorthGalleryModal'
import { TierUpModal } from '@/components/TierUpModal'
import { ThriftPathStatus } from '@/components/ThriftPathStatus'
import { ThriftPathAura } from '@/components/ThriftPathAura'
import { OutOfRollsModal } from '@/components/OutOfRollsModal'
import { SeasonPassModal } from '@/components/SeasonPassModal'
import { DailyDividendsModal } from '@/components/DailyDividendsModal'
import { BoardZoomControls } from '@/components/BoardZoomControls'
import { Board3DViewport } from '@/components/Board3DViewport'
import { StockTickerRibbon } from '@/components/StockTickerRibbon'
import { CenterSlices } from '@/components/CenterSlices'
import { AchievementsModal } from '@/components/AchievementsModal'
import { MysteryCard } from '@/components/MysteryCard'
import { PortalAnimation } from '@/components/PortalAnimation'
import { PortalTeleportAnimation } from '@/components/PortalTeleportAnimation'
import { MoneyCelebration } from '@/components/MoneyCelebration'
import { Card } from '@/components/ui/card'
import { QuickCelebration } from '@/components/QuickCelebration'
import { WheelOfFortuneModal } from '@/components/WheelOfFortuneModal'
import { VaultHeistModal } from '@/components/VaultHeistModal'
import { ThroneVictoryModal } from '@/components/ThroneVictoryModal'
import { RouletteStatusPanel } from '@/components/RouletteStatusPanel'
import { RouletteVictoryModal } from '@/components/RouletteVictoryModal'
import { VAULT_HEIST_CONFIG } from '@/config/vaultHeist'
import { getActiveScheduleWindow } from '@/lib/windowSchedule'
import { getMiniGameSchedule } from '@/lib/miniGameSchedule'
import { VAULT_HEIST_FREE_PICK_COUNT } from '@/lib/vaultHeistRules'
import { SHOP2_ENABLED } from '@/lib/featureFlags'
import { logProToolsDiagnostic } from '@/lib/proToolsDiagnostics'
import { getCourtOfCapitalDefinition } from '@/lib/courtOfCapital'

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
const Shop2Modal = lazy(() => import('@/components/Shop2Modal'))
const ChallengesModal = lazy(() => import('@/components/ChallengesModal'))
const EventCalendar = lazy(() => import('@/components/EventCalendar'))
const PortfolioModal = lazy(() =>
  import('@/components/PortfolioModal').then((module) => ({ default: module.PortfolioModal }))
)
const SettingsModal = lazy(() => import('@/components/SettingsModal'))
const StockExchangeBuilderModal = lazy(() => import('@/components/StockExchangeBuilderModal'))
const GamesHub = lazy(() => import('@/pages/GamesHub').then(m => ({ default: m.GamesHub })))

const SHOP_OVERLAY_ID = SHOP2_ENABLED ? 'shop2' : 'shop'
const SHOP_OVERLAY_COMPONENT = SHOP2_ENABLED ? Shop2Modal : ShopModal

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

const DAILY_WHEEL_SPIN_DATE_KEY = 'dailyWheelSpinDate'
const DAILY_WHEEL_SPIN_LIMIT_KEY = 'dailyWheelSpinLimit'
const DAILY_WHEEL_SPIN_USED_KEY = 'dailyWheelSpinUsed'
const VAULT_HEIST_FREE_PICKS_KEY = 'vaultHeistFreePicks'
const VAULT_HEIST_WINDOW_KEY = 'vaultHeistWindowKey'
const DAILY_WHEEL_SPIN_MIN = 3
const DAILY_WHEEL_SPIN_MAX = 5
const getTodayKey = () => new Date().toLocaleDateString('en-CA')
const getRandomDailyWheelSpinLimit = () =>
  Math.floor(Math.random() * (DAILY_WHEEL_SPIN_MAX - DAILY_WHEEL_SPIN_MIN + 1)) + DAILY_WHEEL_SPIN_MIN
const FALL_PORTAL_RELIEF_REWARDS: QuickRewardType[] = ['bonus-roll', 'stars', 'coins']
const FALL_PORTAL_EVAC_REWARDS: QuickRewardType[] = ['xp', 'cash', 'bonus-roll']
const CHANCE_LIFT_REWARDS: QuickRewardType[] = ['bonus-roll', 'xp']
const CHANCE_CONSOLATION_REWARDS: QuickRewardType[] = ['stars', 'coins', 'cash']

type WeightedOutcome<T> = {
  odds: number
  value: T
}

type PortalOutcome = {
  id: 'safety-net' | 'executive-evac' | 'hard-drop'
  title: string
  description: (rewardLabel?: string) => string
  rewardPool?: QuickRewardType[]
  celebration?: string[]
}

type ChanceOutcome = {
  id: 'jackpot' | 'executive-lift' | 'market-boost'
  title: string
  description: (rewardLabel?: string) => string
  rewardPool?: QuickRewardType[]
  celebration?: string[]
}

type CasinoMode = 'none' | 'modeA' | 'modeB'

const FALL_PORTAL_OUTCOMES: WeightedOutcome<PortalOutcome>[] = [
  {
    odds: 0.35,
    value: {
      id: 'safety-net',
      title: '🛟 Safety Net',
      description: (rewardLabel) => `Grab a ${rewardLabel} on the way down.`,
      rewardPool: FALL_PORTAL_RELIEF_REWARDS,
      celebration: ['🛟', '✨'],
    },
  },
  {
    odds: 0.25,
    value: {
      id: 'executive-evac',
      title: '🪂 Executive Evac',
      description: (rewardLabel) => `Parachuted with a ${rewardLabel}.`,
      rewardPool: FALL_PORTAL_EVAC_REWARDS,
      celebration: ['🪂', '💫'],
    },
  },
  {
    odds: 0.4,
    value: {
      id: 'hard-drop',
      title: '⬇️ Fall Portal',
      description: () => 'You dropped back to Street Level.',
    },
  },
]

const CHANCE_OUTCOMES: WeightedOutcome<ChanceOutcome>[] = [
  {
    odds: 0.2,
    value: {
      id: 'jackpot',
      title: '🎴 Jackpot Card!',
      description: () => 'You shot up to the Wealth Run.',
      celebration: ['🎴', '💎', '🚀'],
    },
  },
  {
    odds: 0.35,
    value: {
      id: 'executive-lift',
      title: '🎴 Executive Lift',
      description: (rewardLabel) => `Lifted with a ${rewardLabel}.`,
      rewardPool: CHANCE_LIFT_REWARDS,
      celebration: ['🎴', '✨'],
    },
  },
  {
    odds: 0.45,
    value: {
      id: 'market-boost',
      title: '🎴 Market Boost',
      description: (rewardLabel) => `Executive boost: ${rewardLabel}.`,
      rewardPool: CHANCE_CONSOLATION_REWARDS,
      celebration: ['🎴', '📈'],
    },
  },
]

const pickWeightedOutcome = <T,>(outcomes: WeightedOutcome<T>[]): T => {
  const roll = Math.random()
  let cumulative = 0

  for (const outcome of outcomes) {
    cumulative += outcome.odds
    if (roll <= cumulative) {
      return outcome.value
    }
  }

  return outcomes[outcomes.length - 1].value
}
const pickRandomReward = <T,>(options: T[]): T =>
  options[Math.floor(Math.random() * options.length)]

const rollRouletteDice = () => {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  return {
    dice,
    total: dice.reduce((sum, value) => sum + value, 0),
  }
}

import { GameState, Stock, BiasCaseStudy, WildcardEvent, PortalTransition, RingNumber, Tile as TileType } from '@/lib/types'
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
  RING_3_CONFIG,
  PORTAL_CONFIG,
  getEliteStocksForRing3,
  ROULETTE_REWARDS,
  type RouletteReward,
} from '@/lib/mockData'
import { getRandomWildcardEvent, CASH_PERCENTAGE_PENALTY } from '@/lib/wildcardEvents'
import { SHOP_ITEMS, ShopCategory } from '@/lib/shopItems'
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
import { getPortfolioRewardBuff } from '@/lib/portfolioRewards'
import { rollDice, DOUBLES_BONUS } from '@/lib/dice'
import { 
  calculateQuickReward, 
  calculatePremiumReward,
  getMysteryReward, 
  getChameleonType,
  QUICK_REWARD_CONFIG,
  QuickRewardType 
} from '@/lib/quickRewardTiles'
import {
  EVENT_TILE_REWARD_LABELS,
  getEventTileDefinition,
  getMarketEventTileDefinition,
  type EventTileOption,
} from '@/lib/eventTiles'
import { getEnergyResetAmount, getResetRollsAmount, getVaultRegenBonusRolls, ENERGY_CONFIG } from '@/lib/energy'
import { calculateTilePositions, calculateAllRingPositions } from '@/lib/tilePositions'
import { calculateMovement, getHoppingTiles, getPortalConfigForRing } from '@/lib/movementEngine'
import { isJackpotWeek } from '@/lib/events'
import { applyRingMultiplier, getMultiplierDisplay } from '@/lib/rewardMultiplier'
import { getLearningTileDefinition } from '@/lib/learningTiles'
import { getStockCategoryDefinition } from '@/lib/stockCategories'
import { getTileLabelConfig } from '@/lib/tileLabels'
import { getLearningQuestionCount } from '@/lib/learningQuestionBank'
import { getLearningRewardSummary } from '@/lib/learningRewards'
import { getDailyStreakUpdate } from '@/lib/streaks'
import {
  ECONOMY_LOCAL_STORAGE_KEY,
  createInitialEconomyState,
  extractEconomyState,
  normalizeEconomyState,
} from '@/lib/economyState'
import {
  applySoftThrottleFromNetWorthChange,
  getSoftThrottleMultiplier,
  tickEconomyThrottle,
} from '@/lib/economyThrottle'
import { clampMultiplierToLeverage, getUnlockedMultipliers } from '@/lib/leverage'
import { MOMENTUM_MAX, applyMomentumDecay, applyMomentumFromNetWorthChange } from '@/lib/momentum'
import type { EconomyWindowState } from '@/lib/economyWindows'
import { getActiveEconomyWindow, getEconomyWindowMultipliers, tickEconomyWindows } from '@/lib/economyWindows'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { useGameSave } from '@/hooks/useGameSave'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/hooks/useSound'
import { getRewardSound, SoundType } from '@/lib/sounds'
import { useShopInventory } from '@/hooks/useShopInventory'
import { useShopVaultPurchase } from '@/hooks/useShopVaultPurchase'
import { useShopVaultOverview } from '@/hooks/useShopVaultOverview'
import type { VaultItemSummary } from '@/hooks/useShopVaultOverview'
import { useAchievements } from '@/hooks/useAchievements'
import { useChallenges } from '@/hooks/useChallenges'
import { useSeasonPass } from '@/hooks/useSeasonPass'
import { useEvents } from '@/hooks/useEvents'
import { useMiniGames } from '@/hooks/useMiniGames'
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
import { setTelemetryContext, trackTelemetryEvent } from '@/lib/telemetry'
import { trackInstrumentationEvent } from '@/lib/instrumentation'
import { getScratchcardEventOverride } from '@/lib/scratchcardEvents'

// Alias for backward compatibility
type Phase = GamePhase

// Debug helper function - logs only when instrumentation is enabled
const debugGame = (message: string, payload?: unknown) => {
  trackInstrumentationEvent(message, payload)
}

// Constants
const LOGO_PANEL_INDEX = 1  // 2nd panel (0-indexed)
const BOARD_CONTAINER_BASE_CLASSES = "relative bg-gradient-to-br from-white/15 via-white/8 to-white/12 backdrop-blur-2xl rounded-2xl border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,0.08),_0_20px_80px_rgba(0,0,0,0.35)] p-8 min-h-[900px] transition-opacity duration-700"

const BASE_NET_WORTH = 100000

// Ring 3 reveal animation timing (in milliseconds)
// Animation duration per tile: 800ms
// Stagger delay between tiles: 100ms
// Total tiles in Ring 3: 7
// Total animation time: 800ms + (7 tiles × 100ms stagger) = 1500ms
const RING_3_REVEAL_DURATION = 1500

const getTileTitleForRing = (ring: RingNumber | 0, tileId: number) => {
  if (ring === 0) {
    return 'Throne'
  }

  const tiles = ring === 1 ? BOARD_TILES : ring === 2 ? RING_2_TILES : RING_3_TILES
  return tiles.find(tile => tile.id === tileId)?.title ?? `Tile ${tileId}`
}

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

const rollAscendMeterPoints = () => Math.floor(Math.random() * 3) + 1

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
  const currencySnapshotRef = useRef({
    cash: 0,
    stars: 0,
    coins: 0,
    xp: 0,
  })
  const currencySnapshotInitializedRef = useRef(false)
  const ASCEND_PROGRESS_GOAL = 100

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
    economy: createInitialEconomyState(),
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
      daily_quiz: 0,
      lastQuizDate: null,
      scratchcardsPlayed: 0,
      scratchcardsWon: 0,
      scratchcardWinStreak: 0,
      learningStreakDays: 0,
      lastLearningDate: null,
      tilesVisited: [],
      consecutiveDays: 0,
      lastLoginDate: null,
      totalStarsEarned: 0,
      roll6Streak: 0,
      ringAscendProgress: 0,
      ringVisitCounts: { ring1: 1, ring2: 0, ring3: 0 },
      ringHistory: [
        {
          ring: 1,
          at: new Date().toISOString(),
          reason: 'start',
        },
      ],
      lastRingVisited: 1,
      lastRingVisitedAt: new Date().toISOString(),
    },
    lifetimeCashEarned: 0,
    lifetimeStarsEarned: 0,
    lifetimeCoinsEarned: 0,
    lifetimeXpEarned: 0,
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

  const economyLoadedFromLocalRef = useRef(false)
  const lastEconomySerializedRef = useRef<string | null>(null)
  const lastNetWorthRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [rollsRemaining, setRollsRemaining] = useState(DAILY_ROLL_LIMIT)
  const [nextResetTime, setNextResetTime] = useState(getNextMidnight())
  const [hoppingTiles, setHoppingTiles] = useState<number[]>([])
  const [landingTilePreview, setLandingTilePreview] = useState<string | null>(null)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  
  // Auto-roll state for Monopoly GO style continuous rolling
  const [isAutoRolling, setIsAutoRolling] = useState(false)
  const [mobileMultiplier, setMobileMultiplier] = useState<RollMultiplier>(1)
  const economyState = extractEconomyState(gameState)
  const leverageLevel = economyState.leverageLevel
  const momentum = economyState.momentum
  const unlockedMultipliers = useMemo(() => getUnlockedMultipliers(leverageLevel), [leverageLevel])

  // Ring 3 reveal state
  const [ring3Revealed, setRing3Revealed] = useState(false)
  const [ring3Revealing, setRing3Revealing] = useState(false)
  const [ring3CelebrationActive, setRing3CelebrationActive] = useState(false)
  const ring3CelebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ring 3 roll tracking and animations
  const [ring3RollUsed, setRing3RollUsed] = useState(false)
  const [ringTransitionDirection, setRingTransitionDirection] = useState<'up' | 'down' | null>(null)
  const [moneyCelebration, setMoneyCelebration] = useState<{
    active: boolean
    amount: number
    position: { x: number; y: number }
  } | null>(null)
  const [rouletteModeActive, setRouletteModeActive] = useState(false)
  const [rouletteSpinActive, setRouletteSpinActive] = useState(false)
  const [lastRouletteReward, setLastRouletteReward] = useState<RouletteReward | null>(null)
  const [rouletteSpinCount, setRouletteSpinCount] = useState(0)
  const [rouletteVictoryOpen, setRouletteVictoryOpen] = useState(false)

  // Quick Reward celebration state
  const [quickCelebration, setQuickCelebration] = useState<{
    active: boolean
    emoji: string
    amount: number
    position: { x: number; y: number }
  } | null>(null)

  // Ring focus system state
  const [revealingRing, setRevealingRing] = useState<RingNumber | null>(null)
  const [fadingRing, setFadingRing] = useState<RingNumber | null>(null)
  const ringTransitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Portal state for ring transitions
  const [portalTransition, setPortalTransition] = useState<PortalTransition | null>(null)
  const [isPortalAnimating, setIsPortalAnimating] = useState(false)

  // Throne victory modal state
  const [showThroneVictory, setShowThroneVictory] = useState(false)
  const [casinoMode, setCasinoMode] = useState<CasinoMode>('none')

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

  const [developerModeEnabled, setDeveloperModeEnabled] = useState(false)
  const [developerPanelOpen, setDeveloperPanelOpen] = useState(false)

  useEffect(() => {
    const storedValue = localStorage.getItem('developerModeEnabled')
    if (storedValue !== null) {
      setDeveloperModeEnabled(storedValue === 'true')
    }

    const handleDeveloperModeChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail?.enabled === 'boolean') {
        setDeveloperModeEnabled(event.detail.enabled)
      } else {
        const fallback = localStorage.getItem('developerModeEnabled')
        setDeveloperModeEnabled(fallback === 'true')
      }
    }

    window.addEventListener('developer-mode-changed', handleDeveloperModeChange)
    return () => window.removeEventListener('developer-mode-changed', handleDeveloperModeChange)
  }, [])

  useEffect(() => {
    if (!developerModeEnabled) {
      setDeveloperPanelOpen(false)
    }
  }, [developerModeEnabled])

  // Keep state for data that modals need (but not open/closed state)
  const [currentStock, setCurrentStock] = useState<Stock | null>(null)
  const [showCentralStock, setShowCentralStock] = useState(false)
  const [isStockSpinning, setIsStockSpinning] = useState(false)
  const [currentEvent, setCurrentEvent] = useState('')
  const [currentCaseStudy, setCurrentCaseStudy] = useState<BiasCaseStudy | null>(null)
  const [currentWildcardEvent, setCurrentWildcardEvent] = useState<WildcardEvent | null>(null)

  // ProTools overlay state (separate from overlay manager)
  const [proToolsOpen, setProToolsOpen] = useState(false)
  const [proToolsFallback, setProToolsFallback] = useState<{
    type: 'login' | 'error'
    code: string
  } | null>(null)

  // Wheel of Fortune state
  const [isWheelOpen, setIsWheelOpen] = useState(false)
  const [freeWheelSpins, setFreeWheelSpins] = useState(1)
  const [dailyWheelSpinLimit, setDailyWheelSpinLimit] = useState(DAILY_WHEEL_SPIN_MIN)
  const [dailyWheelSpinsUsed, setDailyWheelSpinsUsed] = useState(0)
  const [todayKey, setTodayKey] = useState(() => getTodayKey())

  // Vault Heist state
  const [showVaultHeist, setShowVaultHeist] = useState(false)
  const vaultHeistSchedule = useMemo(() => getMiniGameSchedule('vault-heist')?.schedule ?? null, [])
  const getActiveVaultHeistWindowKey = useCallback(() => {
    if (!vaultHeistSchedule || !VAULT_HEIST_CONFIG.resetOnWindowStart) {
      return null
    }
    const activeWindow = getActiveScheduleWindow(vaultHeistSchedule, new Date())
    return activeWindow ? activeWindow.start.toISOString() : null
  }, [vaultHeistSchedule])
  const [vaultHeistWindowKey, setVaultHeistWindowKey] = useState<string | null>(() => getActiveVaultHeistWindowKey())
  const [freeVaultPicks, setFreeVaultPicks] = useState(VAULT_HEIST_FREE_PICK_COUNT)
  const persistVaultHeistFreePicks = useCallback((remaining: number, windowKey: string | null) => {
    try {
      localStorage.setItem(VAULT_HEIST_FREE_PICKS_KEY, String(remaining))
      if (windowKey) {
        localStorage.setItem(VAULT_HEIST_WINDOW_KEY, windowKey)
      }
    } catch {
      // Ignore storage access errors
    }
  }, [])

  // Mobile UI states
  const [activeSection, setActiveSection] = useState<'home' | 'challenges' | 'shop' | 'leaderboard' | 'settings'>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [dynamicRadius, setDynamicRadius] = useState<number | undefined>(undefined)

  const resetDailyWheelSpins = useCallback((dateKey: string) => {
    const newLimit = getRandomDailyWheelSpinLimit()
    setDailyWheelSpinLimit(newLimit)
    setDailyWheelSpinsUsed(0)
    setFreeWheelSpins(1)
    try {
      localStorage.setItem(DAILY_WHEEL_SPIN_DATE_KEY, dateKey)
      localStorage.setItem(DAILY_WHEEL_SPIN_LIMIT_KEY, String(newLimit))
      localStorage.setItem(DAILY_WHEEL_SPIN_USED_KEY, '0')
    } catch {
      // Ignore storage access errors
    }
  }, [])

  useEffect(() => {
    try {
      const storedDate = localStorage.getItem(DAILY_WHEEL_SPIN_DATE_KEY)
      const storedLimit = Number(localStorage.getItem(DAILY_WHEEL_SPIN_LIMIT_KEY))
      const storedUsed = Number(localStorage.getItem(DAILY_WHEEL_SPIN_USED_KEY))
      const hasValidLimit = Number.isFinite(storedLimit)
        && storedLimit >= DAILY_WHEEL_SPIN_MIN
        && storedLimit <= DAILY_WHEEL_SPIN_MAX

      if (storedDate === todayKey && hasValidLimit) {
        const safeUsed = Number.isFinite(storedUsed)
          ? Math.min(Math.max(storedUsed, 0), storedLimit)
          : 0
        setDailyWheelSpinLimit(storedLimit)
        setDailyWheelSpinsUsed(safeUsed)
      } else {
        resetDailyWheelSpins(todayKey)
      }
    } catch {
      resetDailyWheelSpins(todayKey)
    }
  }, [todayKey, resetDailyWheelSpins])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextKey = getTodayKey()
      setTodayKey(prev => (prev === nextKey ? prev : nextKey))
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const activeWindowKey = getActiveVaultHeistWindowKey()
    setVaultHeistWindowKey(activeWindowKey)
    try {
      const storedWindowKey = localStorage.getItem(VAULT_HEIST_WINDOW_KEY)
      const storedPicks = Number(localStorage.getItem(VAULT_HEIST_FREE_PICKS_KEY))
      if (activeWindowKey && storedWindowKey === activeWindowKey && Number.isFinite(storedPicks)) {
        setFreeVaultPicks(Math.max(0, Math.min(storedPicks, VAULT_HEIST_FREE_PICK_COUNT)))
        return
      }
      if (!activeWindowKey && Number.isFinite(storedPicks)) {
        setFreeVaultPicks(Math.max(0, Math.min(storedPicks, VAULT_HEIST_FREE_PICK_COUNT)))
        return
      }
      if (activeWindowKey && VAULT_HEIST_CONFIG.resetOnWindowStart) {
        setFreeVaultPicks(VAULT_HEIST_FREE_PICK_COUNT)
        persistVaultHeistFreePicks(VAULT_HEIST_FREE_PICK_COUNT, activeWindowKey)
        return
      }
    } catch {
      // Ignore storage access errors
    }
    setFreeVaultPicks(VAULT_HEIST_FREE_PICK_COUNT)
  }, [getActiveVaultHeistWindowKey, persistVaultHeistFreePicks])

  useEffect(() => {
    if (!VAULT_HEIST_CONFIG.resetOnWindowStart) return
    const interval = window.setInterval(() => {
      const nextKey = getActiveVaultHeistWindowKey()
      setVaultHeistWindowKey(prev => (prev === nextKey ? prev : nextKey))
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [getActiveVaultHeistWindowKey])

  useEffect(() => {
    if (!vaultHeistWindowKey || !VAULT_HEIST_CONFIG.resetOnWindowStart) return
    try {
      const storedWindowKey = localStorage.getItem(VAULT_HEIST_WINDOW_KEY)
      if (storedWindowKey === vaultHeistWindowKey) return
      setFreeVaultPicks(VAULT_HEIST_FREE_PICK_COUNT)
      persistVaultHeistFreePicks(VAULT_HEIST_FREE_PICK_COUNT, vaultHeistWindowKey)
    } catch {
      setFreeVaultPicks(VAULT_HEIST_FREE_PICK_COUNT)
    }
  }, [vaultHeistWindowKey, persistVaultHeistFreePicks])

  const dailyWheelSpinsRemaining = Math.max(0, dailyWheelSpinLimit - dailyWheelSpinsUsed)
  const dailySpinAvailable = dailyWheelSpinsRemaining > 0

  const markDailySpinUsed = useCallback(() => {
    setDailyWheelSpinsUsed(prev => {
      const next = Math.min(prev + 1, dailyWheelSpinLimit)
      try {
        localStorage.setItem(DAILY_WHEEL_SPIN_DATE_KEY, todayKey)
        localStorage.setItem(DAILY_WHEEL_SPIN_LIMIT_KEY, String(dailyWheelSpinLimit))
        localStorage.setItem(DAILY_WHEEL_SPIN_USED_KEY, String(next))
      } catch {
        // Ignore storage access errors
      }
      return next
    })
  }, [dailyWheelSpinLimit, todayKey])

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
    currentRing: gameState.currentRing,
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
  const [teleportFlash, setTeleportFlash] = useState<{ from: number; to: number } | null>(null)
  
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
    if (hopIntervalRef.current) clearTimeout(hopIntervalRef.current)
    if (landingTimeoutRef.current) clearTimeout(landingTimeoutRef.current)
    if (previewCardTimeoutRef.current) clearTimeout(previewCardTimeoutRef.current)
    if (stockModalTimeoutRef.current) clearTimeout(stockModalTimeoutRef.current)
    if (stockSpinTimeoutRef.current) clearTimeout(stockSpinTimeoutRef.current)
  }

  const { getStockForCategory, loading: loadingUniverse, error: universeError, source: stockSource, universeCount } =
    useUniverseStocks()

  // Wrap getStockForCategory to filter for Ring 3 elite stocks
  const getStockForCategoryWithRingFilter = useCallback((category: string) => {
    const stock = getStockForCategory(category)
    
    // If on Ring 3 and it's an elite category, only allow 8.0+ composite score
    if (gameState.currentRing === 3 && category === 'elite') {
      const eliteStocks = getEliteStocksForRing3()
      if (eliteStocks.length > 0) {
        return eliteStocks[Math.floor(Math.random() * eliteStocks.length)]
      }
    }
    
    return stock
  }, [getStockForCategory, gameState.currentRing])

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

  const portfolioRewardBuff = useMemo(
    () => getPortfolioRewardBuff(gameState.holdings),
    [gameState.holdings]
  )
  const compactCurrencyFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 0 }),
    []
  )
  const rouletteHighlights = useMemo(
    () => ROULETTE_REWARDS.filter(reward => reward.tier === 'mega' || reward.tier === 'major').slice(0, 3),
    []
  )
  const rouletteLongTail = useMemo(
    () => ROULETTE_REWARDS.filter(reward => reward.tier === 'tail' || reward.tier === 'boost').slice(0, 4),
    []
  )

  const tileLabelContext = useMemo(
    () => ({ rouletteModeActive, compactCurrencyFormatter }),
    [rouletteModeActive, compactCurrencyFormatter]
  )

  const getTileLabelConfigForTile = useCallback(
    (tile: TileType, ring: RingNumber) => getTileLabelConfig(tile, ring, tileLabelContext),
    [tileLabelContext]
  )

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
    error: dailyDividendError,
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

  const { purchaseVaultItem, isPurchasing: isVaultPurchasing } = useShopVaultPurchase({
    gameState,
    setGameState,
  })
  const { vaultProgress } = useShopVaultOverview()
  const vaultRegenBonus = useMemo(
    () => getVaultRegenBonusRolls(vaultProgress.level),
    [vaultProgress.level]
  )
  const energyResetAmount = useMemo(
    () => getEnergyResetAmount(vaultProgress.level),
    [vaultProgress.level]
  )

  // Mobile shop purchase handler (uses cash instead of stars)
  const handleMobileShopPurchase = useCallback((itemId: string, cost: number, category: ShopCategory) => {
    if (category === 'vault') {
      let purchaseCompleted = false

      setGameState((prev) => {
        if (prev.cash < cost) {
          return prev
        }

        purchaseCompleted = true
        return {
          ...prev,
          cash: Math.max(0, prev.cash - cost),
        }
      })

      if (!purchaseCompleted) {
        toast.error('Not enough cash', {
          description: `You need $${cost.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
        })
        return false
      }

      toast.success('Vault item secured!', {
        description: 'Added to your Property Vault.',
      })
      playSound('cash-register')
      return true
    }

    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return false

    // Check if can afford with cash
    let purchaseCompleted = false

    // Deduct cash and apply effect atomically so rapid taps cannot drive cash negative
    setGameState((prev) => {
      if (prev.cash < item.price) {
        return prev
      }

      purchaseCompleted = true

      let newState = {
        ...prev,
        cash: Math.max(0, prev.cash - item.price),
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

    if (!purchaseCompleted) {
      toast.error('Not enough cash', {
        description: `You need $${item.price.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
      })
      return false
    }

    // Handle dice rolls separately as it's in a different state
    if (item.effect.type === 'dice') {
      setRollsRemaining(prev => Math.min(prev + (item.effect.value as number), ENERGY_MAX))
    }

    playSound('cash-register')
    return true
  }, [gameState.cash, setGameState, setRollsRemaining, playSound])

  const handleCasinoBuyIn = useCallback(
    (amount: number) => {
      if (gameState.cash < amount) {
        toast.error('Not enough cash', {
          description: `You need $${amount.toLocaleString()} but only have $${gameState.cash.toLocaleString()}`,
        })
        return false
      }

      setGameState((prev) => ({
        ...prev,
        cash: prev.cash - amount,
      }))
      return true
    },
    [gameState.cash, setGameState],
  )

  const {
    seasonPoints,
    currentTier: currentSeasonTier,
    hasPremiumPass,
    claimedTiers,
    activeSeason,
    addSeasonPoints,
    claimReward: claimSeasonReward,
    upgradeToPremium,
    canClaimTierReward,
  } = useSeasonPass({
    gameState,
    setGameState,
    playSound,
  })

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
    addSeasonPoints,
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
    getCustomEffects,
  } = useEvents({ playSound })

  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeVaultHeist = useMemo(
    () => activeMiniGames.find(game => game.id === 'vault-heist'),
    [activeMiniGames],
  )
  const upcomingVaultHeist = useMemo(
    () => upcomingMiniGames.find(game => game.id === 'vault-heist'),
    [upcomingMiniGames],
  )
  const vaultHeistAvailable = Boolean(activeVaultHeist)
  const vaultHeistStatus = useMemo(() => {
    if (activeVaultHeist) {
      const remaining = getTimeRemaining(activeVaultHeist)
      return {
        headline: VAULT_HEIST_CONFIG.scheduleCopy.ctaLive,
        detail: remaining ? `${remaining.display} left` : VAULT_HEIST_CONFIG.scheduleCopy.signalDetail,
        isLive: true,
        ctaAction: 'heist',
      }
    }

    if (upcomingVaultHeist) {
      const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      const upcomingAction = VAULT_HEIST_CONFIG.scheduleCopy.ctaUpcomingAction === 'games-hub' ? 'games-hub' : 'disabled'
      return {
        headline: VAULT_HEIST_CONFIG.scheduleCopy.ctaUpcoming,
        detail: formatTime(upcomingVaultHeist.startsAt),
        isLive: false,
        ctaAction: upcomingAction,
      }
    }

    return null
  }, [activeVaultHeist, upcomingVaultHeist, getTimeRemaining])
  const vaultHeistCtaDisabled = vaultHeistStatus?.ctaAction === 'disabled'
  const scratchcardEventOverride = useMemo(
    () => getScratchcardEventOverride(activeEvents),
    [activeEvents],
  )

  const shopWindow = useMemo(() => {
    let topDiscount = 0
    let topEvent: (typeof activeEvents)[number] | null = null

    activeEvents.forEach((event) => {
      const discount = event.effects.shopDiscount ?? 0
      if (discount > topDiscount) {
        topDiscount = discount
        topEvent = event
      }
    })

    return { discount: topDiscount, event: topEvent }
  }, [activeEvents])

  const customEventEffects = useMemo(() => new Set(getCustomEffects()), [getCustomEffects])

  const handleVaultPurchase = useCallback(
    (item: VaultItemSummary) => purchaseVaultItem(item, shopWindow.discount),
    [purchaseVaultItem, shopWindow.discount]
  )

  const [rightNowTick, setRightNowTick] = useState(() => new Date())
  const forcedCasinoMode = useMemo<CasinoMode | null>(() => {
    if (typeof window === 'undefined') return null
    const mode = new URLSearchParams(window.location.search).get('casinoMode')
    if (mode === 'modeA' || mode === 'modeB') return mode
    return null
  }, [])

  useEffect(() => {
    setTelemetryContext({
      mode: import.meta.env.MODE,
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setRightNowTick(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const activeEconomyWindow = useMemo(
    () => getActiveEconomyWindow(economyState, rightNowTick),
    [economyState, rightNowTick]
  )

  const economyWindowMultipliers = useMemo(
    () => getEconomyWindowMultipliers(economyState, rightNowTick),
    [economyState, rightNowTick]
  )

  const economyThrottleMultiplier = useMemo(
    () => getSoftThrottleMultiplier(economyState, rightNowTick),
    [economyState, rightNowTick]
  )

  const previousEconomyWindowRef = useRef<EconomyWindowState | null>(null)

  useEffect(() => {
    const previous = previousEconomyWindowRef.current
    if (previous?.id === activeEconomyWindow?.id) return

    if (activeEconomyWindow) {
      trackTelemetryEvent('economy_window_started', {
        id: activeEconomyWindow.id,
        type: activeEconomyWindow.type,
        durationMinutes: activeEconomyWindow.durationMinutes,
        leverageLevel: economyState.leverageLevel,
        momentum: economyState.momentum,
      })
    } else if (previous) {
      trackTelemetryEvent('economy_window_ended', {
        id: previous.id,
        type: previous.type,
      })
    }

    previousEconomyWindowRef.current = activeEconomyWindow
  }, [activeEconomyWindow, economyState.leverageLevel, economyState.momentum])

  const getEconomyMultipliers = useCallback(() => {
    const eventMultipliers = getActiveMultipliers()
    return {
      starsMultiplier:
        eventMultipliers.starsMultiplier * economyWindowMultipliers.starsMultiplier * economyThrottleMultiplier,
      xpMultiplier:
        eventMultipliers.xpMultiplier * economyWindowMultipliers.xpMultiplier * economyThrottleMultiplier,
    }
  }, [economyWindowMultipliers, economyThrottleMultiplier, getActiveMultipliers])

  const openEventCalendar = useCallback(() => {
    showOverlay({
      id: 'eventCalendar',
      component: EventCalendar,
      props: {
        activeEvents,
        upcomingEvents,
        activeMiniGames,
        upcomingMiniGames,
      },
      priority: 'normal',
    })
  }, [activeEvents, upcomingEvents, activeMiniGames, upcomingMiniGames, showOverlay])

  const openGamesHub = useCallback(() => {
    showOverlay({
      id: 'gamesHub',
      component: GamesHub,
      props: {
        onBack: () => closeCurrent(),
      },
      priority: 'normal',
    })
  }, [closeCurrent, showOverlay])

  const handleVaultHeistCta = useCallback(() => {
    if (!vaultHeistStatus) return
    if (vaultHeistStatus.ctaAction === 'heist') {
      setShowVaultHeist(true)
      return
    }
    if (vaultHeistStatus.ctaAction === 'games-hub') {
      openGamesHub()
    }
  }, [openGamesHub, vaultHeistStatus])

  const openSeasonPass = useCallback(() => {
    showOverlay({
      id: 'seasonPass',
      component: SeasonPassModal,
      props: {
        season: activeSeason,
        seasonPoints,
        currentTier: currentSeasonTier,
        hasPremiumPass,
        claimedTiers,
        onClaimReward: claimSeasonReward,
        onUpgradePremium: upgradeToPremium,
        canClaimTierReward,
      },
      priority: 'normal',
    })
  }, [
    showOverlay,
    activeSeason,
    seasonPoints,
    currentSeasonTier,
    hasPremiumPass,
    claimedTiers,
    claimSeasonReward,
    upgradeToPremium,
    canClaimTierReward,
  ])

  const openShopOverlay = useCallback(() => {
    showOverlay({
      id: SHOP_OVERLAY_ID,
      component: SHOP_OVERLAY_COMPONENT,
      props: {
        gameState,
        onPurchase: purchaseItem,
        isPermanentOwned,
        getItemQuantity,
        canAfford,
        onEquipCosmetic: equipCosmetic,
        getFinalPrice,
        shopDiscount,
        onVaultPurchase: handleVaultPurchase,
        isVaultPurchasing,
        shopEventDiscount: shopWindow.discount,
        shopEventLabel: shopWindow.event?.title,
        shopEventIcon: shopWindow.event?.icon,
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
    handleVaultPurchase,
    isVaultPurchasing,
    shopWindow.discount,
    shopWindow.event?.icon,
    shopWindow.event?.title,
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

  // Ring Focus System Helper Functions
  const getRingOpacity = useCallback((ringNumber: RingNumber): number => {
    if (rouletteModeActive) {
      return 1
    }
    if (ringNumber === gameState.currentRing) {
      return 1 // Active ring: full opacity
    }
    if (ringNumber < gameState.currentRing) {
      return 0.12 // Lower rings: very muted (been there)
    }
    return 0.08 // Higher rings: almost hidden (not yet unlocked)
  }, [gameState.currentRing, rouletteModeActive])

  const getRingFilter = useCallback((ringNumber: RingNumber): string => {
    if (rouletteModeActive) {
      return 'none'
    }
    if (ringNumber === gameState.currentRing) {
      return 'none' // Active: no filter
    }
    return 'grayscale(0.85) brightness(0.45) saturate(0.65)' // Inactive: heavily dimmed
  }, [gameState.currentRing, rouletteModeActive])

  const isTeleportingTile = useCallback((tileId: number): boolean => {
    if (!teleportFlash) return false
    return tileId === teleportFlash.from || tileId === teleportFlash.to
  }, [teleportFlash])

  const isRingInteractive = useCallback((ringNumber: RingNumber): boolean => {
    if (rouletteModeActive) {
      return false
    }
    return ringNumber === gameState.currentRing
  }, [gameState.currentRing, rouletteModeActive])

  const handleRingTransition = useCallback((fromRing: RingNumber, toRing: RingNumber, direction: 'up' | 'down') => {
    if (ringTransitionTimeoutRef.current) {
      clearTimeout(ringTransitionTimeoutRef.current)
    }
    setRingTransitionDirection(direction)
    // Fade out the old ring
    setFadingRing(fromRing)
    
    // Reveal the new ring
    setTimeout(() => {
      setRevealingRing(toRing)
    }, 300)
    
    // Clear animation states after completion
    ringTransitionTimeoutRef.current = setTimeout(() => {
      setFadingRing(null)
      setRevealingRing(null)
      setRingTransitionDirection(null)
    }, 1200)
  }, [])

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

  useEffect(() => {
    const snapshot = {
      cash: gameState.cash,
      stars: gameState.stars,
      coins: gameState.coins,
      xp: gameState.xp,
    }

    if (!currencySnapshotInitializedRef.current) {
      currencySnapshotInitializedRef.current = true
      currencySnapshotRef.current = snapshot
      return
    }

    const cashDelta = Math.max(0, snapshot.cash - currencySnapshotRef.current.cash)
    const starsDelta = Math.max(0, snapshot.stars - currencySnapshotRef.current.stars)
    const coinsDelta = Math.max(0, snapshot.coins - currencySnapshotRef.current.coins)
    const xpDelta = Math.max(0, snapshot.xp - currencySnapshotRef.current.xp)

    currencySnapshotRef.current = snapshot

    if (cashDelta === 0 && starsDelta === 0 && coinsDelta === 0 && xpDelta === 0) {
      return
    }

    setGameState(prev => ({
      ...prev,
      lifetimeCashEarned: (prev.lifetimeCashEarned ?? 0) + cashDelta,
      lifetimeStarsEarned: (prev.lifetimeStarsEarned ?? 0) + starsDelta,
      lifetimeCoinsEarned: (prev.lifetimeCoinsEarned ?? 0) + coinsDelta,
      lifetimeXpEarned: (prev.lifetimeXpEarned ?? 0) + xpDelta,
    }))
  }, [gameState.cash, gameState.coins, gameState.stars, gameState.xp])

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
            errorMessage: dailyDividendError,
            onCollect: async () => {
              const { reward, error } = await collectDailyReward()
              if (reward) {
                const baseCash = reward.base.type === 'cash' ? reward.base.amount : 0
                const totalCash = baseCash + reward.bonusCash

                // Add rewards to user's balance
                if (reward.base.type === 'dice') {
                  setRollsRemaining(prev => prev + reward.base.amount + reward.mysteryGift)
                  setGameState(prev => ({
                    ...prev,
                    energyRolls: (prev.energyRolls ?? DAILY_ROLL_LIMIT) + reward.base.amount + reward.mysteryGift,
                    cash: prev.cash + reward.bonusCash,
                    netWorth: prev.netWorth + reward.bonusCash,
                  }))
                  toast.success(`Daily Dividend Collected!`, {
                    description: `+${reward.base.amount} rolls, +${reward.mysteryGift} mystery rolls, +$${reward.bonusCash.toLocaleString()} bonus cash`,
                  })
                } else if (reward.base.type === 'cash') {
                  setRollsRemaining(prev => prev + reward.mysteryGift)
                  setGameState(prev => ({
                    ...prev,
                    energyRolls: (prev.energyRolls ?? DAILY_ROLL_LIMIT) + reward.mysteryGift,
                    cash: prev.cash + totalCash,
                    netWorth: prev.netWorth + totalCash,
                  }))
                  toast.success(`Daily Dividend Collected!`, {
                    description: `+$${reward.base.amount.toLocaleString()} cash, +$${reward.bonusCash.toLocaleString()} bonus cash, +${reward.mysteryGift} mystery rolls`,
                  })
                }
                
                playSound('level-up')
                hapticSuccess()
                
                // Refresh status
                await refreshDividendStatus()
              }
              return { reward, error }
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
    dailyDividendError,
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
        logEvent?.('modal_opened', { modal: SHOP_OVERLAY_ID })
        showOverlay({
          id: SHOP_OVERLAY_ID,
          component: SHOP_OVERLAY_COMPONENT,
          props: {
            gameState,
            onPurchase: purchaseItem,
            isPermanentOwned,
            getItemQuantity,
            canAfford,
            onEquipCosmetic: equipCosmetic,
            getFinalPrice,
            shopDiscount,
            onVaultPurchase: handleVaultPurchase,
            isVaultPurchasing,
            shopEventDiscount: shopWindow.discount,
            shopEventLabel: shopWindow.event?.title,
            shopEventIcon: shopWindow.event?.icon,
          },
          priority: 'normal',
          onClose: () => {
            logEvent?.('modal_closed', { modal: SHOP_OVERLAY_ID })
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
    error: saveError,
    savedGameState,
    savedRolls,
    saveGame,
    clearError: clearSaveError,
  } = useGameSave()
  const proToolsOverlayInitialized = useRef(false)
  const immediateSaveRef = useRef(false)

  const shouldUseSameTabProTools = () => {
    if (typeof window === 'undefined') return false
    const userAgent = window.navigator.userAgent || ''
    const userAgentData = (window.navigator as Navigator & { userAgentData?: { mobile?: boolean } })
      .userAgentData
    const isMobileAgent = Boolean(userAgentData?.mobile) || /Android|iPhone|iPad|iPod|Mobi/i.test(userAgent)
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    return Boolean(isMobileAgent || isStandalone)
  }

  const handleOpenProTools = useCallback(() => {
    const proToolsUrl = 'https://www.alphastocks.ai/?proTools=1'
    const fallbackType = isAuthenticated ? 'error' : 'login'

    setProToolsFallback(null)
    logProToolsDiagnostic({
      source: 'board-game-v3',
      action: 'open_attempt',
      details: { url: proToolsUrl, isAuthenticated },
    })

    if (typeof window === 'undefined') {
      setProToolsFallback({
        type: fallbackType,
        code: 'PROTOOLS_NO_WINDOW',
      })
      setProToolsOpen(true)
      logProToolsDiagnostic({
        source: 'board-game-v3',
        action: 'open_failed_no_window',
      })
      return
    }

    if (shouldUseSameTabProTools()) {
      logProToolsDiagnostic({
        source: 'board-game-v3',
        action: 'open_same_tab',
      })
      window.location.assign(proToolsUrl)
      return
    }

    const newWindow = window.open(proToolsUrl, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.focus?.()
      logProToolsDiagnostic({
        source: 'board-game-v3',
        action: 'open_window_success',
      })
      window.setTimeout(() => {
        if (newWindow.closed) {
          logProToolsDiagnostic({
            source: 'board-game-v3',
            action: 'open_window_closed_fast',
          })
        }
      }, 800)
      return
    }

    setProToolsFallback({
      type: fallbackType,
      code: isAuthenticated ? 'PROTOOLS_POPUP_BLOCKED' : 'PROTOOLS_LOGIN_REQUIRED',
    })
    setProToolsOpen(true)
    logProToolsDiagnostic({
      source: 'board-game-v3',
      action: 'open_window_blocked',
      details: { isAuthenticated },
    })
  }, [isAuthenticated])

  const launchProToolsFromOverlay = useCallback(() => {
    setProToolsOpen(false)
    logProToolsDiagnostic({
      source: 'board-game-v3',
      action: 'overlay_retry',
    })
    handleOpenProTools()
  }, [handleOpenProTools])

  useEffect(() => {
    if (!proToolsOverlayInitialized.current) {
      proToolsOverlayInitialized.current = true
      return
    }
    logProToolsDiagnostic({
      source: 'board-game-v3',
      action: proToolsOpen ? 'overlay_open' : 'overlay_close',
    })
  }, [proToolsOpen])

  useEffect(() => {
    if (!saveError) return
    toast.error('Cloud save unavailable', {
      description: saveError,
    })
    clearSaveError()
  }, [saveError, clearSaveError])

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
    const { starsMultiplier } = getEconomyMultipliers()
    const tierStarBonus = activeBenefits.get('star_bonus') || 0
    const tierMultiplier = 1 + tierStarBonus
    const portfolioMultiplier = portfolioRewardBuff.multiplier
    return Math.floor(baseStars * shopMultiplier * starsMultiplier * tierMultiplier * portfolioMultiplier)
  }, [isPermanentOwned, getEconomyMultipliers, activeBenefits, portfolioRewardBuff.multiplier])

  useEffect(() => {
    if (lastNetWorthRef.current === null) {
      lastNetWorthRef.current = gameState.netWorth
    }
  }, [gameState.netWorth])

  useEffect(() => {
    if (lastNetWorthRef.current === null) {
      lastNetWorthRef.current = gameState.netWorth
      return
    }

    const deltaNetWorth = gameState.netWorth - lastNetWorthRef.current
    if (deltaNetWorth === 0) return

    const baseNetWorth = Math.max(lastNetWorthRef.current, BASE_NET_WORTH)
    const now = new Date()

    setGameState((prev) => {
      const economy = extractEconomyState(prev)
      const updatedMomentum = applyMomentumFromNetWorthChange(economy, deltaNetWorth, now, baseNetWorth)
      const throttledEconomy = applySoftThrottleFromNetWorthChange(
        updatedMomentum,
        deltaNetWorth,
        now,
        baseNetWorth
      )
      const updatedEconomy = tickEconomyWindows(throttledEconomy, now)
      const finalEconomy = tickEconomyThrottle(updatedEconomy, now)
      if (finalEconomy === economy) return prev
      return {
        ...prev,
        economy: finalEconomy,
      }
    })

    lastNetWorthRef.current = gameState.netWorth
  }, [gameState.netWorth])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date()
      setGameState((prev) => {
        const economy = extractEconomyState(prev)
        const decayedEconomy = applyMomentumDecay(economy, now)
        const updatedEconomy = tickEconomyWindows(decayedEconomy, now)
        const finalEconomy = tickEconomyThrottle(updatedEconomy, now)
        if (finalEconomy === economy) return prev
        return {
          ...prev,
          economy: finalEconomy,
        }
      })
    }, 60 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  // Hydrate canonical economy state from local storage when Supabase data isn't ready yet
  useEffect(() => {
    if (economyLoadedFromLocalRef.current) return
    if (savedGameState && isAuthenticated) return
    if (typeof window === 'undefined') return

    economyLoadedFromLocalRef.current = true

    const storedEconomy = window.localStorage.getItem(ECONOMY_LOCAL_STORAGE_KEY)
    if (!storedEconomy) return

    try {
      const parsed = JSON.parse(storedEconomy)
      const normalized = normalizeEconomyState(parsed)
      lastEconomySerializedRef.current = JSON.stringify(normalized)
      setGameState(prev => ({
        ...prev,
        economy: normalized,
      }))
    } catch (error) {
      console.warn('Failed to parse stored economy state:', error)
    }
  }, [savedGameState, isAuthenticated])

  // Persist canonical economy state locally so it survives refresh when Supabase is unavailable
  useEffect(() => {
    if (typeof window === 'undefined') return

    const economyState = extractEconomyState(gameState)
    const serialized = JSON.stringify(economyState)
    if (lastEconomySerializedRef.current === serialized) return

    window.localStorage.setItem(ECONOMY_LOCAL_STORAGE_KEY, serialized)
    lastEconomySerializedRef.current = serialized
  }, [gameState])

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
        economy: normalizeEconomyState(savedGameState.economy),
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

  const triggerImmediateSave = useCallback(() => {
    immediateSaveRef.current = true
  }, [])

  useEffect(() => {
    if (!immediateSaveRef.current) return
    immediateSaveRef.current = false
    saveGame(gameState, rollsRemaining, nextResetTime)
  }, [gameState, rollsRemaining, nextResetTime, saveGame])

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
        logProToolsDiagnostic({
          source: 'board-game-v3',
          action: 'visibility_visible',
        })
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

  useEffect(() => {
    if (phase === 'idle' || phase === 'rolling') {
      setLandingTilePreview(null)
    }
  }, [phase])

  const currentTileTitle = useMemo(
    () => getTileTitleForRing(gameState.currentRing, gameState.position),
    [gameState.currentRing, gameState.position]
  )

  const eventTrackCommentary = useMemo(() => {
    if (phase === 'moving') {
      if (landingTilePreview) {
        return `Landing on ${landingTilePreview}`
      }
      if (lastRoll !== null) {
        return `Moving ${lastRoll} tiles`
      }
      return 'Moving...'
    }

    if (phase === 'rolling') {
      return 'Rolling...'
    }

    if (phase === 'landed') {
      return `Landed on ${currentTileTitle}`
    }

    return `On ${currentTileTitle}`
  }, [currentTileTitle, landingTilePreview, lastRoll, phase])

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
      const resetAmount = getResetRollsAmount(currentCheck, vaultRegenBonus)
      
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
  }, [authLoading, saveLoading, vaultRegenBonus])  // Remove gameState dependencies!

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

  useEffect(() => {
    setMobileMultiplier((prev) => clampMultiplierToLeverage(prev, leverageLevel))
  }, [leverageLevel])

  const cycleMobileMultiplier = useCallback(() => {
    setMobileMultiplier((prev) => {
      const leverageSafePrev = clampMultiplierToLeverage(prev, leverageLevel)
      const currentIndex = unlockedMultipliers.indexOf(leverageSafePrev)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % unlockedMultipliers.length
      return unlockedMultipliers[nextIndex] ?? unlockedMultipliers[0]
    })
    if (navigator.vibrate) navigator.vibrate(50)
  }, [leverageLevel, unlockedMultipliers])

  // Function to trigger Ring 3 reveal animation
  const revealRing3 = useCallback(() => {
    if (ring3Revealed) return // Already revealed
    
    if (ring3CelebrationTimeoutRef.current) {
      clearTimeout(ring3CelebrationTimeoutRef.current)
    }
    setRing3CelebrationActive(true)
    ring3CelebrationTimeoutRef.current = setTimeout(() => {
      setRing3CelebrationActive(false)
    }, 2400)

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

  useEffect(() => {
    return () => {
      if (ring3CelebrationTimeoutRef.current) {
        clearTimeout(ring3CelebrationTimeoutRef.current)
      }
    }
  }, [])

  // Trigger Ring 3 reveal when player reaches Ring 3 for the first time
  useEffect(() => {
    if (gameState.currentRing === 3 && !ring3Revealed && !ring3Revealing) {
      revealRing3()
    }
  }, [gameState.currentRing, ring3Revealed, ring3Revealing, revealRing3])

  // Reset Ring 3 roll counter when entering Ring 3
  useEffect(() => {
    if (gameState.currentRing === 3) {
      setRing3RollUsed(false)
    }
  }, [gameState.currentRing])

  type RingHistoryReason = 'start' | 'move' | 'portal' | 'jump' | 'reset'

  const buildRingHistoryUpdate = useCallback((
    prev: GameState,
    nextRing: RingNumber,
    reason: RingHistoryReason,
  ) => {
    if (prev.currentRing === nextRing) {
      return prev.stats
    }

    const timestamp = new Date().toISOString()
    const ringVisitCounts = prev.stats.ringVisitCounts ?? {
      ring1: prev.currentRing === 1 ? 1 : 0,
      ring2: prev.currentRing === 2 ? 1 : 0,
      ring3: prev.currentRing === 3 ? 1 : 0,
    }
    const ringKey = nextRing === 1 ? 'ring1' : nextRing === 2 ? 'ring2' : 'ring3'
    const nextVisitCounts = {
      ...ringVisitCounts,
      [ringKey]: ringVisitCounts[ringKey] + 1,
    }
    const ringHistory = [
      ...(prev.stats.ringHistory ?? [
        {
          ring: prev.currentRing,
          at: prev.stats.lastRingVisitedAt ?? timestamp,
          reason: 'start' as const,
        },
      ]),
      {
        ring: nextRing,
        at: timestamp,
        reason,
      },
    ].slice(-50)

    return {
      ...prev.stats,
      ringVisitCounts: nextVisitCounts,
      ringHistory,
      lastRingVisited: nextRing,
      lastRingVisitedAt: timestamp,
    }
  }, [])

  const handleRoll = (multiplier: number = 1) => {
    if (phase !== 'idle') {
      debugGame('Cannot roll - phase is not idle:', { phase, currentPosition: gameState.position })
      toast.info('Finish your current action first', {
        description: 'Close any open cards or modals before rolling again.',
      })
      return
    }

    if (rouletteModeActive) {
      handleRouletteRoll()
      return
    }

    // Check Ring 3 roll limit
    if (gameState.currentRing === 3 && ring3RollUsed) {
      toast.error('No more rolls!', {
        description: 'You only get 1 roll in the Wealth Run. Make it count.',
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
          energyResetAmount,
          vaultRegenBonus,
          vaultLevel: vaultProgress.level,
        },
        priority: 'high',
      })
      playSound('error')
      return
    }

    // clear any lingering timers from a previous roll to keep movement predictable
    clearAllTimers()
    setLandingTilePreview(null)

    // Mark Ring 3 roll as used
    if (gameState.currentRing === 3) {
      setRing3RollUsed(true)
    }

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
    trackTelemetryEvent('roll_started', {
      multiplier,
      rollsRemaining,
      position: gameState.position,
      ring: gameState.currentRing,
    })

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
    
    // Use new movement engine to calculate cross-ring movement
    const movementResult = calculateMovement(
      gameState.currentRing,
      gameState.position,
      totalMovement,
      undefined
    )
    
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
    
    // Check if player will pass Start (position 0) - only on Ring 1
    const startPosition = gameState.position
    const ringConfig = RING_CONFIG[gameState.currentRing]
    const finalPosition = (startPosition + totalMovement) % ringConfig.tiles
    const willPassStart = gameState.currentRing === 1 && startPosition + totalMovement >= ringConfig.tiles
    const willLandOnStart = finalPosition === 0
    
    if (willPassStart) {
      baseCoins += COIN_EARNINGS.pass_start
      baseStars += 200 // Pass Start star bonus
    }
    
    // Track challenge progress for rolling
    updateChallengeProgress('roll', diceResult.total)
    
    const startMovement = () => {
      debugGame('Movement started', { totalMovement, movementResult })
      logEvent?.('move_started', { totalMovement, startPosition })
      setPhase('moving')

      // Get tiles to hop from movement engine
      const tilesToHop = getHoppingTiles(movementResult)

      // Check if player passes Start (position 0) without landing on it
      const passedStart = willPassStart && !willLandOnStart

      // Animate camera in immersive mode (mobile only)
      if (isMobile && camera.mode === 'immersive') {
        animateAlongPath(tilesToHop, () => {
          debugGame('Camera animation completed')
        })
      }

      let currentHop = 0
      const hopDelayMs = 350
      const teleportFlashDurationMs = 1000

      const runHop = () => {
        if (currentHop < tilesToHop.length) {
          const currentStep = movementResult.path[currentHop]
          const nextStep = movementResult.path[currentHop + 1]
          const nextPosition = tilesToHop[currentHop]
          setHoppingTiles([nextPosition])
          
          // Update position and ring as we hop
          setGameState((prev) => ({
            ...prev,
            position: nextPosition,
            currentRing: currentStep.ring,
            stats: buildRingHistoryUpdate(prev, currentStep.ring, 'move'),
          }))
          currentHop++

          if (nextStep && nextStep.ring !== currentStep.ring) {
            setTeleportFlash({ from: currentStep.tileId, to: nextStep.tileId })
            if (hopIntervalRef.current) clearTimeout(hopIntervalRef.current)
            hopIntervalRef.current = setTimeout(() => {
              setTeleportFlash(null)
              runHop()
            }, teleportFlashDurationMs)
            return
          }

          hopIntervalRef.current = setTimeout(runHop, hopDelayMs)
          return
        }

        if (hopIntervalRef.current) clearTimeout(hopIntervalRef.current)
        setHoppingTiles([])
        setLandingTilePreview(
          getTileTitleForRing(movementResult.finalRing, movementResult.finalTileId)
        )

        landingTimeoutRef.current = setTimeout(() => {
          const newPosition = movementResult.finalTileId
          const newRing = movementResult.finalRing
          
          debugGame('Landing on tile:', { position: newPosition, ring: newRing })
          logEvent?.('move_ended', { newPosition, newRing, totalMovement })
          setPhase('landed')
          // Re-enable UI mode transitions after landing
          setCanTransition(true)
          
          // Apply final position
          setGameState(prev => ({
            ...prev,
            position: newPosition,
            currentRing: newRing,
            stats: buildRingHistoryUpdate(prev, newRing, 'move'),
          }))
          
          // Trigger landing event with current reward multiplier
          handleTileLanding(newPosition, passedStart)
          
          // Handle portal animation if triggered
          if (movementResult.portalTriggered && movementResult.portalDirection) {
            const portalDirection = movementResult.portalDirection === 'throne' ? 'up' : movementResult.portalDirection
            const transition: PortalTransition = {
              direction: portalDirection,
              fromRing: gameState.currentRing,
              toRing: newRing,
              fromTile: gameState.position,
              toTile: newPosition,
              triggeredBy: movementResult.landedExactlyOnPortal ? 'land' : 'pass',
            }
            
            setTimeout(() => {
              triggerPortalAnimation(transition)
            }, 1000) // Delay to let tile landing complete
          }
        }, 200)
      }

      runHop()
    }

    startMovement()

    // Process roll after dice animation
    setTimeout(() => {
      const { starsMultiplier: economyStarsMultiplier, xpMultiplier: economyXpMultiplier } = getEconomyMultipliers()
      // Apply multiplier to rewards
      const finalStars = Math.floor(baseStars * multiplier * economyStarsMultiplier)
      const finalCoins = baseCoins * multiplier
      const finalXP = Math.floor(baseXP * multiplier * economyXpMultiplier)
      
      debugGame('Multiplied rewards', { 
        multiplier,
        economyStarsMultiplier,
        economyXpMultiplier,
        baseStars, finalStars, 
        baseCoins, finalCoins, 
        baseXP, finalXP 
      })

      // Handle jackpot: Add to jackpot when passing Start without landing
      let jackpotChange = 0
      if (willPassStart && !willLandOnStart) {
        jackpotChange = JACKPOT_PASS_START_AMOUNT * multiplier
      }

      trackTelemetryEvent('roll_rewards_awarded', {
        multiplier,
        stars: finalStars,
        coins: finalCoins,
        xp: finalXP,
        jackpotChange,
        ring: gameState.currentRing,
        passedStart: willPassStart && !willLandOnStart,
      })
      
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
      cash: prev.cash + (pack.bonusCashMillions ? pack.bonusCashMillions * 1_000_000 : 0),
      stats: {
        ...prev.stats,
        rollsPurchased: (prev.stats.rollsPurchased ?? 0) + pack.rolls,
      }
    }))

    toast.success(`Added ${pack.rolls} Dice Rolls`, {
      description: `Purchase: $${pack.priceUsd} pack applied${pack.bonusCashMillions ? ` (+$${pack.bonusCashMillions}M cash)` : ''}.`
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
  const ring1PortalTileId = getPortalConfigForRing(1).startTileId

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

    if (tileId >= 300 && tileId < 400) {
      const { ring3 } = calculateAllRingPositions(tileBoardSize, boardOuterRadius)
      const ring3Position = ring3.find(p => p.id === tileId - 300)
      if (!ring3Position) return null
      return {
        x: ring3Position.x - boardPadding,
        y: ring3Position.y - boardPadding,
      }
    }

    if (tileId >= 200 && tileId < 300) {
      const { ring2 } = calculateAllRingPositions(tileBoardSize, boardOuterRadius)
      const ring2Position = ring2.find(p => p.id === tileId - 200)
      if (!ring2Position) return null
      return {
        x: ring2Position.x - boardPadding,
        y: ring2Position.y - boardPadding,
      }
    }

    const tilePositions = calculateTilePositions(tileBoardSize, 35, boardOuterRadius, false)
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

  const handleRouletteRoll = useCallback(() => {
    if (phase !== 'idle') {
      toast.info('Finish your current action first', {
        description: 'Close any open cards or modals before rolling again.',
      })
      return
    }

    setRouletteVictoryOpen(false)
    setPhase('rolling')
    playSound('dice-roll')

    const rouletteRoll = rollRouletteDice()
    const total = rouletteRoll.total

    setDice1(rouletteRoll.dice[0])
    setDice2(rouletteRoll.dice[1])
    setLastRoll(total)

    setRouletteSpinActive(true)

    const rewardIndex = total % ROULETTE_REWARDS.length
    const rawReward = ROULETTE_REWARDS[rewardIndex]
    const reward =
      rawReward.type === 'mystery'
        ? ROULETTE_REWARDS.filter(entry => entry.type !== 'mystery')[Math.floor(Math.random() * (ROULETTE_REWARDS.length - 1))]
        : rawReward

    setTimeout(() => {
      setRouletteSpinActive(false)
      setPhase('idle')

      switch (reward.type) {
        case 'cash':
          setGameState(prev => ({
            ...prev,
            cash: prev.cash + reward.amount,
            netWorth: prev.netWorth + reward.amount,
          }))
          break
        case 'stars':
          setGameState(prev => ({
            ...prev,
            stars: prev.stars + reward.amount,
          }))
          break
        case 'coins':
          addCoins(reward.amount, 'Roulette Mega Spin')
          break
        case 'rolls':
          setRollsRemaining(prev => Math.min(prev + reward.amount, ENERGY_MAX))
          setGameState(prev => ({
            ...prev,
            energyRolls: Math.min((prev.energyRolls ?? DAILY_ROLL_LIMIT) + reward.amount, ENERGY_MAX),
          }))
          break
        case 'xp':
          setGameState(prev => ({
            ...prev,
            xp: prev.xp + reward.amount,
          }))
          break
        default:
          break
      }

      setLastRouletteReward(reward)
      setRouletteSpinCount(prev => prev + 1)
      setRouletteVictoryOpen(true)

      toast.success('🎯 Roulette Jackpot!', {
        description: `${reward.icon} ${reward.label}`,
      })
      triggerCelebrationFromLastTile([reward.icon, '✨'])
    }, 1400)
  }, [phase, playSound, addCoins, triggerCelebrationFromLastTile])

  const handleEventCurrencyEarned = useCallback((source: string) => {
    if (!currentActiveEvent || !activeEventCurrency) return

    const { earnOnMarketEvent, goal, rewardStars, emoji } = activeEventCurrency
    if (earnOnMarketEvent <= 0 || goal <= 0) return
    const { starsMultiplier } = getEconomyMultipliers()

    let goalsHit = 0
    let starsAwarded = 0

    setGameState(prev => {
      const eventId = currentActiveEvent.id
      const currentAmount = prev.eventCurrency?.eventId === eventId ? prev.eventCurrency.amount : 0
      const updatedAmount = currentAmount + earnOnMarketEvent
      goalsHit = Math.floor(updatedAmount / goal)
      const baseStarsAwarded = goalsHit * rewardStars
      // Apply ring multiplier to event rewards
      starsAwarded = Math.floor(applyRingMultiplier(baseStarsAwarded, prev.currentRing) * starsMultiplier)
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
      const multiplierText = getMultiplierDisplay(gameState.currentRing)
      toast.success(`${currentActiveEvent.title} prize unlocked!`, {
        description: `Earned ${starsAwarded.toLocaleString()} ⭐${multiplierText ? ` (${multiplierText})` : ''}`,
      })
      triggerCelebrationFromLastTile(['⭐', '✨'])
    }
  }, [activeEventCurrency, currentActiveEvent, getEconomyMultipliers, triggerCelebrationFromLastTile])

  const handleEventTileChoice = useCallback((tileTitle: string, option: EventTileOption) => {
    const baseAmount = Math.floor(Math.random() * (option.reward.max - option.reward.min + 1)) + option.reward.min
    const isBonusRoll = option.reward.type === 'bonus-roll'
    const multiplierText = isBonusRoll ? '' : getMultiplierDisplay(gameState.currentRing)
    const shouldApplyPortfolioBuff = portfolioRewardBuff.multiplier > 1
      && ['cash', 'coins', 'xp'].includes(option.reward.type)

    let finalAmount = baseAmount
    let portfolioBonus = 0

    if (option.reward.type === 'stars') {
      const starAmount = applyRingMultiplier(applyStarMultiplier(baseAmount), gameState.currentRing)
      finalAmount = starAmount
    } else if (isBonusRoll) {
      finalAmount = baseAmount
    } else {
      const ringAdjusted = applyRingMultiplier(baseAmount, gameState.currentRing)
      finalAmount = shouldApplyPortfolioBuff
        ? Math.floor(ringAdjusted * portfolioRewardBuff.multiplier)
        : ringAdjusted
      portfolioBonus = shouldApplyPortfolioBuff ? finalAmount - ringAdjusted : 0
    }

    setGameState(prev => {
      switch (option.reward.type) {
        case 'cash':
          return {
            ...prev,
            cash: prev.cash + finalAmount,
            netWorth: prev.netWorth + finalAmount,
          }
        case 'stars':
          return {
            ...prev,
            stars: prev.stars + finalAmount,
          }
        case 'coins':
          return {
            ...prev,
            coins: prev.coins + finalAmount,
          }
        case 'xp':
          return {
            ...prev,
            xp: prev.xp + finalAmount,
          }
        default:
          return prev
      }
    })

    if (option.reward.type === 'bonus-roll') {
      setRollsRemaining(prev => prev + finalAmount)
    }

    trackTelemetryEvent('event_tile_choice', {
      tile: tileTitle,
      optionId: option.id,
      rewardType: option.reward.type,
      rewardAmount: finalAmount,
      portfolioBonus,
      ring: gameState.currentRing,
    })

    playSound('celebration')
    hapticSuccess()
    triggerCelebrationFromLastTile([option.emoji, '✨'])

    const rewardLabel = EVENT_TILE_REWARD_LABELS[option.reward.type]
    const portfolioNote = portfolioBonus > 0 ? ` (+${portfolioBonus.toLocaleString()} bonus)` : ''

    toast.success(`${tileTitle}: ${option.title}`, {
      description: `+${finalAmount.toLocaleString()} ${rewardLabel}${multiplierText ? ` (${multiplierText})` : ''}${portfolioNote}`,
    })
  }, [
    applyRingMultiplier,
    applyStarMultiplier,
    gameState.currentRing,
    hapticSuccess,
    playSound,
    portfolioRewardBuff.multiplier,
    setGameState,
    setRollsRemaining,
    trackTelemetryEvent,
    triggerCelebrationFromLastTile,
  ])

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
    
    // Trigger ring focus transition animation
    if (transition.direction === 'up' && transition.toRing !== 0) {
      handleRingTransition(transition.fromRing, transition.toRing as RingNumber, 'up')
    } else if (transition.direction === 'down' && transition.toRing !== 0) {
      handleRingTransition(transition.fromRing, transition.toRing as RingNumber, 'down')
    }
    
    // Play appropriate sound
    if (transition.direction === 'up') {
      playSound('portal-ascend')
    } else {
      playSound('portal-descend')
    }
    
    // After animation, update game state
    setTimeout(() => {
      // Check if throne is reached
      const isThroneReached = transition.toRing === 0
      
      setGameState(prev => {
        const nextRing = transition.toRing !== 0 ? (transition.toRing as RingNumber) : prev.currentRing
        return {
          ...prev,
          // Only update currentRing if not going to throne (toRing !== 0)
          ...(transition.toRing !== 0 && { currentRing: nextRing }),
          position: transition.toTile,
          stats: transition.toRing !== 0
            ? buildRingHistoryUpdate(prev, nextRing, 'portal')
            : prev.stats,
          // Track throne if reached and award rewards
          ...(isThroneReached && {
            hasReachedThrone: true,
            throneCount: (prev.throneCount || 0) + 1,
            stars: prev.stars + 10000,  // Award 10K stars
            cash: prev.cash + 100000,    // Award $100K cash
          }),
        }
      })
      
      setIsPortalAnimating(false)
      setPortalTransition(null)
      
      if (transition.direction === 'up' && isThroneReached) {
        // Show throne victory modal instead of just a toast
        setTimeout(() => {
          setShowThroneVictory(true)
        }, 500)
        return
      }

      if (transition.toastOverride) {
        const variant = transition.toastOverride.variant ?? (transition.direction === 'up' ? 'success' : 'info')
        const toastFn = variant === 'success' ? toast.success : toast.info
        toastFn(transition.toastOverride.title, {
          description: transition.toastOverride.description,
          duration: transition.toastOverride.duration ?? 3000,
        })
        return
      }

      if (transition.suppressDefaultToast) {
        return
      }

      // Show default toast message
      if (transition.direction === 'up') {
        toast.success(`⬆️ PORTAL UP!`, {
          description: `Welcome to Ring ${transition.toRing}: ${RING_CONFIG[transition.toRing as RingNumber].name}!`,
          duration: 3000,
        })
      } else {
        toast.info('⬇️ Portal Down', {
          description: 'Back to Street Level. Complete another lap to ascend!',
          duration: 3000,
        })
      }
    }, 1500) // Animation duration
  }, [buildRingHistoryUpdate, playSound, handleRingTransition])

  // Handle landing on quick reward tile - AUTO COLLECT, NO POPUP
  const handleQuickRewardTile = (tile: TileType) => {
    if (tile.type !== 'quick-reward' || !tile.quickRewardType) return

    let rewardType = tile.quickRewardType as QuickRewardType
    
    // Handle special types
    if (rewardType === 'mystery') {
      rewardType = getMysteryReward()
    } else if (rewardType === 'chameleon') {
      rewardType = getChameleonType(gameState.ring1LapsCompleted)
    }

    // Calculate reward - use premium calculation if it's a premium tile
    const { amount, emoji } = tile.isPremium 
      ? calculatePremiumReward(rewardType)
      : calculateQuickReward(rewardType, gameState.currentRing)
    const config = QUICK_REWARD_CONFIG[rewardType]
    const shouldApplyPortfolioBuff = portfolioRewardBuff.multiplier > 1
      && ['cash', 'stars', 'coins', 'xp'].includes(rewardType)
    const rewardAmount = shouldApplyPortfolioBuff
      ? Math.floor(amount * portfolioRewardBuff.multiplier)
      : amount
    const portfolioBonus = rewardAmount - amount

    trackTelemetryEvent('quick_reward_awarded', {
      type: rewardType,
      amount: rewardAmount,
      portfolioBonus,
      ring: gameState.currentRing,
      isPremium: tile.isPremium,
    })

    // Get tile position for celebration animation (center of screen as approximation)
    const tilePosition = { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    }

    // Trigger celebration animation
    setQuickCelebration({
      active: true,
      emoji,
      amount: rewardAmount,
      position: tilePosition,
    })

    // Apply reward immediately
    setGameState(prev => {
      switch (rewardType) {
        case 'cash':
          return { 
            ...prev, 
            cash: prev.cash + rewardAmount,
            netWorth: prev.netWorth + rewardAmount,
          }
        case 'stars':
          return { ...prev, stars: prev.stars + rewardAmount }
        case 'coins':
          return { ...prev, coins: prev.coins + rewardAmount }
        case 'xp':
          return { ...prev, xp: prev.xp + rewardAmount }
        case 'bonus-roll':
          // Handle via setRollsRemaining below
          return prev
        default:
          return prev
      }
    })

    // Handle bonus roll separately
    if (rewardType === 'bonus-roll') {
      setRollsRemaining(prev => prev + amount)
    }

    // Quick toast (non-blocking)
    toast.success(`${emoji} +${rewardAmount.toLocaleString()} ${config.label}!`, {
      description: portfolioBonus > 0 ? `Portfolio bonus +${portfolioBonus.toLocaleString()}` : undefined,
      duration: 1500,
      position: 'top-center',
    })

    // Haptic feedback
    lightTap()

    // Play sound based on reward type and amount
    let soundType: SoundType = 'coin-collect'
    if (rewardType === 'bonus-roll') {
      soundType = 'star-collect'
    } else if (rewardType === 'xp') {
      soundType = 'coin-collect'
    } else if (rewardType === 'cash' || rewardType === 'stars' || rewardType === 'coins') {
      // Use reward-based sound selection for cash, stars, coins
      soundType = getRewardSound(rewardType, amount)
    }
    
    // Premium tiles always use big sounds
    if (tile.isPremium) {
      soundType = 'mega-jackpot'
    }
    
    playSound(soundType)

    // Auto-continue to next phase after brief delay
    setTimeout(() => {
      setPhase('idle')
    }, 800) // Short delay for celebration to play
  }

  const handleTileLanding = (position: number, passedStart = false) => {
    // Check if this is a Ring 3 tile (IDs 300-306)
    if (position >= 300 && position < 400 && gameState.currentRing === 3) {
      // Get tile position for animation (we'll use center of screen as approximation)
      const tilePosition = { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      }
      handleRing3Landing(position, tilePosition)
      setPhase('idle')
      return
    }

    playSound('tile-land')

    const tile =
      gameState.currentRing === 2
        ? RING_2_TILES.find((ringTile) => ringTile.id === position)
        : BOARD_TILES[position]
    if (!tile) {
      debugGame('handleTileLanding: tile not found', { position, ring: gameState.currentRing })
      return
    }
    debugGame('handleTileLanding:', { position, tile, passedStart })
    setLastLandedTileId(position)
    setIsStockSpinning(false)
    if (stockSpinTimeoutRef.current) clearTimeout(stockSpinTimeoutRef.current)

    // Ring 2 fall portals
    if (gameState.currentRing === 2 && tile.specialAction === 'ring-fall') {
      const fallOutcome = pickWeightedOutcome(FALL_PORTAL_OUTCOMES)
      const rewardType = fallOutcome.rewardPool
        ? pickRandomReward(fallOutcome.rewardPool)
        : null
      const rewardLabel = rewardType ? QUICK_REWARD_CONFIG[rewardType].label.toLowerCase() : ''
      const toastMessage = fallOutcome.description(rewardLabel)

      if (rewardType) {
        toast.success(fallOutcome.title, {
          description: toastMessage,
        })
        handleQuickRewardTile({
          id: -1,
          type: 'quick-reward',
          title: fallOutcome.title,
          quickRewardType: rewardType,
        })
      } else {
        toast.info(fallOutcome.title, {
          description: toastMessage,
        })
      }

      if (fallOutcome.celebration) {
        triggerTileCelebration(position, fallOutcome.celebration)
      }

      triggerPortalAnimation({
        direction: 'down',
        fromRing: 2,
        toRing: 1,
        fromTile: position,
        toTile: 0,
        triggeredBy: 'land',
        suppressDefaultToast: true,
      })
      setPhase('idle')
      return
    }

    // Ring 2 chance tiles
    if (gameState.currentRing === 2 && tile.specialAction === 'chance') {
      showOverlay({
        id: 'chanceCard',
        component: ChanceCardModal,
        props: {
          onDraw: () => {
            const chanceOutcome = pickWeightedOutcome(CHANCE_OUTCOMES)
            const rewardType = chanceOutcome.rewardPool
              ? pickRandomReward(chanceOutcome.rewardPool)
              : null
            const rewardLabel = rewardType ? QUICK_REWARD_CONFIG[rewardType].label.toLowerCase() : ''
            const toastMessage = chanceOutcome.description(rewardLabel)

            if (chanceOutcome.id === 'jackpot') {
              toast.success(chanceOutcome.title, {
                description: toastMessage,
              })
              if (chanceOutcome.celebration) {
                triggerTileCelebration(position, chanceOutcome.celebration)
              }
              triggerPortalAnimation({
                direction: 'up',
                fromRing: 2,
                toRing: 3,
                fromTile: position,
                toTile: 300,
                triggeredBy: 'land',
              })
            } else {
              if (rewardType) {
                toast.info(chanceOutcome.title, {
                  description: toastMessage,
                })
                handleQuickRewardTile({
                  id: -2,
                  type: 'quick-reward',
                  title: chanceOutcome.title,
                  quickRewardType: rewardType,
                })
              } else {
                toast.info(chanceOutcome.title, {
                  description: toastMessage,
                })
              }
              if (chanceOutcome.celebration) {
                triggerTileCelebration(position, chanceOutcome.celebration)
              }
            }
            closeCurrent()
            setPhase('idle')
          },
        },
        priority: 'normal',
        onClose: () => {
          setTimeout(() => {
            setPhase('idle')
          }, 200)
        },
      })
      return
    }

    // Quick reward tiles - auto-collect, no popup
    if (tile.type === 'quick-reward') {
      handleQuickRewardTile(tile)
      return // Don't show any modal
    }

    addEventTrackPoints(
      pointsForTileLanding(tile),
      `Landed on ${tile.title}`
    )

    // Haptic feedback on tile landing
    lightTap()

    if (tile.type === 'category' && tile.category) {
      const categoryDefinition = getStockCategoryDefinition(tile.category)
      if (categoryDefinition?.tier === 'expansion') {
        playSound('expansion-stinger')
        triggerTileCelebration(position, ['✨', '💎', '🚀'])
      }
    }

    // Get current reward multiplier and reset it for next roll
    const rewardMultiplier = currentRewardMultiplierRef.current
    currentRewardMultiplierRef.current = 1 // Reset to default after reading

    // DevTools: Log tile landed event
    logEvent?.('tile_landed', { position, tileType: tile.type, passedStart, rewardMultiplier })
    trackTelemetryEvent('tile_landed', {
      position,
      ring: gameState.currentRing,
      tileType: tile.type,
      passedStart,
      rewardMultiplier,
    })

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
          
          // Play reward sound based on amount
          playSound(getRewardSound('cash', cashReward))
          hapticSuccess()
          triggerTileCelebration(position, ['💰', '💵'])
          
          toast.success(`💰 Category Ownership Bonus!`, {
            description: `You own ${tile.category} stocks! +$${cashReward.toLocaleString()}${rewardMultiplier > 1 ? ` (${rewardMultiplier}x)` : ''}`,
          })
        }
      }
    }

    if (tile.type === 'category' && tile.category && gameState.currentRing < 3) {
      const pointsEarned = rollAscendMeterPoints()
      const currentProgress = gameState.stats?.ringAscendProgress ?? 0
      const nextProgress = currentProgress + pointsEarned
      const shouldAutoAscend = nextProgress >= ASCEND_PROGRESS_GOAL

      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          ringAscendProgress: shouldAutoAscend ? 0 : nextProgress,
        },
      }))

      if (shouldAutoAscend) {
        const nextRing = (gameState.currentRing + 1) as RingNumber
        const targetTile = PORTAL_CONFIG[`ring${nextRing}` as keyof typeof PORTAL_CONFIG].startTileId
        triggerPortalAnimation({
          direction: 'up',
          fromRing: gameState.currentRing,
          toRing: nextRing,
          fromTile: position,
          toTile: targetTile,
          triggeredBy: 'land',
          toastOverride: {
            title: '⬆️ Ascend Meter Filled!',
            description: `Stock momentum lifted you to Ring ${nextRing}.`,
            variant: 'success',
            duration: 3200,
          },
        })
        debugGame('Phase transition: landed -> idle (ascend meter)')
        setPhase('idle')
        return
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
      const stock = getStockForCategoryWithRingFilter(tile.category)
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
            ringNumber: gameState.currentRing,
            playSound,
            onOpenProTools: handleOpenProTools,
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
    } else if (tile.type === 'learning') {
      const learningDefinition = getLearningTileDefinition(tile.learningId)
      const questionCount = getLearningQuestionCount(tile.learningId)
      const questionLabel = questionCount > 0 ? `${questionCount} question${questionCount === 1 ? '' : 's'}` : null
      const learningReward = getLearningRewardSummary(
        gameState.stats?.lastLearningDate,
        gameState.stats?.learningStreakDays ?? 0
      )
      let starsEarned = learningReward.totalStars
      starsEarned = applyStarMultiplier(starsEarned)
      starsEarned = applyRingMultiplier(starsEarned, gameState.currentRing)
      const xpEarned = learningReward.totalXp

      setGameState(prev => ({
        ...prev,
        stars: prev.stars + starsEarned,
        xp: (prev.xp ?? 0) + xpEarned,
        stats: {
          ...prev.stats,
          learningStreakDays: learningReward.nextStreak,
          lastLearningDate: learningReward.todayKey,
          totalStarsEarned: (prev.stats?.totalStarsEarned || 0) + starsEarned,
        },
      }))
      toast.info(learningDefinition?.title ?? tile.title, {
        description: questionLabel
          ? `${questionLabel} • ${learningDefinition?.description ?? 'Micro-learning challenges are coming soon.'}`
          : (learningDefinition?.description ?? 'Micro-learning challenges are coming soon.'),
      })
      toast.success('Learning bonus earned!', {
        description: `+${starsEarned} ⭐ and +${xpEarned} XP • Streak ${learningReward.nextStreak} day${learningReward.nextStreak === 1 ? '' : 's'}`,
      })
      triggerCelebrationFromLastTile(['⭐', '📚', '✨'])
      debugGame('Phase transition: landed -> idle (learning tile)')
      setPhase('idle')
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
      } else if (tile.title === '?' || tile.title === 'Wildcard') {
        debugGame('Opening Wildcard Event modal')
        const wildcardEvent = getRandomWildcardEvent(gameState.currentRing)
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
        debugGame('Opening Market Event choice modal')
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
          const eventDefinition = getMarketEventTileDefinition(event)
          setCurrentEvent(event)
          showOverlay({
            id: 'market-event',
            component: EventChoiceModal,
            props: {
              title: eventDefinition.title,
              description: eventDefinition.description,
              icon: eventDefinition.icon,
              options: eventDefinition.options,
              onSelect: (option: EventTileOption) => {
                handleEventTileChoice(eventDefinition.title, option)
              },
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
        const eventDefinition = getEventTileDefinition(tile.title)
        if (eventDefinition) {
          debugGame('Opening Tier 1 event tile modal')
          showOverlay({
            id: `event-tile-${tile.title.toLowerCase().replace(/\s+/g, '-')}`,
            component: EventChoiceModal,
            props: {
              title: eventDefinition.title,
              description: eventDefinition.description,
              icon: eventDefinition.icon,
              options: eventDefinition.options,
              onSelect: (option: EventTileOption) => {
                handleEventTileChoice(eventDefinition.title, option)
              },
            },
            priority: 'normal',
            onClose: () => {
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (event tile modal closed)')
                setPhase('idle')
              }, 300)
            }
          })
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
      }
    } else if (tile.type === 'corner') {
      debugGame('Corner tile:', tile.title)
      if (tile.title === 'Big Fish Portal') {
        if (position === 0) {
          const isJackpotWeekNow = isJackpotWeek()
          const currentJackpot = gameState.jackpot ?? 0
          const hasMegaJackpotBoost = customEventEffects.has('mega_jackpot')
          const megaJackpotMultiplier = hasMegaJackpotBoost ? 1.5 : 1

          if (isJackpotWeekNow && currentJackpot > 0) {
            const jackpotWin = currentJackpot * rewardMultiplier * megaJackpotMultiplier
            setGameState(prev => ({
              ...prev,
              cash: prev.cash + jackpotWin,
              netWorth: prev.netWorth + jackpotWin,
              jackpot: 0,
            }))

            playSound('level-up')
            hapticSuccess()
            triggerTileCelebration(position, ['🐟', '💰', '🎉'])
            setShowCelebration(true)

            setIsJackpotCelebrating(true)

            const rainbowColors = ['oklch(0.60 0.20 0)', 'oklch(0.65 0.22 60)', 'oklch(0.70 0.20 120)',
                                   'oklch(0.65 0.22 180)', 'oklch(0.60 0.25 240)', 'oklch(0.70 0.20 300)']

            INNER_TRACK_TILES.forEach((tile, index) => {
              setInnerTileColors(prev => new Map(prev).set(tile.id, rainbowColors[index % rainbowColors.length]))
            })

            setTimeout(() => {
              setIsJackpotCelebrating(false)
              setInnerTileColors(new Map())
            }, 5000)

            toast.success(`🎰 JACKPOT WIN!`, {
              description: `You landed on Big Fish Portal during Jackpot Week! +$${jackpotWin.toLocaleString()}${rewardMultiplier > 1 ? ` (${rewardMultiplier}x)` : ''}${hasMegaJackpotBoost ? ' (Mega Jackpot Boost)' : ''}`,
            })
          } else if (isJackpotWeekNow) {
            toast.info('🎰 Jackpot Week!', {
              description: 'Land on Big Fish Portal to win the jackpot! Keep passing to build it up.',
            })
          } else {
            toast.info('🐟 Big Fish Portal', {
              description: 'Land here to jump to Ring 2.',
            })
          }
        }
        debugGame('Phase transition: landed -> idle (Big Fish Portal)')
        setPhase('idle')
      } else if (tile.title === 'Casino') {
        const selectedMode = forcedCasinoMode ?? (Math.random() < 0.5 ? 'modeA' : 'modeB')
        setCasinoMode(selectedMode)
        toast.info('🎰 Casino Mode Triggered!', {
          description:
            selectedMode === 'modeA'
              ? 'Golden Tile Hunt is live — pick one of 8 mini-games.'
              : 'Roulette Ring selected. Using Golden Tile Hunt fallback while mode B is in progress.',
        })
        debugGame('Opening Casino mode panel', { selectedMode })
        setTimeout(() => {
          showOverlay({
            id: 'casino-mode-panel',
            component: CasinoModePanel,
            props: {
              onSelectMiniGame: (miniGameId: string) => {
                if (
                  miniGameId === 'scratchcard' ||
                  miniGameId === 'high-roller-dice' ||
                  miniGameId === 'market-blackjack'
                ) {
                  showOverlay({
                    id: 'casino',
                    component: CasinoModal,
                    props: {
                      onWin: handleCasinoWin,
                      luckBoost: isPermanentOwned('casino-luck') ? 0.2 : 0,
                      guaranteedWin: hasGuaranteedCasinoWin(),
                      scratchcardEventOverride,
                      cashBalance: gameState.cash,
                      onSpendCash: handleCasinoBuyIn,
                      initialView:
                        miniGameId === 'scratchcard'
                          ? 'scratchcard'
                          : miniGameId === 'high-roller-dice'
                            ? 'dice'
                            : 'blackjack',
                    },
                    priority: 'normal',
                    onClose: () => {
                      setCasinoMode('none')
                      debugGame('Casino mini-game modal closed')
                      setTimeout(() => {
                        debugGame('Phase transition: landed -> idle (casino modal closed)')
                        setPhase('idle')
                      }, 300)
                    },
                  })
                  return
                }

                const placeholderWin = 2500 + Math.floor(Math.random() * 5000)
                toast.info('🛠️ Mini-game placeholder', {
                  description: `${miniGameId} is not wired yet. Awarded $${placeholderWin.toLocaleString()} while we integrate it.`,
                })
                handleCasinoWin(placeholderWin)
                setCasinoMode('none')
                setPhase('idle')
              },
            },
            priority: 'normal',
            onClose: () => {
              setCasinoMode('none')
              debugGame('Casino mode panel closed')
              setTimeout(() => {
                debugGame('Phase transition: landed -> idle (casino panel closed)')
                setPhase('idle')
              }, 300)
            },
          })
        }, 1000)
      } else if (tile.title === 'Court of Capital') {
        const courtDefinition = getCourtOfCapitalDefinition()
        showOverlay({
          id: 'courtOfCapital',
          component: EventChoiceModal,
          props: {
            title: courtDefinition.title,
            description: courtDefinition.description,
            icon: courtDefinition.icon,
            options: courtDefinition.options,
            onSelect: (option: EventTileOption) => {
              handleEventTileChoice(courtDefinition.title, option)
            },
          },
          priority: 'normal',
          onClose: () => {
            setTimeout(() => {
              debugGame('Phase transition: landed -> idle (Court corner)')
              setPhase('idle')
            }, 300)
          },
        })
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

  // Handle Ring 3 tile landing
  const handleRing3Landing = (tileId: number, tilePosition: { x: number; y: number }) => {
    const tile = RING_3_TILES.find(t => t.id === tileId)
    if (!tile) return

    // Mark roll as used (already done in handleRoll, but ensure it's set)
    setRing3RollUsed(true)

    // It's a winning tile!
    const winAmount = tile.ring3Reward ?? RING_3_CONFIG.rewardPerWinTile

    // Trigger money celebration
    setMoneyCelebration({
      active: true,
      amount: winAmount,
      position: tilePosition,
    })

    // Add the cash reward
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + winAmount,
      netWorth: prev.netWorth + winAmount,
    }))

    // Play celebration sound based on reward amount
    playSound(getRewardSound('cash', winAmount))
    hapticSuccess()

    // Show toast
    toast.success(`💰 +$${winAmount.toLocaleString()}!`, {
      description: 'Wealth Run jackpot claimed!',
      duration: 3000,
    })

    setTimeout(() => {
      setMoneyCelebration(null)
    }, 1500)

    setRouletteModeActive(true)
    setLastRouletteReward(null)
    setRouletteSpinCount(0)
    setRouletteVictoryOpen(false)
    toast.success('🎯 Triple Ring Roulette', {
      description: 'All rings are live. Spin the mega roulette.',
    })
  }

  const jumpToTile = useCallback((ring: RingNumber, tileId: number) => {
    setGameState(prev => ({
      ...prev,
      currentRing: ring,
      position: tileId,
      stats: buildRingHistoryUpdate(prev, ring, 'jump'),
    }))
    setPhase('idle')
    setRing3RollUsed(false)
  }, [buildRingHistoryUpdate])

  const triggerBiasQuiz = useCallback(() => {
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
        setCurrentCaseStudy(null)
        setTimeout(() => {
          setPhase('idle')
        }, 300)
      },
    })
  }, [showOverlay, handleBiasQuizComplete])

  const triggerChanceJackpot = useCallback(() => {
    triggerPortalAnimation({
      direction: 'up',
      fromRing: 2,
      toRing: 3,
      fromTile: 209,
      toTile: 300,
      triggeredBy: 'land',
    })
    toast.success('🎴 Forced Chance Jackpot', {
      description: 'Jumped to the Wealth Run.',
    })
  }, [triggerPortalAnimation])

  const triggerWealthRunReward = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentRing: 3,
      position: 300,
      stats: buildRingHistoryUpdate(prev, 3, 'jump'),
    }))
    handleRing3Landing(300, { x: window.innerWidth / 2, y: window.innerHeight / 2 })
  }, [buildRingHistoryUpdate, handleRing3Landing])

  const handleBuyStock = (sharesToBuy: number, stock: Stock) => {
    const shares = Math.max(1, Math.floor(sharesToBuy))
    const totalCost = stock.price * shares
    const isEliteStock = stock.category === 'elite'
    const compositeScore = stock.scores?.composite ?? 6
    const baseEliteStars = Math.max(3, Math.round(compositeScore / 2))
    const baseEliteXp = Math.max(8, Math.round(compositeScore * 2))
    const eliteStars = isEliteStock
      ? applyRingMultiplier(applyStarMultiplier(baseEliteStars), gameState.currentRing)
      : 0
    const { xpMultiplier } = getEconomyMultipliers()
    const eliteXp = isEliteStock ? Math.floor(baseEliteXp * xpMultiplier) : 0
    
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
    updateChallengeProgress('buy_stock', { ticker: stock.ticker, category: stock.category })
    
    setGameState((prev) => {
      const newCash = prev.cash - totalCost
      // Apply 10% boost to portfolio value if upgrade owned
      const portfolioValueIncrease = hasPortfolioBooster ? totalCost * 1.1 : totalCost
      const newPortfolioValue = prev.portfolioValue + portfolioValueIncrease
      const newNetWorth = newCash + newPortfolioValue
      const existingHoldingIndex = prev.holdings.findIndex(
        (holding) => holding.stock.ticker === stock.ticker
      )
      const nextHoldings = [...prev.holdings]

      if (existingHoldingIndex >= 0) {
        const existingHolding = nextHoldings[existingHoldingIndex]
        nextHoldings[existingHoldingIndex] = {
          ...existingHolding,
          shares: existingHolding.shares + shares,
          totalCost: existingHolding.totalCost + totalCost,
        }
      } else {
        nextHoldings.push({
          stock,
          shares,
          totalCost,
        })
      }

      const alreadyOwned = existingHoldingIndex >= 0
      const updatedStats = {
        ...prev.stats,
        stocksPurchased: (prev.stats?.stocksPurchased || 0) + 1,
        uniqueStocks: (prev.stats?.uniqueStocks || 0) + (alreadyOwned ? 0 : 1),
        totalStarsEarned: (prev.stats?.totalStarsEarned || 0) + eliteStars,
      }

      return {
        ...prev,
        cash: newCash,
        portfolioValue: newPortfolioValue,
        netWorth: newNetWorth,
        holdings: nextHoldings,
        stats: updatedStats,
        stars: prev.stars + eliteStars,
        xp: (prev.xp ?? 0) + eliteXp,
      }
    })
    triggerImmediateSave()

    toast.success(`Purchased ${shares} shares of ${stock.ticker}`, {
      description: `Total cost: $${totalCost.toLocaleString()}`,
    })
    if (eliteStars > 0 || eliteXp > 0) {
      toast.success('Elite bonus unlocked!', {
        description: `+${eliteStars} ⭐ and +${eliteXp} XP`,
      })
    }

    debugGame('Stock purchased - closing modals and returning to idle')
    // Modal will close automatically via overlay manager's onOpenChange
    setShowCentralStock(false)
    setCurrentStock(null)
    setTimeout(() => {
      debugGame('Phase transition: landed -> idle (after stock purchase)')
      setPhase('idle')
    }, 500)
  }

  const handlePortfolioTrade = useCallback(
    (holdingIndex: number, action: 'buy' | 'sell', shares: number) => {
      const quantity = Math.max(1, Math.floor(shares))

      setGameState((prev) => {
        const holding = prev.holdings[holdingIndex]
        if (!holding) {
          return prev
        }

        const tradeValue = holding.stock.price * quantity
        let nextCash = prev.cash
        const nextHoldings = [...prev.holdings]

        if (action === 'buy') {
          if (nextCash < tradeValue) {
            toast.error('Insufficient funds', {
              description: `You need $${tradeValue.toLocaleString()} but only have $${nextCash.toLocaleString()}`,
            })
            return prev
          }

          nextCash -= tradeValue
          nextHoldings[holdingIndex] = {
            ...holding,
            shares: holding.shares + quantity,
            totalCost: holding.totalCost + tradeValue,
          }
          toast.success(`Bought ${quantity} shares of ${holding.stock.ticker}`, {
            description: `Total cost: $${tradeValue.toLocaleString()}`,
          })
        } else {
          if (quantity > holding.shares) {
            toast.error('Not enough shares', {
              description: `You only have ${holding.shares} shares of ${holding.stock.ticker}`,
            })
            return prev
          }

          const avgCostPerShare = holding.shares > 0 ? holding.totalCost / holding.shares : 0
          const remainingShares = holding.shares - quantity
          const remainingCost = avgCostPerShare * remainingShares

          nextCash += tradeValue

          if (remainingShares <= 0) {
            nextHoldings.splice(holdingIndex, 1)
          } else {
            nextHoldings[holdingIndex] = {
              ...holding,
              shares: remainingShares,
              totalCost: remainingCost,
            }
          }

          toast.success(`Sold ${quantity} shares of ${holding.stock.ticker}`, {
            description: `Proceeds: $${tradeValue.toLocaleString()}`,
          })
        }

        const nextPortfolioValue = nextHoldings.reduce(
          (sum, item) => sum + item.shares * item.stock.price,
          0
        )

        return {
          ...prev,
          cash: nextCash,
          portfolioValue: nextPortfolioValue,
          netWorth: nextCash + nextPortfolioValue,
          holdings: nextHoldings,
        }
      })
      triggerImmediateSave()
    },
    [triggerImmediateSave]
  )

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
    
    // Apply ring multiplier
    starsToAward = applyRingMultiplier(starsToAward, gameState.currentRing)
    
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + starsToAward,
    }))

    const multiplierText = getMultiplierDisplay(gameState.currentRing)
    toast.success(`Challenge accepted: ${challenge.title}`, {
      description: `Earned ${starsToAward} stars! ⭐${multiplierText ? ` (Ring ${gameState.currentRing} ${multiplierText})` : ''}`,
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

  function handleBiasQuizComplete(correct: number, total: number) {
    const percentage = (correct / total) * 100
    const isPerfect = correct === total
    const { nextStreak: nextQuizStreak, todayKey: quizDateKey } = getDailyStreakUpdate(
      gameState.stats?.lastQuizDate,
      gameState.stats?.daily_quiz ?? 0
    )
    
    // Track challenge progress for quiz completion
    updateChallengeProgress('complete_quiz', { score: correct, total, isPerfect })
    
    let starsEarned = isPerfect ? 5 : correct >= total / 2 ? 3 : 1
    
    // Apply star multiplier upgrade if owned
    starsEarned = applyStarMultiplier(starsEarned)
    
    // Apply ring multiplier
    starsEarned = applyRingMultiplier(starsEarned, gameState.currentRing)

    playSound('celebration')
    setGameState((prev) => ({
      ...prev,
      stars: prev.stars + starsEarned,
      stats: {
        ...prev.stats,
        quizzesCompleted: (prev.stats?.quizzesCompleted || 0) + 1,
        perfectQuizzes: (prev.stats?.perfectQuizzes || 0) + (isPerfect ? 1 : 0),
        daily_quiz: nextQuizStreak,
        lastQuizDate: quizDateKey,
        totalStarsEarned: (prev.stats?.totalStarsEarned || 0) + starsEarned,
      },
    }))

    const multiplierText = getMultiplierDisplay(gameState.currentRing)
    toast.success(`Quiz complete: ${correct}/${total} correct`, {
      description: `Earned ${starsEarned} stars! ⭐ ${multiplierText ? `(Ring ${gameState.currentRing} ${multiplierText}) ` : ''}${percentage >= 100 ? 'Perfect score! ' : ''}Streak ${nextQuizStreak} day${nextQuizStreak === 1 ? '' : 's'}.`,
    })
    triggerCelebrationFromLastTile(['⭐', '✨'])
  }

  function handleCasinoWin(amount: number) {
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

  const handleWheelSpinComplete = useCallback((prize: { id: string, type: string, value: number }, value: number) => {
    switch (prize.type) {
      case 'coins':
        addCoins(value, 'Wheel of Fortune')
        showToast('success', `🎡 Wheel Win!`, {
          description: `+${value.toLocaleString()} coins!`
        })
        break
      case 'stars':
        setGameState(prev => ({ ...prev, stars: prev.stars + value }))
        showToast('success', `🎡 Wheel Win!`, {
          description: `+${value.toLocaleString()} stars! ⭐`
        })
        break
      case 'cash':
        setGameState(prev => ({ 
          ...prev, 
          cash: prev.cash + value,
          netWorth: prev.netWorth + value,
        }))
        showToast('success', `🎡 Wheel Win!`, {
          description: `+$${value.toLocaleString()}! 💵`
        })
        break
      case 'rolls':
        setRollsRemaining(prev => Math.min(prev + value, ENERGY_MAX))
        setGameState(prev => ({
          ...prev,
          energyRolls: Math.min((prev.energyRolls ?? DAILY_ROLL_LIMIT) + value, ENERGY_MAX)
        }))
        showToast('success', `🎡 Wheel Win!`, {
          description: `+${value} dice rolls! 🎲`
        })
        break
      case 'xp':
        setGameState(prev => ({
          ...prev,
          xp: (prev.xp ?? 0) + value,
        }))
        showToast('success', `🎡 Wheel Win!`, {
          description: `+${value} XP! ⚡`
        })
        break
      case 'spin-again':
        setFreeWheelSpins(prev => prev + 1)
        showToast('success', `🎡 Wheel Win!`, {
          description: `Free spin awarded! 🔄`
        })
        break
      case 'jackpot':
        if (prize.id === 'jackpot-stars') {
          setGameState(prev => ({ ...prev, stars: prev.stars + value }))
          showToast('success', `🎉 JACKPOT! 🎉`, {
            description: `+${value.toLocaleString()} stars! 👑`
          })
        } else {
          setGameState(prev => ({ 
            ...prev, 
            cash: prev.cash + value,
            netWorth: prev.netWorth + value,
          }))
          showToast('success', `🎉 MEGA JACKPOT! 🎉`, {
            description: `+$${value.toLocaleString()}! 💰`
          })
        }
        triggerCelebrationFromLastTile(['🎡', '🎉', '✨'])
        break
    }
    markDailySpinUsed()
  }, [addCoins, markDailySpinUsed, setGameState, setRollsRemaining, showToast, triggerCelebrationFromLastTile])

  const handleVaultHeistComplete = useCallback((
    prizes: Array<{ type: 'cash' | 'stars' | 'coins' | 'mystery' | 'alarm', amount: number, emoji: string, label: string }>, 
    haul: { cash: number; stars: number; coins: number; mysteryBoxes: number }
  ) => {
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + haul.cash,
      netWorth: prev.netWorth + haul.cash,
      stars: prev.stars + haul.stars,
      coins: prev.coins + haul.coins,
      // Mystery boxes handled separately if needed
    }))
    
    // Decrement free game sessions (one session = 3 picks)
    setFreeVaultPicks(prev => Math.max(0, prev - 1))
    
    playSound('celebration')
    showToast('success', '💼 Vault Heist Complete!', {
      description: `You got away with $${haul.cash.toLocaleString()}, ${haul.stars} ⭐, ${haul.coins} 🪙, and ${haul.mysteryBoxes} 💎!`
    })
  }, [playSound, showToast])

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
        const baseStars = event.effect.stars
        // Apply ring multiplier to positive star rewards
        const starsAmount = baseStars > 0 ? applyRingMultiplier(baseStars, prev.currentRing) : baseStars
        
        if (starsAmount > 0) {
          newStars = prev.stars + starsAmount
          const multiplierText = getMultiplierDisplay(prev.currentRing)
          toast.success(`${event.title}`, {
            description: `Gained ${starsAmount} stars! ⭐${multiplierText ? ` (${multiplierText})` : ''}`,
          })
        } else {
          newStars = Math.max(0, prev.stars + starsAmount)
          toast.error(`${event.title}`, {
            description: `Lost ${Math.abs(starsAmount)} stars`,
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
    isLogoPanel ? 'bg-opacity-0 backdrop-blur-none' : '',
    ringTransitionDirection === 'up' ? 'ring-transition-up' : '',
    ringTransitionDirection === 'down' ? 'ring-transition-down' : ''
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

  const hasActiveOverlay = Boolean(getCurrentOverlay() || proToolsOpen)

  // Main content that will be wrapped by layout
  const mainContent = (
    <div 
      ref={containerRef} 
      className={`relative isolate game-board ${isPhone ? 'h-full w-full p-0' : 'min-h-screen bg-background p-8 overflow-hidden'} ${
        ring3CelebrationActive ? 'ring3-celebration-screen' : ''
      } ${rouletteModeActive ? 'roulette-mode-active' : ''} ${rouletteSpinActive ? 'roulette-spin-active' : ''}`}
    >
      <LoadingScreen show={isLoading} />
        
        {/* Background - only show if not in phone layout (phone layout has its own) */}
        {!isPhone && (
          <div
            className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-[length:auto_100%] bg-top opacity-60 pointer-events-none"
            aria-hidden="true"
          />
        )}
        {ring3CelebrationActive && (
          <div className="ring3-celebration-beams" aria-hidden="true" />
        )}

        {/* Hide DiceHUD on mobile - shown in BottomNav instead */}
        {!isMobile && (
          <div data-tutorial="dice" className={ring3CelebrationActive ? 'ring3-ui-flash' : ''}>
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
              leverageLevel={leverageLevel}
              momentum={momentum}
              momentumMax={MOMENTUM_MAX}
              economyWindowLabel={activeEconomyWindow?.label ?? null}
              economyWindowEndsAt={activeEconomyWindow?.endAt ?? null}
              economyWindowStarsMultiplier={economyWindowMultipliers.starsMultiplier}
              economyWindowXpMultiplier={economyWindowMultipliers.xpMultiplier}
              rollLabel={rouletteModeActive ? 'SPIN ROULETTE' : 'ROLL'}
              rollIcon={rouletteModeActive ? <span className="text-lg">🎲🎲🎲</span> : undefined}
              rollPulse={rouletteModeActive}
            />
          </div>
        )}

        {developerModeEnabled && !isPhone && (
          <div className="fixed bottom-40 right-8 z-50 flex flex-col items-end gap-3 pointer-events-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeveloperPanelOpen((prev) => !prev)}
              className="bg-slate-900/70 text-slate-100 border-slate-500/50"
            >
              {developerPanelOpen ? 'Hide Dev Panel' : 'Show Dev Panel'}
            </Button>
            {developerPanelOpen && (
              <Card className="w-64 border border-slate-500/40 bg-slate-950/90 p-3 text-xs text-slate-100 shadow-xl">
                <div className="mb-2 font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Developer Tools
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => jumpToTile(1, 0)}>
                    Jump to Big Fish Portal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => jumpToTile(2, 209)}>
                    Jump to Chance Tile
                  </Button>
                  <Button size="sm" variant="outline" onClick={triggerChanceJackpot}>
                    Force Chance Jackpot
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => jumpToTile(2, 200)}>
                    Jump to Fall Portal
                  </Button>
                  <Button size="sm" variant="outline" onClick={triggerWealthRunReward}>
                    Trigger Wealth Run Reward
                  </Button>
                  <Button size="sm" variant="outline" onClick={triggerBiasQuiz}>
                    Open Bias Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRouletteModeActive(false)
                      setRouletteSpinActive(false)
                      setLastRouletteReward(null)
                      setRouletteSpinCount(0)
                      setRouletteVictoryOpen(false)
                    }}
                  >
                    Reset Roulette Mode
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
        
        {/* Event Banner - Shows active events at top */}
        {!isPhone && (
          <div className={ring3CelebrationActive ? 'ring3-ui-flash' : ''}>
            <EventBanner
              events={activeEvents}
              onOpenCalendar={openEventCalendar}
            />
          </div>
        )}
        {rouletteModeActive && (
          <div
            className={`absolute left-1/2 z-30 w-[min(92vw,420px)] -translate-x-1/2 ${
              isPhone ? 'top-24' : 'top-6'
            }`}
          >
            <RouletteStatusPanel
              isActive={rouletteModeActive}
              spinActive={rouletteSpinActive}
              lastReward={lastRouletteReward}
              highlightRewards={rouletteHighlights}
              tailRewards={rouletteLongTail}
              spinCount={rouletteSpinCount}
            />
          </div>
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
          } ${ring3CelebrationActive ? 'ring3-ui-flash' : ''}`}>
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
                  ctaDisabled={!eventTrackCTA || eventTrackCTA.disabled}
                  commentary={eventTrackCommentary}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
              {/* ProTools Button */}
              <Button
                onClick={handleOpenProTools}
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
                      onOpenAIInsights: () => {
                        showOverlay({
                          id: 'ai-insights',
                          component: AIInsightsModal,
                          priority: 'normal',
                        })
                      },
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
                onClick={openGamesHub}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm rounded-full h-14 px-6 text-base font-semibold flex items-center gap-2"
                aria-label="Open Mini-Games Hub"
              >
                <GameController size={20} weight="fill" />
                Games
              </Button>
              <Button
                onClick={() => {
                  showOverlay({
                    id: 'portfolio',
                    component: PortfolioModal,
                    props: {
                      gameState,
                      onTradeHolding: handlePortfolioTrade,
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
          } ${ring3CelebrationActive ? 'ring3-ui-flash' : ''}`}>
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
                  const tilePositions = calculateTilePositions(tileBoardSize, 35, boardOuterRadius, false)
                  
                  return (
                    <div 
                      className={`ring-rotation-layer transition-all duration-500 ${
                        revealingRing === 1 ? 'ring-revealing' : ''
                      } ${fadingRing === 1 ? 'ring-fading' : ''} ${
                        ring3CelebrationActive ? 'ring3-spin-cw' : ''
                      }`}
                      style={{
                        opacity: getRingOpacity(1),
                        filter: getRingFilter(1),
                        pointerEvents: isRingInteractive(1) ? 'auto' : 'none',
                      }}
                    >
                      {BOARD_TILES.map((tile) => {
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
                          tileLabel={getTileLabelConfigForTile(tile, 1)}
                          isTeleporting={isTeleportingTile(tile.id)}
                          isPortal={tile.id === ring1PortalTileId}
                          onClick={() => {
                            if (phase === 'idle') {
                              handleTileLanding(tile.id)
                            }
                          }}
                        />
                      </div>
                    )
                  })}
                    </div>
                  )
                })()}
                
                {/* Inner Mystery Cards - Always visible */}
                {(() => {
                  const tileBoardSize = { width: boardSize, height: boardSize }
                  const innerPositions = calculateTilePositions(tileBoardSize, 12, boardOuterRadius, true)
                  
                  // Mobile scaling adjustment - slightly larger for better visibility
                  const mobileScale = isPhone ? 0.65 : 0.75
                  
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
                      {/* Ring 2 - Executive Floor (24 tiles) */}
                      <div 
                        className={`ring-rotation-layer transition-all duration-500 ${
                          revealingRing === 2 ? 'ring-revealing' : ''
                        } ${fadingRing === 2 ? 'ring-fading' : ''} ${
                          ring3CelebrationActive ? 'ring3-spin-ccw' : ''
                        }`}
                        style={{
                          opacity: getRingOpacity(2),
                          filter: getRingFilter(2),
                          pointerEvents: isRingInteractive(2) ? 'auto' : 'none',
                        }}
                      >
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
                            }}
                          >
                            <Tile
                              tile={tile}
                              isActive={gameState.currentRing === 2 && tile.id === gameState.position}
                              isHopping={hoppingTiles.includes(tile.id)}
                              isLanded={false}
                              ringNumber={2}
                              tileLabel={getTileLabelConfigForTile(tile, 2)}
                              isTeleporting={isTeleportingTile(tile.id)}
                              isPortal={tile.specialAction === 'ring-fall'}
                              onClick={() => {
                                if (phase === 'idle' && gameState.currentRing === 2) {
                                  handleTileLanding(tile.id)
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                      </div>

                      {/* Ring 3 - Elite Circle (7 tiles) */}
                      <div 
                        className={`ring-rotation-layer transition-all duration-500 ${
                          revealingRing === 3 ? 'ring-revealing' : ''
                        } ${fadingRing === 3 ? 'ring-fading' : ''}`}
                        style={{
                          opacity: getRingOpacity(3),
                          filter: getRingFilter(3),
                          pointerEvents: isRingInteractive(3) ? 'auto' : 'none',
                        }}
                      >
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
                            }}
                          >
                            <Tile
                              tile={tile}
                              isActive={gameState.currentRing === 3 && tile.id === gameState.position}
                              isHopping={hoppingTiles.includes(tile.id)}
                              isLanded={false}
                              ringNumber={3}
                              tileLabel={getTileLabelConfigForTile(tile, 3)}
                              isRing3Revealed={ring3Revealed}
                              isRing3Revealing={ring3Revealing}
                              isTeleporting={isTeleportingTile(tile.id)}
                              onClick={() => {
                                if (phase === 'idle' && gameState.currentRing === 3) {
                                  handleTileLanding(tile.id)
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                      </div>

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

        {/* Right Column - Action buttons (desktop only) */}
        {!isPhone && !isMobile && (
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

      {/* Mobile Quick Action Buttons - BOTTOM-LEFT positioned, above dice area - Only show on isMobile (not phone) */}
      {isMobile && !isPhone && (
        <div className="fixed bottom-[200px] left-4 z-40 flex flex-col gap-2">
          {/* Shop Button */}
          <button 
            onClick={openShopOverlay}
            className="flex items-center justify-center rounded-full bg-transparent p-0 shadow-lg hover:shadow-xl transition-all"
            aria-label="Open Shop"
          >
            <span className="text-3xl">🏪</span>
          </button>
          
          {/* Stock Exchange Builder Button - green pill */}
          <button 
            onClick={openStockExchangeOverlay}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold shadow-lg"
            aria-label="Open Stocks"
          >
            📈 Stocks
          </button>
          
          {/* Right Now Button - orange pill with notification dot */}
          <button 
            onClick={openEventCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-semibold shadow-lg relative"
            aria-label="Open Right Now"
          >
            ⏰ Right Now
            {/* Red notification dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </button>
        </div>
      )}

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

      {hasActiveOverlay && (
        <EconomyWindowStatus
          label={activeEconomyWindow?.label ?? null}
          endsAt={activeEconomyWindow?.endAt ?? null}
          starsMultiplier={economyWindowMultipliers.starsMultiplier}
          xpMultiplier={economyWindowMultipliers.xpMultiplier}
          className="fixed left-1/2 top-24 z-[70] w-[min(92vw,320px)] -translate-x-1/2 pointer-events-none border-emerald-300/50 bg-emerald-500/15 text-[11px] text-emerald-50 shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
          headerClassName="text-[9px] uppercase tracking-[0.3em] text-emerald-100/90"
          detailClassName="text-[10px] text-emerald-100/90"
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
          onVaultPurchase: handleVaultPurchase,
          isVaultPurchasing,
          shopEventDiscount: shopWindow.discount,
          shopEventLabel: shopWindow.event?.title,
          shopEventIcon: shopWindow.event?.icon,
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
          gameState,
          portfolio: gameState.portfolio,
          totalInvested: gameState.totalInvested,
          onViewStock: (symbol) => {
            logEvent?.('stock_viewed_from_portfolio', { symbol })
          },
          onTradeHolding: handlePortfolioTrade,
        }}
      />

      {/* ProToolsOverlay - kept separate as it's not a standard modal */}
      <ProToolsOverlay
        open={proToolsOpen}
        onOpenChange={(open) => {
          setProToolsOpen(open)
          if (!open) {
            setProToolsFallback(null)
          }
        }}
        fallback={proToolsFallback ?? undefined}
        onLaunchProTools={launchProToolsFromOverlay}
      />

      <AchievementsModal
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        unlockedAchievements={unlockedAchievements}
        getAchievementProgress={getAchievementProgress}
      />

      {/* Wheel of Fortune Modal */}
      <WheelOfFortuneModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
        coins={gameState.coins}
        currentRing={gameState.currentRing as 1 | 2 | 3}
        spinsRemaining={dailyWheelSpinsRemaining}
        spinsLimit={dailyWheelSpinLimit}
        freeSpinsRemaining={freeWheelSpins}
        onSpinComplete={handleWheelSpinComplete}
        onSpendCoins={(amount) => {
          if (dailyWheelSpinsRemaining <= 0) {
            return false
          }
          // If spending coins (not free), proceed with coin deduction
          if (amount > 0) {
            if (gameState.coins >= amount) {
              setGameState(prev => ({ ...prev, coins: prev.coins - amount }))
              return true
            }
            return false
          }
          // Free spin - decrement free spins counter
          if (freeWheelSpins > 0) {
            setFreeWheelSpins(prev => prev - 1)
            return true
          }
          return false
        }}
        playSound={playSound}
      />

      <RouletteVictoryModal
        isOpen={rouletteVictoryOpen}
        reward={lastRouletteReward}
        spinCount={rouletteSpinCount}
        onClose={() => setRouletteVictoryOpen(false)}
      />

      {/* Vault Heist Modal */}
      <VaultHeistModal
        isOpen={showVaultHeist}
        onClose={() => setShowVaultHeist(false)}
        currentRing={gameState.currentRing as 1 | 2 | 3}
        freePicksRemaining={freeVaultPicks}
        coins={gameState.coins}
        onPickComplete={handleVaultHeistComplete}
        onSpendCoins={(amount) => {
          if (amount === 0) {
            if (freeVaultPicks <= 0) {
              return false
            }
            setFreeVaultPicks(prev => {
              const next = Math.max(0, prev - 1)
              persistVaultHeistFreePicks(next, vaultHeistWindowKey)
              return next
            })
            return true
          }
          if (gameState.coins >= amount) {
            setGameState(prev => ({ ...prev, coins: prev.coins - amount }))
            return true
          }
          return false
        }}
        playSound={playSound}
      />

      {/* Throne Victory Modal */}
      <ThroneVictoryModal
        isOpen={showThroneVictory}
        onClose={() => setShowThroneVictory(false)}
        onPlayAgain={() => {
          // Reset to Ring 1, position 0
          setGameState(prev => ({
            ...prev,
            currentRing: 1,
            position: 0,
            stats: buildRingHistoryUpdate(prev, 1, 'reset'),
          }))
          setShowThroneVictory(false)
        }}
        journeyStats={{
          turnsTaken: gameState.stats.totalRolls,
          stocksCollected: gameState.stats.stocksPurchased,
          timesFallen: 0, // TODO: Track this if needed
          timePlayed: '0m', // TODO: Calculate actual play time if needed
          throneCount: gameState.throneCount,
        }}
        rewards={{
          stars: 10000,
          cash: 100000,
          badge: 'Tycoon',
        }}
        playSound={playSound}
      />

      {/* Portal Animation */}
      <PortalAnimation 
        transition={portalTransition}
        isAnimating={isPortalAnimating}
      />

      {/* Daily Spin Button */}
      {!isPhone && dailySpinAvailable && (
        <button
          onClick={() => setIsWheelOpen(true)}
          className="fixed bottom-24 right-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg animate-bounce hover:scale-110 transition-transform z-50"
          aria-label="Open Daily Spin"
        >
          <span className="text-3xl">🎡</span>
        </button>
      )}

      {/* Vault Heist Button */}
      {vaultHeistStatus && (
        <div className="fixed bottom-24 right-20 z-50 flex flex-col items-center gap-1">
          <button
            onClick={vaultHeistCtaDisabled ? undefined : handleVaultHeistCta}
            className={`p-4 rounded-full shadow-lg transition-transform ${
              vaultHeistStatus.isLive
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 animate-bounce hover:scale-110'
                : vaultHeistCtaDisabled
                ? 'bg-gradient-to-r from-amber-600/70 to-yellow-600/70 opacity-80 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600/80 to-yellow-600/80 opacity-90 hover:scale-110'
            }`}
            aria-label={
              vaultHeistStatus.isLive
                ? 'Open Vault Heist'
                : vaultHeistCtaDisabled
                ? 'Vault Heist upcoming'
                : 'Open Mini-Games Hub'
            }
            aria-disabled={vaultHeistCtaDisabled}
            disabled={vaultHeistCtaDisabled}
            title={`${vaultHeistStatus.headline} • ${vaultHeistStatus.detail}`}
          >
            <span className="text-3xl">🏦</span>
          </button>
          <div className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100 shadow">
            <span>{vaultHeistStatus.headline}</span>
            <span className="ml-2 text-[9px] font-medium normal-case text-amber-200/80">
              {vaultHeistStatus.detail}
            </span>
          </div>
        </div>
      )}

      {/* Money Celebration for Ring 3 wins */}
      {moneyCelebration && (
        <MoneyCelebration
          isActive={moneyCelebration.active}
          amount={moneyCelebration.amount}
          position={moneyCelebration.position}
          onComplete={() => setMoneyCelebration(null)}
        />
      )}

      {/* Quick Reward Celebration */}
      {quickCelebration && (
        <QuickCelebration
          isActive={quickCelebration.active}
          emoji={quickCelebration.emoji}
          amount={quickCelebration.amount}
          position={quickCelebration.position}
          onComplete={() => setQuickCelebration(null)}
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
    </>
  )

  // Render with appropriate layout based on screen size
  if (isPhone) {
    return (
      <>
        <PhoneLayout
          currentPosition={gameState.position}
          currentRing={gameState.currentRing}
          gameState={{
            cash: gameState.cash,
            netWorth: gameState.netWorth,
            level: gameState.level,
            xp: gameState.xp,
            xpToNext: xpForNextLevel,
            rolls: rollsRemaining,
            stars: gameState.stars, // Pass stars to CompactHUD
            coins: gameState.coins,
            seasonPoints: gameState.seasonPoints,
            cityLevel: gameState.cityLevel ?? 1, // Defensive fallback to 1
          }}
          onRollDice={(multiplier) => handleRoll(multiplier)}
          multiplier={mobileMultiplier}
          onCycleMultiplier={cycleMobileMultiplier}
          leverageLevel={leverageLevel}
          momentum={momentum}
          momentumMax={MOMENTUM_MAX}
          economyWindowLabel={activeEconomyWindow?.label ?? null}
          economyWindowEndsAt={activeEconomyWindow?.endAt ?? null}
          economyWindowStarsMultiplier={economyWindowMultipliers.starsMultiplier}
          economyWindowXpMultiplier={economyWindowMultipliers.xpMultiplier}
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
                onTradeHolding: handlePortfolioTrade,
              },
              priority: 'normal',
            })
          }}
          onOpenProTools={handleOpenProTools}
          onOpenSettings={() => handleBottomNavigation('settings')}
          onOpenShop={openShopOverlay}
          onOpenStockExchangeBuilder={openStockExchangeOverlay}
          onOpenRightNow={openEventCalendar}
          onOpenSeasonPass={openSeasonPass}
          dailySpinAvailable={dailySpinAvailable}
          onOpenDailySpin={() => setIsWheelOpen(true)}
          onOpenGamesHub={openGamesHub}
          saturdayVaultAvailable={vaultHeistAvailable}
          vaultHeistStatus={vaultHeistStatus ?? undefined}
          onOpenSaturdayVault={() => setShowVaultHeist(true)}
          ascendProgress={gameState.stats?.ringAscendProgress ?? 0}
          ascendGoal={ASCEND_PROGRESS_GOAL}
          eventTrackNode={(
            <EventTrackBar
              definition={eventTrackDefinition}
              progress={eventTrackProgress}
              onClaim={claimMilestone}
              onCTA={purchaseCTA}
              ctaLabel={eventTrackCTA?.label ?? null}
              ctaDisabled={!eventTrackCTA || eventTrackCTA.disabled}
              compactByDefault
              commentary={eventTrackCommentary}
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
