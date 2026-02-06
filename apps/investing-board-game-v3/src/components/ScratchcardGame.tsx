import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LockSimple, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  getScratchcardTier,
  type ScratchcardPrize,
  type ScratchcardPrizeResult,
  type ScratchcardTier,
  type ScratchcardTierId,
} from '@/lib/scratchcardTiers'
import {
  buildScratchcardGrid,
  evaluateScratchcardResults,
  getScratchcardWinningLines,
} from '@/lib/evaluateScratchcard'
import { getScratchcardOddsSummary } from '@/lib/scratchcardOdds'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'
import { getRewardSound } from '@/lib/sounds'

interface ScratchcardGameProps {
  onWin?: (amount: number) => void
  onResults?: (results: ScratchcardPrizeResult[]) => void
  onClose: () => void
  luckBoost?: number // Percentage boost to win chance (0-1)
  tierId?: ScratchcardTierId
  tier?: ScratchcardTier
}

const currencyLabel = (currency: ScratchcardPrize['currency']) => {
  switch (currency) {
    case 'coins':
      return '🪙'
    case 'stars':
      return '⭐'
    case 'xp':
      return 'XP'
    default:
      return '$'
  }
}

const entryCostLabel = (currency: ScratchcardTier['entryCost']['currency']) => {
  switch (currency) {
    case 'coins':
      return '🪙'
    case 'stars':
      return '⭐'
    default:
      return '$'
  }
}

const lineAccents = [
  {
    tile: 'ring-yellow-300/90 shadow-[0_0_12px_rgba(250,204,21,0.6)]',
    badge: 'bg-yellow-300/80 text-yellow-950',
  },
  {
    tile: 'ring-emerald-300/90 shadow-[0_0_12px_rgba(110,231,183,0.6)]',
    badge: 'bg-emerald-300/80 text-emerald-950',
  },
  {
    tile: 'ring-sky-300/90 shadow-[0_0_12px_rgba(125,211,252,0.6)]',
    badge: 'bg-sky-300/80 text-sky-950',
  },
  {
    tile: 'ring-pink-300/90 shadow-[0_0_12px_rgba(249,168,212,0.6)]',
    badge: 'bg-pink-300/80 text-pink-950',
  },
]

export function ScratchcardGame({
  onWin,
  onResults,
  onClose,
  luckBoost = 0,
  tierId = 'bronze',
  tier: providedTier,
}: ScratchcardGameProps) {
  const tier = useMemo(() => providedTier ?? getScratchcardTier(tierId), [providedTier, tierId])
  const [grid, setGrid] = useState<string[]>(() => buildScratchcardGrid(tier, luckBoost))
  const { lightTap, mediumTap, success: hapticSuccess, warning: hapticWarning } = useHaptics()
  const { play } = useSound()

  const totalCells = tier.grid.rows * tier.grid.columns
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(totalCells).fill(false))
  const [gameOver, setGameOver] = useState(false)
  const [prizeResults, setPrizeResults] = useState<ScratchcardPrizeResult[]>([])
  const [winningLineIndices, setWinningLineIndices] = useState<Set<number>>(new Set())
  const [winningLines, setWinningLines] = useState<
    ReturnType<typeof getScratchcardWinningLines>
  >([])
  const [showOdds, setShowOdds] = useState(false)
  const lineHighlightClasses = useMemo(() => {
    const classes = Array(totalCells).fill('')
    winningLines.forEach((line, lineIndex) => {
      const accent = lineAccents[lineIndex % lineAccents.length].tile
      line.indices.forEach((index) => {
        if (!classes[index]) {
          classes[index] = accent
        }
      })
    })
    return classes
  }, [totalCells, winningLines])
  const lineBadgeByIndex = useMemo(() => {
    const badges: Array<number | null> = Array(totalCells).fill(null)
    winningLines.forEach((line, lineIndex) => {
      line.indices.forEach((index) => {
        if (badges[index] === null) {
          badges[index] = lineIndex
        }
      })
    })
    return badges
  }, [totalCells, winningLines])
  const lineBadgeClass = (lineIndex: number) => lineAccents[lineIndex % lineAccents.length].badge

  useEffect(() => {
    const freshGrid = buildScratchcardGrid(tier, luckBoost)
    setGrid(freshGrid)
    setRevealed(Array(tier.grid.rows * tier.grid.columns).fill(false))
    setGameOver(false)
    setPrizeResults([])
    setWinningLineIndices(new Set())
    setWinningLines([])
    setShowOdds(false)
  }, [tier, luckBoost])

  const handleReveal = (index: number) => {
    if (revealed[index] || gameOver) return
    
    const newRevealed = [...revealed]
    newRevealed[index] = true
    setRevealed(newRevealed)
    lightTap()
    play('button-click')

    // Check if all are revealed
    if (newRevealed.every(r => r)) {
      checkWin()
    }
  }

  const revealAll = () => {
    mediumTap()
    play('button-click')
    setRevealed(Array(totalCells).fill(true))
    checkWin()
  }

  const checkWin = () => {
    setGameOver(true)

    const winningLines = getScratchcardWinningLines(grid, tier).slice(0, tier.prizeSlots)
    const winningIndices = new Set<number>()
    winningLines.forEach((line) => {
      line.indices.forEach((index) => winningIndices.add(index))
    })
    setWinningLineIndices(winningIndices)
    setWinningLines(winningLines)

    const results = evaluateScratchcardResults(grid, tier)
    if (results.length === 0) {
      toast.info('No match this time', {
        description: 'Better luck next time!',
      })
      setPrizeResults([])
      onResults?.([])
      setWinningLineIndices(new Set())
      setWinningLines([])
      hapticWarning()
      play('swipe-no')
      return
    }

    setPrizeResults(results)
    onResults?.(results)
    const totalCash = results
      .filter((prize) => prize.currency === 'cash')
      .reduce((sum, prize) => sum + prize.amount, 0)
    if (totalCash > 0 && onWin) {
      onWin(totalCash)
    }

    const summary = results
      .map((prize) => {
        const label = currencyLabel(prize.currency)
        return `${label}${prize.amount.toLocaleString()}`
      })
      .join(', ')
    toast.success('🎉 You hit winning lines!', {
      description: `Prizes: ${summary}`,
    })
    hapticSuccess()
    const highlightPrize = results.reduce((best, prize) => {
      if (!best) return prize
      if (prize.amount > best.amount) return prize
      return best
    }, null as ScratchcardPrizeResult | null)
    if (highlightPrize) {
      play(getRewardSound(highlightPrize.currency, highlightPrize.amount))
    }
  }

  const totalWinnings = prizeResults.reduce((sum, prize) => sum + prize.amount, 0)
  const totalsByCurrency = useMemo(() => {
    return prizeResults.reduce<Record<ScratchcardPrize['currency'], number>>(
      (totals, prize) => {
        totals[prize.currency] += prize.amount
        return totals
      },
      {
        cash: 0,
        coins: 0,
        stars: 0,
        xp: 0,
      },
    )
  }, [prizeResults])
  const totalsSummary = useMemo(() => {
    return Object.entries(totalsByCurrency)
      .filter(([, amount]) => amount > 0)
      .map(([currency, amount]) => {
        return `${currencyLabel(currency as ScratchcardPrize['currency'])}${amount.toLocaleString()}`
      })
  }, [totalsByCurrency])
  const revealedCount = useMemo(() => revealed.filter(Boolean).length, [revealed])
  const revealThreshold = Math.min(3, Math.max(1, totalCells - 1))
  const fastRevealUnlocked = revealedCount >= revealThreshold
  const scratchesUntilUnlock = Math.max(revealThreshold - revealedCount, 0)
  const hasJackpot = prizeResults.some((prize) => prize.label.toLowerCase().includes('jackpot'))
  const isBigWin =
    prizeResults.length > 1 || hasJackpot || totalWinnings >= tier.entryCost.amount * 10
  const evSummary = useMemo(() => getScratchcardOddsSummary(tier).evSummary, [tier])
  const patternLabel = (pattern: ScratchcardPrizeResult['pattern']) => {
    switch (pattern) {
      case 'row':
        return 'Row match'
      case 'diagonal':
        return 'Diagonal match'
      case 'bonus':
        return 'Bonus match'
      default:
        return 'Match'
    }
  }

  return (
    <Card className="w-full max-w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Sparkle size={24} className="text-yellow-400" />
          {tier.name} Scratchcard
          <Sparkle size={24} className="text-yellow-400" />
        </CardTitle>
        <p className="text-sm text-center text-muted-foreground mt-2">
          Scratch to reveal! Win lines pay out multiple prizes.
        </p>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Entry cost: {entryCostLabel(tier.entryCost.currency)}
          {tier.entryCost.amount.toLocaleString()}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOdds((prev) => !prev)}
            className="h-7 px-3 text-xs text-purple-100/80 hover:text-purple-50"
          >
            {showOdds ? 'Hide odds & EV' : 'See odds & EV'}
          </Button>
          <span className="text-[11px] text-purple-200/60">
            Estimates, not event boosts
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showOdds && (
          <div className="rounded-lg border border-purple-400/30 bg-purple-950/40 p-3 text-xs text-purple-100/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-purple-50">Ticket odds</span>
              <span className="text-[11px] text-purple-200/70">
                Grid {tier.grid.rows}×{tier.grid.columns} • Slots {tier.prizeSlots}
              </span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-1">
                <span className="block text-[11px] uppercase text-purple-200/60">Win chance</span>
                <span className="text-sm font-semibold text-purple-50">
                  {(tier.odds.winChance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-1">
                <span className="block text-[11px] uppercase text-purple-200/60">Jackpot chance</span>
                <span className="text-sm font-semibold text-purple-50">
                  {(tier.odds.jackpotChance * 100).toFixed(1)}%
                </span>
              </div>
              <div className="rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-1">
                <span className="block text-[11px] uppercase text-purple-200/60">
                  Multiplier chance
                </span>
                <span className="text-sm font-semibold text-purple-50">
                  {(tier.odds.multiplierChance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-2 text-[11px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="uppercase text-purple-200/60">Estimated EV</span>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-purple-200/80">
                  {evSummary
                    .filter((entry) => entry.average > 0)
                    .map((entry) => (
                      <span
                        key={`ev-${entry.currency}`}
                        className="rounded-full border border-purple-300/20 bg-purple-950/40 px-2 py-0.5 text-purple-50"
                      >
                        {currencyLabel(entry.currency)}
                        {entry.average.toFixed(0)}{' '}
                        <span className="text-purple-200/60">
                          ({currencyLabel(entry.currency)}
                          {entry.min.toFixed(0)}–{currencyLabel(entry.currency)}
                          {entry.max.toFixed(0)})
                        </span>
                      </span>
                    ))}
                </div>
              </div>
              <p className="mt-1 text-purple-200/60">
                EV uses tier odds, prize slots, and weighted prize averages.
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <span className="text-[11px] uppercase text-purple-200/60">Prize table</span>
              <ul className="space-y-1">
                {tier.prizes.map((prize) => (
                  <li
                    key={`${prize.label}-${prize.currency}`}
                    className="flex items-center justify-between rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-1 text-[11px]"
                  >
                    <span>{prize.label}</span>
                    <span className="font-semibold text-purple-50">
                      {currencyLabel(prize.currency)}
                      {prize.minAmount.toLocaleString()}–{currencyLabel(prize.currency)}
                      {prize.maxAmount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1 text-center text-xs text-muted-foreground">
          <span>
            Scratched {revealedCount}/{totalCells}
          </span>
          {!gameOver && (
            <div className="flex flex-col items-center gap-1 text-[11px] text-purple-200/70">
              <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-purple-300/70 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (revealedCount / revealThreshold) * 100)}%`,
                  }}
                />
              </div>
              <span>
                {fastRevealUnlocked
                  ? 'Fast reveal unlocked.'
                  : `Fast reveal unlocks in ${scratchesUntilUnlock} scratch${
                      scratchesUntilUnlock === 1 ? '' : 'es'
                    }.`}
              </span>
            </div>
          )}
        </div>
        <div
          className="grid gap-2 sm:gap-3 max-w-xs mx-auto"
          style={{ gridTemplateColumns: `repeat(${tier.grid.columns}, minmax(0, 1fr))` }}
        >
          {grid.map((symbol, index) => (
            <button
              key={index}
              onClick={() => handleReveal(index)}
              disabled={revealed[index] || gameOver}
              className={`
                scratch-tile relative aspect-square overflow-hidden rounded-lg text-3xl sm:text-4xl font-bold
                transition-all duration-300 transform
                ${revealed[index] 
                  ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 scale-100' 
                  : 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-2 border-purple-400/60 hover:scale-105 hover:shadow-lg cursor-pointer'
                }
                ${gameOver && winningLineIndices.has(index)
                  ? `ring-2 ${lineHighlightClasses[index]} scratch-tile--win`
                  : ''}
                ${gameOver && winningLineIndices.has(index) && isBigWin ? 'scratch-tile--bigwin' : ''}
                ${!revealed[index] && !gameOver ? 'hover:from-purple-500/50 hover:to-pink-500/50' : ''}
                flex items-center justify-center
              `}
            >
              {revealed[index] ? symbol : '?'}
              {gameOver && winningLineIndices.has(index) && lineBadgeByIndex[index] !== null && (
                <span
                  className={`absolute left-1 top-1 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow ${lineBadgeClass(
                    lineBadgeByIndex[index] ?? 0,
                  )}`}
                >
                  L{(lineBadgeByIndex[index] ?? 0) + 1}
                </span>
              )}
              {gameOver && winningLineIndices.has(index) && isBigWin && (
                <span aria-hidden="true" className="scratch-win-sparkle" />
              )}
              <span
                aria-hidden="true"
                className={`scratch-overlay ${revealed[index] ? 'scratch-overlay--revealed' : ''}`}
              />
            </button>
          ))}
        </div>

        {gameOver && prizeResults.length > 0 && (
          <div className="rounded-lg border border-purple-400/40 bg-purple-900/20 p-3 text-sm text-purple-100">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-purple-50">Winning lines</p>
              {isBigWin && (
                <span className="inline-flex items-center rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                  Big win 🎉
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-purple-100/70">
              <span className="rounded-full border border-purple-200/30 bg-purple-950/40 px-2 py-0.5">
                Lines hit: {prizeResults.length}
              </span>
              {hasJackpot && (
                <span className="rounded-full border border-yellow-200/40 bg-yellow-400/20 px-2 py-0.5 text-yellow-100">
                  Jackpot hit
                </span>
              )}
            </div>
            <ul className="mt-2 space-y-2">
              {prizeResults.map((prize, index) => {
                const line = winningLines[index]
                const lineNumber = line ? index + 1 : null
                const lineSymbol = line ? grid[line.indices[0]] : null
                const accent = lineAccents[index % lineAccents.length].badge
                return (
                  <li
                    key={`${prize.label}-${index}`}
                    className="flex flex-col gap-2 rounded-md border border-purple-400/20 bg-purple-900/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-purple-100/80">
                      {lineNumber && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${accent}`}>
                          Line {lineNumber}
                        </span>
                      )}
                      <div className="flex flex-col text-sm text-purple-50">
                        <span className="font-semibold">{prize.label}</span>
                        <span className="text-xs text-purple-200/70">
                          {patternLabel(prize.pattern)}
                          {lineSymbol ? ` • Matched ${lineSymbol}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-semibold text-purple-50">
                      {currencyLabel(prize.currency)}
                      {prize.amount.toLocaleString()}
                      {prize.multiplier ? ` (${prize.multiplier}x)` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
            {totalsSummary.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple-400/20 pt-3 text-xs text-purple-100/70">
                <span>Total winnings</span>
                <span className="text-sm font-semibold text-purple-50">
                  {totalsSummary.join(' • ')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!gameOver && (
            <Button
              onClick={revealAll}
              variant="outline"
              disabled={!fastRevealUnlocked}
              className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {fastRevealUnlocked ? (
                'Fast Reveal'
              ) : (
                <span className="inline-flex items-center gap-1">
                  <LockSimple size={14} />
                  Fast Reveal ({scratchesUntilUnlock})
                </span>
              )}
            </Button>
          )}
          <Button
            onClick={onClose}
            variant={gameOver ? 'default' : 'ghost'}
            className={gameOver ? 'bg-accent hover:bg-accent/90' : ''}
          >
            {gameOver ? 'Close' : 'Exit'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
