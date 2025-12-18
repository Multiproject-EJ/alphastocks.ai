import { motion } from 'framer-motion'

interface AnimatedDiceProps {
  value: number
  isRolling: boolean
  isMoving: boolean
  isDoubles?: boolean
  className?: string
}

const diceFaces: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

export function AnimatedDice({ value, isRolling, isMoving, isDoubles = false, className = '' }: AnimatedDiceProps) {
  const dots = diceFaces[value] || diceFaces[1]

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        rotateX: isRolling ? [0, 360, 720, 1080, 1440] : 0,
        rotateY: isRolling ? [0, 360, 720, 1080, 1440] : 0,
        rotateZ: isRolling ? [0, 180, 360, 540, 720] : 0,
        scale: isRolling ? [1, 1.15, 0.95, 1.1, 1] : isDoubles ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: isRolling ? 0.8 : 0.3,
        ease: isRolling ? "easeInOut" : "easeOut",
        scale: {
          duration: isDoubles ? 0.5 : 0.3,
          repeat: isDoubles ? Infinity : 0,
          repeatType: 'reverse'
        }
      }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <motion.div
        className={`relative w-12 h-12 rounded-lg bg-card shadow-lg ${
          isDoubles ? 'border-2 border-yellow-400' : 'border-2 border-accent/30'
        }`}
        animate={{
          boxShadow: isDoubles
            ? [
                '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.6)',
                '0 0 30px rgba(250, 204, 21, 1), 0 0 60px rgba(250, 204, 21, 0.8)',
                '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.6)',
              ]
            : isRolling 
            ? [
                '0 0 30px oklch(0.75 0.15 85 / 0.7), 0 0 60px oklch(0.75 0.15 85 / 0.5)',
                '0 0 40px oklch(0.75 0.15 85 / 0.9), 0 0 80px oklch(0.75 0.15 85 / 0.7)',
                '0 0 30px oklch(0.75 0.15 85 / 0.7), 0 0 60px oklch(0.75 0.15 85 / 0.5)',
              ]
            : isMoving
            ? '0 0 20px oklch(0.75 0.15 85 / 0.6), 0 0 40px oklch(0.75 0.15 85 / 0.4)'
            : '0 4px 6px rgba(0, 0, 0, 0.3)',
          scale: isRolling ? [1, 1.1, 1.05, 1] : !isRolling && !isMoving ? [1, 1.15, 1] : 1,
          y: !isRolling && !isMoving ? [0, -8, 0] : 0,
        }}
        transition={{
          boxShadow: {
            duration: isDoubles ? 1.2 : isRolling ? 0.8 : 0.3,
            repeat: isDoubles || isRolling ? Infinity : 0,
            ease: "easeInOut",
          },
          scale: {
            duration: isRolling ? 0.4 : 0.3,
            repeat: isRolling ? Infinity : 0,
            ease: "easeInOut",
            delay: !isRolling && !isMoving ? 0.8 : 0,
          },
          y: {
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1], // Spring bounce
            delay: !isRolling && !isMoving ? 0.8 : 0,
          },
        }}
      >
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1.5">
          {Array.from({ length: 9 }).map((_, index) => {
            const row = Math.floor(index / 3)
            const col = index % 3
            const hasDot = dots.some(([r, c]) => r === row && c === col)

            return (
              <div
                key={index}
                className="flex items-center justify-center"
              >
                {hasDot && (
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isDoubles ? 'bg-yellow-400' : 'bg-accent'}`}
                    animate={{
                      opacity: isRolling ? [1, 0.6, 1] : 1,
                      scale: isRolling ? [1, 0.8, 1] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: isRolling ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
