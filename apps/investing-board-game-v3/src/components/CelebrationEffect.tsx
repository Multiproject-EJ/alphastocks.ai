import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/sounds'

type ParticleType = 'circle' | 'star' | 'coin' | 'confetti' | 'sparkle' | 'heart' | 'diamond'

interface CelebrationEffectProps {
  show: boolean
  onComplete?: () => void
  level?: 'small' | 'medium' | 'large' | 'epic'
  particleTypes?: ParticleType[]
  screenShake?: boolean
  soundEffect?: boolean
}

const PARTICLE_CONFIGS = {
  small: {
    count: 30,
    duration: 2000,
    spread: 60,
    velocity: 300,
    types: ['circle', 'star'] as ParticleType[],
    colors: ['#FFD700', '#FFA500'],
  },
  medium: {
    count: 60,
    duration: 2500,
    spread: 80,
    velocity: 400,
    types: ['circle', 'star', 'coin'] as ParticleType[],
    colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
  },
  large: {
    count: 100,
    duration: 3000,
    spread: 100,
    velocity: 500,
    types: ['circle', 'star', 'coin', 'confetti'] as ParticleType[],
    colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    screenShake: true,
  },
  epic: {
    count: 200,
    duration: 4000,
    spread: 120,
    velocity: 600,
    types: ['circle', 'star', 'coin', 'confetti', 'sparkle', 'diamond'] as ParticleType[],
    colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    screenShake: true,
    soundEffect: true,
  },
}

export function CelebrationEffect({ 
  show, 
  onComplete, 
  level = 'medium',
  particleTypes,
  screenShake,
  soundEffect = true,
}: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Array<{ 
    id: number
    x: number
    y: number
    color: string
    rotation: number
    shape: ParticleType
  }>>([])
  const [shake, setShake] = useState(false)

  const config = PARTICLE_CONFIGS[level]
  const particleCount = config.count
  const duration = config.duration
  const shouldShake = screenShake ?? config.screenShake ?? false

  useEffect(() => {
    if (show) {
      // Play sound if enabled
      if (soundEffect && (level === 'medium' || level === 'large' || level === 'epic')) {
        soundManager.play('celebration')
      }

      // Screen shake for large/epic celebrations
      let shakeTimeout: NodeJS.Timeout | undefined
      if (shouldShake) {
        setShake(true)
        shakeTimeout = setTimeout(() => setShake(false), 500)
      }

      const colors = config.colors
      const shapes = particleTypes || config.types
      
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
        if (shakeTimeout) clearTimeout(shakeTimeout)
        setParticles([])
      }
    }
  }, [show, onComplete, level, particleCount, duration, shouldShake, soundEffect, config, particleTypes])

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
                <div className="text-2xl" aria-hidden="true">⭐</div>
              )}
              {particle.shape === 'coin' && (
                <div className="text-2xl" aria-hidden="true">💰</div>
              )}
              {particle.shape === 'circle' && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: particle.color }}
                  aria-hidden="true"
                />
              )}
              {particle.shape === 'confetti' && (
                <div 
                  className="w-2 h-4 rounded-sm"
                  style={{ backgroundColor: particle.color }}
                  aria-hidden="true"
                />
              )}
              {particle.shape === 'sparkle' && (
                <div className="text-xl" aria-hidden="true">✨</div>
              )}
              {particle.shape === 'heart' && (
                <div className="text-xl" aria-hidden="true">❤️</div>
              )}
              {particle.shape === 'diamond' && (
                <div className="text-2xl" aria-hidden="true">💎</div>
              )}
            </motion.div>
          ))}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            className="text-7xl font-bold"
            aria-label="Celebration"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
