import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type CasinoModePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMiniGame: (miniGameId: string) => void
}

const modeAGames = [
  { id: 'scratchcard', label: 'Scratchcard Vault', icon: '🎟️', status: 'live' },
  { id: 'high-roller-dice', label: 'High Roller Dice', icon: '🎲', status: 'live' },
  { id: 'market-blackjack', label: 'Market Blackjack', icon: '🂡', status: 'live' },
  { id: 'portfolio-poker', label: 'Portfolio Poker', icon: '🃏', status: 'placeholder' },
  { id: 'macro-slots', label: 'Macro Slots', icon: '🎰', status: 'placeholder' },
  { id: 'bull-bear-race', label: 'Bull/Bear Race', icon: '🐂', status: 'placeholder' },
  { id: 'insider-wheel', label: 'Insider Wheel', icon: '🎡', status: 'placeholder' },
  { id: 'vault-jackpot', label: 'Vault Jackpot', icon: '💎', status: 'placeholder' },
] as const

export function CasinoModePanel({ open, onOpenChange, onSelectMiniGame }: CasinoModePanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-lg rounded-2xl border border-amber-300/50 bg-gradient-to-br from-yellow-500/20 via-amber-900/60 to-black p-4 text-amber-50">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100/70">Casino Mode A</p>
          <h2 className="text-lg font-bold text-white">Golden Tile Hunt</h2>
          <p className="mt-1 text-xs text-amber-100/80">
            Pick one of 8 casino game tiles. Scratchcard is fully integrated as a live mini-game.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {modeAGames.map((game) => (
            <Button
              key={game.id}
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-1 border-amber-200/40 bg-black/30 px-3 py-3 text-left hover:bg-black/45"
              onClick={() => onSelectMiniGame(game.id)}
            >
              <span className="text-base leading-none">{game.icon}</span>
              <span className="text-xs font-semibold text-amber-50">{game.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-amber-100/70">
                {game.status === 'live' ? 'Live table' : 'Placeholder'}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

