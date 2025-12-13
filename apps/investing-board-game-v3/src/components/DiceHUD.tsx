import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DiceFive, Clock } from '@phosphor-icons/react'
import { AnimatedDice } from '@/components/AnimatedDice'

interface DiceHUDProps {
  onRoll: () => void
  lastRoll: number | null
  phase: 'idle' | 'rolling' | 'moving' | 'landed'
  rollsRemaining: number
  nextResetTime: Date
  boardRef?: React.RefObject<HTMLDivElement | null>
}

export function DiceHUD({ onRoll, lastRoll, phase, rollsRemaining, nextResetTime, boardRef }: DiceHUDProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)

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

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={boardRef}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className="absolute top-8 right-8 z-50 cursor-move"
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
    >
      <Card className="p-4 bg-card/90 backdrop-blur-md border-2 border-border shadow-xl">
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
              Dice HUD
            </h3>
          </div>

          <div className="flex items-center justify-center gap-3 py-4">
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
            disabled={phase === 'rolling' || phase === 'moving'}
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            size="lg"
          >
            <DiceFive size={20} weight="fill" />
            ROLL {rollsRemaining > 0 && `(${rollsRemaining})`}
          </Button>

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
  )
}