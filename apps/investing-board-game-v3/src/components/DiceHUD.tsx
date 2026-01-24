import type { MouseEvent, PointerEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DiceFive, Clock, X, ArrowsClockwise, Play, Stop } from '@phosphor-icons/react'
import { AnimatedDice } from '@/components/AnimatedDice'
import { COIN_COSTS } from '@/lib/coins'
import { MULTIPLIERS } from '@/lib/constants'
import { getTimeUntilNextRegen } from '@/lib/energy'
import { clampMultiplierToLeverage, getUnlockedMultipliers, isMultiplierUnlocked } from '@/lib/leverage'
import type { DiceRoll } from '@/lib/types'

interface DiceHUDProps {
  onRoll: (multiplier?: number) => void
  lastRoll: number | null
  phase: 'idle' | 'rolling' | 'moving' | 'landed'
  rollsRemaining: number
  nextResetTime: Date
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
  leverageLevel?: number
  momentum?: number
  momentumMax?: number
  economyWindowLabel?: string | null
  economyWindowEndsAt?: string | null
  economyWindowStarsMultiplier?: number
  economyWindowXpMultiplier?: number
}

export function DiceHUD({ 
  onRoll, 
  lastRoll, 
  phase, 
  rollsRemaining, 
  nextResetTime, 
  coins,
  canAffordReroll,
  onReroll,
  dice1: propDice1,
  dice2: propDice2,
  energyRolls = 10,
  lastEnergyCheck,
  rollHistory = [],
  leverageLevel = 0,
  momentum = 0,
  momentumMax = 100,
  economyWindowLabel = null,
  economyWindowEndsAt = null,
  economyWindowStarsMultiplier = 1,
  economyWindowXpMultiplier = 1,
}: DiceHUDProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [energyRegenTime, setEnergyRegenTime] = useState('')
  const [economyWindowRemaining, setEconomyWindowRemaining] = useState('')
  const [dice1, setDice1] = useState(propDice1 || 1)
  const [dice2, setDice2] = useState(propDice2 || 1)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedMultiplier, setSelectedMultiplier] = useState(1)
  const [autoRollActive, setAutoRollActive] = useState(false)
  const [autoRollFlash, setAutoRollFlash] = useState(false)
  const autoRollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const canRoll = phase === 'idle'
  const isDoubles = dice1 === dice2 && lastRoll !== null

  // Update dice when props change
  useEffect(() => {
    if (propDice1) setDice1(propDice1)
    if (propDice2) setDice2(propDice2)
  }, [propDice1, propDice2])

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

  useEffect(() => {
    if (!economyWindowEndsAt || !economyWindowLabel) {
      setEconomyWindowRemaining('')
      return
    }

    const endAt = new Date(economyWindowEndsAt)
    if (Number.isNaN(endAt.getTime())) {
      setEconomyWindowRemaining('')
      return
    }

    const updateWindowTimer = () => {
      const diff = endAt.getTime() - Date.now()
      if (diff <= 0) {
        setEconomyWindowRemaining('Ending...')
        return
      }
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setEconomyWindowRemaining(`${minutes}m ${seconds}s`)
    }

    updateWindowTimer()
    const interval = setInterval(updateWindowTimer, 1000)
    return () => clearInterval(interval)
  }, [economyWindowEndsAt, economyWindowLabel])

  const handleCompactRoll = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (autoRollActive) {
      stopAutoRoll()
      return
    }
    if (!canRoll) return
    onRoll(selectedMultiplier)
  }

  // Effect that watches phase and triggers auto-roll when idle
  useEffect(() => {
    if (!autoRollActive) return
    if (phase !== 'idle') return // Wait for user to finish modal interaction
    if (rollsRemaining < selectedMultiplier) {
      stopAutoRoll()
      return
    }
    
    // Clear any existing timeout
    if (autoRollTimeoutRef.current) {
      clearTimeout(autoRollTimeoutRef.current)
    }
    
    // Schedule next roll after delay (gives user time to see result)
    autoRollTimeoutRef.current = setTimeout(() => {
      if (autoRollActive && phase === 'idle' && rollsRemaining >= selectedMultiplier) {
        onRoll(selectedMultiplier)
      }
    }, 1500) // 1.5 second delay before next roll
    
    return () => {
      if (autoRollTimeoutRef.current) {
        clearTimeout(autoRollTimeoutRef.current)
      }
    }
  }, [autoRollActive, phase, rollsRemaining, selectedMultiplier, onRoll])

  const startAutoRoll = () => {
    setAutoRollActive(true)
    // Immediately trigger first roll
    onRoll(selectedMultiplier)
  }

  const stopAutoRoll = () => {
    setAutoRollActive(false)
    if (autoRollTimeoutRef.current) {
      clearTimeout(autoRollTimeoutRef.current)
      autoRollTimeoutRef.current = null
    }
  }

  const unlockedMultipliers = getUnlockedMultipliers(leverageLevel)
  const safeMomentumMax = momentumMax > 0 ? momentumMax : 100
  const momentumPercent = Math.max(0, Math.min(100, Math.round((momentum / safeMomentumMax) * 100)))
  const hasEconomyWindow = Boolean(economyWindowLabel && economyWindowEndsAt)
  const windowStarsBonus = Math.max(0, Math.round((economyWindowStarsMultiplier - 1) * 100))
  const windowXpBonus = Math.max(0, Math.round((economyWindowXpMultiplier - 1) * 100))

  const handleMultiplierToggle = () => {
    const currentIndex = unlockedMultipliers.indexOf(selectedMultiplier as (typeof unlockedMultipliers)[number])
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % unlockedMultipliers.length
    setSelectedMultiplier(unlockedMultipliers[nextIndex] ?? MULTIPLIERS[0])
  }

  const triggerAutoRollFlash = () => {
    setAutoRollFlash(true)
    window.setTimeout(() => {
      setAutoRollFlash(false)
    }, 600)
  }

  const handleAutoRollToggle = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (autoRollActive) {
      stopAutoRoll()
      return
    }
    triggerAutoRollFlash()
    startAutoRoll()
  }

  // Effect-based auto-roll: watches for phase changes and auto-rolls when idle
  useEffect(() => {
    return () => {
      if (autoRollTimeoutRef.current) {
        clearTimeout(autoRollTimeoutRef.current)
      }
    }
    // Note: onRoll is included in deps as required by React hooks rules
    // Parent component should memoize onRoll with useCallback for optimal performance
  }, [autoRollActive, phase, rollsRemaining, selectedMultiplier, onRoll])

  // Auto-stop when out of rolls
  useEffect(() => {
    if (autoRollActive && rollsRemaining < selectedMultiplier) {
      setAutoRollActive(false)
    }
  }, [autoRollActive, rollsRemaining, selectedMultiplier])

  useEffect(() => {
    setSelectedMultiplier((prev) => clampMultiplierToLeverage(prev, leverageLevel))
  }, [leverageLevel])

  const availableMultipliers = MULTIPLIERS

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="dice-control-zone">
        <div
          className={`dice-aura ${canRoll ? 'dice-aura--active' : ''}`}
          aria-hidden="true"
          onClick={() => {
            if (!isExpanded) setIsExpanded(true)
          }}
        />
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="dice-control-zone__content absolute bottom-0 right-0"
            >
            <Card className="p-4 bg-card/90 backdrop-blur-md border-2 border-border shadow-xl relative">
              {/* Roll Counter - Top Right */}
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-accent/30">
                <div className="flex items-center gap-1.5">
                  <DiceFive size={14} className="text-accent" />
                  <span className="font-mono font-bold text-sm">
                    <motion.span
                      key={rollsRemaining}
                      initial={{ scale: 1.5, color: 'rgb(var(--accent))' }}
                      animate={{ scale: 1, color: 'currentColor' }}
                      transition={{ duration: 0.3 }}
                      className={
                        rollsRemaining === 0
                          ? 'text-destructive'
                          : rollsRemaining <= 10
                          ? 'text-orange-400'
                          : 'text-accent'
                      }
                    >
                      {rollsRemaining}
                    </motion.span>
                    <span className="text-muted-foreground">/{rollsRemaining > 50 ? rollsRemaining : 50}</span>
                  </span>
                </div>
              </div>

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

                {/* Momentum Meter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Momentum</span>
                    <span className="font-mono text-foreground">{momentumPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-white/15 bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 transition-all duration-500"
                      style={{ width: `${momentumPercent}%` }}
                    />
                  </div>
                </div>

                {/* Multiplier Selection */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground text-center">Multiplier</div>
                  <div className="flex gap-1 justify-center">
                    {availableMultipliers.map((multiplier) => {
                      const unlocked = isMultiplierUnlocked(multiplier, leverageLevel)
                      const disabled = rollsRemaining < multiplier || !unlocked
                      return (
                        <Button
                          key={multiplier}
                          size="sm"
                          variant={selectedMultiplier === multiplier ? 'default' : 'outline'}
                          onClick={() => {
                            if (!unlocked) return
                            setSelectedMultiplier(multiplier)
                          }}
                          disabled={disabled}
                          className="flex-1 text-xs"
                          aria-label={
                            unlocked
                              ? `${multiplier}x multiplier`
                              : `${multiplier}x multiplier locked`
                          }
                        >
                          {multiplier}x{unlocked ? '' : ' 🔒'}
                        </Button>
                      )
                    })}
                  </div>
                  {!isMultiplierUnlocked(selectedMultiplier, leverageLevel) && (
                    <div className="text-[11px] text-center text-yellow-200/90">
                      Higher leverage unlocks stronger multipliers.
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => onRoll(selectedMultiplier)}
                  disabled={phase !== 'idle' || rollsRemaining < selectedMultiplier}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                  size="lg"
                >
                  <DiceFive size={20} weight="fill" />
                  ROLL {selectedMultiplier > 1 ? `(${selectedMultiplier})` : ''}
                </Button>

                {/* Auto-Roll Button */}
                <Button
                  onClick={autoRollActive ? stopAutoRoll : startAutoRoll}
                  disabled={!autoRollActive && (phase !== 'idle' || rollsRemaining < selectedMultiplier)}
                  variant={autoRollActive ? 'destructive' : 'outline'}
                  size="sm"
                  className="w-full gap-2"
                >
                  {autoRollActive ? <Stop size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  {autoRollActive 
                    ? (phase !== 'idle' ? 'Waiting...' : 'Stop Auto') 
                    : 'Auto Roll'}
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

                {hasEconomyWindow && (
                  <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold uppercase tracking-[0.12em] text-emerald-200/90">
                        {economyWindowLabel}
                      </span>
                      <span className="font-mono text-emerald-200">{economyWindowRemaining}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-emerald-100/90">
                      <span>⭐ +{windowStarsBonus}%</span>
                      <span>XP +{windowXpBonus}%</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="font-mono text-center">
                    Phase: <span className="text-accent">{phase}</span>
                  </div>
                  
                  {/* 2-Hour Reset Timer */}
                  {lastEnergyCheck && (
                    <div className="flex items-center gap-2 justify-center p-2 rounded bg-background/50">
                      <Clock size={14} className="text-green-400" />
                      <div className="flex flex-col">
                        <div className="text-[10px] opacity-60">Next reset (30 dice) in</div>
                        <div className="font-mono text-green-400 text-xs">{energyRegenTime}</div>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 text-center">
                    Dice: {energyRolls}/50
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
              className="dice-control-zone__content relative flex items-center justify-center w-32 h-32 rounded-full border-2 border-white/20 bg-card/80 backdrop-blur-md shadow-xl cursor-pointer"
            >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleMultiplierToggle()
              }}
              className="absolute -top-6 left-1/2 flex h-12 w-[150px] -translate-x-1/2 items-start justify-center rounded-t-full border-2 border-yellow-200/60 bg-background/40 pt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-100 shadow-[0_0_14px_rgba(250,204,21,0.25)] backdrop-blur-sm"
              aria-label={`Leverage ${selectedMultiplier}x. Tap to change.`}
            >
              Leverage {selectedMultiplier}x
            </button>

            <button
              type="button"
              onPointerDown={handleAutoRollToggle}
              className={`absolute top-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white ${
                autoRollActive ? 'border-yellow-300/70 bg-yellow-400/70' : 'border-white/30 bg-background/80'
              } ${autoRollFlash ? 'auto-roll-flash' : ''}`}
              aria-label={autoRollActive ? 'Auto roll on. Tap to stop.' : 'Tap to enable auto roll.'}
            >
              Auto {autoRollActive ? 'ON' : 'OFF'}
            </button>

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
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">Rolls</span>
              <span className="text-lg font-bold">{rollsRemaining}</span>
            </div>
            <span className="sr-only">Open dice HUD</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
