/**
 * Dividend Derby Timed Event Surface
 * Game 6 of 10
 */

import { ClockCountdown, FlagCheckered, Sparkle, Trophy, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface DividendDerbyProps {
  onClose: () => void
}

const DERBY_LANES = [
  {
    id: 'steady-pace',
    name: 'Steady Pace',
    yield: '4.2% yield',
    boost: '+12% payout',
    signal: 'Low volatility',
  },
  {
    id: 'growth-streak',
    name: 'Growth Streak',
    yield: '3.1% yield',
    boost: '+25% payout',
    signal: 'High momentum',
  },
  {
    id: 'income-surge',
    name: 'Income Surge',
    yield: '5.6% yield',
    boost: '+18% payout',
    signal: 'Quarterly kicker',
  },
]

const DERBY_CARDS = [
  {
    symbol: 'DIVX',
    name: 'Dividend Empire',
    note: 'Blue-chip staples',
    odds: 'Leader',
  },
  {
    symbol: 'PAYA',
    name: 'Payrise Utilities',
    note: 'Stable cash flows',
    odds: 'Catching up',
  },
  {
    symbol: 'YILD',
    name: 'Yield Lane REIT',
    note: 'Monthly distributions',
    odds: 'Fast finish',
  },
]

export function DividendDerby({ onClose }: DividendDerbyProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeDerby = activeMiniGames.find(game => game.id === 'dividend-derby')
  const upcomingDerby = upcomingMiniGames.find(game => game.id === 'dividend-derby')
  const remaining = activeDerby ? getTimeRemaining(activeDerby) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeDerby) {
      return remaining ? `Derby live • ${remaining.display} left` : 'Derby live'
    }
    if (upcomingDerby) {
      return `Next derby • ${formatTime(upcomingDerby.startsAt)}`
    }
    return 'Derby schedule pending'
  }, [activeDerby, remaining, upcomingDerby])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
            <Sparkle size={18} weight="fill" />
            Dividend Derby
            <span className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-indigo-100">
              Game 6 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Race your dividend picks to the payout line.</h1>
              <p className="mt-3 max-w-xl text-sm text-indigo-100/70 sm:text-base">
                Dividend Derby is a monthly showcase where three portfolio picks sprint for bonus payouts.
                Build a diverse lineup and chase the photo finish.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/40 p-5 shadow-[0_20px_60px_rgba(99,102,241,0.2)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-indigo-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Event cadence</p>
            <p className="mt-2 text-3xl font-bold text-white">Monthly</p>
            <p className="mt-2 text-xs text-indigo-100/70">
              Special derby window with boosted dividend bonuses.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Pick lineup</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <FlagCheckered size={26} weight="fill" className="text-indigo-300" />
              3 stocks
            </p>
            <p className="mt-2 text-xs text-indigo-100/70">
              Choose three portfolio names to anchor the race.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Top prize</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <Trophy size={26} weight="fill" className="text-yellow-300" />
              +30% dividends
            </p>
            <p className="mt-2 text-xs text-indigo-100/70">
              First-place finisher multiplies the payout pool.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-indigo-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Race Lanes</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">
                3 pace paths
              </span>
            </div>
            <div className="space-y-4">
              {DERBY_LANES.map(lane => (
                <div
                  key={lane.id}
                  className="rounded-2xl border border-indigo-400/20 bg-black/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-bold text-indigo-100">
                          {lane.name}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-indigo-200/70">
                        {lane.signal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-indigo-200/70">{lane.yield}</p>
                      <p className="text-lg font-bold text-white">{lane.boost}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-400">
                      Reserve lane
                    </Button>
                    <span className="text-xs text-indigo-200/70">
                      Lane bonuses stack with ring multipliers.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">
                Photo finish
              </p>
              <p className="mt-3 text-2xl font-bold text-white">Dividend sprint</p>
              <p className="mt-2 text-xs text-indigo-100/70">
                Final stretch highlights the leading stock and payout multiplier.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold">Derby Lineup</h2>
            <ul className="mt-4 space-y-3 text-sm text-indigo-100/80">
              {DERBY_CARDS.map(card => (
                <li key={card.symbol} className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-black/30 p-3">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-100">
                    {card.symbol}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{card.name}</p>
                    <p className="text-xs text-indigo-200/70">{card.note}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-200/70">
                      {card.odds}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">
                Derby Window
              </p>
              <p className="mt-3 text-2xl font-bold text-white">Lineup ready</p>
              <p className="mt-2 text-xs text-indigo-100/70">
                Enter early to lock dividend boosters before the gate opens.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-black/40 p-4 text-xs text-indigo-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-indigo-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-indigo-200/80">
                  Ends in {remaining.display}. Lock your dividend picks now.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
