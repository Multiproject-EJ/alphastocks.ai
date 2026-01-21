import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import type { GameState } from '@/lib/types'

interface Shop2ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
}

export function Shop2Modal({ open, onOpenChange, gameState }: Shop2ModalProps) {
  const dialogClass = useResponsiveDialogClass('full')

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
                <h3 className="text-base font-semibold text-foreground">
                  Coming in Shop 2.0
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Season vaults with collectible 4×3 sets</li>
                  <li>• Completion rewards and unlock chains</li>
                  <li>• Flash discounts tied to economy windows</li>
                </ul>
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
