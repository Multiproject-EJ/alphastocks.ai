import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Coins } from 'lucide-react'

interface WheelSegment {
  id: string
  label: string
  emoji: string
  value: number
  type: 'coins' | 'stars' | 'cash' | 'rolls' | 'xp' | 'spin-again' | 'mystery' | 'jackpot'
  color: string
  weight: number
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 'coins-50', label: '50', emoji: '🪙', value: 50, type: 'coins', color: '#F59E0B', weight: 20 },
  { id: 'stars-25', label: '25', emoji: '⭐', value: 25, type: 'stars', color: '#EAB308', weight: 15 },
  { id: 'cash-500', label: '$500', emoji: '💵', value: 500, type: 'cash', color: '#22C55E', weight: 12 },
  { id: 'coins-100', label: '100', emoji: '🪙', value: 100, type: 'coins', color: '#F59E0B', weight: 15 },
  { id: 'xp-50', label: '50', emoji: '⚡', value: 50, type: 'xp', color: '#3B82F6', weight: 5 },
  { id: 'stars-50', label: '50', emoji: '⭐', value: 50, type: 'stars', color: '#EAB308', weight: 10 },
  { id: 'rolls-2', label: '+2', emoji: '🎲', value: 2, type: 'rolls', color: '#8B5CF6', weight: 8 },
  { id: 'cash-1000', label: '$1K', emoji: '💵', value: 1000, type: 'cash', color: '#22C55E', weight: 8 },
  { id: 'spin-again', label: 'Again!', emoji: '🔄', value: 0, type: 'spin-again', color: '#06B6D4', weight: 4 },
  { id: 'mystery', label: 'Mystery', emoji: '💎', value: 0, type: 'mystery', color: '#EC4899', weight: 2 },
  { id: 'jackpot-stars', label: '500', emoji: '👑', value: 500, type: 'jackpot', color: '#FFD700', weight: 0.8 },
  { id: 'mega-jackpot', label: '$5K', emoji: '💰', value: 5000, type: 'jackpot', color: '#FFD700', weight: 0.2 },
]

interface WheelOfFortuneModalProps {
  isOpen: boolean
  onClose: () => void
  coins: number
  currentRing: 1 | 2 | 3
  freeSpinsRemaining: number
  onSpinComplete: (prize: WheelSegment, multipliedValue: number) => void
  onSpendCoins: (amount: number) => boolean
  playSound: (sound: string) => void
}

export function WheelOfFortuneModal({
  isOpen,
  onClose,
  coins,
  currentRing,
  freeSpinsRemaining,
  onSpinComplete,
  onSpendCoins,
  playSound,
}: WheelOfFortuneModalProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [lastWin, setLastWin] = useState<{ segment: WheelSegment, value: number } | null>(null)
  const [showWinCelebration, setShowWinCelebration] = useState(false)

  const ringMultiplier = currentRing === 3 ? 10 : currentRing === 2 ? 3 : 1
  const spinCost = freeSpinsRemaining > 0 ? 0 : 50

  const selectWinningSegment = useCallback((): WheelSegment => {
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const segment of WHEEL_SEGMENTS) {
      random -= segment.weight
      if (random <= 0) return segment
    }
    return WHEEL_SEGMENTS[0]
  }, [])

  const handleSpin = useCallback(() => {
    if (isSpinning) return
    
    // Check if player can afford spin
    if (spinCost > 0 && !onSpendCoins(spinCost)) {
      playSound('error')
      return
    }

    setIsSpinning(true)
    setShowWinCelebration(false)
    playSound('dice-roll') // wheel-start sound

    // Select winning segment
    const winner = selectWinningSegment()
    const segmentIndex = WHEEL_SEGMENTS.findIndex(s => s.id === winner.id)
    const segmentAngle = (360 / WHEEL_SEGMENTS.length)
    const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2

    // Calculate spin
    const baseSpins = 5 + Math.random() * 5 // 5-10 full rotations
    const totalRotation = baseSpins * 360 + (360 - targetAngle)

    setRotation(prev => prev + totalRotation)

    // After spin completes
    const spinDuration = 4000 + Math.random() * 1000
    setTimeout(() => {
      setIsSpinning(false)
      
      // Calculate multiplied prize
      const multipliedValue = winner.type === 'spin-again' || winner.type === 'mystery'
        ? winner.value
        : winner.value * ringMultiplier

      setLastWin({ segment: winner, value: multipliedValue })
      setShowWinCelebration(true)

      // Play appropriate sound
      if (winner.type === 'jackpot') {
        playSound('mega-jackpot')
      } else if (winner.value >= 100 || winner.type === 'mystery') {
        playSound('big-win')
      } else {
        playSound('cha-ching')
      }

      // Handle spin again
      if (winner.type === 'spin-again') {
        // Give free spin - handled by parent
      }

      onSpinComplete(winner, multipliedValue)
    }, spinDuration)
  }, [isSpinning, spinCost, onSpendCoins, selectWinningSegment, ringMultiplier, playSound, onSpinComplete])

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md mx-4 bg-gradient-to-b from-purple-900 to-indigo-950 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        {/* Header */}
        <div className="relative p-4 text-center border-b border-purple-500/30">
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            🎡 Daily Spin 🎡
          </h2>
          <div className="flex items-center justify-center gap-1 text-purple-300 text-sm mt-1">
            <Clock className="w-4 h-4" />
            <span>Come back tomorrow for another spin.</span>
          </div>
          {ringMultiplier > 1 && (
            <div className="mt-2 inline-block px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-sm font-bold">
              {ringMultiplier}× Ring Multiplier Active!
            </div>
          )}
        </div>

        {/* Wheel Container */}
        <div className="relative p-6">
          {/* Pointer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div className="relative w-72 h-72 mx-auto">
            <motion.div
              className="w-full h-full rounded-full relative"
              style={{
                background: `conic-gradient(${WHEEL_SEGMENTS.map((seg, i) => 
                  `${seg.color} ${i * (360/WHEEL_SEGMENTS.length)}deg ${(i+1) * (360/WHEEL_SEGMENTS.length)}deg`
                ).join(', ')})`,
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(0,0,0,0.3)',
              }}
              animate={{ rotate: rotation }}
              transition={{
                duration: isSpinning ? 4 : 0,
                ease: [0.17, 0.67, 0.12, 0.99],
              }}
            >
              {/* Segment Labels */}
              {WHEEL_SEGMENTS.map((segment, i) => {
                const segmentAngle = 360 / WHEEL_SEGMENTS.length
                const angle = (i * segmentAngle) + (segmentAngle / 2) // Offset to center
                const radius = 100 // px from center
                const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                
                return (
                  <div
                    key={segment.id}
                    className="absolute text-center"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
                    }}
                  >
                    <div className="text-2xl">{segment.emoji}</div>
                    <div className="text-xs font-bold text-white drop-shadow-md">{segment.label}</div>
                  </div>
                )
              })}

              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg flex items-center justify-center">
                  <span className="text-2xl">🎡</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Win Celebration */}
          <AnimatePresence>
            {showWinCelebration && lastWin && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <div className={`px-6 py-4 rounded-2xl text-center shadow-2xl ${
                  lastWin.segment.type === 'jackpot' 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' 
                    : 'bg-white/95 text-gray-900'
                }`}>
                  <div className="text-4xl mb-2">{lastWin.segment.emoji}</div>
                  <div className="text-xl font-bold">
                    {lastWin.segment.type === 'jackpot' ? '🎉 JACKPOT! 🎉' : 'You Won!'}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {lastWin.segment.type === 'coins' && `🪙 ${lastWin.value.toLocaleString()} Coins`}
                    {lastWin.segment.type === 'stars' && `⭐ ${lastWin.value.toLocaleString()} Stars`}
                    {lastWin.segment.type === 'cash' && `💵 $${lastWin.value.toLocaleString()}`}
                    {lastWin.segment.type === 'rolls' && `🎲 +${lastWin.value} Dice Rolls`}
                    {lastWin.segment.type === 'xp' && `⚡ ${lastWin.value} XP`}
                    {lastWin.segment.type === 'spin-again' && `🔄 Free Spin!`}
                    {lastWin.segment.type === 'mystery' && `💎 Mystery Box!`}
                    {lastWin.segment.type === 'jackpot' && lastWin.segment.id === 'jackpot-stars' && `👑 ${lastWin.value} Stars!`}
                    {lastWin.segment.type === 'jackpot' && lastWin.segment.id === 'mega-jackpot' && `💰 $${lastWin.value.toLocaleString()}!`}
                  </div>
                  {ringMultiplier > 1 && lastWin.segment.type !== 'spin-again' && lastWin.segment.type !== 'mystery' && (
                    <div className="text-sm text-gray-600 mt-1">
                      ({ringMultiplier}× multiplier applied!)
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spin Button */}
        <div className="p-4 border-t border-purple-500/30">
          <button
            onClick={handleSpin}
            disabled={isSpinning || (spinCost > 0 && coins < spinCost)}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all transform
              ${isSpinning 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : spinCost > 0 && coins < spinCost
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-105 hover:shadow-lg active:scale-95'
              }`}
          >
            {isSpinning ? (
              '🎡 Spinning...'
            ) : freeSpinsRemaining > 0 ? (
              `🎰 SPIN FREE! (${freeSpinsRemaining} left)`
            ) : (
              `🎰 SPIN (${spinCost} 🪙)`
            )}
          </button>

          {/* Balance */}
          <div className="mt-3 flex items-center justify-center gap-2 text-purple-300">
            <Coins className="w-4 h-4" />
            <span>Balance: {coins.toLocaleString()} coins</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
