/**
 * Stock Rush Timed Event Surface
 * Game 2 of 10
 */

import { ClockCountdown, Lightning, Sparkle, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface StockRushProps {
  onClose: () => void
}

const RUSH_DISCOUNT = 0.2
const RUSH_BONUS_STARS = 15
const MOCK_STOCKS = [
  {
    symbol: 'ALFA',
    name: 'Alpha Robotics',
    price: 420,
    supply: 280,
    claimed: 212,
    momentum: 'Surging',
    category: 'AI',
  },
  {
    symbol: 'VOLT',
    name: 'VoltGrid Energy',
    price: 305,
    supply: 190,
    claimed: 138,
    momentum: 'Hot',
    category: 'Clean Energy',
  },
  {
    symbol: 'CLOUD',
    name: 'Nimbus Cloud',
    price: 260,
    supply: 240,
    claimed: 96,
    momentum: 'Heating',
    category: 'SaaS',
  },
  {
    symbol: 'NOVA',
    name: 'Nova Bio',
    price: 375,
    supply: 150,
    claimed: 112,
    momentum: 'Breaking',
    category: 'Biotech',
  },
]

export function StockRush({ onClose }: StockRushProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()

  const activeRush = activeMiniGames.find(game => game.id === 'stock-rush')
  const upcomingRush = upcomingMiniGames.find(game => game.id === 'stock-rush')
  const remaining = activeRush ? getTimeRemaining(activeRush) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeRush) {
      return remaining ? `Rush live • ${remaining.display} left` : 'Rush live'
    }
    if (upcomingRush) {
      return `Next rush • ${formatTime(upcomingRush.startsAt)}`
    }
    return 'Rush schedule pending'
  }, [activeRush, remaining, upcomingRush])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
            <Sparkle size={18} weight="fill" />
            Stock Rush
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-100">
              Game 2 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Grab discounted stocks before the bell.</h1>
              <p className="mt-3 max-w-xl text-sm text-emerald-100/70 sm:text-base">
                Stock Rush runs three times a day. Prices drop and bonus stars stack while the timer ticks down.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-950/40 p-5 shadow-[0_20px_60px_rgba(16,185,129,0.15)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Rush Discount</p>
            <p className="mt-2 text-3xl font-bold text-white">-20%</p>
            <p className="mt-2 text-xs text-emerald-100/70">
              Every pick in the rush lane is automatically discounted.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Bonus Stars</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <Lightning size={26} weight="fill" className="text-yellow-300" />
              +{RUSH_BONUS_STARS}%
            </p>
            <p className="mt-2 text-xs text-emerald-100/70">
              Rush purchases boost star rewards for the next roll.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Limited Supply</p>
            <p className="mt-2 text-3xl font-bold text-white">First come</p>
            <p className="mt-2 text-xs text-emerald-100/70">
              Each pick has a finite rush batch. Grab a slot fast.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-emerald-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Rush Picks</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                4 live lots
              </span>
            </div>
            <div className="space-y-4">
              {MOCK_STOCKS.map(stock => {
                const discounted = Math.round(stock.price * (1 - RUSH_DISCOUNT))
                const claimedPercent = Math.min(100, Math.round((stock.claimed / stock.supply) * 100))
                return (
                  <div
                    key={stock.symbol}
                    className="rounded-2xl border border-emerald-400/20 bg-black/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-100">
                            {stock.symbol}
                          </span>
                          <span className="text-sm font-semibold text-emerald-100">{stock.name}</span>
                        </div>
                        <p className="mt-2 text-xs text-emerald-200/70">
                          {stock.category} • {stock.momentum} momentum
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-200/70 line-through">
                          ${stock.price.toLocaleString()}
                        </p>
                        <p className="text-xl font-bold text-white">
                          ${discounted.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-950">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${claimedPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200/70">
                        {claimedPercent}% claimed
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button className="h-10 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-black hover:bg-emerald-400">
                        Quick buy
                      </Button>
                      <span className="text-xs text-emerald-200/70">
                        Limited batch • {stock.supply - stock.claimed} slots left
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold">Rush Checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-emerald-100/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Tap a pick to lock in the discounted price instantly.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Bonus stars apply to your next roll payout.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Rush slots disappear once the batch is claimed.
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/70">
                Rush Signal
              </p>
              <p className="mt-3 text-2xl font-bold text-white">RUSH MODE</p>
              <p className="mt-2 text-xs text-emerald-100/70">
                Stock tiles glow while the rush timer is active.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-black/40 p-4 text-xs text-emerald-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-emerald-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-emerald-200/80">
                  Ends in {remaining.display}. Grab a slot now.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
