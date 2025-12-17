import type { MouseEvent } from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DiceFive, Clock, X, ArrowsClockwise } from '@phosphor-icons/react'
import { AnimatedDice } from '@/components/AnimatedDice'
import { COIN_COSTS } from '@/lib/coins'

interface DiceHUDProps {
  onRoll: () => void
  lastRoll: number | null
  phase: 'idle' | 'rolling' | 'moving' | 'landed'
  rollsRemaining: number
  nextResetTime: Date
  boardRef?: React.RefObject<HTMLDivElement | null>
  resetPositionKey?: number
  // Coin-related props
  coins?: number
  canAffordReroll?: boolean
  onReroll?: () => void
}

export function DiceHUD({ 
  onRoll, 
  lastRoll, 
  phase, 
  rollsRemaining, 
  nextResetTime, 
  boardRef, 
  resetPositionKey,
  coins,
  canAffordReroll,
  onReroll
}: DiceHUDProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dicePosition, setDicePosition] = useState({ x: 0, y: 0 })

  const canRoll = phase === 'idle' && rollsRemaining > 0

  useEffect(() => {
    setDicePosition({ x: 0, y: 0 })
  }, [resetPositionKey])

  useEffect(() => {
    if (lastRoll !== null) {
      const die1 = Math.floor(Math.random() * 6) + 1
      const die2 = lastRoll - die1
      
      if (die2 >= 1 && die2 <= 6) {
        setDice1(die1)
        setDice2(die2)
      } else {
        const randomSplit = Math.floor(Math.random() * (lastRoll - 1)) + 1
        setDice1(Math.min(randomSplit, 6))
        setDice2(Math.min(lastRoll - randomSplit, 6))
      }
    }
  }, [lastRoll])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const diff = nextResetTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilReset('Resetting...')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [nextResetTime])

  const handleCompactRoll = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (!canRoll) return
    onRoll()
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={boardRef}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        setDicePosition((prev) => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y,
        }))
      }}
      className="absolute left-1/2 z-50 -translate-x-1/2"
      style={{ top: 'calc(50% - 220px)', x: dicePosition.x, y: dicePosition.y }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="cursor-move"
          >
            <Card className="p-4 bg-card/90 backdrop-blur-md border-2 border-border shadow-xl">
              <div className="flex flex-col gap-3 min-w-[220px]">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                    Dice HUD
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                    className="rounded-full"
                    aria-label="Collapse dice HUD"
                  >
                    <X size={16} />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  <AnimatedDice 
                    value={dice1} 
                    isRolling={phase === 'rolling'} 
                    isMoving={phase === 'moving'}
                  />
                  <AnimatedDice 
                    value={dice2} 
                    isRolling={phase === 'rolling'} 
                    isMoving={phase === 'moving'}
                  />
                </div>

                <Button
                  onClick={onRoll}
                  disabled={phase !== 'idle' || rollsRemaining <= 0}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                  size="lg"
                >
                  <DiceFive size={20} weight="fill" />
                  ROLL {rollsRemaining > 0 && `(${rollsRemaining})`}
                </Button>

                {/* Reroll Button */}
                {onReroll && coins !== undefined && (
                  <Button
                    onClick={onReroll}
                    disabled={phase !== 'idle' || !canAffordReroll}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <ArrowsClockwise size={16} />
                    Reroll ({COIN_COSTS.reroll_dice} 🪙)
                  </Button>
                )}

                {lastRoll !== null && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-xs text-muted-foreground mb-1">Total Roll</div>
                    <div className="text-2xl font-bold text-accent font-mono">{lastRoll}</div>
                  </motion.div>
                )}

                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="font-mono text-center">
                    Phase: <span className="text-accent">{phase}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-center p-2 rounded bg-background/50">
                    <Clock size={14} className="text-accent" />
                    <div className="flex flex-col">
                      <div className="text-[10px] opacity-60">Next reset in</div>
                      <div className="font-mono text-accent text-xs">{timeUntilReset}</div>
                    </div>
                  </div>

                  <div className="text-[10px] opacity-60 text-center">Drag me anywhere on the board</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.button
            key="compact"
            type="button"
            onClick={() => setIsExpanded(true)}
            className="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-white/20 bg-card/80 backdrop-blur-md shadow-xl cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <motion.div
                className="flex items-center justify-center gap-1"
                onClick={handleCompactRoll}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255,255,255,0.45)',
                      '0 0 0 12px rgba(255,255,255,0)'
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  className="rounded-full"
                >
                  <AnimatedDice
                    value={dice1}
                    isRolling={phase === 'rolling'}
                    isMoving={phase === 'moving'}
                    className="scale-90"
                  />
                </motion.div>
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255,255,255,0.45)',
                      '0 0 0 12px rgba(255,255,255,0)'
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  className="rounded-full"
                >
                  <AnimatedDice
                    value={dice2}
                    isRolling={phase === 'rolling'}
                    isMoving={phase === 'moving'}
                    className="scale-90"
                  />
                </motion.div>
              </motion.div>
            </div>
            <span className="sr-only">Open dice HUD</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
