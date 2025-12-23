import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stock } from '@/lib/types'
import { Coins } from '@phosphor-icons/react'

interface StockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: Stock | null
  onBuy: (multiplier: number) => void
  cash: number
  showInsights?: boolean
}

export function StockModal({ open, onOpenChange, stock, onBuy, cash, showInsights = false }: StockModalProps) {
  const dialogClass = useResponsiveDialogClass('small')
  
  if (!stock) return null

  const baseShares = 10
  const smallCost = stock.price * (baseShares * 0.5)
  const normalCost = stock.price * baseShares
  const highCost = stock.price * (baseShares * 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)]`}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-mono uppercase bg-accent/20 text-accent border-accent/50">
              {stock.category}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-accent">{stock.name}</DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-2">
            {stock.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-sm text-muted-foreground">Current Price:</div>
            <div className="text-2xl font-bold font-mono text-foreground">
              ${stock.price.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins size={16} className="text-accent" />
            Available Cash: <span className="font-mono text-foreground">${cash.toLocaleString()}</span>
          </div>

          {showInsights && (
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-accent flex items-center gap-2">
                🔍 Stock Insights
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">P/E Ratio</div>
                  <div className="font-mono text-foreground">
                    {(Math.random() * 30 + 10).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Analyst Rating</div>
                  <div className="font-mono text-foreground">
                    {['Buy', 'Strong Buy', 'Hold'][Math.floor(Math.random() * 3)]}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Dividend Yield</div>
                  <div className="font-mono text-foreground">
                    {(Math.random() * 3).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Market Cap</div>
                  <div className="font-mono text-foreground">
                    ${(Math.random() * 100 + 10).toFixed(1)}B
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="space-y-2">
              <Button
                onClick={() => onBuy(0.5)}
                disabled={cash < smallCost}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                size="lg"
              >
                Buy Small
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {Math.floor(baseShares * 0.5)} shares
                <br />${smallCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onBuy(1)}
                disabled={cash < normalCost}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Buy Normal
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {baseShares} shares
                <br />${normalCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onBuy(2)}
                disabled={cash < highCost}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent"
                size="lg"
              >
                High Conviction
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {baseShares * 2} shares
                <br />${highCost.toLocaleString()}
              </div>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full mt-4"
          >
            Pass
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}