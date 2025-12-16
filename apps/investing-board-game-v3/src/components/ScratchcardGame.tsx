import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ScratchcardGameProps {
  onWin?: (amount: number) => void
  onClose: () => void
}

const SYMBOLS = ['💎', '⭐', '🎰', '🍀', '💰', '🎲']
const WIN_AMOUNT = 5000

export function ScratchcardGame({ onWin, onClose }: ScratchcardGameProps) {
  const [grid, setGrid] = useState<string[]>(() => {
    // Generate a random 3x3 grid
    const symbols = Array(9).fill(null).map(() => 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    )
    // 30% chance to have a winning combination
    if (Math.random() < 0.3) {
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8]
      // Shuffle and pick 3 random positions
      const shuffled = positions.sort(() => Math.random() - 0.5)
      symbols[shuffled[0]] = winningSymbol
      symbols[shuffled[1]] = winningSymbol
      symbols[shuffled[2]] = winningSymbol
    }
    return symbols
  })
  
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false))
  const [gameOver, setGameOver] = useState(false)

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
    setRevealed(Array(9).fill(true))
    checkWin()
  }

  const checkWin = () => {
    setGameOver(true)
    
    // Count occurrences of each symbol
    const counts = grid.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Check if any symbol appears 3 or more times
    const hasWin = Object.values(counts).some(count => count >= 3)

    if (hasWin) {
      const winningSymbol = Object.keys(counts).find(symbol => counts[symbol] >= 3)
      toast.success(`🎉 You won! Three ${winningSymbol}s!`, {
        description: `You earned $${WIN_AMOUNT.toLocaleString()}!`,
      })
      if (onWin) {
        onWin(WIN_AMOUNT)
      }
    } else {
      toast.info('No match this time', {
        description: 'Better luck next time!',
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Sparkle size={24} className="text-yellow-400" />
          Casino Scratchcard
          <Sparkle size={24} className="text-yellow-400" />
        </CardTitle>
        <p className="text-sm text-center text-muted-foreground mt-2">
          Scratch to reveal! Match 3 symbols to win ${WIN_AMOUNT.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {grid.map((symbol, index) => (
            <button
              key={index}
              onClick={() => handleReveal(index)}
              disabled={revealed[index] || gameOver}
              className={`
                aspect-square rounded-lg text-4xl font-bold
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
