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
import { DiceFive, Clock, CurrencyCircleDollar, ShoppingCart } from '@phosphor-icons/react'
import { ENERGY_CONFIG } from '@/lib/energy'
import { toast } from 'sonner'

// Real money purchase packs (prices in Norwegian Krone - kr)
export interface RealMoneyRollsPack {
  id: 'pack_50' | 'pack_350'
  rolls: number
  priceKr: number
  badge?: string
}

export const REAL_MONEY_ROLLS_PACKS: RealMoneyRollsPack[] = [
  {
    id: 'pack_50',
    rolls: 50,
    priceKr: 25,
  },
  {
    id: 'pack_350',
    rolls: 350,
    priceKr: 129,
    badge: 'BEST VALUE'
  }
]

interface OutOfRollsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchase?: (pack: RealMoneyRollsPack) => void
  nextResetTime?: Date
  lastEnergyCheck?: Date
}

export function OutOfRollsModal({
  open,
  onOpenChange,
  onPurchase,
  nextResetTime,
  lastEnergyCheck,
}: OutOfRollsModalProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Update countdown timer for next 2-hour reset
  useEffect(() => {
    const updateTimer = () => {
      if (!lastEnergyCheck) {
        setTimeUntilReset('--')
        return
      }

      const now = new Date()
      const nextReset = new Date(lastEnergyCheck.getTime() + ENERGY_CONFIG.REGEN_INTERVAL_MINUTES * 60 * 1000)
      const diff = nextReset.getTime() - now.getTime()

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
  }, [lastEnergyCheck])

  const handlePurchaseClick = (pack: RealMoneyRollsPack) => {
    if (onPurchase) {
      onPurchase(pack)
    } else {
      // Placeholder: In production, this would integrate with Stripe/payment provider
      toast.info(`Purchase: ${pack.rolls} dice rolls for ${pack.priceKr} kr`, {
        description: 'Payment integration coming soon!'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.6_0.2_280_/_0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
            <DiceFive size={32} weight="fill" />
            Out of Dice Rolls!
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Get more dice rolls to continue your investment journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Real money purchase packs */}
          {REAL_MONEY_ROLLS_PACKS.map((pack) => {
            const pricePerRoll = (pack.priceKr / pack.rolls).toFixed(2)

            return (
              <Card
                key={pack.id}
                className="relative cursor-pointer transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/20"
                onClick={() => handlePurchaseClick(pack)}
              >
                <CardContent className="p-5">
                  {pack.badge && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold border-0 px-3 py-1 shadow-lg">
                      {pack.badge}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <DiceFive size={48} weight="fill" className="text-accent" />
                        <span className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          +
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-xl text-foreground">+{pack.rolls} Dice Rolls</div>
                        <div className="text-sm text-muted-foreground">
                          Only {pricePerRoll} kr per roll
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <CurrencyCircleDollar size={24} className="text-green-500" weight="fill" />
                        <span className="font-bold text-2xl text-foreground">{pack.priceKr} kr</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePurchaseClick(pack)
                        }}
                      >
                        <ShoppingCart size={16} weight="fill" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-2 space-y-3">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 bg-background/50 p-3 rounded-lg border border-border/50">
            <Clock size={18} className="text-accent" />
            <span>
              Free reset in: <span className="font-mono font-bold text-accent">{timeUntilReset}</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center px-4">
            💡 <strong>{ENERGY_CONFIG.RESET_AMOUNT} free dice rolls</strong> are reset every{' '}
            <strong>{Math.round(ENERGY_CONFIG.REGEN_INTERVAL_MINUTES / 60)} hours</strong>
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Wait for Free Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
