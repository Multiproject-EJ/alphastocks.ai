/**
 * EventBanner Component
 * Displays active events at the top of the game screen
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEvent } from '@/lib/events'
import { X, CalendarBlank } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface EventBannerProps {
  events: GameEvent[]
  onOpenCalendar: () => void
}

export function EventBanner({ events, onOpenCalendar }: EventBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (events.length === 0 || dismissed) return null

  // Show first active event
  const event = events[0]

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date()
    const diff = event.endDate.getTime() - now.getTime()
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h remaining`
    }
    return `${hours}h ${minutes}m remaining`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 safe-top"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(var(--accent-rgb), 0.3)',
              '0 0 40px rgba(var(--accent-rgb), 0.5)',
              '0 0 20px rgba(var(--accent-rgb), 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 backdrop-blur-md border-2 border-accent/50 rounded-lg p-4 max-w-2xl w-full relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {event.icon}
              </motion.span>
              
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {event.description}
                </p>
                <div className="text-xs text-accent font-semibold">
                  {getTimeRemaining()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCalendar}
                className="border-accent/30 hover:bg-accent/20"
              >
                <CalendarBlank size={16} className="mr-1" />
                Calendar
              </Button>
              
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
