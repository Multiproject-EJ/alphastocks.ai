import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface EconomyWindowStatusProps {
  label?: string | null
  endsAt?: string | null
  starsMultiplier?: number
  xpMultiplier?: number
  className?: string
  headerClassName?: string
  detailClassName?: string
}

export function EconomyWindowStatus({
  label = null,
  endsAt = null,
  starsMultiplier = 1,
  xpMultiplier = 1,
  className,
  headerClassName,
  detailClassName,
}: EconomyWindowStatusProps) {
  const [remaining, setRemaining] = useState('')
  const hasWindow = Boolean(label && endsAt)

  useEffect(() => {
    if (!hasWindow || !endsAt) {
      setRemaining('')
      return
    }

    const endAt = new Date(endsAt)
    if (Number.isNaN(endAt.getTime())) {
      setRemaining('')
      return
    }

    const updateTimer = () => {
      const diff = endAt.getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('Ending...')
        return
      }
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setRemaining(`${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = window.setInterval(updateTimer, 1000)
    return () => window.clearInterval(interval)
  }, [endsAt, hasWindow])

  if (!hasWindow) return null

  const starsBonus = Math.max(0, Math.round((starsMultiplier - 1) * 100))
  const xpBonus = Math.max(0, Math.round((xpMultiplier - 1) * 100))

  return (
    <div
      className={cn(
        'rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs text-emerald-100 backdrop-blur-sm',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-100/90',
          headerClassName
        )}
      >
        <span className="font-semibold">{label}</span>
        <span className="font-mono">{remaining}</span>
      </div>
      <div className={cn('mt-1 flex items-center gap-3 text-[11px] text-emerald-100/90', detailClassName)}>
        <span>⭐ +{starsBonus}%</span>
        <span>XP +{xpBonus}%</span>
      </div>
    </div>
  )
}
