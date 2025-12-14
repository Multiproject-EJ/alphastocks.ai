import { useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { GameState } from '@/lib/types'

interface ProToolsOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  sessionId?: string
}

export function ProToolsOverlay({ 
  open, 
  onOpenChange, 
  gameState,
  sessionId = 'BOARDGAME_V3_SESSION'
}: ProToolsOverlayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Send context to iframe when it loads
  useEffect(() => {
    if (!open || !iframeRef.current) return

    const handleIframeLoad = (event: Event) => {
      const iframe = event.target as HTMLIFrameElement
      if (!iframe?.contentWindow) return

      // Send game context to iframe
      const message = {
        type: 'ALPHASTOCKS_PT_CONTEXT',
        version: 1,
        source: 'boardgame-v3',
        sessionId: sessionId,
        payload: {
          cash: gameState.cash,
          netWorth: gameState.netWorth,
          portfolioValue: gameState.portfolioValue,
          stars: gameState.stars,
          holdings: gameState.holdings.map(h => ({
            ticker: h.stock.ticker,
            name: h.stock.name,
            shares: h.shares,
            totalCost: h.totalCost,
          })),
        },
      }

      // Send message to iframe (same origin since we're using relative URL)
      const targetOrigin = window.location.origin
      iframe.contentWindow.postMessage(message, targetOrigin)
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad)
      return () => {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [open, gameState, sessionId])

  if (!open) return null

  const proToolsUrl = `/pro-tools?embed=1&source=boardgame-v3&session=${encodeURIComponent(sessionId)}`

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-tools-title"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <h2 
          id="pro-tools-title" 
          className="text-xl font-bold text-foreground"
        >
          Pro Tools
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label="Close Pro Tools"
          className="hover:bg-accent/50"
        >
          <X size={24} weight="bold" />
        </Button>
      </div>

      {/* Iframe content */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={proToolsUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="Pro Tools"
        />
      </div>
    </div>
  )
}
