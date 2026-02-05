import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  getScratchcardTier,
  type ScratchcardPrize,
  type ScratchcardTier,
  type ScratchcardTierId,
} from '@/lib/scratchcardTiers'

interface ScratchcardGameProps {
  onWin?: (amount: number) => void
  onClose: () => void
  luckBoost?: number // Percentage boost to win chance (0-1)
  tierId?: ScratchcardTierId
  tier?: ScratchcardTier
}

type PrizeResult = {
  label: string
  amount: number
  currency: ScratchcardPrize['currency']
  pattern: 'row' | 'diagonal' | 'bonus'
  multiplier?: number
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

const weightedPick = (prizes: ScratchcardPrize[]) => {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
  let roll = Math.random() * totalWeight
  for (const prize of prizes) {
    roll -= prize.weight
    if (roll <= 0) {
      return prize
    }
  }
  return prizes[0]
}

const rollAmount = (prize: ScratchcardPrize) =>
  Math.floor(prize.minAmount + Math.random() * (prize.maxAmount - prize.minAmount + 1))

const getIndex = (row: number, col: number, columns: number) => row * columns + col

const buildGrid = (tier: ScratchcardTier, luckBoost: number) => {
  const { rows, columns } = tier.grid
  const totalCells = rows * columns
  const symbols = Array.from({ length: totalCells }, () => {
    return tier.symbolPool[Math.floor(Math.random() * tier.symbolPool.length)]
  })
  const winChance = tier.odds.winChance + luckBoost
  const patterns = tier.winPatterns.filter((pattern) => pattern !== 'multiplier')
  if (Math.random() < winChance && patterns.length > 0) {
    const winningSymbol = tier.symbolPool[Math.floor(Math.random() * tier.symbolPool.length)]
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    if (pattern === 'row') {
      const row = Math.floor(Math.random() * rows)
      for (let col = 0; col < columns; col += 1) {
        symbols[getIndex(row, col, columns)] = winningSymbol
      }
    } else if (pattern === 'diagonal') {
      const size = Math.min(rows, columns)
      const isMain = Math.random() < 0.5
      for (let step = 0; step < size; step += 1) {
        const col = isMain ? step : columns - 1 - step
        symbols[getIndex(step, col, columns)] = winningSymbol
      }
    } else if (pattern === 'bonus') {
      const centerRow = Math.floor(rows / 2)
      const centerCol = Math.floor(columns / 2)
      symbols[getIndex(centerRow, centerCol, columns)] = winningSymbol
      const extraCells = Math.min(2, totalCells - 1)
      for (let i = 0; i < extraCells; i += 1) {
        const randomIndex = Math.floor(Math.random() * totalCells)
        symbols[randomIndex] = winningSymbol
      }
    }
  }
  return symbols
}

const evaluatePatterns = (grid: string[], tier: ScratchcardTier): Array<PrizeResult['pattern']> => {
  const { rows, columns } = tier.grid
  const wins: Array<PrizeResult['pattern']> = []
  if (tier.winPatterns.includes('row')) {
    for (let row = 0; row < rows; row += 1) {
      const startIndex = getIndex(row, 0, columns)
      const symbol = grid[startIndex]
      let isMatch = true
      for (let col = 1; col < columns; col += 1) {
        if (grid[getIndex(row, col, columns)] !== symbol) {
          isMatch = false
          break
        }
      }
      if (isMatch) wins.push('row')
    }
  }

  if (tier.winPatterns.includes('diagonal')) {
    const size = Math.min(rows, columns)
    const mainSymbol = grid[getIndex(0, 0, columns)]
    let mainMatch = true
    for (let step = 1; step < size; step += 1) {
      if (grid[getIndex(step, step, columns)] !== mainSymbol) {
        mainMatch = false
        break
      }
    }
    if (mainMatch) wins.push('diagonal')

    const antiSymbol = grid[getIndex(0, columns - 1, columns)]
    let antiMatch = true
    for (let step = 1; step < size; step += 1) {
      if (grid[getIndex(step, columns - 1 - step, columns)] !== antiSymbol) {
        antiMatch = false
        break
      }
    }
    if (antiMatch) wins.push('diagonal')
  }

  if (tier.winPatterns.includes('bonus')) {
    const centerRow = Math.floor(rows / 2)
    const centerCol = Math.floor(columns / 2)
    const centerSymbol = grid[getIndex(centerRow, centerCol, columns)]
    const centerCount = grid.filter((symbol) => symbol === centerSymbol).length
    if (centerCount >= Math.min(3, rows)) {
      wins.push('bonus')
    }
  }

  return wins
}

export function ScratchcardGame({
  onWin,
  onClose,
  luckBoost = 0,
  tierId = 'bronze',
  tier: providedTier,
}: ScratchcardGameProps) {
  const tier = useMemo(() => providedTier ?? getScratchcardTier(tierId), [providedTier, tierId])
  const [grid, setGrid] = useState<string[]>(() => buildGrid(tier, luckBoost))

  const totalCells = tier.grid.rows * tier.grid.columns
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(totalCells).fill(false))
  const [gameOver, setGameOver] = useState(false)
  const [prizeResults, setPrizeResults] = useState<PrizeResult[]>([])

  useEffect(() => {
    const freshGrid = buildGrid(tier, luckBoost)
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

    const wins = evaluatePatterns(grid, tier).slice(0, tier.prizeSlots)
    if (wins.length === 0) {
      toast.info('No match this time', {
        description: 'Better luck next time!',
      })
      return
    }

    const multiplierRoll =
      tier.winPatterns.includes('multiplier') && Math.random() < tier.odds.multiplierChance
        ? [2, 3, 5][Math.floor(Math.random() * 3)]
        : 1

    const results: PrizeResult[] = wins.map((pattern) => {
      const prize = weightedPick(tier.prizes)
      const amount = rollAmount(prize)
      return {
        label: prize.label,
        amount: amount * multiplierRoll,
        currency: prize.currency,
        pattern,
        multiplier: multiplierRoll > 1 ? multiplierRoll : undefined,
      }
    })

    setPrizeResults(results)
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
