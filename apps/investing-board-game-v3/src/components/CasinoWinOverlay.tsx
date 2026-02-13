import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  title: string
  summary: string
  onClose: () => void
}

export function CasinoWinOverlay({ open, title, summary, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-yellow-300/50 bg-gradient-to-br from-amber-500/30 to-black p-5 text-center text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-yellow-200">Casino Victory</p>
        <h2 className="mt-2 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-yellow-100/90">{summary}</p>
        <Button className="mt-4 w-full" onClick={onClose}>Back to board</Button>
      </div>
    </div>
  )
}
