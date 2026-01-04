import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { EventTrackDefinition, EventTrackProgress } from '../types'

interface EventTrackBarProps {
  definition: EventTrackDefinition
  progress: EventTrackProgress
  onClaim: (milestoneId: string) => void
  onCTA: () => void
  ctaLabel?: string | null
  ctaDisabled?: boolean
}

export function EventTrackBar({
  definition,
  progress,
  onClaim,
  onCTA,
  ctaLabel,
  ctaDisabled = false,
}: EventTrackBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const [userReducedMotion, setUserReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setUserReducedMotion(localStorage.getItem('reducedMotion') === 'true')
  }, [])

  const reducedMotion = prefersReducedMotion || userReducedMotion

  const progressPercent = useMemo(() => {
    if (definition.pointsMax === 0) return 0
    return Math.min((progress.points / definition.pointsMax) * 100, 100)
  }, [definition.pointsMax, progress.points])

  return (
    <section className="w-full rounded-2xl border border-white/15 bg-slate-950/70 p-4 text-white shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">Event Reward Track</p>
          <p className="text-sm font-semibold">{definition.name}</p>
          <p className="text-xs text-emerald-100/70">{definition.description}</p>
        </div>
        {definition.endTime ? (
          <div className="text-right text-xs text-white/70">
            <div className="uppercase tracking-[0.18em] text-[10px]">Ends</div>
            <div>{new Date(definition.endTime).toLocaleString()}</div>
          </div>
        ) : (
          <div className="text-right text-xs text-white/70">
            <div className="uppercase tracking-[0.18em] text-[10px]">Status</div>
            <div>{definition.isActive ? 'Live' : 'Paused'}</div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>{progress.points} / {definition.pointsMax} pts</span>
          <span>{definition.isActive ? 'Keep rolling!' : 'Event ended'}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {definition.milestones.map(milestone => {
          const reached = progress.points >= milestone.pointsRequired
          const claimed = progress.claimedMilestones.includes(milestone.id)
          const isNext = !claimed && reached
          const rewardIcon =
            milestone.reward.type === 'rolls'
              ? '🎲'
              : milestone.reward.type === 'coins'
                ? '🪙'
                : '✨'

          return (
            <Tooltip key={milestone.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (reached && !claimed) {
                      onClaim(milestone.id)
                    }
                  }}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold',
                    claimed
                      ? 'border-emerald-300 bg-emerald-400 text-slate-900'
                      : reached
                        ? 'border-amber-300 bg-amber-400 text-slate-900'
                        : 'border-white/30 bg-white/10 text-white/70',
                    isNext && !reducedMotion ? 'animate-pulse' : ''
                  )}
                  aria-label={`${milestone.reward.label} milestone`}
                >
                  {claimed ? '✓' : rewardIcon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="w-56 text-left">
                <div className="text-xs font-semibold">{milestone.reward.label}</div>
                {milestone.reward.description && (
                  <div className="text-[11px] text-primary-foreground/80">
                    {milestone.reward.description}
                  </div>
                )}
                <div className="mt-2 text-[11px]">
                  Requires {milestone.pointsRequired} pts
                </div>
                {reached && !claimed && (
                  <Button
                    size="sm"
                    className="mt-2 h-7 rounded-md text-xs"
                    onClick={() => onClaim(milestone.id)}
                  >
                    Claim
                  </Button>
                )}
                {claimed && (
                  <div className="mt-2 text-[11px] text-emerald-200">Claimed</div>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {ctaLabel && (
        <Button
          className="mt-4 w-full rounded-full bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30"
          onClick={onCTA}
          disabled={ctaDisabled}
        >
          {ctaLabel}
        </Button>
      )}
    </section>
  )
}
