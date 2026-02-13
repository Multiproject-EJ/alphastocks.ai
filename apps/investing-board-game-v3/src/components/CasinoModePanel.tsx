import { Button } from '@/components/ui/button'
import { MODE_A_GAMES, type CasinoMode, type CasinoModePhase } from '@/lib/casinoMode'

type CasinoModePanelProps = {
  mode: CasinoMode
  phase: CasinoModePhase
  onSelectMiniGame: (miniGameId: string) => void
  onRandomPick: () => void
  onSpin: () => void
  selectedNumbers: number[]
  rouletteLocked: boolean
  onToggleNumber: (index: number) => void
  onReset: () => void
}

export function CasinoModePanel({
  mode,
  phase,
  onSelectMiniGame,
  onRandomPick,
  onSpin,
  selectedNumbers,
  rouletteLocked,
  onToggleNumber,
  onReset,
}: CasinoModePanelProps) {
  if (mode === 'none') return null

  return (
    <div className="pointer-events-auto fixed inset-x-2 bottom-2 z-[70] rounded-2xl border border-amber-200/40 bg-black/90 p-3 text-white shadow-2xl backdrop-blur-sm pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:inset-x-auto md:right-4 md:w-[360px]">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Casino {mode === 'modeA' ? 'Mode A' : 'Mode B'}</p>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={onReset}>Safe Exit</Button>
      </div>
      {mode === 'modeA' ? (
        <>
          <p className="text-sm font-semibold">Golden Tile Hunt</p>
          <p className="mb-2 text-xs text-amber-100/80">Land on a game tile to start a mini-game.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODE_A_GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                className="min-h-11 rounded-md border border-amber-300/30 bg-amber-500/10 px-2 py-1.5 text-left text-xs"
                onClick={() => onSelectMiniGame(game.id)}
              >
                {game.icon} {game.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold">Roulette Ring</p>
          <p className="mb-2 text-xs text-emerald-100/80">Pick 5 numbers, then spin. {selectedNumbers.length}/5 selected.</p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }, (_, index) => {
              const selected = selectedNumbers.includes(index)
              return (
                <button
                  key={index}
                  type="button"
                  disabled={rouletteLocked}
                  onClick={() => onToggleNumber(index)}
                  className={`min-h-10 rounded text-xs font-semibold ${selected ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'} disabled:opacity-40`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" className="flex-1" variant="outline" onClick={onRandomPick} disabled={rouletteLocked}>Random Pick</Button>
            <Button size="sm" className="flex-1" onClick={onSpin} disabled={rouletteLocked || selectedNumbers.length !== 5 || phase === 'spinning'}>Spin</Button>
          </div>
        </>
      )}
    </div>
  )
}
