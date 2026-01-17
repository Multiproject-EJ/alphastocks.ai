import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface VaultPrize {
  type: 'cash' | 'stars' | 'coins' | 'mystery' | 'alarm'
  amount: number
  emoji: string
  label: string
}

interface Vault {
  id: number
  state: 'locked' | 'cracking' | 'opened' | 'alarm'
  prize: VaultPrize | null
}

const VAULT_PRIZES: { prize: VaultPrize; weight: number }[] = [
  { prize: { type: 'cash', amount: 500, emoji: '💰', label: '$500' }, weight: 25 },
  { prize: { type: 'cash', amount: 2000, emoji: '💰', label: '$2,000' }, weight: 20 },
  { prize: { type: 'cash', amount: 10000, emoji: '💰', label: '$10,000' }, weight: 10 },
  { prize: { type: 'cash', amount: 50000, emoji: '💵', label: '$50,000 MEGA!' }, weight: 3 },
  { prize: { type: 'stars', amount: 100, emoji: '⭐', label: '100 Stars' }, weight: 15 },
  { prize: { type: 'stars', amount: 500, emoji: '⭐', label: '500 Stars' }, weight: 7 },
  { prize: { type: 'mystery', amount: 1, emoji: '💎', label: 'Mystery Box' }, weight: 8 },
  { prize: { type: 'coins', amount: 200, emoji: '🪙', label: '200 Coins' }, weight: 7 },
  { prize: { type: 'alarm', amount: 0, emoji: '💣', label: 'ALARM!' }, weight: 5 },
]

interface VaultHeistModalProps {
  isOpen: boolean
  onClose: () => void
  currentRing: 1 | 2 | 3
  freePicksRemaining: number
  coins: number
  onPickComplete: (prizes: VaultPrize[], totalHaul: { cash: number; stars: number; coins: number; mysteryBoxes: number }) => void
  onSpendCoins: (amount: number) => boolean
  playSound: (sound: string) => void
}

export function VaultHeistModal({
  isOpen,
  onClose,
  currentRing,
  freePicksRemaining,
  coins,
  onPickComplete,
  onSpendCoins,
  playSound,
}: VaultHeistModalProps) {
  const [vaults, setVaults] = useState<Vault[]>([
    { id: 1, state: 'locked', prize: null },
    { id: 2, state: 'locked', prize: null },
    { id: 3, state: 'locked', prize: null },
    { id: 4, state: 'locked', prize: null },
    { id: 5, state: 'locked', prize: null },
  ])
  const [picksUsed, setPicksUsed] = useState(0)
  const [haul, setHaul] = useState({ cash: 0, stars: 0, coins: 0, mysteryBoxes: 0 })
  const [isGameOver, setIsGameOver] = useState(false)
  const [collectedPrizes, setCollectedPrizes] = useState<VaultPrize[]>([])

  const maxPicks = 3
  const picksRemaining = maxPicks - picksUsed
  const ringMultiplier = currentRing === 3 ? 10 : currentRing === 2 ? 3 : 1
  const pickCost = freePicksRemaining > 0 ? 0 : 100

  // Select random prize based on weights
  const selectPrize = useCallback((): VaultPrize => {
    const totalWeight = VAULT_PRIZES.reduce((sum, p) => sum + p.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const { prize, weight } of VAULT_PRIZES) {
      random -= weight
      if (random <= 0) return { ...prize }
    }
    return VAULT_PRIZES[0].prize
  }, [])

  // Handle vault crack
  const crackVault = useCallback((vaultId: number) => {
    if (picksRemaining <= 0 || isGameOver) return
    
    const vault = vaults.find(v => v.id === vaultId)
    if (!vault || vault.state !== 'locked') return

    // Check if need to pay
    if (pickCost > 0 && !onSpendCoins(pickCost)) {
      playSound('error')
      return
    }

    // Start cracking animation
    playSound('dice-roll') // vault-crack sound
    setVaults(prev => prev.map(v => 
      v.id === vaultId ? { ...v, state: 'cracking' } : v
    ))

    // After crack animation, reveal prize
    setTimeout(() => {
      const prize = selectPrize()
      const isAlarm = prize.type === 'alarm'

      setVaults(prev => prev.map(v => 
        v.id === vaultId ? { ...v, state: isAlarm ? 'alarm' : 'opened', prize } : v
      ))

      if (isAlarm) {
        playSound('error')
        // Alarm steals a pick but doesn't count as used pick
        setPicksUsed(prev => Math.min(prev + 2, maxPicks)) // Lose extra pick
      } else {
        // Apply multiplier and add to haul
        const multipliedAmount = prize.type === 'mystery' ? prize.amount : prize.amount * ringMultiplier
        
        setHaul(prev => ({
          cash: prev.cash + (prize.type === 'cash' ? multipliedAmount : 0),
          stars: prev.stars + (prize.type === 'stars' ? multipliedAmount : 0),
          coins: prev.coins + (prize.type === 'coins' ? multipliedAmount : 0),
          mysteryBoxes: prev.mysteryBoxes + (prize.type === 'mystery' ? 1 : 0),
        }))
        
        setCollectedPrizes(prev => [...prev, { ...prize, amount: multipliedAmount }])
        
        if (multipliedAmount >= 10000) {
          playSound('big-win')
        } else {
          playSound('cha-ching')
        }
      }

      setPicksUsed(prev => prev + 1)

      // Check if game over
      if (picksUsed + 1 >= maxPicks) {
        setTimeout(() => setIsGameOver(true), 1000)
      }
    }, 800) // Crack animation duration
  }, [vaults, picksRemaining, isGameOver, pickCost, onSpendCoins, selectPrize, ringMultiplier, playSound, picksUsed])

  // Handle game complete
  const handleComplete = useCallback(() => {
    onPickComplete(collectedPrizes, haul)
    onClose()
  }, [collectedPrizes, haul, onPickComplete, onClose])

  // Reset game when modal opens
  useEffect(() => {
    if (isOpen) {
      setVaults([
        { id: 1, state: 'locked', prize: null },
        { id: 2, state: 'locked', prize: null },
        { id: 3, state: 'locked', prize: null },
        { id: 4, state: 'locked', prize: null },
        { id: 5, state: 'locked', prize: null },
      ])
      setPicksUsed(0)
      setHaul({ cash: 0, stars: 0, coins: 0, mysteryBoxes: 0 })
      setIsGameOver(false)
      setCollectedPrizes([])
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        {/* Header */}
        <div className="relative p-4 text-center bg-gradient-to-r from-amber-600 to-yellow-600">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            🏦 VAULT HEIST 🏦
          </h2>
          <p className="text-amber-100 text-sm mt-1">Saturday Special!</p>
        </div>

        {/* Vaults Grid */}
        <div className="p-6">
          <div className="flex justify-center gap-3 mb-6">
            {vaults.map(vault => (
              <motion.button
                key={vault.id}
                onClick={() => crackVault(vault.id)}
                disabled={vault.state !== 'locked' || picksRemaining <= 0}
                className={`
                  w-16 h-20 rounded-xl flex flex-col items-center justify-center
                  font-bold text-lg transition-all border-2
                  ${vault.state === 'locked' 
                    ? 'bg-slate-700 border-slate-500 hover:border-amber-400 hover:bg-slate-600 cursor-pointer' 
                    : vault.state === 'cracking'
                    ? 'bg-amber-600 border-amber-400 animate-pulse'
                    : vault.state === 'alarm'
                    ? 'bg-red-600 border-red-400 animate-pulse'
                    : 'bg-green-600 border-green-400'
                  }
                `}
                whileHover={vault.state === 'locked' ? { scale: 1.05 } : {}}
                whileTap={vault.state === 'locked' ? { scale: 0.95 } : {}}
                animate={vault.state === 'cracking' ? { 
                  x: [0, -5, 5, -5, 5, 0],
                  transition: { duration: 0.5, repeat: Infinity }
                } : {}}
              >
                {vault.state === 'locked' && (
                  <>
                    <span className="text-2xl">🔐</span>
                    <span className="text-xs text-slate-300">{vault.id}</span>
                  </>
                )}
                {vault.state === 'cracking' && (
                  <span className="text-2xl">⏳</span>
                )}
                {vault.state === 'opened' && vault.prize && (
                  <>
                    <span className="text-2xl">{vault.prize.emoji}</span>
                    <span className="text-[10px] text-white">{vault.prize.type === 'cash' ? `$${(vault.prize.amount * ringMultiplier).toLocaleString()}` : vault.prize.label}</span>
                  </>
                )}
                {vault.state === 'alarm' && (
                  <>
                    <span className="text-2xl">🚨</span>
                    <span className="text-[10px] text-white">ALARM!</span>
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {/* Picks indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: maxPicks }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < picksRemaining ? 'bg-amber-400' : 'bg-slate-600'
                }`}
              />
            ))}
            <span className="text-slate-300 text-sm ml-2">
              {picksRemaining} picks left
            </span>
          </div>

          {/* Ring multiplier badge */}
          {ringMultiplier > 1 && (
            <div className="text-center mb-4">
              <span className="px-3 py-1 bg-purple-600/30 rounded-full text-purple-300 text-sm font-bold">
                🔓 Ring {currentRing} = {ringMultiplier}× Rewards!
              </span>
            </div>
          )}

          {/* Haul display */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <h3 className="text-amber-400 font-semibold mb-2 text-center">💼 Your Haul</h3>
            <div className="flex justify-center gap-4 text-white">
              <div className="text-center">
                <div className="text-xl font-bold">${haul.cash.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Cash</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{haul.stars}</div>
                <div className="text-xs text-slate-400">⭐ Stars</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{haul.coins}</div>
                <div className="text-xs text-slate-400">🪙 Coins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{haul.mysteryBoxes}</div>
                <div className="text-xs text-slate-400">💎 Boxes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {isGameOver ? (
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-105 transition-transform"
            >
              🎉 Collect Haul!
            </button>
          ) : (
            <div className="text-center text-slate-400 text-sm">
              {pickCost > 0 
                ? `Extra picks: ${pickCost} 🪙 each (Balance: ${coins})` 
                : `Free picks remaining: ${freePicksRemaining}`
              }
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
