import { motion } from 'framer-motion'

interface MysteryCardProps {
  isActive: boolean
  color: string
  isJackpotCelebrating: boolean
  index: number
}

export function MysteryCard({ isActive, color, isJackpotCelebrating, index }: MysteryCardProps) {
  // Default state: Gray with subtle pulse animation
  const defaultStyle = {
    background: 'oklch(0.20 0.02 250)',
    border: '2px solid oklch(0.35 0.02 250)',
  }

  // Active state: Glow in category color
  const activeStyle = {
    border: `3px solid ${color}`,
    boxShadow: `0 0 20px ${color}, inset 0 0 15px ${color}`,
  }

  // Determine which styles to apply
  const baseStyle = isActive ? activeStyle : defaultStyle

  return (
    <motion.div
      className="relative flex items-center justify-center w-14 h-14 rounded-lg"
      style={baseStyle}
      animate={
        isJackpotCelebrating
          ? {
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }
          : isActive
          ? {
              scale: [1, 1.05, 1],
            }
          : {
              scale: [1, 1.02, 1],
            }
      }
      transition={
        isJackpotCelebrating
          ? {
              rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
              scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
            }
          : isActive
          ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
    >
      {/* Rainbow cycling border during jackpot */}
      {isJackpotCelebrating && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            borderColor: [
              'oklch(0.60 0.20 0)',
              'oklch(0.65 0.22 60)',
              'oklch(0.70 0.20 120)',
              'oklch(0.65 0.22 180)',
              'oklch(0.60 0.25 240)',
              'oklch(0.70 0.20 300)',
              'oklch(0.60 0.20 0)',
            ],
          }}
          style={{
            border: '3px solid',
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      
      {/* Question mark */}
      <span className="text-2xl font-bold text-white/90 z-10">?</span>
    </motion.div>
  )
}
