import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkle } from '@phosphor-icons/react'
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

  const totalCells = tier.grid.rows * tier.grid.columns
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(totalCells).fill(false))
  const [gameOver, setGameOver] = useState(false)
  const [prizeResults, setPrizeResults] = useState<ScratchcardPrizeResult[]>([])
  const [winningLineIndices, setWinningLineIndices] = useState<Set<number>>(new Set())
  const [winningLines, setWinningLines] = useState<
    ReturnType<typeof getScratchcardWinningLines>
  >([])

  useEffect(() => {
    const freshGrid = buildScratchcardGrid(tier, luckBoost)
    setGrid(freshGrid)
    setRevealed(Array(tier.grid.rows * tier.grid.columns).fill(false))
    setGameOver(false)
    setPrizeResults([])
    setWinningLineIndices(new Set())
    setWinningLines([])
  }, [tier, luckBoost])

  const handleReveal = (index: number) => {
    if (revealed[index] || gameOver) return
    
    const newRevealed = [...revealed]
    newRevealed[index] = true
    setRevealed(newRevealed)

    // Check if all are revealed
    if (newRevealed.every(r => r)) {
      checkWin()
    }
  }

  const revealAll = () => {
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
  }

  const totalWinnings = prizeResults.reduce((sum, prize) => sum + prize.amount, 0)
  const hasJackpot = prizeResults.some((prize) => prize.label.toLowerCase().includes('jackpot'))
  const isBigWin =
    prizeResults.length > 1 || hasJackpot || totalWinnings >= tier.entryCost.amount * 10
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
      </CardHeader>
      <CardContent className="space-y-4">
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
                  ? 'ring-2 ring-yellow-300/90 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                  : ''}
                ${!revealed[index] && !gameOver ? 'hover:from-purple-500/50 hover:to-pink-500/50' : ''}
                flex items-center justify-center
              `}
            >
              {revealed[index] ? symbol : '?'}
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
              <p className="font-semibold text-purple-50">Prize summary</p>
              {isBigWin && (
                <span className="inline-flex items-center rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                  Big win 🎉
                </span>
              )}
            </div>
            <ul className="mt-2 space-y-2">
              {prizeResults.map((prize, index) => {
                const lineNumber = winningLines[index] ? index + 1 : null
                return (
                  <li
                    key={`${prize.label}-${index}`}
                    className="flex flex-col gap-1 rounded-md border border-purple-400/20 bg-purple-900/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-purple-100/80">
                      {lineNumber && (
                        <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-xs font-semibold text-purple-100">
                          Line {lineNumber}
                        </span>
                      )}
                      <span className="text-sm font-medium text-purple-50">
                        {patternLabel(prize.pattern)}
                      </span>
                      <span className="text-xs text-purple-200/70">{prize.label}</span>
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
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!gameOver && (
            <Button
              onClick={revealAll}
              variant="outline"
              className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-400/50"
            >
              Reveal All
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
