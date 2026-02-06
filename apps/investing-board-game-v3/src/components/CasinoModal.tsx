import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScratchcardGame } from '@/components/ScratchcardGame'
import {
  applyScratchcardEventOverride,
  type ScratchcardEventOverride,
} from '@/lib/scratchcardEvents'
import { getScratchcardOddsSummary } from '@/lib/scratchcardOdds'
import { scratchcardTiers, type ScratchcardTierId } from '@/lib/scratchcardTiers'
import { useEffect, useMemo, useState } from 'react'

interface CasinoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWin?: (amount: number) => void
  luckBoost?: number
  guaranteedWin?: boolean
  tierId?: ScratchcardTierId
  scratchcardEventOverride?: ScratchcardEventOverride | null
}

export function CasinoModal({
  open,
  onOpenChange,
  onWin,
  luckBoost,
  guaranteedWin,
  tierId,
  scratchcardEventOverride,
}: CasinoModalProps) {
  const defaultTier = tierId ?? scratchcardTiers[0]?.id ?? 'bronze'
  const [selectedTierId, setSelectedTierId] = useState<ScratchcardTierId>(defaultTier)
  const [showOdds, setShowOdds] = useState(false)
  const decoratedTiers = useMemo(
    () => scratchcardTiers.map((tier) => applyScratchcardEventOverride(tier, scratchcardEventOverride ?? null)),
    [scratchcardEventOverride],
  )
  const selectedTier = useMemo(
    () => decoratedTiers.find((tier) => tier.id === selectedTierId),
    [decoratedTiers, selectedTierId],
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
  const oddsSummary = useMemo(
    () =>
      selectedTier
        ? getScratchcardOddsSummary(selectedTier, { luckBoost, guaranteedWin })
        : null,
    [selectedTier, luckBoost, guaranteedWin],
  )
  const winPatternLabels = useMemo(() => {
    if (!selectedTier) {
      return []
    }
    const labelMap: Record<
      NonNullable<typeof selectedTier>['winPatterns'][number],
      { label: string; detail: string }
    > = {
      row: { label: 'Rows', detail: 'Match any full horizontal row.' },
      diagonal: { label: 'Diagonals', detail: 'Match a top-left to bottom-right line.' },
      bonus: { label: 'Bonus center', detail: 'Center bonus symbol pays a separate prize.' },
      multiplier: { label: 'Multiplier badge', detail: 'Boosts one win with a 2×–5× multiplier.' },
    }
    return selectedTier.winPatterns.map((pattern) => ({
      id: pattern,
      label: labelMap[pattern].label,
      detail: labelMap[pattern].detail,
    }))
  }, [selectedTier])
  const evSummary = oddsSummary?.evSummary ?? []
  const winChance = oddsSummary?.winChance ?? selectedTier?.odds.winChance ?? 0
  const isEventActive = Boolean(scratchcardEventOverride)
  const eventBannerClasses = isEventActive
    ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-50'
    : 'border-purple-400/40 bg-purple-900/40 text-purple-50'
  const ticketPanelClasses = isEventActive
    ? 'border-emerald-400/40 bg-gradient-to-br from-emerald-950/60 via-slate-950/60 to-purple-950/50'
    : 'border-purple-500/40 bg-purple-900/30'
  const previewClasses = isEventActive
    ? 'border-emerald-400/30 bg-emerald-950/30'
    : 'border-purple-400/30 bg-purple-950/40'
  const previewCellClasses = isEventActive
    ? 'border-emerald-300/30 bg-emerald-900/30 text-emerald-50'
    : 'border-purple-400/30 bg-purple-900/40 text-purple-50'
  const eventBoostSummary = scratchcardEventOverride?.oddsBoost
    ? [
        scratchcardEventOverride.oddsBoost.winChance
          ? `+${(scratchcardEventOverride.oddsBoost.winChance * 100).toFixed(0)}% win`
          : null,
        scratchcardEventOverride.oddsBoost.jackpotChance
          ? `+${(scratchcardEventOverride.oddsBoost.jackpotChance * 100).toFixed(0)}% jackpot`
          : null,
        scratchcardEventOverride.oddsBoost.multiplierChance
          ? `+${(scratchcardEventOverride.oddsBoost.multiplierChance * 100).toFixed(0)}% multiplier`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[calc(100vw-2rem)] sm:max-w-md p-0">
        {scratchcardEventOverride && (
          <div className={`mb-3 rounded-xl border px-3 py-2 ${eventBannerClasses}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-100/80">Active Event</p>
                <p className="text-sm font-semibold">{scratchcardEventOverride.title}</p>
                <p className="text-[11px] text-emerald-100/70">
                  {scratchcardEventOverride.description}
                </p>
                {eventBoostSummary && (
                  <p className="mt-1 text-[11px] text-emerald-100/70">
                    Boosts: {eventBoostSummary}
                  </p>
                )}
              </div>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-100/80">
                Event Boost
              </span>
            </div>
          </div>
        )}
        <div className={`rounded-xl border p-3 sm:p-4 mb-4 ${ticketPanelClasses}`}>
          <p className="text-xs uppercase tracking-wide text-purple-100/70">Choose your ticket</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {decoratedTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId
              const tierTopPrize = Math.max(...tier.prizes.map((prize) => prize.maxAmount))
              const tierWinChance = getScratchcardOddsSummary(tier, {
                luckBoost,
                guaranteedWin,
              }).winChance
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
                      Win {(tierWinChance * 100).toFixed(0)}% · Top prize {tierTopPrize.toLocaleString()}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
          {selectedTier && (
            <div className={`mt-4 rounded-lg border p-3 text-purple-100/80 ${previewClasses}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selectedTier.name} preview</p>
                  <p className="text-xs text-purple-100/70">
                    {selectedTier.grid.rows}x{selectedTier.grid.columns} grid · {selectedTier.prizeSlots} prize slots
                  </p>
                  <p className="text-xs text-purple-100/70">
                    Win {(winChance * 100).toFixed(0)}% · Top prize {topPrize.toLocaleString()} {selectedTier.prizes[0]?.currency ?? 'coins'}
                  </p>
                  {scratchcardEventOverride && (
                    <p className="mt-1 text-[11px] text-emerald-200/80">
                      {scratchcardEventOverride.title}: {scratchcardEventOverride.description}
                    </p>
                  )}
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
                    className={`flex h-8 items-center justify-center rounded-md border text-base ${previewCellClasses}`}
                  >
                    {selectedTier.symbolPool[index % selectedTier.symbolPool.length]}
                  </div>
                ))}
              </div>
              {winPatternLabels.length > 0 && (
                <div className="mt-3 grid gap-2 text-[11px] text-purple-100/80 sm:grid-cols-2">
                  {winPatternLabels.map((pattern) => (
                    <div
                      key={`${selectedTier.id}-pattern-${pattern.id}`}
                      className="rounded-lg border border-purple-300/30 bg-purple-950/40 px-2 py-1"
                      title={pattern.detail}
                    >
                      <p className="text-xs font-semibold text-purple-50">{pattern.label}</p>
                      <p className="text-[11px] text-purple-100/70">{pattern.detail}</p>
                    </div>
                  ))}
                </div>
              )}
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
                      Win chance: {(winChance * 100).toFixed(0)}% · Jackpot:{' '}
                      {(selectedTier.odds.jackpotChance * 100).toFixed(0)}% · Multiplier:{' '}
                      {(selectedTier.odds.multiplierChance * 100).toFixed(0)}%
                    </p>
                    {guaranteedWin && (
                      <p className="text-emerald-200/80">
                        Happy Hour active: ticket wins are guaranteed.
                      </p>
                    )}
                    {!guaranteedWin && luckBoost && luckBoost > 0 && (
                      <p>Casino Luck active: +{(luckBoost * 100).toFixed(0)}% win chance.</p>
                    )}
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
          guaranteedWin={guaranteedWin}
          tierId={selectedTierId}
          tier={selectedTier}
          eventOverride={scratchcardEventOverride}
        />
      </DialogContent>
    </Dialog>
  )
}
