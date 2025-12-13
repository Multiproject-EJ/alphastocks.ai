import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Coins, TrendUp } from '@phosphor-icons/react'
import { GameState } from '@/lib/types'

interface InfoCardsProps {
  gameState: GameState
}

export function InfoCards({ gameState }: InfoCardsProps) {
  return (
    <div className="flex flex-col gap-4 w-[320px]">
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-border">
        <h3 className="text-lg font-bold text-accent mb-2">Investing Board Game – Hub</h3>
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
        </div>

        <Separator className="my-4" />

        <Button variant="outline" className="w-full" disabled>
          Support development (coming soon)
        </Button>
      </Card>
    </div>
  )
}