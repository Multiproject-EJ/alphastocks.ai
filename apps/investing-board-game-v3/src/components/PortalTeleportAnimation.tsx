import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PortalTeleportAnimationProps {
  isActive: boolean
  direction: 'up' | 'down'
  senderPosition: { x: number; y: number }
  receiverPosition: { x: number; y: number }
  onComplete: () => void
}

export function PortalTeleportAnimation({
  isActive,
  direction,
  senderPosition,
  receiverPosition,
  onComplete,
}: PortalTeleportAnimationProps) {
  const [phase, setPhase] = useState<
    'idle' | 'sender-glow' | 'player-fade' | 'pause' | 'receiver-glow' | 'player-appear' | 'complete'
  >('idle')

  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      return
    }

    // Animation sequence
    setPhase('sender-glow')
    
    const timers = [
      setTimeout(() => setPhase('player-fade'), 500),
      setTimeout(() => setPhase('pause'), 900),
      setTimeout(() => setPhase('receiver-glow'), 1000),
      setTimeout(() => setPhase('player-appear'), 1300),
      setTimeout(() => {
        setPhase('complete')
        onComplete()
      }, 1800),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isActive, onComplete])

  if (!isActive) return null

  const isAscending = direction === 'up'
  const glowColor = isAscending 
    ? 'rgba(147, 51, 234, 0.8)' // Purple for ascending
    : 'rgba(239, 68, 68, 0.8)' // Red for falling

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Sender Tile Glow */}
      <AnimatePresence>
        {(phase === 'sender-glow' || phase === 'player-fade') && (
          <motion.div
            className="absolute rounded-full"
            style={{
              left: senderPosition.x,
              top: senderPosition.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 60, height: 60, opacity: 0 }}
            animate={{ 
              width: [60, 100, 120],
              height: [60, 100, 120],
              opacity: [0, 0.8, 1],
              boxShadow: [
                `0 0 20px ${glowColor}`,
                `0 0 40px ${glowColor}`,
                `0 0 60px ${glowColor}`,
              ],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Receiver Tile Glow */}
      <AnimatePresence>
        {(phase === 'receiver-glow' || phase === 'player-appear') && (
          <motion.div
            className="absolute rounded-full"
            style={{
              left: receiverPosition.x,
              top: receiverPosition.y,
              transform: 'translate(-50%, -50%)',
              backgroundColor: isAscending ? 'rgba(147, 51, 234, 0.3)' : 'rgba(234, 179, 8, 0.3)',
            }}
            initial={{ width: 40, height: 40, opacity: 0 }}
            animate={{ 
              width: [40, 80, 100],
              height: [40, 80, 100],
              opacity: [0, 0.6, 0.8],
              boxShadow: `0 0 50px ${isAscending ? 'rgba(147, 51, 234, 0.6)' : 'rgba(234, 179, 8, 0.6)'}`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Direction Indicator */}
      <AnimatePresence>
        {phase === 'pause' && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          >
            {isAscending ? '⬆️' : '⬇️'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen shake for falling */}
      {!isAscending && phase === 'sender-glow' && (
        <motion.div
          className="fixed inset-0"
          animate={{
            x: [0, -5, 5, -5, 5, 0],
            y: [0, 3, -3, 3, -3, 0],
          }}
          transition={{ duration: 0.4 }}
        />
      )}
    </div>
  )
}
