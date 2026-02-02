/**
 * Game Card Component
 * Reusable card for displaying games in the hub
 */

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GameConfig } from '@/lib/gamesConfig'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface GameCardProps {
  game: GameConfig
  onClick: () => void
  isPlayable?: boolean
  statusLabel?: string
  availabilityLabel?: string
}

export function GameCard({ game, onClick, isPlayable: isPlayableProp, statusLabel, availabilityLabel }: GameCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const isPlayable = isPlayableProp ?? game.status === 'playable'
  const actionLabel = statusLabel ?? (isPlayable ? 'Play' : 'Coming Soon')

  const handleClick = () => {
    if (!isPlayable) return
    onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPlayable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <div 
        className={`
          relative overflow-hidden rounded-2xl border-2 
          bg-gradient-to-br from-slate-800 to-slate-900
          p-6 shadow-lg transition-all duration-300
          ${isPlayable 
            ? 'border-transparent hover:shadow-2xl cursor-pointer' 
            : 'border-slate-700/50 opacity-75'
          }
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isPlayable ? 0 : -1}
        aria-disabled={!isPlayable}
        aria-label={`${game.name} - ${game.description} - ${availabilityLabel ?? actionLabel} - ${game.counter}`}
      >
        {/* Counter Badge */}
        <div className="absolute right-4 top-4">
          <Badge 
            variant="secondary" 
            className="bg-black/50 text-xs font-semibold text-white backdrop-blur"
          >
            {game.counter}
          </Badge>
        </div>

        {/* Game Icon */}
        <div className="mb-4 text-6xl">{game.emoji}</div>

        {/* Game Info */}
        <h3 className="mb-2 text-xl font-bold text-white">
          {game.name}
        </h3>
        <p className="mb-4 text-sm text-slate-300">
          {game.description}
        </p>
        {availabilityLabel && (
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
            {availabilityLabel}
          </p>
        )}

        {/* Status/Action Button */}
        <Button
          className={`
            w-full 
            ${isPlayable 
              ? `bg-gradient-to-r ${game.accentColor} text-white hover:opacity-90` 
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
          disabled={!isPlayable}
        >
          {actionLabel}
        </Button>

        {/* Accent Glow Effect */}
        {isPlayable && (
          <div 
            className={`
              absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r 
              ${game.accentColor} opacity-0 blur-xl transition-opacity 
              duration-300 group-hover:opacity-50
            `}
          />
        )}
      </div>
    </motion.div>
  )
}
