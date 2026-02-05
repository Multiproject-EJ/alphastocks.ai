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
import { buildScratchcardGrid, evaluateScratchcardResults } from '@/lib/evaluateScratchcard'

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

  useEffect(() => {
    const freshGrid = buildScratchcardGrid(tier, luckBoost)
    setGrid(freshGrid)
    setRevealed(Array(tier.grid.rows * tier.grid.columns).fill(false))
    setGameOver(false)
    setPrizeResults([])
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

    const results = evaluateScratchcardResults(grid, tier)
    if (results.length === 0) {
      toast.info('No match this time', {
        description: 'Better luck next time!',
      })
      setPrizeResults([])
      onResults?.([])
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
                aspect-square rounded-lg text-3xl sm:text-4xl font-bold
                transition-all duration-300 transform
                ${revealed[index] 
                  ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 scale-100' 
                  : 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-2 border-purple-400/60 hover:scale-105 hover:shadow-lg cursor-pointer'
                }
                ${!revealed[index] && !gameOver ? 'hover:from-purple-500/50 hover:to-pink-500/50' : ''}
                flex items-center justify-center
              `}
            >
              {revealed[index] ? symbol : '?'}
            </button>
          ))}
        </div>

        {gameOver && prizeResults.length > 0 && (
          <div className="rounded-lg border border-purple-400/40 bg-purple-900/20 p-3 text-sm text-purple-100">
            <p className="font-semibold text-purple-50">Prize summary</p>
            <ul className="mt-2 space-y-1">
              {prizeResults.map((prize, index) => (
                <li key={`${prize.label}-${index}`} className="flex items-center justify-between">
                  <span className="text-purple-100/80">
                    {prize.pattern === 'row' && 'Row match'}
                    {prize.pattern === 'diagonal' && 'Diagonal match'}
                    {prize.pattern === 'bonus' && 'Bonus match'}
                  </span>
                  <span className="font-semibold">
                    {currencyLabel(prize.currency)}
                    {prize.amount.toLocaleString()}
                    {prize.multiplier ? ` (${prize.multiplier}x)` : ''}
                  </span>
                </li>
              ))}
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
