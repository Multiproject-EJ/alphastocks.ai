import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface BlackSwanAnimationProps {
  isActive: boolean
  tilePosition: { x: number; y: number }
  destinationPosition: { x: number; y: number }
  consolationReward: { type: 'stars' | 'coins'; amount: number }
  onComplete: () => void
}

export function BlackSwanAnimation({
  isActive,
  tilePosition,
  destinationPosition,
  consolationReward,
  onComplete,
}: BlackSwanAnimationProps) {
  const [phase, setPhase] = useState<
    'idle' | 'flash' | 'shake' | 'fall' | 'catch' | 'consolation' | 'complete'
  >('idle')

  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      return
    }

    setPhase('flash')
    
    const timers = [
      setTimeout(() => setPhase('shake'), 300),
      setTimeout(() => setPhase('fall'), 600),
      setTimeout(() => setPhase('catch'), 1200),
      setTimeout(() => setPhase('consolation'), 1600),
      setTimeout(() => {
        setPhase('complete')
        onComplete()
      }, 2500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Red flash on tile */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute rounded-lg bg-red-500"
            style={{
              left: tilePosition.x,
              top: tilePosition.y,
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 120,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.4] }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* BLACK SWAN text */}
      <AnimatePresence>
        {(phase === 'flash' || phase === 'shake') && (
          <motion.div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 text-4xl font-bold text-red-500"
            style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.2, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            🦢 BLACK SWAN 🦢
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen shake */}
      {phase === 'shake' && (
        <motion.div
          className="fixed inset-0"
          animate={{
            x: [0, -8, 8, -8, 8, -4, 4, 0],
            y: [0, 4, -4, 4, -4, 2, -2, 0],
          }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Catch glow at Ring 1 */}
      <AnimatePresence>
        {phase === 'catch' && (
          <motion.div
            className="absolute rounded-full"
            style={{
              left: destinationPosition.x,
              top: destinationPosition.y,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(234, 179, 8, 0.3)',
            }}
            initial={{ width: 40, height: 40, opacity: 0 }}
            animate={{ 
              width: [40, 100, 80],
              height: [40, 100, 80],
              opacity: [0, 0.8, 0.5],
              boxShadow: '0 0 50px rgba(234, 179, 8, 0.6)',
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Consolation reward toast */}
      <AnimatePresence>
        {phase === 'consolation' && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-gray-900/90 rounded-xl px-6 py-4 text-center"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-lg text-gray-300 mb-2">Consolation Prize</div>
            <div className="text-3xl font-bold text-yellow-400">
              +{consolationReward.amount} {consolationReward.type === 'stars' ? '⭐' : '🪙'}
            </div>
            <div className="text-sm text-gray-400 mt-2">Back to Street Level...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
