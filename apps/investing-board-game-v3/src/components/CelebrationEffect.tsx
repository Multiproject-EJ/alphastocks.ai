import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/sounds'

interface CelebrationEffectProps {
  show: boolean
  onComplete?: () => void
  level?: 'small' | 'medium' | 'large'
}

export function CelebrationEffect({ show, onComplete, level = 'medium' }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Array<{ 
    id: number
    x: number
    y: number
    color: string
    rotation: number
    shape: 'circle' | 'star' | 'coin'
  }>>([])
  const [shake, setShake] = useState(false)

  // Particle count based on level
  const particleCount = level === 'large' ? 100 : level === 'medium' ? 60 : 30
  const duration = level === 'large' ? 4000 : level === 'medium' ? 3000 : 2000

  useEffect(() => {
    if (show) {
      // Play sound for medium and large celebrations
      if (level === 'medium' || level === 'large') {
        soundManager.play('celebration')
      }

      // Screen shake for large celebrations
      if (level === 'large') {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }

      const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9']
      const shapes: Array<'circle' | 'star' | 'coin'> = ['circle', 'star', 'coin']
      
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, duration)

      return () => {
        clearTimeout(timer)
        setParticles([])
      }
    }
  }, [show, onComplete, level, particleCount, duration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"
          animate={shake ? {
            x: [0, -10, 10, -10, 10, 0],
            y: [0, -5, 5, -5, 5, 0],
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1, 1, 0.8],
                x: particle.x * 10,
                y: particle.y * 10 + 250,
                opacity: [1, 1, 0.8, 0],
                rotate: particle.rotation * 4,
              }}
              transition={{
                duration: duration / 1000,
                ease: 'easeOut',
              }}
              className="absolute"
            >
              {particle.shape === 'star' && (
                <div 
                  className="w-4 h-4"
                  style={{ color: particle.color }}
                >
                  ⭐
                </div>
              )}
              {particle.shape === 'coin' && (
                <div 
                  className="w-4 h-4"
                  style={{ color: particle.color }}
                >
                  🪙
                </div>
              )}
              {particle.shape === 'circle' && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: particle.color }}
                />
              )}
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            className="text-7xl font-bold"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
