import { motion } from 'framer-motion'

interface AnimatedDiceProps {
  value: number
  isRolling: boolean
  isMoving: boolean
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

export function AnimatedDice({ value, isRolling, isMoving, className = '' }: AnimatedDiceProps) {
  const dots = diceFaces[value] || diceFaces[1]

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        rotateX: isRolling ? [0, 360, 720, 1080] : 0,
        rotateY: isRolling ? [0, 360, 720, 1080] : 0,
        rotateZ: isRolling ? [0, 180, 360, 540] : 0,
        scale: isRolling ? [1, 1.1, 0.9, 1] : 1,
      }}
      transition={{
        duration: isRolling ? 0.6 : 0.3,
        ease: isRolling ? "easeInOut" : "easeOut",
      }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <motion.div
        className="relative w-12 h-12 rounded-lg bg-card border-2 border-accent/30 shadow-lg"
        animate={{
          boxShadow: isRolling 
            ? [
                '0 0 20px oklch(0.75 0.15 85 / 0.6), 0 0 40px oklch(0.75 0.15 85 / 0.4)',
                '0 0 30px oklch(0.75 0.15 85 / 0.8), 0 0 60px oklch(0.75 0.15 85 / 0.6)',
                '0 0 20px oklch(0.75 0.15 85 / 0.6), 0 0 40px oklch(0.75 0.15 85 / 0.4)',
              ]
            : isMoving
            ? '0 0 15px oklch(0.75 0.15 85 / 0.5), 0 0 30px oklch(0.75 0.15 85 / 0.3)'
            : '0 4px 6px rgba(0, 0, 0, 0.3)',
          scale: isRolling ? [1, 1.05, 1] : 1,
        }}
        transition={{
          boxShadow: {
            duration: isRolling ? 0.6 : 0.3,
            repeat: isRolling ? Infinity : 0,
            ease: "easeInOut",
          },
          scale: {
            duration: isRolling ? 0.3 : 0,
            repeat: isRolling ? Infinity : 0,
            ease: "easeInOut",
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
                    className="w-2 h-2 rounded-full bg-accent"
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
