import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DiceFive, Clock, CurrencyCircleDollar, ShoppingCart, Sparkle, Storefront } from '@phosphor-icons/react'
import { ENERGY_CONFIG } from '@/lib/energy'
import { toast } from 'sonner'

// Real money purchase packs
export interface RealMoneyRollsPack {
  id: 'pack_valuebot_boost' | 'pack_store_bundle' | 'pack_investment_god'
  rolls: number
  priceUsd: number
  bonusCashMillions?: number
  badge?: string
  title: string
  subtitle: string
  cta: string
}

export const REAL_MONEY_ROLLS_PACKS: RealMoneyRollsPack[] = [
  {
    id: 'pack_valuebot_boost',
    rolls: 120,
    priceUsd: 2,
    title: 'Valuebot Power Boost',
    subtitle: 'Upgrade stock cards until Valuebot becomes an Investment God.',
    cta: 'Contribute',
    badge: 'STEP 1',
  },
  {
    id: 'pack_store_bundle',
    rolls: 250,
    priceUsd: 3,
    title: 'Store Boost Bundle',
    subtitle: 'Quick top-up from the store to keep your run alive.',
    cta: 'Open Store Deal',
    badge: 'STEP 2',
  },
  {
    id: 'pack_investment_god',
    rolls: 750,
    bonusCashMillions: 15,
    priceUsd: 5,
    title: 'Investment God Special',
    subtitle: 'Special deal: 750 dice 🎲 + $15M cash for one quick purchase.',
    cta: 'Claim Special Deal',
    badge: 'STEP 3 • BEST',
  },
]

interface OutOfRollsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchase?: (pack: RealMoneyRollsPack) => void
  nextResetTime?: Date
  lastEnergyCheck?: Date
  energyResetAmount?: number
  vaultRegenBonus?: number
  vaultLevel?: number
}

export function OutOfRollsModal({
  open,
  onOpenChange,
  onPurchase,
  nextResetTime,
  lastEnergyCheck,
  energyResetAmount,
  vaultRegenBonus = 0,
  vaultLevel,
}: OutOfRollsModalProps) {
  const dialogClass = useResponsiveDialogClass('small')
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [activeDealIndex, setActiveDealIndex] = useState(0)
  const effectiveResetAmount = energyResetAmount ?? ENERGY_CONFIG.RESET_AMOUNT
  const safeVaultBonus = Math.max(0, vaultRegenBonus)

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
      toast.info(`Purchase: ${pack.rolls} dice rolls for $${pack.priceUsd}`, {
        description: 'Payment integration coming soon!'
      })
    }
  }

  const activeDeal = REAL_MONEY_ROLLS_PACKS[activeDealIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.6_0.2_280_/_0.3)]`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
            <DiceFive size={32} weight="fill" />
            Out of Dice Rolls!
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Quick Monopoly Go-style deal sequence to keep your streak moving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card
            className="relative cursor-pointer transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/20"
            onClick={() => handlePurchaseClick(activeDeal)}
          >
            <CardContent className="p-5">
              {activeDeal.badge && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold border-0 px-3 py-1 shadow-lg">
                  {activeDeal.badge}
                </Badge>
              )}

              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                {activeDeal.id === 'pack_store_bundle' ? <Storefront size={16} weight="fill" /> : <Sparkle size={16} weight="fill" />}
                Quick Deal {activeDealIndex + 1}/{REAL_MONEY_ROLLS_PACKS.length}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <DiceFive size={48} weight="fill" className="text-accent" />
                    <span className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      +
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xl text-foreground">{activeDeal.title}</div>
                    <div className="text-sm text-muted-foreground">{activeDeal.subtitle}</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">+{activeDeal.rolls} Dice Rolls</div>
                    {activeDeal.bonusCashMillions && (
                      <div className="text-sm font-semibold text-emerald-400">+${activeDeal.bonusCashMillions}M cash</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <CurrencyCircleDollar size={24} className="text-green-500" weight="fill" />
                    <span className="font-bold text-2xl text-foreground">${activeDeal.priceUsd}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchaseClick(activeDeal)
                    }}
                  >
                    <ShoppingCart size={16} weight="fill" />
                    {activeDeal.cta}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDealIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeDealIndex === 0}
            >
              Previous
            </Button>
            <div className="text-xs text-muted-foreground">Swipe vibe: deal → store → special</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDealIndex((prev) => Math.min(REAL_MONEY_ROLLS_PACKS.length - 1, prev + 1))}
              disabled={activeDealIndex === REAL_MONEY_ROLLS_PACKS.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="mt-2 space-y-3">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 bg-background/50 p-3 rounded-lg border border-border/50">
            <Clock size={18} className="text-accent" />
            <span>
              Free reset in: <span className="font-mono font-bold text-accent">{timeUntilReset}</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center px-4">
            💡 <strong>{effectiveResetAmount} free dice rolls</strong> are reset every{' '}
            <strong>{Math.round(ENERGY_CONFIG.REGEN_INTERVAL_MINUTES / 60)} hours</strong>
          </p>
          {safeVaultBonus > 0 && (
            <p className="text-sm text-muted-foreground text-center px-4">
              Vault perk: +{safeVaultBonus} rolls per reset{vaultLevel ? ` (Vault Lv. ${vaultLevel})` : ''}.
            </p>
          )}
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
