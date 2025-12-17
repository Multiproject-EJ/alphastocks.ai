/**
 * AchievementNotification Component
 * Full-screen overlay when achievement is unlocked
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Achievement } from '@/lib/types'
import { CelebrationEffect } from './CelebrationEffect'

interface AchievementNotificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  achievement: Achievement | null
}

export function AchievementNotification({ open, onOpenChange, achievement }: AchievementNotificationProps) {
  const [showContent, setShowContent] = useState(false)

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 200)
      
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [open, onOpenChange])

  if (!achievement) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-xl bg-gradient-to-br from-amber-900/95 via-orange-900/95 to-red-900/95 border-4 border-amber-400 shadow-2xl"
        hideClose
      >
        {/* Confetti celebration effect */}
        {open && <CelebrationEffect />}

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center space-y-6 py-6"
            >
              {/* Achievement Unlocked text */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold text-amber-300 tracking-wide drop-shadow-lg">
                  ACHIEVEMENT UNLOCKED!
                </h1>
              </motion.div>

              {/* Achievement badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', damping: 10 }}
                className="relative mx-auto w-32 h-32"
              >
                {/* Badge background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-2xl" />
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-yellow-400/50 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  {achievement.icon}
                </div>
              </motion.div>

              {/* Achievement details */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <h2 className="text-3xl font-bold text-white">
                  {achievement.title}
                </h2>
                
                <p className="text-lg text-amber-100">
                  {achievement.description}
                </p>

                {/* Reward */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold text-yellow-300">
                    +{achievement.reward} Stars
                  </span>
                </div>
              </motion.div>

              {/* Close button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold px-8 py-2"
                >
                  Nice!
                </Button>
              </motion.div>

              {/* Category badge */}
              <div className="text-xs text-amber-200/60 uppercase tracking-wider">
                {achievement.category}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
