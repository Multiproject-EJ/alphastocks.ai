import { Card } from '@/components/ui/card'
import type { RouletteReward } from '@/lib/mockData'

interface RouletteStatusPanelProps {
  isActive: boolean
  spinActive: boolean
  lastReward: RouletteReward | null
  highlightRewards: RouletteReward[]
  tailRewards: RouletteReward[]
  spinCount: number
  className?: string
}

export function RouletteStatusPanel({
  isActive,
  spinActive,
  lastReward,
  highlightRewards,
  tailRewards,
  spinCount,
  className,
}: RouletteStatusPanelProps) {
  if (!isActive) return null

  const spinLabel = spinActive ? 'Spinning...' : `Spin ${spinCount + 1}`
  const latestLabel = lastReward ? `${lastReward.icon} ${lastReward.label}` : 'No spins yet'

  return (
    <Card
      className={`pointer-events-none rounded-2xl border border-amber-300/40 bg-slate-950/70 px-4 py-3 text-white shadow-[0_20px_50px_rgba(15,23,42,0.55)] backdrop-blur ${className ?? ''}`}
    >
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-amber-200">
        <span>Roulette Live</span>
        <span>{spinLabel}</span>
      </div>
      <div className="mt-2 flex items-start gap-3">
        <div className="text-2xl">🎯</div>
        <div>
          <div className="text-sm font-semibold text-white">Triple Ring Roulette</div>
          <div className="text-xs text-white/70">
            All rings are live. Spin for mega jackpots and long-tail boosts.
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-amber-200">
          Latest
        </span>
        <span>{latestLabel}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] text-white/70">
        {highlightRewards.map(reward => (
          <span
            key={reward.id}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
          >
            {reward.icon} {reward.label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-slate-300">
        <span className="rounded-full bg-slate-800/70 px-2 py-1">
          Long-tail boosts:
        </span>
        {tailRewards.map(reward => (
          <span key={reward.id} className="rounded-full bg-slate-800/40 px-2 py-1">
            {reward.icon} {reward.label}
          </span>
        ))}
      </div>
    </Card>
  )
}
