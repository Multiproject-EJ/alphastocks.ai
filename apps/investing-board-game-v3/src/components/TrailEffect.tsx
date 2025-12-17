import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TrailEffectProps {
  active: boolean
  trailType?: 'sparkle' | 'fire' | 'stars' | 'none'
  position: { x: number; y: number }
}

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
}

const TRAIL_EMOJIS = {
  sparkle: ['✨', '⭐', '💫'],
  fire: ['🔥', '💥', '⚡'],
  stars: ['⭐', '🌟', '✨'],
  none: [],
}

export function TrailEffect({ active, trailType = 'none', position }: TrailEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active || trailType === 'none') {
      setParticles([])
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const emojis = TRAIL_EMOJIS[trailType]
    if (!emojis.length) return

    // Add a new particle
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: position.x,
      y: position.y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }

    setParticles((prev) => [...prev, newParticle])

    // Remove particle after animation
    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
    }, 1000)

    return () => clearTimeout(timer)
  }, [active, position, trailType])

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              opacity: 0, 
              scale: 0.5,
              y: particle.y + 30 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute text-xl"
            style={{ left: 0, top: 0 }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
