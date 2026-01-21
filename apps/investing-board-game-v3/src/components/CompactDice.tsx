import { motion } from 'framer-motion'
import { DiceFive } from '@phosphor-icons/react'
import { AnimatedDice } from '@/components/AnimatedDice'

interface CompactDiceProps {
  dice1: number
  dice2: number
  isRolling: boolean
  rollsRemaining: number
  onRoll: () => void
  canRoll: boolean
}

export function CompactDice({
  dice1,
  dice2,
  isRolling,
  rollsRemaining,
  onRoll,
  canRoll,
}: CompactDiceProps) {
  const isDoubles = dice1 === dice2

  return (
    <motion.button
      onClick={onRoll}
      disabled={!canRoll}
      className="relative flex flex-col items-center justify-center gap-1 touch-target"
      whileTap={{ scale: canRoll ? 0.95 : 1 }}
      aria-label="Roll dice"
    >
      {/* Dice Display */}
      <div className="relative flex items-center gap-2">
        <AnimatedDice
          value={dice1}
          isRolling={isRolling}
          isMoving={false}
          isDoubles={isDoubles}
          className="scale-[0.825]"
        />
        <AnimatedDice
          value={dice2}
          isRolling={isRolling}
          isMoving={false}
          isDoubles={isDoubles}
          className="scale-[0.825]"
        />
      </div>

      {/* Roll Counter Badge */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-accent/30">
        <DiceFive size={10} className="text-accent" />
        <span
          className={`font-mono font-bold text-xs ${
            rollsRemaining === 0
              ? 'text-destructive'
              : rollsRemaining <= 10
              ? 'text-orange-400'
              : 'text-accent'
          }`}
        >
          {rollsRemaining}
        </span>
      </div>

      {/* Pulse effect when ready to roll */}
      {canRoll && !isRolling && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255,255,255,0.4)',
              '0 0 0 10px rgba(255,255,255,0)',
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      )}
    </motion.button>
  )
}
