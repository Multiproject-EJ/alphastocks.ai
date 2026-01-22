import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { useShopVaultOverview } from '@/hooks/useShopVaultOverview'
import type { VaultItemSummary } from '@/hooks/useShopVaultOverview'
import type { GameState } from '@/lib/types'

interface Shop2ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  onVaultPurchase?: (item: VaultItemSummary) => Promise<boolean>
  isVaultPurchasing?: boolean
  shopEventDiscount?: number
  shopEventLabel?: string
  shopEventIcon?: string
}

export function Shop2Modal({
  open,
  onOpenChange,
  gameState,
  onVaultPurchase,
  isVaultPurchasing,
  shopEventDiscount = 0,
  shopEventLabel,
  shopEventIcon,
}: Shop2ModalProps) {
  const dialogClass = useResponsiveDialogClass('full')
  const { seasons, loading, error, source, setDetails, registerOwnership, vaultProgress } =
    useShopVaultOverview()
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)
  const sanitizedDiscount = Math.max(0, Math.min(100, shopEventDiscount))
  const vaultProgressPercent =
    vaultProgress.xpToNext > 0
      ? Math.min(100, Math.round((vaultProgress.xp / vaultProgress.xpToNext) * 100))
      : 0

  const defaultSetId = useMemo(() => {
    for (const season of seasons) {
      const unlockedSet = season.sets.find((set) => set.isUnlocked)
      if (unlockedSet) return unlockedSet.id
    }
    return seasons[0]?.sets[0]?.id ?? null
  }, [seasons])
  const selectedSet = selectedSetId ? setDetails[selectedSetId] : null

  useEffect(() => {
    if (!selectedSetId && defaultSetId) {
      setSelectedSetId(defaultSetId)
    }
  }, [defaultSetId, selectedSetId])

  useEffect(() => {
    if (selectedSetId && selectedSet && !selectedSet.isUnlocked && defaultSetId) {
      setSelectedSetId(defaultSetId)
    }
  }, [defaultSetId, selectedSet, selectedSetId])

  const formatCurrency = (currency: string) => {
    if (currency === 'cash') return '$'
    if (currency === 'stars') return '⭐'
    return '🪙'
  }

  const getDiscountedPrice = (price: number) => {
    if (sanitizedDiscount <= 0) return price
    return Math.max(1, Math.ceil(price * (1 - sanitizedDiscount / 100)))
  }

  const handlePurchase = async (item: VaultItemSummary) => {
    if (!onVaultPurchase) return

    setPendingItemId(item.id)
    const success = await onVaultPurchase(item)
    if (success) {
      registerOwnership(item.id)
    }
    setPendingItemId(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${dialogClass} h-[100vh] overflow-hidden bg-card p-0 border-0`}
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-2xl font-bold text-accent">
              Shop 2.0 — Vault Preview
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              The next-gen Vault shop is rolling in. You&apos;ll be able to collect
              sets, unlock seasons, and stack permanent perks.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                <div className="text-sm uppercase tracking-[0.2em] text-accent/80">
                  Vault Status
                </div>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  ${gameState.cash.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Cash available for Shop 2.0 drops
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Vault Level</span>
                  <span className="text-xs font-semibold text-accent">
                    Lv. {vaultProgress.level}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {vaultProgress.xp.toLocaleString()} / {vaultProgress.xpToNext.toLocaleString()} XP
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted/60">
                  <div
                    className="h-2 rounded-full bg-accent transition-all"
                    style={{ width: `${vaultProgressPercent}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Unlock perks as you collect vault drops.
                </div>
              </div>

              {sanitizedDiscount > 0 && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.3em] text-emerald-700">
                    <span>{shopEventIcon ? `${shopEventIcon} Flash Window` : 'Flash Window'}</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold">
                      {sanitizedDiscount}% off
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {shopEventLabel ?? 'Vault savings are live right now.'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Discounts apply automatically to Shop 2.0 vault drops.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    Vault Overview
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {source === 'supabase' ? 'Live catalog' : 'Preview data'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track seasons, finish collectible sets, and unlock perks as you complete the
                  album.
                </p>

                {loading ? (
                  <div className="mt-4 space-y-3">
                    <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
                    <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {error && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                        {error}
                      </div>
                    )}
                    {seasons.map((season) => {
                      const seasonProgress =
                        season.setsTotal > 0
                          ? Math.round((season.setsCompleted / season.setsTotal) * 100)
                          : 0
                      const rewardReady = season.isComplete
                      return (
                        <div
                          key={season.id}
                          className="rounded-2xl border border-border bg-background/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {season.code} • {season.theme}
                              </div>
                              <h4 className="mt-2 text-lg font-semibold text-foreground">
                                {season.name}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {season.description}
                              </p>
                            </div>
                            <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent">
                              {season.isActive ? 'Active' : 'Upcoming'}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {season.setsCompleted}/{season.setsTotal} sets complete
                              </span>
                              <span>{seasonProgress}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-muted/60">
                              <div
                                className="h-2 rounded-full bg-accent transition-all"
                                style={{ width: `${seasonProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {season.sets.map((set) => {
                              const setProgress =
                                set.itemsTotal > 0
                                  ? Math.round((set.itemsOwned / set.itemsTotal) * 100)
                                  : 0
                              const isLocked = !set.isUnlocked
                              return (
                                <button
                                  type="button"
                                  key={set.id}
                                  onClick={() => setSelectedSetId(set.id)}
                                  disabled={isLocked}
                                  className={`rounded-xl border p-3 text-left transition ${
                                    isLocked
                                      ? 'border-border/40 bg-muted/10 text-muted-foreground'
                                      : selectedSetId === set.id
                                      ? 'border-accent bg-accent/10 shadow-sm'
                                      : 'border-border/70 bg-muted/30 hover:border-accent/60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">
                                        {set.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {set.description}
                                      </p>
                                    </div>
                                    <span className="text-xs font-semibold text-accent">
                                      {isLocked ? 'Locked' : `${set.itemsOwned}/${set.itemsTotal}`}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-1.5 w-full rounded-full bg-background/60">
                                    <div
                                      className="h-1.5 rounded-full bg-accent"
                                      style={{ width: `${setProgress}%` }}
                                    />
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>{setProgress}% collected</span>
                                    <span>
                                      {isLocked
                                        ? 'Complete previous set'
                                        : set.isComplete
                                        ? 'Set complete'
                                        : 'In progress'}
                                    </span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>

                          <div
                            className={`mt-4 rounded-xl border p-3 text-xs ${
                              rewardReady
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                                : 'border-border/60 bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            <div className="text-[11px] uppercase tracking-[0.2em]">
                              Mega Reward
                            </div>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {rewardReady
                                ? 'Album complete — mega reward unlocked!'
                                : 'Finish every set to unlock the mega reward.'}
                            </p>
                            <p className="mt-1 text-xs">
                              {rewardReady
                                ? 'Expect a vault-sized bonus drop with a premium perk.'
                                : 'Complete the season album to claim the vault-sized bonus.'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {selectedSet && (
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {selectedSet.code} Set Detail
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">
                        {selectedSet.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedSet.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent">
                      {selectedSet.itemsOwned}/{selectedSet.itemsTotal} collected
                    </span>
                  </div>
                  {!selectedSet.isUnlocked && (
                    <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">
                      Complete the previous set to unlock this collection.
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {selectedSet.items.map((item) => {
                      const isPending = isVaultPurchasing && pendingItemId === item.id
                      const isOwned = item.isOwned
                      const discountedPrice = getDiscountedPrice(item.price)
                      const hasDiscount = sanitizedDiscount > 0 && discountedPrice < item.price
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-2 text-center text-[10px] ${
                            isOwned
                              ? 'border-accent/60 bg-accent/10'
                              : 'border-border/70 bg-muted/30'
                          }`}
                        >
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 text-lg">
                            {item.icon}
                          </div>
                          <div className="mt-2 font-semibold text-foreground truncate">
                            {item.name}
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {hasDiscount && (
                              <span className="mr-1 line-through opacity-70">
                                {formatCurrency(item.currency)}
                                {item.price.toLocaleString()}
                              </span>
                            )}
                            <span className={hasDiscount ? 'font-semibold text-foreground' : undefined}>
                              {formatCurrency(item.currency)}
                              {discountedPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            {item.rarity}
                          </div>
                          <div className="mt-1 text-[10px] font-semibold text-accent">
                            {isOwned ? 'Owned' : 'Missing'}
                          </div>
                          <Button
                            size="sm"
                            className="mt-2 h-7 w-full text-[10px]"
                            disabled={
                              !onVaultPurchase ||
                              isOwned ||
                              isVaultPurchasing ||
                              !selectedSet.isUnlocked
                            }
                            onClick={() => handlePurchase(item)}
                          >
                            {isOwned
                              ? 'Owned'
                              : isPending
                              ? 'Purchasing...'
                              : `Buy ${formatCurrency(item.currency)}${discountedPrice.toLocaleString()}`}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <h3 className="text-base font-semibold text-foreground">Stars Balance</h3>
                <p className="mt-2 text-xl font-semibold text-accent">
                  {gameState.stars.toLocaleString()} ⭐
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stars will still power legacy shop purchases.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-5 py-4">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Back to Board
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Shop2Modal
