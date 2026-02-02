/**
 * Bear Trap Timed Event Surface
 * Game 8 of 10
 */

import { ClockCountdown, ShieldChevron, Snowflake, Sparkle, TrendDown, Warning, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface BearTrapProps {
  onClose: () => void
}

const DEFENSE_PODS = [
  {
    id: 'hedge-haven',
    label: 'Hedge Haven',
    perk: 'Loss shield',
    bonus: '+25% stars',
    risk: 'Low drawdown',
  },
  {
    id: 'cash-bunker',
    label: 'Cash Bunker',
    perk: 'Stable reserve',
    bonus: '+2 rolls',
    risk: 'Medium drawdown',
  },
  {
    id: 'rebound-ridge',
    label: 'Rebound Ridge',
    perk: 'Reversal boost',
    bonus: '+18% coins',
    risk: 'High drawdown',
  },
]

const BEAR_ALERTS = [
  {
    symbol: 'RISK',
    name: 'Risk Spiral',
    callout: 'Trim exposure fast',
  },
  {
    symbol: 'SELL',
    name: 'Sell-Off Wave',
    callout: 'Momentum break',
  },
  {
    symbol: 'CASH',
    name: 'Cash Flow Dip',
    callout: 'Defend liquidity',
  },
]

export function BearTrap({ onClose }: BearTrapProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeBearTrap = activeMiniGames.find(game => game.id === 'bear-trap')
  const upcomingBearTrap = upcomingMiniGames.find(game => game.id === 'bear-trap')
  const remaining = activeBearTrap ? getTimeRemaining(activeBearTrap) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeBearTrap) {
      return remaining ? `Bear Trap live • ${remaining.display} left` : 'Bear Trap live'
    }
    if (upcomingBearTrap) {
      return `Next drop • ${formatTime(upcomingBearTrap.startsAt)}`
    }
    return 'Bear Trap schedule pending'
  }, [activeBearTrap, upcomingBearTrap, remaining])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/80">
            <Sparkle size={18} weight="fill" />
            Bear Trap
            <span className="rounded-full border border-slate-400/40 bg-slate-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-slate-100">
              Game 8 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Shield your portfolio and escape the market slide.</h1>
              <p className="mt-3 max-w-xl text-sm text-slate-100/70 sm:text-base">
                Bear Trap drops each evening. Choose a defense pod, brace for the sell-off, and grab the rebound bonuses before the recovery window closes.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-500/30 bg-slate-950/40 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-slate-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200/70">Crash window</p>
            <p className="mt-2 text-3xl font-bold text-white">2 hours</p>
            <p className="mt-2 text-xs text-slate-100/70">
              Nightly market drop with limited recovery plays.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200/70">Defense bonus</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <ShieldChevron size={26} weight="fill" className="text-slate-200" />
              +25%
            </p>
            <p className="mt-2 text-xs text-slate-100/70">
              Successful hedges stack extra stars for your next roll.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200/70">Rebound meter</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <TrendDown size={26} weight="fill" className="text-blue-200" />
              3x swing
            </p>
            <p className="mt-2 text-xs text-slate-100/70">
              Flip bearish streaks into a high-reward bounce.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Defense Pods</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                3 shelter paths
              </span>
            </div>
            <div className="space-y-4">
              {DEFENSE_PODS.map(pod => (
                <div
                  key={pod.id}
                  className="rounded-2xl border border-slate-400/20 bg-black/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-500/20 px-2 py-1 text-xs font-bold text-slate-100">
                          {pod.perk}
                        </span>
                        <span className="text-sm font-semibold text-slate-100">{pod.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-200/70">{pod.risk}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{pod.bonus}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-slate-200 px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                      Secure pod
                    </Button>
                    <span className="text-xs text-slate-200/70">
                      Defense stacks with ring multipliers.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-400/20 bg-slate-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                Bear signal
              </p>
              <p className="mt-3 text-2xl font-bold text-white">DEEP RED</p>
              <p className="mt-2 text-xs text-slate-100/70">
                Stay defensive to unlock rebound boosts at the bell.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-500/20 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bear Alerts</h2>
              <Snowflake size={22} className="text-blue-200" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-100/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                Guard cash flow to stay above the freeze line.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                Rotate into defense pods before the alert ticks down.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                Recovery picks unlock bonus rolls when the market rebounds.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-slate-400/20 bg-slate-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                Freeze warning
              </p>
              <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                <Warning size={22} weight="fill" className="text-amber-200" />
                Volatility spike
              </p>
              <p className="mt-2 text-xs text-slate-100/70">
                Watch for alerts that can slash the rebound meter.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-400/20 bg-black/40 p-4 text-xs text-slate-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-slate-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-slate-200/80">
                  Ends in {remaining.display}. Hold the line now.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-500/20 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alert Stream</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">Live feed</span>
          </div>
          <div className="mt-4 space-y-3">
            {BEAR_ALERTS.map(alert => (
              <div
                key={alert.symbol}
                className="flex items-center justify-between rounded-2xl border border-slate-400/20 bg-black/40 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/20 text-xs font-bold text-slate-100">
                    {alert.symbol}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-100">{alert.name}</p>
                    <p className="text-xs text-slate-200/70">{alert.callout}</p>
                  </div>
                </div>
                <Button className="h-9 rounded-full border border-slate-400/40 bg-transparent px-4 text-xs font-semibold text-slate-100 hover:bg-white/10">
                  Guard
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
