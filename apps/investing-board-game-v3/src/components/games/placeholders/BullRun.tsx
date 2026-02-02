/**
 * Bull Run Timed Event Surface
 * Game 7 of 10
 */

import { ClockCountdown, Flame, RocketLaunch, Sparkle, TrendUp, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface BullRunProps {
  onClose: () => void
}

export function BullRun({ onClose }: BullRunProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeBullRun = activeMiniGames.find(game => game.id === 'bull-run')
  const upcomingBullRun = upcomingMiniGames.find(game => game.id === 'bull-run')
  const remaining = activeBullRun ? getTimeRemaining(activeBullRun) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeBullRun) {
      return remaining ? `Bull Run live • ${remaining.display} left` : 'Bull Run live'
    }
    if (upcomingBullRun) {
      return `Next run • ${formatTime(upcomingBullRun.startsAt)}`
    }
    return 'Bull Run schedule pending'
  }, [activeBullRun, upcomingBullRun, remaining])

  const momentumLanes = [
    {
      id: 'green-lane',
      label: 'Momentum Lane',
      signal: 'Stack streaks fast',
      bonus: '+25% stars',
    },
    {
      id: 'volume-lane',
      label: 'Volume Lane',
      signal: 'High turnover picks',
      bonus: '+15% coins',
    },
    {
      id: 'breakout-lane',
      label: 'Breakout Lane',
      signal: 'Riskier callouts',
      bonus: '+1 roll',
    },
  ]

  const surgeCards = [
    {
      symbol: 'BULL',
      name: 'Bullion Tech',
      note: 'Momentum leader',
      signal: '🚀 Breakout alert',
    },
    {
      symbol: 'RISE',
      name: 'Rise Robotics',
      note: 'Volume spike',
      signal: '🔥 Hot streak',
    },
    {
      symbol: 'GAIN',
      name: 'GainGrid Energy',
      note: 'Sector runner',
      signal: '⚡ Speed boost',
    },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-lime-950 via-emerald-950 to-slate-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime-200/80">
            <Sparkle size={18} weight="fill" />
            Bull Run
            <span className="rounded-full border border-lime-400/40 bg-lime-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-lime-100">
              Game 7 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Ride the green wave and lock in the breakout bonus.</h1>
              <p className="mt-3 max-w-xl text-sm text-lime-100/70 sm:text-base">
                Bull Run is a surge window where momentum builds fast. Chain streaks, pick the hottest lane, and bank amplified rewards before the rally fades.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-lime-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-lime-500/30 bg-lime-950/40 p-5 shadow-[0_20px_60px_rgba(132,204,22,0.15)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-lime-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-lime-200/70">Run window</p>
            <p className="mt-2 text-3xl font-bold text-white">90 min</p>
            <p className="mt-2 text-xs text-lime-100/70">
              Short rally sessions that keep the pace high.
            </p>
          </div>
          <div className="rounded-2xl border border-lime-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-lime-200/70">Streak bonus</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <Flame size={26} weight="fill" className="text-orange-300" />
              +30% stars
            </p>
            <p className="mt-2 text-xs text-lime-100/70">
              Maintain the streak meter to amplify your next roll.
            </p>
          </div>
          <div className="rounded-2xl border border-lime-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-lime-200/70">Surge meter</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <TrendUp size={26} weight="fill" className="text-lime-300" />
              3x peaks
            </p>
            <p className="mt-2 text-xs text-lime-100/70">
              Hit momentum peaks to unlock triple reward bursts.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-lime-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Momentum Lanes</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
                3 rally paths
              </span>
            </div>
            <div className="space-y-4">
              {momentumLanes.map(lane => (
                <div
                  key={lane.id}
                  className="rounded-2xl border border-lime-400/20 bg-black/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-lime-500/20 px-2 py-1 text-xs font-bold text-lime-100">
                          {lane.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-lime-200/70">{lane.signal}</p>
                    </div>
                    <div className="text-right text-lg font-bold text-white">{lane.bonus}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-lime-500 px-5 text-sm font-semibold text-black hover:bg-lime-400">
                      Lock lane
                    </Button>
                    <span className="text-xs text-lime-200/70">
                      Bonuses stack with ring multipliers.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
                Rally signal
              </p>
              <p className="mt-3 text-2xl font-bold text-white">GREEN CANDLE</p>
              <p className="mt-2 text-xs text-lime-100/70">
                Rally bonus stacks for every back-to-back hit.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-lime-500/20 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bull Playbook</h2>
              <RocketLaunch size={22} className="text-lime-200" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-lime-100/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-lime-400" />
                Maintain streaks to keep the surge meter climbing.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-lime-400" />
                Use Volume Lane picks to secure steady coin flow.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-lime-400" />
                Breakout Lane wins grant a bonus roll when the meter peaks.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
                Surge picks
              </p>
              <div className="mt-4 space-y-3">
                {surgeCards.map(card => (
                  <div key={card.symbol} className="rounded-xl border border-lime-400/20 bg-black/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{card.name}</p>
                        <p className="text-xs text-lime-200/70">{card.note}</p>
                      </div>
                      <span className="rounded-full bg-lime-500/20 px-2 py-1 text-[11px] font-semibold text-lime-100">
                        {card.symbol}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-lime-200/70">
                      {card.signal}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-lime-400/20 bg-black/40 p-4 text-xs text-lime-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-lime-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-lime-200/80">
                  Ends in {remaining.display}. Ride the rally now.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
