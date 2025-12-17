/**
 * XPBar Component
 * Displays XP progress and current level at the top of the game screen
 */

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface XPBarProps {
  level: number
  xp: number
  xpNeeded: number
  xpCurrent: number
  percentage: number
  className?: string
}

export function XPBar({ level, xp, xpNeeded, xpCurrent, percentage, className }: XPBarProps) {
  const isCloseToLevelUp = percentage > 90

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full max-w-md mx-auto px-4 py-2 bg-card/80 backdrop-blur-sm border border-accent/20 rounded-lg shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-accent">Level {level}</span>
          {isCloseToLevelUp && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-xs text-yellow-400"
            >
              ⭐ Almost there!
            </motion.span>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {xpCurrent.toLocaleString()} / {xpNeeded.toLocaleString()} XP
        </span>
      </div>

      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            'h-3 bg-accent/10',
            isCloseToLevelUp && 'animate-pulse'
          )}
        />
        
        {/* Glow effect when close to level up */}
        {isCloseToLevelUp && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 rounded-full blur-sm"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
          />
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="sr-only">
        Level {level} - {xpCurrent} / {xpNeeded} XP ({percentage.toFixed(1)}%)
      </div>
    </motion.div>
  )
}
