/**
 * Bull Run Game Placeholder
 * Game 7 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface BullRunProps {
  onClose: () => void
}

export function BullRun({ onClose }: BullRunProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-lime-900 via-green-800 to-emerald-900 p-8">
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="mb-8 text-lg font-semibold text-lime-200">
        Game 7 of 10
      </div>

      <div className="mb-6 text-9xl">🐂</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Bull Run
      </h1>
      <p className="mb-12 text-center text-xl text-lime-200">
        Ride the bull market
      </p>

      <div className="w-full max-w-2xl rounded-2xl border-2 border-lime-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-lime-200">
          Ride the bull market to massive gains! Time your entries and exits perfectly to maximize profits during the uptrend.
        </p>
        
        <div className="mt-8 rounded-xl border-2 border-dashed border-lime-500/50 bg-lime-500/10 p-8">
          <p className="text-sm text-lime-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
