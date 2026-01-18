/**
 * Wheel of Fortune Game Placeholder
 * Game 1 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface WheelOfFortuneProps {
  onClose: () => void
}

export function WheelOfFortune({ onClose }: WheelOfFortuneProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-8">
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      {/* Counter */}
      <div className="mb-8 text-lg font-semibold text-purple-200">
        Game 1 of 10
      </div>

      {/* Game Icon & Title */}
      <div className="mb-6 text-9xl">🎡</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Wheel of Fortune
      </h1>
      <p className="mb-12 text-center text-xl text-purple-200">
        Spin to win cash & prizes
      </p>

      {/* Coming Soon Container */}
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-purple-200">
          This exciting mini-game is under development. Spin the wheel to win amazing prizes including cash, stocks, and exclusive rewards!
        </p>
        
        {/* Placeholder for Spark-built game */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 p-8">
          <p className="text-sm text-purple-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
