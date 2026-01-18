/**
 * IPO Frenzy Game Placeholder
 * Game 9 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface IpoFrenzyProps {
  onClose: () => void
}

export function IpoFrenzy({ onClose }: IpoFrenzyProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-900 via-pink-800 to-fuchsia-900 p-8">
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="mb-8 text-lg font-semibold text-rose-200">
        Game 9 of 10
      </div>

      <div className="mb-6 text-9xl">🚀</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        IPO Frenzy
      </h1>
      <p className="mb-12 text-center text-xl text-rose-200">
        Hot IPO investment game
      </p>

      <div className="w-full max-w-2xl rounded-2xl border-2 border-rose-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-rose-200">
          Get in on hot IPOs before they soar! Evaluate companies and invest early for massive first-day gains.
        </p>
        
        <div className="mt-8 rounded-xl border-2 border-dashed border-rose-500/50 bg-rose-500/10 p-8">
          <p className="text-sm text-rose-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
