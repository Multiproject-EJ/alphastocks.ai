/**
 * LevelUpModal Component
 * Full-screen celebration overlay when player levels up
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LevelReward } from '@/lib/types'
import { CelebrationEffect } from './CelebrationEffect'

interface LevelUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newLevel: number
  reward: LevelReward | null
}

export function LevelUpModal({ open, onOpenChange, newLevel, reward }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false)

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (open) {
      // Delay content appearance for animation
      setTimeout(() => setShowContent(true), 200)
      
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 border-4 border-yellow-400 shadow-2xl"
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
              className="text-center space-y-6 py-8"
            >
              {/* LEVEL UP text */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              >
                <h1 className="text-6xl font-bold text-yellow-400 tracking-wider drop-shadow-2xl">
                  LEVEL UP!
                </h1>
              </motion.div>

              {/* New level number */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', damping: 8 }}
                className="relative"
              >
                <div className="text-8xl font-black text-white drop-shadow-2xl">
                  {newLevel}
                </div>
                <motion.div
                  className="absolute inset-0 text-8xl font-black text-yellow-400/50 blur-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {newLevel}
                </motion.div>
              </motion.div>

              {/* Reward display */}
              {reward && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm border-2 border-yellow-400/50 rounded-xl p-6 mx-auto max-w-md"
                >
                  <div className="text-sm text-yellow-300 font-semibold uppercase tracking-wide mb-2">
                    Reward Unlocked
                  </div>
                  <div className="text-xl font-bold text-white">
                    {reward.description}
                  </div>
                  
                  {/* Reward icon/type */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {reward.type === 'stars' && <span className="text-2xl">⭐</span>}
                    {reward.type === 'cash' && <span className="text-2xl">💰</span>}
                    {reward.type === 'theme' && <span className="text-2xl">🎨</span>}
                    {reward.type === 'dice_skin' && <span className="text-2xl">🎲</span>}
                    {reward.type === 'badge' && <span className="text-2xl">🏆</span>}
                    {reward.type === 'daily_rolls' && <span className="text-2xl">🎲</span>}
                    {reward.type === 'shop_discount' && <span className="text-2xl">🏷️</span>}
                    {reward.type === 'star_bonus' && <span className="text-2xl">✨</span>}
                    <span className="text-sm text-yellow-200">
                      {reward.type === 'stars' && `+${reward.value} Stars`}
                      {reward.type === 'cash' && `$${Number(reward.value).toLocaleString()}`}
                      {reward.type === 'daily_rolls' && `+${reward.value} Daily Rolls`}
                      {reward.type === 'shop_discount' && `${Number(reward.value) * 100}% Discount`}
                      {reward.type === 'star_bonus' && `+${Number(reward.value) * 100}% Stars`}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Close button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8 py-3 text-lg"
                >
                  Awesome!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
