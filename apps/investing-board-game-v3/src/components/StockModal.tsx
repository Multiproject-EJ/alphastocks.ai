import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Stock } from '@/lib/types'
import { AI_INSIGHTS_FIXTURES, AI_INSIGHTS_SURFACE } from '@/lib/aiInsightsFixtures'
import {
  formatRelativeAgeDaysPhrase,
  formatRelativeAgeFallbackPhrase,
  formatRelativeAgeHoursPhrase,
  formatRelativeAgePhrase,
} from '@/config/aiInsights'
import type { RingNumber } from '@/lib/types'

interface StockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: Stock | null
  onBuy: (shares: number, stock: Stock) => void
  cash: number
  ringNumber?: RingNumber
  playSound?: (sound: string) => void
  onOpenProTools?: () => void
}


const STOCK_CARD_DEFAULTS = {
  analysisLabel: 'ValueBot analysis',
  modelLabelPrefix: 'Model',
  staleAfterDays: 30,
  staleBadgeLabel: 'Stale analysis',
  latestPulseLabel: 'Latest market pulse',
  noPulseLabel: 'No recent market pulse for this symbol yet.',
  pulseFreshToneClass: 'text-emerald-200',
  pulseStaleToneClass: 'text-amber-200',
  qualityChipToneClass: 'border-emerald-400/40 text-emerald-200',
  riskChipToneClass: 'border-amber-400/40 text-amber-200',
  timingChipToneClass: 'border-sky-400/40 text-sky-200',
  staleChipToneClass: 'border-rose-400/50 bg-rose-500/10 text-rose-200',
}

const STOCK_CARD_CONFIG = {
  ...STOCK_CARD_DEFAULTS,
  ...(AI_INSIGHTS_SURFACE?.stockCard ?? {}),
}

const AI_INSIGHTS_FIXTURE_LIST = Array.isArray(AI_INSIGHTS_FIXTURES) ? AI_INSIGHTS_FIXTURES : []

const RELATIVE_AGE_DEFAULTS = {
  updatedLabel: 'Updated',
  justNowLabel: 'Just now',
  minutesAgoTemplate: '{minutes}m ago',
  hoursAgoTemplate: '{hours}h ago',
  daysAgoTemplate: '{days}d ago',
  hoursThresholdMinutes: 60,
  hourCountDivisorMinutes: 60,
  hourCountMinimum: 1,
  daysThresholdMinutes: 1440,
  dayCountDivisorMinutes: 1440,
  dayCountMinimum: 1,
  fallbackTemplate: '{label}',
  unavailableLabel: 'Time unavailable',
}

const FRESHNESS_CONFIG = {
  staleAfterMinutes: 60,
  relativeAge: {
    ...RELATIVE_AGE_DEFAULTS,
    ...(AI_INSIGHTS_SURFACE?.freshness?.relativeAge ?? {}),
  },
  ...(AI_INSIGHTS_SURFACE?.freshness ?? {}),
}

// Stock hook generator - one catchy line per stock type
function getStockHook(stock: Stock): string {
  const hooks: Record<string, string[]> = {
    growth: [
      "Rocket ship ready for liftoff",
      "Growth machine that keeps delivering",
      "The future is bullish here",
    ],
    value: [
      "Hidden gem at a discount",
      "Wall Street's sleeping on this one",
      "Buy low, smile later",
    ],
    dividends: [
      "Passive income on autopilot",
      "Cash flow that never sleeps",
      "Your money making money",
    ],
    moats: [
      "Competition can't touch this",
      "Fortress business model",
      "Untouchable market leader",
    ],
    turnarounds: [
      "Comeback story in progress",
      "From underdog to top dog",
      "The phoenix is rising",
    ],
    elite: [
      "The crown jewel of investing",
      "Legendary wealth builder",
      "Elite tier excellence",
    ],
  }

  const category = stock.category || 'value'
  const categoryHooks = hooks[category] || hooks.value
  return categoryHooks[Math.floor(Math.random() * categoryHooks.length)]
}

// Mini score bar component
function ScoreMiniBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 10) * 100
  const color = value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div>
      <div className="flex justify-between text-gray-400 mb-1">
        <span>{label}</span>
        <span className="text-white">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Particle burst effect on buy
function BuyParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (360 / 20) * i,
    distance: 40 + Math.random() * 30,
    emoji: ['💵', '✨', '⭐', '💰'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const radians = (p.angle * Math.PI) / 180
        const x = Math.cos(radians) * p.distance
        const y = Math.sin(radians) * p.distance

        return (
          <motion.span
            key={p.id}
            className="absolute left-1/2 top-1/2 text-sm"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ 
              x, 
              y, 
              opacity: 0, 
              scale: 0.5,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {p.emoji}
          </motion.span>
        )
      })}
    </div>
  )
}


function getAgeMinutes(timestamp?: string | null): number {
  if (!timestamp) return Number.POSITIVE_INFINITY

  const parsed = new Date(timestamp).getTime()
  if (!Number.isFinite(parsed)) return Number.POSITIVE_INFINITY

  return Math.max(0, (Date.now() - parsed) / 60000)
}

function formatAnalysisAge(timestamp?: string | null): string {
  const relativeAgeConfig = FRESHNESS_CONFIG.relativeAge
  const ageMinutes = getAgeMinutes(timestamp)

  if (!Number.isFinite(ageMinutes)) {
    return formatRelativeAgeFallbackPhrase({
      fallbackTemplate: relativeAgeConfig.fallbackTemplate,
      label: relativeAgeConfig.unavailableLabel,
    })
  }

  const roundedAgeMinutes = Math.floor(ageMinutes)

  if (roundedAgeMinutes <= 0) {
    return formatRelativeAgeFallbackPhrase({
      fallbackTemplate: relativeAgeConfig.fallbackTemplate,
      label: relativeAgeConfig.justNowLabel,
    })
  }

  if (roundedAgeMinutes >= relativeAgeConfig.daysThresholdMinutes) {
    const dayCount = Math.max(
      relativeAgeConfig.dayCountMinimum,
      Math.floor(roundedAgeMinutes / relativeAgeConfig.dayCountDivisorMinutes),
    )

    return formatRelativeAgeDaysPhrase({
      daysAgoTemplate: relativeAgeConfig.daysAgoTemplate,
      days: dayCount,
    })
  }

  if (roundedAgeMinutes >= relativeAgeConfig.hoursThresholdMinutes) {
    const hourCount = Math.max(
      relativeAgeConfig.hourCountMinimum,
      Math.floor(roundedAgeMinutes / relativeAgeConfig.hourCountDivisorMinutes),
    )

    return formatRelativeAgeHoursPhrase({
      hoursAgoTemplate: relativeAgeConfig.hoursAgoTemplate,
      hours: hourCount,
    })
  }

  return formatRelativeAgePhrase({
    minutesAgoTemplate: relativeAgeConfig.minutesAgoTemplate,
    minutes: roundedAgeMinutes,
  })
}

function getLatestPulseForTicker(ticker?: string | null) {
  const normalizedTicker = ticker?.trim().toUpperCase()
  if (!normalizedTicker) return null

  const matches = AI_INSIGHTS_FIXTURE_LIST
    .filter((insight) => insight.symbol.trim().toUpperCase() === normalizedTicker)
    .sort((a, b) => getAgeMinutes(a.updatedAt) - getAgeMinutes(b.updatedAt))

  return matches[0] ?? null
}

// Haptic feedback utility
function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  
  switch (type) {
    case 'light':
      navigator.vibrate(10)
      break
    case 'medium':
      navigator.vibrate(30)
      break
    case 'heavy':
      navigator.vibrate([30, 50, 30])
      break
  }
}

export function StockModal({ 
  open, 
  onOpenChange, 
  stock, 
  onBuy, 
  cash, 
  ringNumber = 1,
  playSound,
  onOpenProTools
}: StockModalProps) {
  const [buyPressed, setBuyPressed] = useState(false)
  const [passPressed, setPassPressed] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  if (!stock) return null

  const multiplier = ringNumber === 3 ? 10 : ringNumber === 2 ? 3 : 1
  const sharesToBuy = 10 * multiplier
  const totalCost = stock.price * sharesToBuy
  const canAffordBundle = cash >= totalCost

  const handleBuy = () => {
    if (!canAffordBundle) {
      playSound?.('error')
      triggerHaptic('light')
      return
    }

    playSound?.('cash-register')
    triggerHaptic('medium')
    setBuyPressed(true)
    setShowParticles(true)
    
    setTimeout(() => {
      onBuy(sharesToBuy, stock)
      setBuyPressed(false)
      setShowParticles(false)
      onOpenChange(false)
    }, 300)
  }

  const handlePass = () => {
    playSound?.('swipe-no')
    triggerHaptic('light')
    setPassPressed(true)
    setTimeout(() => {
      onOpenChange(false)
      setPassPressed(false)
    }, 200)
  }

  const qualityScore = stock.scores?.quality ?? 5
  const riskScore = stock.scores?.risk ?? 5
  const timingScore = stock.scores?.timing ?? 5
  const displayedCompositeScore = Number(((qualityScore + riskScore + timingScore) / 3).toFixed(1))

  // Generate score stars (0-5 based on composite score 0-10)
  const scoreStars = Math.round(displayedCompositeScore / 2)
  const starDisplay = '⭐'.repeat(Math.min(scoreStars, 5))

  // One-line stock hook/summary
  const stockHook = getStockHook(stock)
  const analysisAge = formatAnalysisAge(stock.analyzed_at)
  const staleAfterMinutes = STOCK_CARD_CONFIG.staleAfterDays * 24 * 60
  const isAnalysisStale = getAgeMinutes(stock.analyzed_at) >= staleAfterMinutes
  const latestPulse = getLatestPulseForTicker(stock.ticker)
  const isPulseStale = latestPulse
    ? getAgeMinutes(latestPulse.updatedAt) >= FRESHNESS_CONFIG.staleAfterMinutes
    : false
  const pulseToneClass = isPulseStale ? STOCK_CARD_CONFIG.pulseStaleToneClass : STOCK_CARD_CONFIG.pulseFreshToneClass

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handlePass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm mx-4 bg-gradient-to-b from-gray-900 to-gray-950 
                       rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Swipe down = Pass
              if (info.offset.y > 100) {
                handlePass()
              }
            }}
          >
            {/* Compact Header */}
            <div className="p-4 pb-2">
              {/* Top row: Logo + Ticker + Score */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {stock.image_url ? (
                      <img 
                        src={stock.image_url} 
                        alt={stock.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.textContent = '📈'
                        }}
                      />
                    ) : '📈'}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stock.ticker}</div>
                    <div className="text-sm text-gray-400 truncate max-w-[180px]">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {displayedCompositeScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-yellow-400">{starDisplay}</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-3" />

              {/* Price Display */}
              <div className="text-center mb-2">
                <div className="text-2xl font-bold text-white">
                  ${stock.price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Current Price</div>
              </div>

              {/* One-line hook */}
              <p className="text-sm text-gray-300 italic text-center mb-3">
                "{stockHook}"
              </p>

              {/* Mini score bars */}
              <div className="space-y-2 text-xs">
                <ScoreMiniBar label="Quality" value={qualityScore} />
                <ScoreMiniBar label="Risk" value={riskScore} />
                <ScoreMiniBar label="Timing" value={timingScore} />
              </div>


              <div className="mt-3 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-cyan-200">{STOCK_CARD_CONFIG.analysisLabel}</span>
                  {stock.quality_label ? (
                    <span className={`rounded-full border px-2 py-0.5 ${STOCK_CARD_CONFIG.qualityChipToneClass}`}>Q: {stock.quality_label}</span>
                  ) : null}
                  {stock.risk_label ? (
                    <span className={`rounded-full border px-2 py-0.5 ${STOCK_CARD_CONFIG.riskChipToneClass}`}>R: {stock.risk_label}</span>
                  ) : null}
                  {stock.timing_label ? (
                    <span className={`rounded-full border px-2 py-0.5 ${STOCK_CARD_CONFIG.timingChipToneClass}`}>T: {stock.timing_label}</span>
                  ) : null}
                  {isAnalysisStale ? (
                    <span className={`rounded-full border px-2 py-0.5 ${STOCK_CARD_CONFIG.staleChipToneClass}`}>
                      {STOCK_CARD_CONFIG.staleBadgeLabel}
                    </span>
                  ) : null}
                </div>

                <p className="text-gray-300">
                  {FRESHNESS_CONFIG.relativeAge.updatedLabel}: {analysisAge}
                </p>
                {stock.ai_model ? (
                  <p className="text-gray-400">
                    {STOCK_CARD_CONFIG.modelLabelPrefix}: {stock.ai_model}
                  </p>
                ) : null}
                <p className={`${pulseToneClass}`}>
                  {STOCK_CARD_CONFIG.latestPulseLabel}: {latestPulse ? latestPulse.headline : STOCK_CARD_CONFIG.noPulseLabel}
                </p>
              </div>

              {/* ProTools Report Link */}
              {onOpenProTools && (
                <button
                  onClick={() => {
                    playSound?.('button-click')
                    onOpenProTools()
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 mt-3
                             text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-medium">Read the full report →</span>
                </button>
              )}

              {/* Ring multiplier badge */}
              {multiplier > 1 && (
                <div className="mt-3 text-center">
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-sm font-bold
                    ${ringNumber === 3 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' 
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                    }
                  `}>
                    Ring {ringNumber} — {multiplier}× Rewards!
                  </span>
                </div>
              )}
            </div>

            {/* HUGE Buttons Section */}
            <div className="p-4 pt-2 pb-8 flex gap-3">
              {/* PASS Button */}
              <motion.button
                className={`
                  flex-1 py-6 rounded-2xl font-bold text-xl
                  bg-gradient-to-b from-gray-700 to-gray-800
                  border-2 border-gray-600
                  text-gray-300
                  flex flex-col items-center justify-center gap-1
                  active:scale-95 transition-transform
                  ${passPressed ? 'scale-95' : ''}
                `}
                whileTap={{ scale: 0.95 }}
                onClick={handlePass}
              >
                <span className="text-3xl">👋</span>
                <span>PASS</span>
              </motion.button>

              {/* BUY Button */}
              <motion.button
                className={`
                  flex-[1.5] py-6 rounded-2xl font-bold text-xl
                  relative overflow-hidden
                  ${canAffordBundle 
                    ? 'bg-gradient-to-b from-green-500 to-green-700 border-2 border-green-400 text-white' 
                    : 'bg-gradient-to-b from-gray-600 to-gray-700 border-2 border-gray-500 text-gray-400'
                  }
                  flex flex-col items-center justify-center gap-1
                  ${buyPressed ? 'scale-95' : ''}
                `}
                whileTap={canAffordBundle ? { scale: 0.92 } : {}}
                onClick={handleBuy}
                disabled={!canAffordBundle}
              >
                {/* Glow effect */}
                {canAffordBundle && (
                  <motion.div
                    className="absolute inset-0 bg-green-400/20"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Particle burst on click */}
                {showParticles && <BuyParticles />}

                <span className="text-3xl relative z-10">
                  {canAffordBundle ? '💰🚀' : '🔒'}
                </span>
                <span className="relative z-10">
                  {canAffordBundle ? `BUY ${sharesToBuy} SHARES` : "Can't Afford"}
                </span>
                <span className="text-sm opacity-80 relative z-10">
                  ${totalCost.toLocaleString()}
                </span>
              </motion.button>
            </div>

            {/* Swipe hint for mobile */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
