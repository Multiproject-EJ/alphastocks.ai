import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface QuickCelebrationProps {
  isActive: boolean
  emoji: string
  amount: number
  position: { x: number; y: number }
  onComplete: () => void
}

export function QuickCelebration({
  isActive,
  emoji,
  amount,
  position,
  onComplete,
}: QuickCelebrationProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    angle: number
    distance: number
    delay: number
  }>>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    // Generate particles for burst (PR 3 will increase to 200)
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (360 / 30) * i + Math.random() * 10,
      distance: 30 + Math.random() * 40,
      delay: Math.random() * 0.1,
    }))
    setParticles(newParticles)

    const timer = setTimeout(onComplete, 1000)
    return () => clearTimeout(timer)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Amount pop-up */}
      <motion.div
        className="absolute text-2xl font-bold text-white drop-shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1, 0.8],
          y: [0, -30, -50, -70],
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        +{amount.toLocaleString()}
      </motion.div>

      {/* Emoji burst */}
      {particles.map((p) => {
        const radians = (p.angle * Math.PI) / 180
        const endX = Math.cos(radians) * p.distance
        const endY = Math.sin(radians) * p.distance

        return (
          <motion.span
            key={p.id}
            className="absolute text-lg"
            style={{
              left: position.x,
              top: position.y,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 0, 
              scale: 0,
            }}
            animate={{ 
              x: endX,
              y: endY - 20, // Float up slightly
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.8, 0],
            }}
            transition={{ 
              duration: 0.7, 
              ease: 'easeOut',
              delay: p.delay,
            }}
          >
            {emoji}
          </motion.span>
        )
      })}
    </div>
  )
}
