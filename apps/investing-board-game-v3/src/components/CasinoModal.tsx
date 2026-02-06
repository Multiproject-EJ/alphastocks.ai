import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScratchcardGame } from '@/components/ScratchcardGame'
import { getScratchcardOddsSummary } from '@/lib/scratchcardOdds'
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
  const [showOdds, setShowOdds] = useState(false)
  const selectedTier = useMemo(
    () => scratchcardTiers.find((tier) => tier.id === selectedTierId),
    [selectedTierId],
  )

  useEffect(() => {
    if (tierId) {
      setSelectedTierId(tierId)
    }
  }, [tierId])

  useEffect(() => {
    setShowOdds(false)
  }, [selectedTierId])

  const topPrize = selectedTier
    ? Math.max(...selectedTier.prizes.map((prize) => prize.maxAmount))
    : 0
  const evSummary = useMemo(
    () => (selectedTier ? getScratchcardOddsSummary(selectedTier).evSummary : []),
    [selectedTier],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[calc(100vw-2rem)] sm:max-w-md p-0">
        <div className="rounded-xl border border-purple-500/40 bg-purple-900/30 p-3 sm:p-4 mb-4">
          <p className="text-xs uppercase tracking-wide text-purple-100/70">Choose your ticket</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {scratchcardTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId
              const tierTopPrize = Math.max(...tier.prizes.map((prize) => prize.maxAmount))
              return (
                <Button
                  key={tier.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500/80 to-pink-500/70 hover:from-purple-500/90 hover:to-pink-500/80 text-white border-purple-300/80 shadow-lg'
                      : 'border-purple-400/50 text-purple-100/80 hover:text-white hover:border-purple-300/70'
                  }
                >
                  <span className="flex w-full flex-col gap-1 text-left">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {tier.name}
                      {isSelected && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/90">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-purple-100/70">
                      {tier.entryCost.amount.toLocaleString()} {tier.entryCost.currency} · {tier.grid.rows}x{tier.grid.columns} grid
                    </span>
                    <span className="text-[11px] text-purple-100/70">
                      Win {(tier.odds.winChance * 100).toFixed(0)}% · Top prize {tierTopPrize.toLocaleString()}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
          {selectedTier && (
            <div className="mt-4 rounded-lg border border-purple-400/30 bg-purple-950/40 p-3 text-purple-100/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selectedTier.name} preview</p>
                  <p className="text-xs text-purple-100/70">
                    {selectedTier.grid.rows}x{selectedTier.grid.columns} grid · {selectedTier.prizeSlots} prize slots
                  </p>
                </div>
                <div className="rounded-full border border-purple-400/40 bg-purple-500/20 px-2 py-1 text-[11px] uppercase tracking-wide text-purple-100">
                  {selectedTier.id}
                </div>
              </div>
              <div
                className="mt-3 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${selectedTier.grid.columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: selectedTier.grid.rows * selectedTier.grid.columns }).map((_, index) => (
                  <div
                    key={`${selectedTier.id}-preview-${index}`}
                    className="flex h-8 items-center justify-center rounded-md border border-purple-400/30 bg-purple-900/40 text-base"
                  >
                    {selectedTier.symbolPool[index % selectedTier.symbolPool.length]}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-purple-100/70">
                  Entry: {selectedTier.entryCost.amount.toLocaleString()} {selectedTier.entryCost.currency}
                </span>
                <span className="text-purple-100/70">
                  Top prize: {topPrize.toLocaleString()} {selectedTier.prizes[0]?.currency ?? 'coins'}
                </span>
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOdds((prev) => !prev)}
                  className="w-full border-purple-400/50 text-purple-100 hover:text-white"
                >
                  {showOdds ? 'Hide odds + prizes' : 'See odds + prizes'}
                </Button>
                {showOdds && (
                  <div className="mt-3 space-y-2 text-xs text-purple-100/70">
                    <p>
                      Win chance: {(selectedTier.odds.winChance * 100).toFixed(0)}% · Jackpot:{' '}
                      {(selectedTier.odds.jackpotChance * 100).toFixed(0)}% · Multiplier:{' '}
                      {(selectedTier.odds.multiplierChance * 100).toFixed(0)}%
                    </p>
                    <div className="rounded-md border border-purple-400/20 bg-purple-900/30 px-2 py-1">
                      <p className="text-[11px] uppercase text-purple-200/60">Estimated EV</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {evSummary
                          .filter((entry) => entry.average > 0)
                          .map((entry) => (
                            <span
                              key={`casino-ev-${entry.currency}`}
                              className="rounded-full border border-purple-300/20 bg-purple-950/40 px-2 py-0.5 text-[11px] text-purple-50"
                            >
                              {entry.currency.toUpperCase()}: {entry.average.toFixed(0)} (
                              {entry.min.toFixed(0)}–{entry.max.toFixed(0)})
                            </span>
                          ))}
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {selectedTier.prizes.map((prize) => (
                        <li key={`${selectedTier.id}-${prize.label}`} className="flex justify-between gap-2">
                          <span>{prize.label}</span>
                          <span>
                            {prize.minAmount.toLocaleString()}–{prize.maxAmount.toLocaleString()} {prize.currency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
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
