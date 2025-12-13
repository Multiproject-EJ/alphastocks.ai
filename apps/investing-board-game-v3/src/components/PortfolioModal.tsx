import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { GameState } from '@/lib/types'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
}

export function PortfolioModal({ open, onOpenChange, gameState }: PortfolioModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-accent/30 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">Portfolio / Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Cash</div>
              <div className="font-mono font-semibold text-foreground">
                ${gameState.cash.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
              <div className="font-mono font-semibold text-foreground">
                ${gameState.portfolioValue.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Net Worth</div>
              <div className="font-mono font-semibold text-accent">
                ${gameState.netWorth.toLocaleString()}
              </div>
            </div>
          </div>

          <Separator />

          {gameState.holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              You don't own any stocks yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {gameState.holdings.map((holding, idx) => (
                <div key={idx} className="text-xs space-y-1 p-3 rounded bg-background/50 border border-border">
                  <div className="font-semibold text-foreground">
                    {holding.stock.ticker} - {holding.shares} shares
                  </div>
                  <div className="text-muted-foreground">
                    Cost: ${holding.totalCost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
