/**
 * Market Mayhem Timed Event Surface
 * Game 4 of 10
 */

import { ChartLineUp, ClockCountdown, Sparkle, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface MarketMayhemProps {
  onClose: () => void
}

const MAYHEM_SIGNALS = [
  {
    symbol: 'NOVA',
    name: 'Nova Bio',
    flash: '+18% bonus stars',
    volatility: 'High',
  },
  {
    symbol: 'VOLT',
    name: 'VoltGrid Energy',
    flash: '-6% penalty risk',
    volatility: 'Extreme',
  },
  {
    symbol: 'LUMO',
    name: 'Lumen Commerce',
    flash: '+12% bonus stars',
    volatility: 'Surging',
  },
]

const MAYHEM_LEADERS = [
  { id: 'player-1', name: 'ChartShark', score: 1860 },
  { id: 'player-2', name: 'MomentumMia', score: 1710 },
  { id: 'player-3', name: 'AlphaAce', score: 1645 },
]

export function MarketMayhem({ onClose }: MarketMayhemProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()

  const activeMayhem = activeMiniGames.find(game => game.id === 'market-mayhem')
  const upcomingMayhem = upcomingMiniGames.find(game => game.id === 'market-mayhem')
  const remaining = activeMayhem ? getTimeRemaining(activeMayhem) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeMayhem) {
      return remaining ? `Mayhem live • ${remaining.display} left` : 'Mayhem live'
    }
    if (upcomingMayhem) {
      return `Next surge • ${formatTime(upcomingMayhem.startsAt)}`
    }
    return 'Mayhem schedule pending'
  }, [activeMayhem, remaining, upcomingMayhem])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-red-950 to-amber-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-200/80">
            <Sparkle size={18} weight="fill" />
            Market Mayhem
            <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-red-100">
              Game 4 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Trade through the chaos before the bell rings.</h1>
              <p className="mt-3 max-w-xl text-sm text-red-100/70 sm:text-base">
                Market Mayhem surges a few times a month. Stocks flash with bonuses and penalties, and every choice must be made fast.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-red-500/30 bg-red-950/40 p-5 shadow-[0_20px_60px_rgba(239,68,68,0.15)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-red-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Decision Timer</p>
            <p className="mt-2 text-3xl font-bold text-white">5 sec</p>
            <p className="mt-2 text-xs text-red-100/70">
              Choose buy, sell, or skip before the clock resets.
            </p>
          </div>
          <div className="rounded-2xl border border-red-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Bonus Swing</p>
            <p className="mt-2 text-3xl font-bold text-white">+20%</p>
            <p className="mt-2 text-xs text-red-100/70">
              Smart picks boost stars while penalties trim coin gains.
            </p>
          </div>
          <div className="rounded-2xl border border-red-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-red-200/70">Trading Floor</p>
            <p className="mt-2 text-3xl font-bold text-white">4 hours</p>
            <p className="mt-2 text-xs text-red-100/70">
              Each surge opens a 4-hour flash window to climb the board.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-red-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Flash Signals</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200/70">
                3 live alerts
              </span>
            </div>
            <div className="space-y-4">
              {MAYHEM_SIGNALS.map(signal => (
                <div
                  key={signal.symbol}
                  className="rounded-2xl border border-red-400/20 bg-black/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-bold text-red-100">
                          {signal.symbol}
                        </span>
                        <span className="text-sm font-semibold text-red-100">{signal.name}</span>
                      </div>
                      <p className="mt-2 text-xs text-red-200/70">
                        Volatility: {signal.volatility}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-red-100/80">
                      {signal.flash}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Button className="h-10 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-black hover:bg-emerald-400">
                      Buy
                    </Button>
                    <Button className="h-10 rounded-full bg-rose-500 px-4 text-xs font-semibold text-white hover:bg-rose-400">
                      Sell
                    </Button>
                    <Button className="h-10 rounded-full border border-white/30 bg-transparent px-4 text-xs font-semibold text-white hover:bg-white/10">
                      Skip
                    </Button>
                    <span className="ml-auto text-xs text-red-200/70">5s left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mayhem Board</h2>
              <ChartLineUp size={22} className="text-red-200" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-red-100/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
                Hit quick streaks to stack bonus stars for the next roll.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
                Wrong calls shave coins but keep your streak alive.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
                A weekly leaderboard tracks your best decision runs.
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200/70">
                Trading Floor
              </p>
              <p className="mt-3 text-2xl font-bold text-white">MAYHEM MODE</p>
              <p className="mt-2 text-xs text-red-100/70">
                Ticker tape flashes while the market is in flux.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-black/40 p-4 text-xs text-red-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-red-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-red-200/80">
                  Ends in {remaining.display}. Lock in your streak now.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-red-500/20 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Decision Runs</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200/70">Leaderboard</span>
          </div>
          <div className="mt-4 space-y-3">
            {MAYHEM_LEADERS.map((leader, index) => (
              <div
                key={leader.id}
                className="flex items-center justify-between rounded-2xl border border-red-400/20 bg-black/40 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-100">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-red-100">{leader.name}</p>
                    <p className="text-xs text-red-200/70">Rapid-fire accuracy</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">{leader.score.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
