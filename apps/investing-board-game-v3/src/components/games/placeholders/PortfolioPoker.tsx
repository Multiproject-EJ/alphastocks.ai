/**
 * Portfolio Poker Game Placeholder
 * Game 5 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface PortfolioPokerProps {
  onClose: () => void
}

export function PortfolioPoker({ onClose }: PortfolioPokerProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900 p-8">
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="mb-8 text-lg font-semibold text-blue-200">
        Game 5 of 10
      </div>

      <div className="mb-6 text-9xl">🃏</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Portfolio Poker
      </h1>
      <p className="mb-12 text-center text-xl text-blue-200">
        Card-based investing
      </p>

      <div className="w-full max-w-2xl rounded-2xl border-2 border-blue-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-blue-200">
          Build the ultimate portfolio hand! Combine stocks strategically to create winning combinations and maximize returns.
        </p>
        
        <div className="mt-8 rounded-xl border-2 border-dashed border-blue-500/50 bg-blue-500/10 p-8">
          <p className="text-sm text-blue-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
