/**
 * Daily Dividends Modal Component
 * Stock market themed daily reward system similar to Monopoly Go's Daily Treats
 * Mobile-first design that fits phone screen without scrolling
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, TrendUp } from '@phosphor-icons/react'
import {
  DailyDividendReward,
  DailyDividendStatus,
  getRewardPreviewForDay,
} from '@/hooks/useDailyDividends'
import { useSound } from '@/hooks/useSound'
import { useHaptics } from '@/hooks/useHaptics'
import confetti from 'canvas-confetti'

interface DailyDividendsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: DailyDividendStatus
  onCollect: () => Promise<{ reward: DailyDividendReward | null; error?: string }>
  errorMessage?: string | null
}

// Confetti celebration effect
const triggerConfetti = () => {
  const count = 200
  const defaults = {
    origin: { y: 0.5 },
    colors: ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b'],
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })

  fire(0.2, {
    spread: 60,
  })

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export function DailyDividendsModal({
  open,
  onOpenChange,
  status,
  onCollect,
  errorMessage,
}: DailyDividendsModalProps) {
  const { play: playSound } = useSound()
  const { success: hapticSuccess } = useHaptics()
  const [collecting, setCollecting] = useState(false)
  const [collectError, setCollectError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [revealedReward, setRevealedReward] = useState<DailyDividendReward | null>(null)

  useEffect(() => {
    if (errorMessage) {
      setCollectError(errorMessage)
    }
  }, [errorMessage])

  const handleCollect = async () => {
    if (collecting || !status.canCollect) return

    setCollectError(null)
    setCollecting(true)
    playSound('cash-register')
    hapticSuccess()

    setTimeout(async () => {
      const { reward, error } = await onCollect()
      if (!reward) {
        setCollecting(false)
        setCollectError(error || errorMessage || 'Unable to collect right now. Please try again.')
        return
      }

      setRevealedReward(reward)
      setRevealed(true)
      triggerConfetti()

      // Close modal after celebration
      setTimeout(() => {
        onOpenChange(false)
        setRevealed(false)
        setRevealedReward(null)
        setCollecting(false)
      }, 2000)
    }, 350)
  }

  // Render day card
  const DayCard = ({ day, size = 'normal' }: { day: number; size?: 'normal' | 'large' }) => {
    const isCurrentDay = day === status.currentDay
    const isCollected = day < status.currentDay || (day === 7 && status.currentDay === 1 && status.totalCollected > 0)
    const isLockedToday = isCurrentDay && !status.canCollect
    const reward = getRewardPreviewForDay(day)

    const cardSize = size === 'large'
      ? 'w-28 h-36 sm:w-32 sm:h-40'
      : 'w-20 h-28 sm:w-24 sm:h-32'
    
    return (
      <motion.button
        onClick={isCurrentDay && status.canCollect ? handleCollect : undefined}
        disabled={!isCurrentDay || !status.canCollect || collecting}
        className={`${cardSize} relative rounded-xl border-2 transition-all ${
          isCurrentDay && status.canCollect
            ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-lg shadow-emerald-500/50 cursor-pointer hover:scale-105'
            : isLockedToday
            ? 'border-emerald-700/40 bg-gradient-to-br from-slate-700/50 to-slate-800/60 opacity-80'
            : isCollected
            ? 'border-slate-200 bg-white/95 shadow-inner'
            : 'border-slate-600/40 bg-gradient-to-br from-slate-700/20 to-slate-800/20'
        }`}
        whileHover={isCurrentDay && status.canCollect ? { scale: 1.05 } : undefined}
        whileTap={isCurrentDay && status.canCollect ? { scale: 0.95 } : undefined}
      >
        {/* Day number badge */}
        <div className={`absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          isCurrentDay 
            ? 'border-emerald-500 bg-emerald-500 text-white' 
            : isCollected
            ? 'border-emerald-700 bg-emerald-700 text-white'
            : 'border-slate-600 bg-slate-700 text-slate-300'
        }`}>
          <span className="text-xs font-bold">D{day}</span>
        </div>

        {/* Collected checkmark */}
        {isCollected && !isCurrentDay && (
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white">
            <Check size={16} weight="bold" />
          </div>
        )}

        {/* Reward display */}
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
          {isCurrentDay && !revealed ? (
            <>
              <div className="text-2xl sm:text-3xl">{isLockedToday ? '🔒' : '?'}</div>
              <div className="text-[10px] text-center font-medium text-slate-300">
                {isLockedToday ? 'Come back tomorrow' : 'Tap to Reveal'}
              </div>
            </>
          ) : (
            <>
              <div className={`text-2xl ${size === 'large' ? 'text-3xl sm:text-4xl' : ''}`}>
                {reward.base.type === 'dice' ? '🎲' : '💵'}
              </div>
              <div className={`text-[10px] sm:text-xs text-center font-bold ${
                isCurrentDay ? 'text-emerald-300' : isCollected ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {reward.base.type === 'dice' 
                  ? `${reward.base.amount} Rolls`
                  : `$${reward.base.amount.toLocaleString()}`
                }
              </div>
              <div className={`text-[10px] sm:text-[11px] text-center ${
                isCollected ? 'text-slate-600' : 'text-emerald-200/80'
              }`}>
                +$${reward.bonusCash.toLocaleString()} bonus
              </div>
            </>
          )}
        </div>

        {/* Animated pulse for current day */}
        {isCurrentDay && status.canCollect && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-emerald-500"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md p-0 overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <DialogHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 bg-gradient-to-b from-emerald-900/40 to-transparent">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-white">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-500">
              <TrendUp size={20} weight="bold" />
            </div>
            <span>Daily Dividends</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-2">
            Visit daily to collect your rewards! Progress through all 7 days to maximize your gains.
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          {/* Days 1-3: Top row */}
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-center gap-2 sm:gap-3 mb-2">
              <DayCard day={1} />
              <DayCard day={2} />
              <DayCard day={3} />
            </div>
          </div>

          {/* Days 4-6: Middle row */}
          <div className="mb-3 sm:mb-4">
            <div className="flex justify-center gap-2 sm:gap-3 mb-2">
              <DayCard day={4} />
              <DayCard day={5} />
              <DayCard day={6} />
            </div>
          </div>

          {/* Day 7: Bottom (larger card) */}
          <div className="flex justify-center">
            <DayCard day={7} size="large" />
          </div>

          {/* Progress indicator */}
          <div className="mt-4 sm:mt-6 rounded-lg bg-slate-800/50 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300">Progress</span>
              <span className="text-xs text-emerald-400 font-bold">
                {status.currentDay === 1 && status.totalCollected > 0 ? '7/7 Complete' : `Day ${status.currentDay} of 7`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700/50">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${((status.currentDay - 1) / 7) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2 text-center">
              {status.currentDay === 7 
                ? 'Complete Day 7 to restart the cycle!' 
                : 'Keep your streak going!'}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-lg bg-slate-800/50 p-2 sm:p-3 text-center">
              <div className="text-base sm:text-lg font-bold text-emerald-400">
                {status.totalCollected}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400">Total Collected</div>
            </div>
            <div className="rounded-lg bg-slate-800/50 p-2 sm:p-3 text-center">
              <div className="text-base sm:text-lg font-bold text-emerald-400">
                Day {status.currentDay}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400">Current Day</div>
            </div>
          </div>

          {/* Collect action */}
          <div className="mt-4 sm:mt-5">
            <button
              type="button"
              onClick={handleCollect}
              disabled={!status.canCollect || collecting}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                status.canCollect && !collecting
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400'
                  : 'bg-slate-700/60 text-slate-300'
              }`}
            >
              {collecting
                ? 'Collecting...'
                : status.canCollect
                ? 'Collect Today’s Reward'
                : 'Come back tomorrow'}
            </button>
            {collectError && (
              <p className="mt-2 text-[11px] sm:text-xs text-rose-300 text-center">
                {collectError}
              </p>
            )}
          </div>
        </div>

        {/* Celebration overlay */}
        <AnimatePresence>
          {revealed && revealedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-center"
              >
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
                  {revealedReward.base.type === 'dice' ? '🎲' : '💵'}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {revealedReward.base.type === 'dice' 
                    ? `+${revealedReward.base.amount} Rolls!`
                    : `+$${revealedReward.base.amount.toLocaleString()}!`
                  }
                </div>
                <div className="text-base sm:text-lg text-emerald-300">
                  +$${revealedReward.bonusCash.toLocaleString()} bonus cash
                </div>
                <div className="text-base sm:text-lg text-emerald-200">
                  +{revealedReward.mysteryGift} mystery rolls
                </div>
                <div className="text-emerald-400 text-base sm:text-lg mt-2">Reward Collected!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
