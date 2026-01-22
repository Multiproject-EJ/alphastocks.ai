import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { useShopVaultOverview } from '@/hooks/useShopVaultOverview'
import type { GameState } from '@/lib/types'

interface Shop2ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
}

export function Shop2Modal({ open, onOpenChange, gameState }: Shop2ModalProps) {
  const dialogClass = useResponsiveDialogClass('full')
  const { seasons, loading, error, source } = useShopVaultOverview()

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
                              return (
                                <div
                                  key={set.id}
                                  className="rounded-xl border border-border/70 bg-muted/30 p-3"
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
                                      {set.itemsOwned}/{set.itemsTotal}
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
                                    <span>{set.isComplete ? 'Set complete' : 'In progress'}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

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
