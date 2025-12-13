import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Coins, TrendUp } from '@phosphor-icons/react'
import { GameState } from '@/lib/types'

interface HubModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
}

export function HubModal({ open, onOpenChange, gameState }: HubModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-accent/30 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            Investing Board Game – Hub
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Mission: Build a resilient portfolio without going broke.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins size={16} className="text-accent" />
              Cash
            </div>
            <div className="font-mono font-semibold text-foreground">
              ${gameState.cash.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendUp size={16} className="text-accent" />
              Net Worth
            </div>
            <div className="font-mono font-semibold text-foreground">
              ${gameState.netWorth.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Holdings</div>
            <div className="font-mono font-semibold text-foreground">
              {gameState.holdings.length}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Stars</div>
            <div className="font-mono font-semibold text-accent">
              {gameState.stars} ⭐
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <Button variant="outline" className="w-full" disabled>
          Support development (coming soon)
        </Button>
      </DialogContent>
    </Dialog>
  )
}
