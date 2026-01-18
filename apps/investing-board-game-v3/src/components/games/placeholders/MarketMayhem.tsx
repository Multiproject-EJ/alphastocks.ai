/**
 * Market Mayhem Game Placeholder
 * Game 4 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface MarketMayhemProps {
  onClose: () => void
}

export function MarketMayhem({ onClose }: MarketMayhemProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-900 via-orange-800 to-amber-900 p-8">
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="mb-8 text-lg font-semibold text-red-200">
        Game 4 of 10
      </div>

      <div className="mb-6 text-9xl">📊</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Market Mayhem
      </h1>
      <p className="mb-12 text-center text-xl text-red-200">
        Chaos trading challenge
      </p>

      <div className="w-full max-w-2xl rounded-2xl border-2 border-red-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-red-200">
          Navigate through market chaos! Make strategic trading decisions as prices swing wildly in this high-stakes challenge.
        </p>
        
        <div className="mt-8 rounded-xl border-2 border-dashed border-red-500/50 bg-red-500/10 p-8">
          <p className="text-sm text-red-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
