import { Button } from '@/components/ui/button'
import { casinoConfig } from '@/config/casino'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'
import { getRewardSound } from '@/lib/sounds'
import {
  getHighRollerDiceOddsSummary,
  getHighRollerDiceStreakMultiplier,
} from '@/lib/highRollerDiceOdds'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface HighRollerDiceGameProps {
  onWin?: (amount: number) => void
  luckBoost?: number
  guaranteedWin?: boolean
  cashBalance: number
  onSpend?: (amount: number) => boolean
}

type RollOutcome = {
  dice: [number, number]
  total: number
  isWin: boolean
  reason: 'roll' | 'luck' | 'guaranteed'
  payout: number
  multiplier: number
}

const rollDice = (shouldWin: boolean, target: number) => {
  let dieOne = 1
  let dieTwo = 1
  let total = 2
  do {
    dieOne = Math.floor(Math.random() * 6) + 1
    dieTwo = Math.floor(Math.random() * 6) + 1
    total = dieOne + dieTwo
  } while (shouldWin && total < target)
  return { dice: [dieOne, dieTwo] as [number, number], total }
}

export function HighRollerDiceGame({
  onWin,
  luckBoost,
  guaranteedWin,
  cashBalance,
  onSpend,
}: HighRollerDiceGameProps) {
  const diceConfig = casinoConfig.dice
  const { play: playSound } = useSound()
  const { roll: hapticRoll, success: hapticSuccess, warning: hapticWarning } = useHaptics()
  const [selectedOptionId, setSelectedOptionId] = useState(diceConfig.options[0]?.id ?? '')
  const [selectedBuyInId, setSelectedBuyInId] = useState(diceConfig.buyIns[0]?.id ?? '')
  const [isRolling, setIsRolling] = useState(false)
  const [streak, setStreak] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<RollOutcome | null>(null)
  const [currentStreakPayout, setCurrentStreakPayout] = useState(0)
  const [lastStreakSummary, setLastStreakSummary] = useState<{ length: number; payout: number } | null>(null)
  const [sessionStats, setSessionStats] = useState({
    rolls: 0,
    wins: 0,
    totalPayout: 0,
    bestStreak: 0,
  })

  const selectedBuyIn = useMemo(
    () => diceConfig.buyIns.find((buyIn) => buyIn.id === selectedBuyInId) ?? diceConfig.buyIns[0],
    [diceConfig.buyIns, selectedBuyInId],
  )

  const selectedOption = useMemo(
    () => diceConfig.options.find((option) => option.id === selectedOptionId) ?? diceConfig.options[0],
    [diceConfig.options, selectedOptionId],
  )

  if (!selectedOption || !selectedBuyIn) {
    return null
  }

  const buyInMultiplier = selectedBuyIn.multiplier
  const buyInEntry = selectedBuyIn.entry
  const isBuyInAffordable = cashBalance >= buyInEntry
  const buyInShortfall = Math.max(0, buyInEntry - cashBalance)
  const adjustedOption = useMemo(
    () => ({
      ...selectedOption,
      payout: Math.round(selectedOption.payout * buyInMultiplier),
    }),
    [selectedOption, buyInMultiplier],
  )

  const resetSession = () => {
    if (isRolling) {
      return
    }
    setStreak(0)
    setLastOutcome(null)
    setCurrentStreakPayout(0)
    setLastStreakSummary(null)
    setSessionStats({
      rolls: 0,
      wins: 0,
      totalPayout: 0,
      bestStreak: 0,
    })
  }

  const handleRoll = () => {
    if (isRolling) {
      return
    }
    if (!isBuyInAffordable) {
      toast.error('Not enough cash for the buy-in', {
        description: `You need $${buyInShortfall.toLocaleString()} more to cover the ${selectedBuyIn.label} entry.`,
      })
      return
    }
    if (onSpend && !onSpend(buyInEntry)) {
      return
    }
    playSound('dice-roll')
    hapticRoll()
    setIsRolling(true)

    const shouldGuaranteeWin = Boolean(guaranteedWin)
    const roll = rollDice(shouldGuaranteeWin, adjustedOption.target)
    let isWin = roll.total >= adjustedOption.target
    let reason: RollOutcome['reason'] = 'roll'

    if (!isWin && luckBoost && luckBoost > 0 && Math.random() < luckBoost) {
      const luckyRoll = rollDice(true, adjustedOption.target)
      roll.dice = luckyRoll.dice
      roll.total = luckyRoll.total
      isWin = true
      reason = 'luck'
    }

    if (shouldGuaranteeWin) {
      isWin = true
      reason = 'guaranteed'
    }

    const nextStreak = isWin ? Math.min(streak + 1, diceConfig.streakCap) : 0
    const multiplier = getHighRollerDiceStreakMultiplier(adjustedOption, nextStreak)
    const payout = isWin ? Math.round(adjustedOption.payout * multiplier) : 0

    const outcome: RollOutcome = {
      dice: roll.dice,
      total: roll.total,
      isWin,
      reason,
      payout,
      multiplier,
    }

    setTimeout(() => {
      setIsRolling(false)
      setLastOutcome(outcome)
      setStreak(nextStreak)
      setSessionStats((prev) => ({
        rolls: prev.rolls + 1,
        wins: prev.wins + (isWin ? 1 : 0),
        totalPayout: prev.totalPayout + payout,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      }))
      if (isWin) {
        setCurrentStreakPayout((prev) => prev + payout)
      } else {
        if (streak > 0) {
          setLastStreakSummary({ length: streak, payout: currentStreakPayout })
        }
        setCurrentStreakPayout(0)
      }
      playSound('dice-land')
      if (isWin && payout > 0) {
        playSound(getRewardSound('cash', payout))
        hapticSuccess()
        onWin?.(payout)
      } else if (!isWin) {
        playSound('swipe-no')
        hapticWarning()
      }
    }, 450)
  }

  const streakPreview = Math.max(1, streak || 1)
  const oddsSummary = getHighRollerDiceOddsSummary(adjustedOption, {
    luckBoost,
    guaranteedWin,
    streak: streakPreview,
    streakCap: diceConfig.streakCap,
  })
  const streakMultiplier = oddsSummary.streakMultiplier
  const maxStreakMultiplier = oddsSummary.maxStreakMultiplier
  const payoutLabel = `${adjustedOption.payout.toLocaleString()} cash`
  const boostedPayoutLabel = `${oddsSummary.payoutPerWin.toLocaleString()} cash`
  const maxPayoutLabel = `${oddsSummary.maxPayout.toLocaleString()} cash`
  const winChanceLabel = `${(oddsSummary.adjustedWinChance * 100).toFixed(0)}%`
  const baseWinChanceLabel = `${(oddsSummary.baseWinChance * 100).toFixed(0)}%`
  const expectedPayoutLabel = `${Math.round(oddsSummary.expectedPayout).toLocaleString()} cash`
  const winRateLabel =
    sessionStats.rolls > 0 ? `${Math.round((sessionStats.wins / sessionStats.rolls) * 100)}%` : '—'
  const buyInEntryLabel = `${selectedBuyIn.entry.toLocaleString()} cash`
  const buyInMultiplierLabel = `x${buyInMultiplier.toFixed(2)}`
  const cashBalanceLabel = `$${cashBalance.toLocaleString()}`
  const buyInShortfallLabel = `$${buyInShortfall.toLocaleString()} more`

  return (
    <div className="rounded-xl border border-purple-500/40 bg-purple-950/50 p-4 text-purple-100/80">
      <p className="text-xs uppercase tracking-wide text-purple-100/60">VIP Dice Table</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{diceConfig.title}</h3>
      <p className="text-sm text-purple-100/70">{diceConfig.description}</p>

      {guaranteedWin && (
        <div className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100/80">
          Happy Hour active: your next roll is locked as a win.
        </div>
      )}
      {!guaranteedWin && luckBoost && luckBoost > 0 && (
        <div className="mt-3 rounded-lg border border-purple-300/30 bg-purple-900/40 px-3 py-2 text-xs text-purple-100/80">
          Casino Luck active: +{(luckBoost * 100).toFixed(0)}% win chance.
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {diceConfig.buyIns.map((buyIn) => {
          const isSelected = buyIn.id === selectedBuyIn.id
          const isAffordable = cashBalance >= buyIn.entry
          return (
            <Button
              key={buyIn.id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => {
                if (isRolling) {
                  return
                }
                setSelectedBuyInId(buyIn.id)
                resetSession()
              }}
              className={
                isSelected
                  ? 'h-auto min-h-[84px] items-start whitespace-normal border-emerald-300/80 bg-gradient-to-br from-emerald-500/80 to-teal-500/70 px-3 py-2 text-left text-white'
                  : 'h-auto min-h-[84px] items-start whitespace-normal border-emerald-300/30 px-3 py-2 text-left text-emerald-100/80'
              }
              disabled={isRolling || (!isAffordable && !isSelected)}
            >
              <span className="flex w-full flex-col gap-1">
                <span className="text-sm font-semibold">{buyIn.label}</span>
                <span className="text-[11px] text-emerald-100/70">{buyIn.description}</span>
                <span className="text-[11px] text-emerald-100/70">
                  Buy-in {buyIn.entry.toLocaleString()} cash · Payout {`x${buyIn.multiplier.toFixed(2)}`}
                </span>
                {!isAffordable && (
                  <span className="text-[10px] uppercase tracking-wide text-amber-200/80">
                    Need {`$${(buyIn.entry - cashBalance).toLocaleString()}`} more
                  </span>
                )}
              </span>
            </Button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {diceConfig.options.map((option) => {
          const isSelected = option.id === selectedOption.id
          const adjustedTableOption = {
            ...option,
            payout: Math.round(option.payout * buyInMultiplier),
          }
          const optionOddsSummary = getHighRollerDiceOddsSummary(adjustedTableOption, {
            luckBoost,
            guaranteedWin,
            streak: 1,
            streakCap: diceConfig.streakCap,
          })
          return (
            <Button
              key={option.id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setSelectedOptionId(option.id)}
              className={
                isSelected
                  ? 'h-auto min-h-[88px] items-start whitespace-normal border-purple-300/80 bg-gradient-to-br from-purple-500/80 to-pink-500/70 px-3 py-2 text-left text-white'
                  : 'h-auto min-h-[88px] items-start whitespace-normal border-purple-400/40 px-3 py-2 text-left text-purple-100/80'
              }
            >
              <span className="flex w-full flex-col gap-1">
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-[11px] text-purple-100/70">{option.description}</span>
                <span className="text-[11px] text-purple-100/70">
                  Target {option.target}+ · Payout {adjustedTableOption.payout.toLocaleString()} cash
                </span>
                <span className="text-[11px] text-purple-100/70">
                  Win {(optionOddsSummary.adjustedWinChance * 100).toFixed(0)}% · EV ~
                  {Math.round(optionOddsSummary.expectedPayout).toLocaleString()} cash
                </span>
              </span>
            </Button>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg border border-purple-400/30 bg-purple-950/40 p-3 text-xs text-purple-100/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            Streak: <span className="font-semibold text-purple-50">{streak}</span> /
            {diceConfig.streakCap}
          </span>
          <span>
            Payout: <span className="font-semibold text-purple-50">{payoutLabel}</span>
          </span>
          <span>
            Buy-in: <span className="font-semibold text-purple-50">{buyInEntryLabel}</span>
          </span>
          <span>
            Streak boost: <span className="font-semibold text-purple-50">x{streakMultiplier.toFixed(2)}</span>
          </span>
          <span>
            Buy-in boost: <span className="font-semibold text-purple-50">{buyInMultiplierLabel}</span>
          </span>
          <span>
            Balance: <span className="font-semibold text-purple-50">{cashBalanceLabel}</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] text-purple-100/60">
          Win chance {winChanceLabel} (base {baseWinChanceLabel}). EV ~{expectedPayoutLabel} per roll.
        </p>
        <p className="mt-1 text-[11px] text-purple-100/60">
          Win to grow your streak. Max streak payout hits {maxPayoutLabel}.
        </p>
        {!isBuyInAffordable && (
          <p className="mt-2 text-[11px] text-amber-200/80">
            Insufficient cash for this buy-in. Add {buyInShortfallLabel} to roll.
          </p>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-purple-400/20 bg-purple-950/30 p-3 text-xs text-purple-100/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            Session rolls: <span className="font-semibold text-purple-50">{sessionStats.rolls}</span>
          </span>
          <span>
            Wins: <span className="font-semibold text-purple-50">{sessionStats.wins}</span> ({winRateLabel})
          </span>
          <span>
            Total payout:{' '}
            <span className="font-semibold text-purple-50">{sessionStats.totalPayout.toLocaleString()} cash</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] text-purple-100/60">
          Best streak this session: {sessionStats.bestStreak} win{sessionStats.bestStreak === 1 ? '' : 's'}.
        </p>
        <p className="mt-1 text-[11px] text-purple-100/60">
          Buy-in tier: <span className="font-semibold text-purple-50">{selectedBuyIn.label}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetSession}
            disabled={isRolling}
            className="h-8 border-purple-300/40 text-purple-100/80 hover:text-white"
          >
            Reset session
          </Button>
          <span className="text-[11px] text-purple-100/50">Resets streak + session stats.</span>
        </div>
      </div>

      {(lastOutcome || isRolling) && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            lastOutcome?.isWin
              ? 'border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
              : 'border-purple-400/30 bg-purple-900/30'
          } ${isRolling ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-100/60">Last roll</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                lastOutcome?.isWin
                  ? 'bg-emerald-400/20 text-emerald-100/80'
                  : 'bg-slate-700/40 text-slate-200/80'
              }`}
            >
              {isRolling ? 'Rolling' : lastOutcome?.isWin ? 'Win' : 'Miss'}
            </span>
          </div>
          {isRolling ? (
            <p className="mt-2 text-sm text-purple-100/70">Dice are in the air…</p>
          ) : (
            lastOutcome && (
              <>
                <div className="mt-2 flex items-center gap-3 text-lg font-semibold text-white">
                  <span className="rounded-md border border-purple-400/30 bg-purple-950/60 px-3 py-1">
                    🎲 {lastOutcome.dice[0]}
                  </span>
                  <span className="rounded-md border border-purple-400/30 bg-purple-950/60 px-3 py-1">
                    🎲 {lastOutcome.dice[1]}
                  </span>
                  <span className="text-purple-100/80">Total {lastOutcome.total}</span>
                </div>
                {lastOutcome.isWin && (
                  <p className="mt-2 text-sm text-emerald-100/80">
                    +{lastOutcome.payout.toLocaleString()} cash awarded · x{lastOutcome.multiplier.toFixed(2)} streak
                    boost.
                  </p>
                )}
                {!lastOutcome.isWin && (
                  <p className="mt-2 text-sm text-purple-100/70">
                    Tight roll. Streak reset — pick a new table and try again.
                  </p>
                )}
                {!lastOutcome.isWin && lastStreakSummary && lastStreakSummary.length > 0 && (
                  <p className="mt-1 text-[11px] text-purple-100/70">
                    Streak recap: {lastStreakSummary.length} win{lastStreakSummary.length === 1 ? '' : 's'} for{' '}
                    {lastStreakSummary.payout.toLocaleString()} cash.
                  </p>
                )}
                {lastOutcome.isWin && lastOutcome.reason !== 'roll' && (
                  <p className="mt-1 text-[11px] text-emerald-200/80">
                    {lastOutcome.reason === 'guaranteed'
                      ? 'Happy Hour locked the win.'
                      : 'Casino Luck saved the roll.'}
                  </p>
                )}
              </>
            )
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-purple-100/60">
          Target {adjustedOption.target}+ · Next payout {boostedPayoutLabel}
        </span>
        <Button
          type="button"
          onClick={handleRoll}
          disabled={isRolling || !isBuyInAffordable}
          className="h-10 bg-gradient-to-r from-purple-500/90 to-pink-500/80 text-white"
        >
          {isRolling ? 'Rolling...' : !isBuyInAffordable ? `Need ${buyInShortfallLabel}` : 'Roll the dice'}
        </Button>
      </div>
    </div>
  )
}
