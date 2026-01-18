/**
 * Merger Mania Game Placeholder
 * Game 10 of 10
 */

import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface MergerManiaProps {
  onClose: () => void
}

export function MergerMania({ onClose }: MergerManiaProps) {
  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 p-8">
      <Button
        onClick={onClose}
        className="absolute right-6 top-6 h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50"
        aria-label="Close"
      >
        <X size={24} weight="bold" />
      </Button>

      <div className="mb-8 text-lg font-semibold text-teal-200">
        Game 10 of 10
      </div>

      <div className="mb-6 text-9xl">🤝</div>
      <h1 className="mb-4 text-5xl font-bold text-white">
        Merger Mania
      </h1>
      <p className="mb-12 text-center text-xl text-teal-200">
        M&A deal making
      </p>

      <div className="w-full max-w-2xl rounded-2xl border-2 border-teal-500/30 bg-black/20 p-12 text-center backdrop-blur">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Coming Soon
        </h2>
        <p className="text-lg text-teal-200">
          Broker high-stakes M&A deals! Match companies, negotiate terms, and profit from successful mergers and acquisitions.
        </p>
        
        <div className="mt-8 rounded-xl border-2 border-dashed border-teal-500/50 bg-teal-500/10 p-8">
          <p className="text-sm text-teal-300">
            🎮 Game code will be integrated here
          </p>
        </div>
      </div>
    </div>
  )
}
