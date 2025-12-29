import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface TileCelebration {
  id: number
  x: number
  y: number
  emojis: string[]
}

interface TileCelebrationEffectProps {
  celebrations: TileCelebration[]
  duration?: number
}

const DEFAULT_DURATION = 1400

export function TileCelebrationEffect({
  celebrations,
  duration = DEFAULT_DURATION,
}: TileCelebrationEffectProps) {
  return (
    <AnimatePresence>
      {celebrations.map((celebration) => (
        <CelebrationBurst
          key={celebration.id}
          celebration={celebration}
          duration={duration}
        />
      ))}
    </AnimatePresence>
  )
}

interface CelebrationBurstProps {
  celebration: TileCelebration
  duration: number
}

function CelebrationBurst({ celebration, duration }: CelebrationBurstProps) {
  const particles = useMemo(() => {
    const count = 12
    return Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count
      const radius = 38 + Math.random() * 18
      return {
        id: index,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius - 10,
        emoji:
          celebration.emojis[Math.floor(Math.random() * celebration.emojis.length)],
        delay: Math.random() * 0.15,
      }
    })
  }, [celebration.emojis])

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${celebration.x}px`,
        top: `${celebration.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration / 1000 }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute text-lg drop-shadow-[0_0_10px_rgba(255,200,120,0.7)]"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.1, 1],
            x: particle.x,
            y: particle.y,
            opacity: [1, 1, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: duration / 1000,
            ease: 'easeOut',
            delay: particle.delay,
          }}
        >
          {particle.emoji}
        </motion.span>
      ))}
      <motion.span
        className="absolute text-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
        transition={{ duration: duration / 1000, ease: 'easeOut' }}
      >
        {celebration.emojis[0]}
      </motion.span>
    </motion.div>
  )
}

export type { TileCelebration }
