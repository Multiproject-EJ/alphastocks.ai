import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import type { RouletteReward } from '@/lib/mockData'

interface RouletteVictoryModalProps {
  isOpen: boolean
  reward: RouletteReward | null
  spinCount: number
  onClose: () => void
}

const TIER_STYLES: Record<string, {
  badge: string
  gradient: string
  glow: string
  celebration: 'small' | 'medium' | 'large' | 'epic'
}> = {
  mega: {
    badge: 'Mega Win',
    gradient: 'from-amber-400 via-yellow-300 to-orange-500',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.6)]',
    celebration: 'epic',
  },
  major: {
    badge: 'Major Win',
    gradient: 'from-emerald-400 via-teal-300 to-cyan-500',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.5)]',
    celebration: 'large',
  },
  boost: {
    badge: 'Boost Win',
    gradient: 'from-sky-400 via-blue-400 to-indigo-500',
    glow: 'shadow-[0_0_24px_rgba(96,165,250,0.5)]',
    celebration: 'medium',
  },
  tail: {
    badge: 'Quick Win',
    gradient: 'from-purple-400 via-fuchsia-400 to-pink-500',
    glow: 'shadow-[0_0_20px_rgba(216,180,254,0.5)]',
    celebration: 'small',
  },
  mystery: {
    badge: 'Mystery Win',
    gradient: 'from-pink-400 via-rose-400 to-red-500',
    glow: 'shadow-[0_0_28px_rgba(244,114,182,0.5)]',
    celebration: 'medium',
  },
}

export function RouletteVictoryModal({
  isOpen,
  reward,
  spinCount,
  onClose,
}: RouletteVictoryModalProps) {
  if (!isOpen || !reward) return null

  const tierStyle = TIER_STYLES[reward.tier] ?? TIER_STYLES.tail

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 text-white ${tierStyle.glow}`}
            initial={{ scale: 0.92, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
          >
            <CelebrationEffect show={true} level={tierStyle.celebration} />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 p-2 text-white/70 transition hover:text-white"
              aria-label="Close roulette victory"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-3 text-center">
              <span className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 bg-gradient-to-r ${tierStyle.gradient}`}>
                {tierStyle.badge}
              </span>

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl">
                {reward.icon}
              </div>

              <div>
                <h3 className="text-2xl font-bold">{reward.label}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Spin #{spinCount} just landed a {reward.type} bonus.
                </p>
              </div>

              <div className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="uppercase tracking-wide">Reward</span>
                  <span className="font-semibold text-white">
                    {reward.icon} {reward.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Keep the streak going for bigger spins and richer roulette tiers.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-[1.02]"
              >
                Collect & Keep Rolling
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
