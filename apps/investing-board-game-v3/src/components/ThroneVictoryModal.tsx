import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import confetti from 'canvas-confetti'

interface ThroneVictoryModalProps {
  isOpen: boolean
  onClose: () => void
  onPlayAgain: () => void
  journeyStats: {
    turnsTaken: number
    stocksCollected: number
    timesFallen: number
    timePlayed: string
    throneCount: number
  }
  rewards: {
    stars: number
    cash: number
    badge: string
  }
  playSound: (sound: string) => void
}

const VICTORY_PHASES = {
  approach: { duration: 500, delay: 0 },
  coronation: { duration: 1500, delay: 500 },
  celebration: { duration: 2000, delay: 2000 },
  rewards: { duration: 1000, delay: 4000 },
  modal: { duration: 500, delay: 5000 },
}

export function ThroneVictoryModal({
  isOpen,
  onClose,
  onPlayAgain,
  journeyStats,
  rewards,
  playSound,
}: ThroneVictoryModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'approach' | 'coronation' | 'celebration' | 'rewards' | 'modal'>('approach')

  useEffect(() => {
    if (!isOpen) {
      setCurrentPhase('approach')
      return
    }

    // Play epic sound
    playSound('mega-jackpot')

    // Phase sequence
    const approachTimeout = setTimeout(() => {
      setCurrentPhase('coronation')
    }, VICTORY_PHASES.coronation.delay)

    const celebrationTimeout = setTimeout(() => {
      setCurrentPhase('celebration')
      // Trigger fireworks
      triggerFireworks()
    }, VICTORY_PHASES.celebration.delay)

    const rewardsTimeout = setTimeout(() => {
      setCurrentPhase('rewards')
    }, VICTORY_PHASES.rewards.delay)

    const modalTimeout = setTimeout(() => {
      setCurrentPhase('modal')
    }, VICTORY_PHASES.modal.delay)

    return () => {
      clearTimeout(approachTimeout)
      clearTimeout(celebrationTimeout)
      clearTimeout(rewardsTimeout)
      clearTimeout(modalTimeout)
    }
  }, [isOpen, playSound])

  const triggerFireworks = () => {
    const duration = 2000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  const handlePlayAgain = () => {
    onPlayAgain()
    onClose()
  }

  const handleShare = () => {
    // Share victory (placeholder for now)
    if (navigator.share) {
      navigator.share({
        title: '👑 Wealth Throne Reached!',
        text: `I've conquered the Wealth Spiral in ${journeyStats.turnsTaken} turns! Can you do better?`,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or error
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `👑 I've conquered the Wealth Spiral in ${journeyStats.turnsTaken} turns! Play at ${window.location.href}`
      )
      alert('Victory message copied to clipboard!')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Phase 1: Approach - Screen dims with golden rays */}
          <motion.div
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentPhase === 'approach' ? 1 : 0.9 }}
            transition={{ duration: VICTORY_PHASES.approach.duration / 1000 }}
          >
            {/* Golden light rays from center */}
            {currentPhase !== 'approach' && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 h-full w-2 bg-gradient-to-t from-transparent via-yellow-400/40 to-transparent"
                    style={{
                      transformOrigin: '0 0',
                      transform: `rotate(${i * 30}deg)`,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Phase 2: Coronation - Crown descends */}
          {currentPhase !== 'approach' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ y: -200, opacity: 0 }}
                animate={{
                  y: currentPhase === 'coronation' ? 0 : -50,
                  opacity: 1,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-8xl md:text-9xl"
              >
                👑
              </motion.div>

              {/* Player token glow */}
              <motion.div
                className="mt-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: currentPhase === 'coronation' ? 1 : 0.8,
                  opacity: currentPhase === 'coronation' ? 1 : 0,
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.div
                  className="text-6xl"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))',
                      'drop-shadow(0 0 40px rgba(250, 204, 21, 1))',
                      'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))',
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎮
                </motion.div>
              </motion.div>

              {/* Golden particles burst */}
              {currentPhase === 'coronation' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl"
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * 2 * Math.PI) / 20) * 200,
                        y: Math.sin((i * 2 * Math.PI) / 20) * 200,
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: 1, delay: 1 }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Celebration - Title appears */}
          {(currentPhase === 'celebration' || currentPhase === 'rewards' || currentPhase === 'modal') && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-20 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold text-yellow-400"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(250, 204, 21, 0.8)',
                      '0 0 40px rgba(250, 204, 21, 1)',
                      '0 0 20px rgba(250, 204, 21, 0.8)',
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  👑 WEALTH THRONE REACHED! 👑
                </motion.h1>
              </div>
            </motion.div>
          )}

          {/* Phase 4: Rewards */}
          {(currentPhase === 'rewards' || currentPhase === 'modal') && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  +{rewards.stars.toLocaleString()} ⭐ Stars
                </motion.div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  +${rewards.cash.toLocaleString()} 💵 Cash
                </motion.div>
                <motion.div
                  className="text-2xl md:text-3xl font-bold text-amber-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  🏆 "{rewards.badge}" Badge Unlocked
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Phase 5: Victory Screen Modal */}
          {currentPhase === 'modal' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 max-w-2xl mx-4 md:mx-auto"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-400/50 shadow-2xl p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-yellow-400 mb-6">
                  👑 CONGRATULATIONS! 👑
                </h2>
                <p className="text-xl text-center text-white mb-8">
                  You've reached the Wealth Throne!
                </p>

                {/* Journey Stats */}
                <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Journey Stats:</h3>
                  <div className="space-y-2 text-white">
                    <div className="flex justify-between">
                      <span>• Turns taken:</span>
                      <span className="font-bold">{journeyStats.turnsTaken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Stocks collected:</span>
                      <span className="font-bold">{journeyStats.stocksCollected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Times fallen:</span>
                      <span className="font-bold">{journeyStats.timesFallen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Time played:</span>
                      <span className="font-bold">{journeyStats.timePlayed}</span>
                    </div>
                    {journeyStats.throneCount > 1 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>• Throne victories:</span>
                        <span className="font-bold">{journeyStats.throneCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rewards Summary */}
                <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Rewards:</h3>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-white">
                    <div className="text-center">
                      <div className="text-2xl font-bold">+{rewards.stars.toLocaleString()} ⭐</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        +${rewards.cash.toLocaleString()} 💵
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-400">🏆 {rewards.badge}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handlePlayAgain}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold py-6 rounded-xl"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg font-semibold py-6 rounded-xl"
                  >
                    Share Victory
                  </Button>
                </div>

                {/* Close button */}
                <Button
                  onClick={onClose}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
