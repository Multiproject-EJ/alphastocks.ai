/**
 * Game Loading Screen Component
 * Shows a loading animation when a game is being loaded
 */

import { motion } from 'framer-motion'

interface GameLoadingScreenProps {
  gameName: string
  emoji: string
}

export function GameLoadingScreen({ gameName, emoji }: GameLoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading game"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-8xl"
        >
          {emoji}
        </motion.div>
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-2xl font-bold text-white"
        >
          Loading {gameName}...
        </motion.div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              className="h-3 w-3 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
