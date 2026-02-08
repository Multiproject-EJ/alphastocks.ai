import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getVaultHeistStage } from '../lib/vaultHeistStages'
import {
  VAULT_HEIST_CREWS,
  VAULT_HEIST_GEAR,
  applyVaultHeistModifiers,
  getVaultHeistCrew,
  getVaultHeistGear,
} from '../lib/vaultHeistModifiers'

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
]

const ALARM_PRIZE: VaultPrize = { type: 'alarm', amount: 0, emoji: '💣', label: 'ALARM!' }

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
  const [isPickResolving, setIsPickResolving] = useState(false)
  const [isAlarmDecisionActive, setIsAlarmDecisionActive] = useState(false)
  const [resolutionState, setResolutionState] = useState<'idle' | 'cracking' | 'reveal' | 'resolved' | 'alarm'>('idle')
  const [lastResultLabel, setLastResultLabel] = useState('Choose a hatch to start the heist.')
  const [selectedCrewId, setSelectedCrewId] = useState(VAULT_HEIST_CREWS[0].id)
  const [selectedGearId, setSelectedGearId] = useState(VAULT_HEIST_GEAR[0].id)

  const maxPicks = 3
  const picksRemaining = maxPicks - picksUsed
  const heistProgress = Math.min(100, Math.round((picksUsed / maxPicks) * 100))
  const currentStage = getVaultHeistStage(picksUsed)
  const ringMultiplier = currentRing === 3 ? 10 : currentRing === 2 ? 3 : 1
  const pickCost = freePicksRemaining > 0 ? 0 : 100
  const alarmBribeCost = 250
  const selectedCrew = getVaultHeistCrew(selectedCrewId)
  const selectedGear = getVaultHeistGear(selectedGearId)
  const adjustedOdds = applyVaultHeistModifiers(
    currentStage.alarmWeight,
    currentStage.rewardMultiplier,
    selectedCrew,
    selectedGear,
  )

  // Select random prize based on weights
  const selectPrize = useCallback((alarmWeight: number): VaultPrize => {
    const totalPrizeWeight = VAULT_PRIZES.reduce((sum, p) => sum + p.weight, 0)
    const totalWeight = totalPrizeWeight + alarmWeight
    let random = Math.random() * totalWeight

    if (random <= alarmWeight) return { ...ALARM_PRIZE }
    random -= alarmWeight

    for (const { prize, weight } of VAULT_PRIZES) {
      random -= weight
      if (random <= 0) return { ...prize }
    }
    return VAULT_PRIZES[0].prize
  }, [])

  const applyStageMultiplier = useCallback((prize: VaultPrize, multiplier: number): VaultPrize => {
    if (prize.type === 'alarm' || prize.type === 'mystery') return prize

    const adjustedAmount = Math.round(prize.amount * multiplier)
    const label =
      prize.type === 'cash'
        ? `$${adjustedAmount.toLocaleString()}`
        : `${adjustedAmount.toLocaleString()} ${prize.type === 'stars' ? 'Stars' : 'Coins'}`

    return { ...prize, amount: adjustedAmount, label }
  }, [])

  // Handle vault crack
  const crackVault = useCallback((vaultId: number) => {
    if (picksRemaining <= 0 || isGameOver || isPickResolving || isAlarmDecisionActive) return
    
    const vault = vaults.find(v => v.id === vaultId)
    if (!vault || vault.state !== 'locked') return

    const stage = getVaultHeistStage(picksUsed)
    const crew = getVaultHeistCrew(selectedCrewId)
    const gear = getVaultHeistGear(selectedGearId)
    const odds = applyVaultHeistModifiers(stage.alarmWeight, stage.rewardMultiplier, crew, gear)
    const rewardMultiplier = ringMultiplier * odds.rewardMultiplier

    setIsPickResolving(true)
    setResolutionState('cracking')
    setLastResultLabel('Cracking vault...')
    setPicksUsed(prev => prev + 1)
    const nextPicksUsed = picksUsed + 1

    // Check if need to pay
    if (pickCost > 0 && !onSpendCoins(pickCost)) {
      playSound('error')
      setPicksUsed(prev => Math.max(0, prev - 1))
      setIsPickResolving(false)
      setResolutionState('idle')
      setLastResultLabel('Not enough coins for that pick.')
      return
    }

    // Start cracking animation
    playSound('dice-roll') // vault-crack sound
    setVaults(prev => prev.map(v => 
      v.id === vaultId ? { ...v, state: 'cracking' } : v
    ))

    // After crack animation, reveal prize
    setTimeout(() => {
      const prize = selectPrize(odds.alarmWeight)
      const isAlarm = prize.type === 'alarm'
      const resolvedPrize = isAlarm ? prize : applyStageMultiplier(prize, rewardMultiplier)

      setVaults(prev => prev.map(v => 
        v.id === vaultId ? { ...v, state: isAlarm ? 'alarm' : 'opened', prize: resolvedPrize } : v
      ))
      setResolutionState(isAlarm ? 'alarm' : 'reveal')

      if (isAlarm) {
        playSound('error')
        setLastResultLabel('🚨 Alarm triggered! The vault is compromised.')
        setIsAlarmDecisionActive(true)
        setIsPickResolving(false)
        // Alarm doesn't give a prize but still consumes a pick
        // The pick counter will be incremented below (line 132) regardless of alarm
      } else {
        // Apply multiplier and add to haul
        const multipliedAmount = resolvedPrize.type === 'mystery' ? resolvedPrize.amount : resolvedPrize.amount
        
        setHaul(prev => ({
          cash: prev.cash + (prize.type === 'cash' ? multipliedAmount : 0),
          stars: prev.stars + (prize.type === 'stars' ? multipliedAmount : 0),
          coins: prev.coins + (prize.type === 'coins' ? multipliedAmount : 0),
          mysteryBoxes: prev.mysteryBoxes + (prize.type === 'mystery' ? 1 : 0),
        }))
        
        setCollectedPrizes(prev => [...prev, resolvedPrize])
        setLastResultLabel(`Loot secured: ${resolvedPrize.label}`)
        
        if (multipliedAmount >= 10000) {
          playSound('big-win')
        } else {
          playSound('cha-ching')
        }
      }

      // Check if game over
      if (nextPicksUsed >= maxPicks) {
        setTimeout(() => setIsGameOver(true), 1000)
      }
      setTimeout(() => {
        if (isAlarm) {
          setResolutionState('alarm')
        } else {
          setResolutionState('resolved')
          setIsPickResolving(false)
        }
      }, 350)
    }, 800) // Crack animation duration
  }, [
    vaults,
    picksRemaining,
    isGameOver,
    isPickResolving,
    isAlarmDecisionActive,
    pickCost,
    onSpendCoins,
    selectPrize,
    ringMultiplier,
    playSound,
    picksUsed,
    applyStageMultiplier,
    selectedCrewId,
    selectedGearId,
  ])

  const handleBailOut = useCallback(() => {
    setIsAlarmDecisionActive(false)
    setResolutionState('resolved')
    setLastResultLabel('You bailed out with your haul. Heist over.')
    setIsGameOver(true)
  }, [])

  const handleBribe = useCallback(() => {
    if (!onSpendCoins(alarmBribeCost)) {
      playSound('error')
      setLastResultLabel('Not enough coins to bribe the guards.')
      return
    }
    playSound('cha-ching')
    setIsAlarmDecisionActive(false)
    setResolutionState('resolved')
    setLastResultLabel('Bribe paid. The crew is back in action.')
    setIsPickResolving(false)
  }, [alarmBribeCost, onSpendCoins, playSound])

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
      setIsPickResolving(false)
      setIsAlarmDecisionActive(false)
      setResolutionState('idle')
      setLastResultLabel('Choose a hatch to start the heist.')
      setSelectedCrewId(VAULT_HEIST_CREWS[0].id)
      setSelectedGearId(VAULT_HEIST_GEAR[0].id)
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

        {/* Pre-heist selections */}
        <div className="px-6 pt-6">
          <div className="bg-slate-700/40 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-amber-300">Crew &amp; Gear (optional)</h3>
              {picksUsed > 0 && (
                <span className="text-[11px] text-slate-300">Locked after first pick</span>
              )}
            </div>
            <div className="mb-3">
              <p className="text-[11px] text-slate-300 mb-2">Choose a crew</p>
              <div className="flex flex-wrap gap-2">
                {VAULT_HEIST_CREWS.map(crew => (
                  <button
                    key={crew.id}
                    onClick={() => setSelectedCrewId(crew.id)}
                    disabled={picksUsed > 0 || isPickResolving}
                    className={`px-3 py-1 rounded-full text-[11px] border transition ${
                      crew.id === selectedCrewId
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'border-slate-600 text-slate-300 hover:border-amber-400'
                    } ${picksUsed > 0 || isPickResolving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={crew.description}
                  >
                    {crew.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-300 mb-2">Choose gear</p>
              <div className="flex flex-wrap gap-2">
                {VAULT_HEIST_GEAR.map(gear => (
                  <button
                    key={gear.id}
                    onClick={() => setSelectedGearId(gear.id)}
                    disabled={picksUsed > 0 || isPickResolving}
                    className={`px-3 py-1 rounded-full text-[11px] border transition ${
                      gear.id === selectedGearId
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'border-slate-600 text-slate-300 hover:border-purple-400'
                    } ${picksUsed > 0 || isPickResolving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={gear.description}
                  >
                    {gear.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heist HUD */}
        <div className="px-6">
          <div className="bg-slate-800/60 rounded-2xl p-4 mb-4 border border-slate-700/60">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: maxPicks }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < picksRemaining ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-300">{picksRemaining} picks left</span>
              </div>
              <div className="text-slate-300">
                Stage {currentStage.id}: <span className="text-white">{currentStage.name}</span>
              </div>
              <div className="text-slate-300">
                Alarm risk: <span className="text-amber-200">{currentStage.alarmRiskLabel}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Heist meter</span>
                <span>{heistProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all"
                  style={{ width: `${heistProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vaults Grid */}
        <div className="p-6">
          <div className="flex justify-center gap-3 mb-6">
            {vaults.map(vault => (
              <motion.button
                key={vault.id}
                onClick={() => crackVault(vault.id)}
                disabled={vault.state !== 'locked' || picksRemaining <= 0 || isPickResolving || isAlarmDecisionActive}
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
                    <span className="text-[10px] text-white">
                      {vault.prize.type === 'cash' 
                        ? `$${vault.prize.amount.toLocaleString()}` 
                        : vault.prize.type === 'stars'
                        ? `${vault.prize.amount.toLocaleString()}`
                        : vault.prize.type === 'coins'
                        ? `${vault.prize.amount.toLocaleString()}`
                        : vault.prize.label
                      }
                    </span>
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

          <div className="text-center text-xs text-slate-200 mb-2">
            Stage bonus: {currentStage.rewardMultiplier}× · Alarm weight {adjustedOdds.alarmWeight}
          </div>
          <div className="text-center text-[11px] text-slate-300 mb-2">
            Crew: {selectedCrew.name} · Gear: {selectedGear.name} · Bonus {adjustedOdds.rewardMultiplier.toFixed(2)}×
          </div>
          <div className="text-center text-xs text-amber-200 mb-4">
            {resolutionState === 'cracking'
              ? 'Cracking vault...'
              : resolutionState === 'reveal'
              ? 'Revealing the haul...'
              : resolutionState === 'alarm'
              ? 'Alarm triggered — choose to bail or bribe.'
              : resolutionState === 'resolved'
              ? lastResultLabel
              : lastResultLabel}
          </div>
          {isPickResolving && (
            <div className="text-center text-xs text-amber-200 mb-4">
              Locking vaults…
            </div>
          )}

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

        {isAlarmDecisionActive && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-6">
            <div className="w-full max-w-sm rounded-2xl border border-red-400/60 bg-slate-900/95 p-5 text-center shadow-2xl">
              <h3 className="text-lg font-semibold text-red-300 mb-2">🚨 Alarm Decision</h3>
              <p className="text-xs text-slate-200 mb-4">
                Security is on the way. Bail out now to keep your haul, or bribe the guards to keep
                cracking vaults.
              </p>
              <div className="grid gap-3">
                <button
                  onClick={handleBailOut}
                  className="w-full rounded-xl border border-amber-400/60 bg-amber-500/10 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/20"
                >
                  🏃 Bail &amp; Keep Haul
                </button>
                <button
                  onClick={handleBribe}
                  className="w-full rounded-xl border border-emerald-400/60 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
                >
                  💸 Bribe for {alarmBribeCost} 🪙
                </button>
                <p className="text-[11px] text-slate-400">
                  Bribes spend coins immediately and keep your picks alive.
                </p>
              </div>
            </div>
          </div>
        )}

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
