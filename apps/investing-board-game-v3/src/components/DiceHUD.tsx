import type { MouseEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DiceFive, Clock, X, ArrowsClockwise, Play, Stop } from '@phosphor-icons/react'
import { AnimatedDice } from '@/components/AnimatedDice'
import { COIN_COSTS } from '@/lib/coins'
import { MULTIPLIERS } from '@/lib/constants'
import { getTimeUntilNextRegen } from '@/lib/energy'
import type { DiceRoll } from '@/lib/types'

interface DiceHUDProps {
  onRoll: (multiplier?: number) => void
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
  // New props for dual dice and energy
  dice1?: number
  dice2?: number
  energyRolls?: number
  lastEnergyCheck?: Date
  rollHistory?: DiceRoll[]
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
  onReroll,
  dice1: propDice1,
  dice2: propDice2,
  energyRolls = 10,
  lastEnergyCheck,
  rollHistory = []
}: DiceHUDProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [energyRegenTime, setEnergyRegenTime] = useState('')
  const [dice1, setDice1] = useState(propDice1 || 1)
  const [dice2, setDice2] = useState(propDice2 || 1)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dicePosition, setDicePosition] = useState({ x: 0, y: 0 })
  const [selectedMultiplier, setSelectedMultiplier] = useState(1)
  const [autoRollActive, setAutoRollActive] = useState(false)
  const autoRollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const canRoll = phase === 'idle' && rollsRemaining > 0
  const isDoubles = dice1 === dice2 && lastRoll !== null

  // Update dice when props change
  useEffect(() => {
    if (propDice1) setDice1(propDice1)
    if (propDice2) setDice2(propDice2)
  }, [propDice1, propDice2])

  useEffect(() => {
    setDicePosition({ x: 0, y: 0 })
  }, [resetPositionKey])

  // Update daily reset timer
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

  // Update energy regeneration timer
  useEffect(() => {
    if (!lastEnergyCheck) return

    const updateEnergyTimer = () => {
      const { minutes, seconds } = getTimeUntilNextRegen(lastEnergyCheck)
      setEnergyRegenTime(`${minutes}m ${seconds}s`)
    }

    updateEnergyTimer()
    const interval = setInterval(updateEnergyTimer, 1000)

    return () => clearInterval(interval)
  }, [lastEnergyCheck])

  const handleCompactRoll = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (!canRoll) return
    onRoll(selectedMultiplier)
  }

  const startAutoRoll = () => {
    setAutoRollActive(true)
    autoRollIntervalRef.current = setInterval(() => {
      if (rollsRemaining < selectedMultiplier || phase !== 'idle') {
        stopAutoRoll()
        return
      }
      onRoll(selectedMultiplier)
    }, 2500) // Roll every 2.5 seconds
  }

  const stopAutoRoll = () => {
    setAutoRollActive(false)
    if (autoRollIntervalRef.current) {
      clearInterval(autoRollIntervalRef.current)
      autoRollIntervalRef.current = null
    }
  }

  // Cleanup auto-roll on unmount
  useEffect(() => {
    return () => {
      if (autoRollIntervalRef.current) {
        clearInterval(autoRollIntervalRef.current)
      }
    }
  }, [])

  const availableMultipliers = MULTIPLIERS.filter(m => m <= 25) // Limit to 1, 5, 10, 25

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
              <div className="flex flex-col gap-3 min-w-[260px]">
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
                    isDoubles={isDoubles}
                  />
                  <AnimatedDice 
                    value={dice2} 
                    isRolling={phase === 'rolling'} 
                    isMoving={phase === 'moving'}
                    isDoubles={isDoubles}
                  />
                </div>

                {/* Multiplier Selection */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground text-center">Multiplier</div>
                  <div className="flex gap-1 justify-center">
                    {availableMultipliers.map((multiplier) => (
                      <Button
                        key={multiplier}
                        size="sm"
                        variant={selectedMultiplier === multiplier ? 'default' : 'outline'}
                        onClick={() => setSelectedMultiplier(multiplier)}
                        disabled={rollsRemaining < multiplier}
                        className="flex-1 text-xs"
                      >
                        {multiplier}x
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => onRoll(selectedMultiplier)}
                  disabled={phase !== 'idle' || rollsRemaining < selectedMultiplier}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                  size="lg"
                >
                  <DiceFive size={20} weight="fill" />
                  ROLL {selectedMultiplier > 1 ? `${selectedMultiplier}x` : ''} ({rollsRemaining})
                </Button>

                {/* Auto-Roll Button */}
                <Button
                  onClick={autoRollActive ? stopAutoRoll : startAutoRoll}
                  disabled={phase !== 'idle' || rollsRemaining < selectedMultiplier}
                  variant={autoRollActive ? 'destructive' : 'outline'}
                  size="sm"
                  className="w-full gap-2"
                >
                  {autoRollActive ? <Stop size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {autoRollActive ? 'Stop Auto' : 'Auto Roll'}
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
                    <div className={`text-2xl font-bold font-mono ${isDoubles ? 'text-yellow-400' : 'text-accent'}`}>
                      {lastRoll} {isDoubles && '🎲'}
                    </div>
                  </motion.div>
                )}

                {/* Roll History */}
                {rollHistory.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground text-center">Recent Rolls</div>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {rollHistory.slice(-10).reverse().map((roll, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${
                            roll.isDoubles 
                              ? 'bg-yellow-400/20 text-yellow-400 font-bold' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {roll.total}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="font-mono text-center">
                    Phase: <span className="text-accent">{phase}</span>
                  </div>
                  
                  {/* Energy Regen Timer */}
                  {lastEnergyCheck && (
                    <div className="flex items-center gap-2 justify-center p-2 rounded bg-background/50">
                      <Clock size={14} className="text-green-400" />
                      <div className="flex flex-col">
                        <div className="text-[10px] opacity-60">Next roll in</div>
                        <div className="font-mono text-green-400 text-xs">{energyRegenTime}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 justify-center p-2 rounded bg-background/50">
                    <Clock size={14} className="text-accent" />
                    <div className="flex flex-col">
                      <div className="text-[10px] opacity-60">Daily reset in</div>
                      <div className="font-mono text-accent text-xs">{timeUntilReset}</div>
                    </div>
                  </div>

                  <div className="text-[10px] opacity-60 text-center">
                    Energy: {energyRolls}/50 • Drag me anywhere
                  </div>
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
                    boxShadow: isDoubles
                      ? [
                          '0 0 0 0 rgba(250,204,21,0.7)',
                          '0 0 0 12px rgba(250,204,21,0)'
                        ]
                      : [
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
                    isDoubles={isDoubles}
                    className="scale-90"
                  />
                </motion.div>
                <motion.div
                  animate={{
                    boxShadow: isDoubles
                      ? [
                          '0 0 0 0 rgba(250,204,21,0.7)',
                          '0 0 0 12px rgba(250,204,21,0)'
                        ]
                      : [
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
                    isDoubles={isDoubles}
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
