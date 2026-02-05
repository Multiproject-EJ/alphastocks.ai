import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScratchcardGame } from '@/components/ScratchcardGame'
import { scratchcardTiers, type ScratchcardTierId } from '@/lib/scratchcardTiers'
import { useEffect, useMemo, useState } from 'react'

interface CasinoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWin?: (amount: number) => void
  luckBoost?: number
  tierId?: ScratchcardTierId
}

export function CasinoModal({ open, onOpenChange, onWin, luckBoost, tierId }: CasinoModalProps) {
  const defaultTier = tierId ?? scratchcardTiers[0]?.id ?? 'bronze'
  const [selectedTierId, setSelectedTierId] = useState<ScratchcardTierId>(defaultTier)
  const selectedTier = useMemo(
    () => scratchcardTiers.find((tier) => tier.id === selectedTierId),
    [selectedTierId],
  )

  useEffect(() => {
    if (tierId) {
      setSelectedTierId(tierId)
    }
  }, [tierId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[calc(100vw-2rem)] sm:max-w-md p-0">
        <div className="rounded-xl border border-purple-500/40 bg-purple-900/30 p-3 sm:p-4 mb-4">
          <p className="text-xs uppercase tracking-wide text-purple-100/70">Choose your ticket</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {scratchcardTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId
              return (
                <Button
                  key={tier.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={
                    isSelected
                      ? 'bg-purple-500/70 hover:bg-purple-500/90 text-white border-purple-300/70'
                      : 'border-purple-400/50 text-purple-100/80 hover:text-white'
                  }
                >
                  <span className="flex w-full flex-col text-left">
                    <span className="text-sm font-semibold">{tier.name}</span>
                    <span className="text-[11px] text-purple-100/70">
                      {tier.entryCost.amount.toLocaleString()} {tier.entryCost.currency} · {tier.grid.rows}x{tier.grid.columns}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
          {selectedTier && (
            <p className="mt-3 text-xs text-purple-100/70">
              Odds: {(selectedTier.odds.winChance * 100).toFixed(0)}% win chance · Top tier prize available.
            </p>
          )}
        </div>
        <ScratchcardGame
          onWin={onWin}
          onClose={() => onOpenChange(false)}
          luckBoost={luckBoost}
          tierId={selectedTierId}
        />
      </DialogContent>
    </Dialog>
  )
}
