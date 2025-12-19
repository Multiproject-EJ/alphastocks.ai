import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DiceFive, Clock, Coin } from '@phosphor-icons/react'
import { RollsPack } from '@/lib/types'
import { COIN_COSTS } from '@/lib/coins'
import { ENERGY_CONFIG } from '@/lib/energy'

export const ROLLS_PACKS: RollsPack[] = [
  {
    id: 'small',
    rolls: 10,
    cost: COIN_COSTS.rolls_small,
  },
  {
    id: 'medium',
    rolls: 25,
    cost: COIN_COSTS.rolls_medium,
  },
  {
    id: 'large',
    rolls: 50,
    cost: COIN_COSTS.rolls_large,
    badge: 'BEST VALUE'
  }
]

interface OutOfRollsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCoins: number
  onPurchase: (rollsPack: RollsPack) => void
  nextResetTime: Date
}

export function OutOfRollsModal({
  open,
  onOpenChange,
  currentCoins,
  onPurchase,
  nextResetTime,
}: OutOfRollsModalProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const diff = nextResetTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeUntilReset('Soon!')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [nextResetTime])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.6_0.2_280_/_0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
            <DiceFive size={32} weight="fill" />
            Out of Rolls!
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Get more rolls to keep playing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {ROLLS_PACKS.map((pack) => {
            const canAfford = currentCoins >= pack.cost
            const coinsPerRoll = Math.round(pack.cost / pack.rolls)

            return (
              <Card
                key={pack.id}
                className={`relative cursor-pointer transition-all ${
                  canAfford
                    ? 'hover:border-accent hover:shadow-lg hover:shadow-accent/20'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => canAfford && onPurchase(pack)}
              >
                <CardContent className="p-4">
                  {pack.badge && (
                    <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950 font-bold border-yellow-400">
                      {pack.badge}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DiceFive size={32} weight="fill" className="text-accent" />
                      <div>
                        <div className="font-bold text-lg">+{pack.rolls} Rolls</div>
                        <div className="text-sm text-muted-foreground">
                          {coinsPerRoll} coins per roll
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Coin size={20} className="text-yellow-500" weight="fill" />
                      <span className="font-bold text-lg">{pack.cost}</span>
                    </div>
                  </div>

                  {!canAfford && (
                    <div className="mt-2 text-xs text-destructive font-medium">
                      Insufficient coins (need {pack.cost - currentCoins} more)
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 bg-background/50 p-3 rounded-lg">
            <Clock size={16} />
            <span>Next free rolls in: <span className="font-mono font-bold text-accent">{timeUntilReset}</span></span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            💡 Rolls also regenerate {ENERGY_CONFIG.REGEN_RATE} every {ENERGY_CONFIG.REGEN_INTERVAL_MINUTES} minutes
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
