import { Button } from '@/components/ui/button'
import { casinoConfig, type CasinoDiceOption } from '@/config/casino'
import { useMemo, useState } from 'react'

interface HighRollerDiceGameProps {
  onWin?: (amount: number) => void
  luckBoost?: number
  guaranteedWin?: boolean
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

const getStreakMultiplier = (option: CasinoDiceOption, streak: number) =>
  1 + Math.max(0, streak - 1) * option.streakBonus

export function HighRollerDiceGame({
  onWin,
  luckBoost,
  guaranteedWin,
}: HighRollerDiceGameProps) {
  const diceConfig = casinoConfig.dice
  const [selectedOptionId, setSelectedOptionId] = useState(diceConfig.options[0]?.id ?? '')
  const [isRolling, setIsRolling] = useState(false)
  const [streak, setStreak] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<RollOutcome | null>(null)

  const selectedOption = useMemo(
    () => diceConfig.options.find((option) => option.id === selectedOptionId) ?? diceConfig.options[0],
    [diceConfig.options, selectedOptionId],
  )

  if (!selectedOption) {
    return null
  }

  const handleRoll = () => {
    if (isRolling) {
      return
    }
    setIsRolling(true)

    const shouldGuaranteeWin = Boolean(guaranteedWin)
    const roll = rollDice(shouldGuaranteeWin, selectedOption.target)
    let isWin = roll.total >= selectedOption.target
    let reason: RollOutcome['reason'] = 'roll'

    if (!isWin && luckBoost && luckBoost > 0 && Math.random() < luckBoost) {
      const luckyRoll = rollDice(true, selectedOption.target)
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
    const multiplier = getStreakMultiplier(selectedOption, nextStreak)
    const payout = isWin ? Math.round(selectedOption.payout * multiplier) : 0

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
      if (isWin && payout > 0) {
        onWin?.(payout)
      }
    }, 450)
  }

  const streakMultiplier = getStreakMultiplier(selectedOption, Math.max(1, streak || 1))
  const payoutLabel = `${selectedOption.payout.toLocaleString()} cash`
  const boostedPayoutLabel = `${Math.round(selectedOption.payout * streakMultiplier).toLocaleString()} cash`

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
        {diceConfig.options.map((option) => {
          const isSelected = option.id === selectedOption.id
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
                  Target {option.target}+ · Base {option.payout.toLocaleString()} cash
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
            Streak boost: <span className="font-semibold text-purple-50">x{streakMultiplier.toFixed(2)}</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] text-purple-100/60">
          Win to grow your streak. Each streak step boosts payout until the streak cap.
        </p>
      </div>

      {lastOutcome && (
        <div className="mt-4 rounded-lg border border-purple-400/30 bg-purple-900/30 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-purple-100/60">Last roll</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                lastOutcome.isWin ? 'bg-emerald-400/20 text-emerald-100/80' : 'bg-slate-700/40 text-slate-200/80'
              }`}
            >
              {lastOutcome.isWin ? 'Win' : 'Miss'}
            </span>
          </div>
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
              +{lastOutcome.payout.toLocaleString()} cash awarded · x{lastOutcome.multiplier.toFixed(2)} streak boost.
            </p>
          )}
          {!lastOutcome.isWin && (
            <p className="mt-2 text-sm text-purple-100/70">
              Tight roll. Streak reset — pick a new table and try again.
            </p>
          )}
          {lastOutcome.isWin && lastOutcome.reason !== 'roll' && (
            <p className="mt-1 text-[11px] text-emerald-200/80">
              {lastOutcome.reason === 'guaranteed' ? 'Happy Hour locked the win.' : 'Casino Luck saved the roll.'}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-purple-100/60">
          Target {selectedOption.target}+ · Next payout {boostedPayoutLabel}
        </span>
        <Button
          type="button"
          onClick={handleRoll}
          disabled={isRolling}
          className="h-10 bg-gradient-to-r from-purple-500/90 to-pink-500/80 text-white"
        >
          {isRolling ? 'Rolling...' : 'Roll the dice'}
        </Button>
      </div>
    </div>
  )
}
