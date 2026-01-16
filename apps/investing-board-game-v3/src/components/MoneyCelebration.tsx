import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MoneyCelebrationProps {
  isActive: boolean
  amount: number
  position: { x: number; y: number }
  onComplete: () => void
}

export function MoneyCelebration({
  isActive,
  amount,
  position,
  onComplete,
}: MoneyCelebrationProps) {
  const [moneyIcons, setMoneyIcons] = useState<Array<{ id: number; angle: number; distance: number }>>([])

  useEffect(() => {
    if (!isActive) {
      setMoneyIcons([])
      return
    }

    // Generate 10-12 money icons bursting outward
    const icons = Array.from({ length: 10 + Math.floor(Math.random() * 3) }, (_, i) => ({
      id: i,
      angle: (360 / 12) * i + Math.random() * 20 - 10, // Spread around circle
      distance: 60 + Math.random() * 40, // Vary distance
    }))
    setMoneyIcons(icons)

    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Amount text pop-up */}
      <motion.div
        className="absolute text-3xl font-bold text-yellow-400 drop-shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          textShadow: '0 0 20px rgba(234, 179, 8, 0.8)',
        }}
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1, 0.8],
          y: [0, -20, -40, -60],
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        +${amount.toLocaleString()}
      </motion.div>

      {/* Money icons bursting outward */}
      <AnimatePresence>
        {moneyIcons.map((icon) => {
          const radians = (icon.angle * Math.PI) / 180
          const endX = Math.cos(radians) * icon.distance
          const endY = Math.sin(radians) * icon.distance

          return (
            <motion.div
              key={icon.id}
              className="absolute text-2xl"
              style={{
                left: position.x,
                top: position.y,
              }}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.5],
                x: [0, endX * 0.5, endX, endX * 1.2],
                y: [0, endY * 0.5 - 20, endY - 40, endY - 80], // Float upward
              }}
              transition={{ 
                duration: 1.2, 
                ease: 'easeOut',
                delay: icon.id * 0.03, // Stagger
              }}
            >
              💵
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Tile flash effect */}
      <motion.div
        className="absolute rounded-lg"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 100,
          backgroundColor: 'rgba(234, 179, 8, 0.3)',
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: [0, 0.8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}
