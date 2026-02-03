/**
 * IPO Frenzy Timed Event Surface
 * Game 9 of 10
 */

import { ChartLineUp, ClockCountdown, RocketLaunch, Sparkle, TrendUp, UsersThree, Warning, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface IpoFrenzyProps {
  onClose: () => void
}

const IPO_ALLOCS = [
  {
    id: 'anchor',
    label: 'Anchor Allocation',
    perk: 'Founder access',
    bonus: '+25% cash',
    detail: 'Early access locks premium IPO pricing.',
  },
  {
    id: 'momentum',
    label: 'Momentum Book',
    perk: 'First-day pop',
    bonus: '+18% stars',
    detail: 'Ride demand surges into launch-day rewards.',
  },
  {
    id: 'steady',
    label: 'Steady Syndicate',
    perk: 'Safe ladder',
    bonus: '+2 rolls',
    detail: 'Balanced picks keep volatility under control.',
  },
]

const ROADSHOWS = [
  {
    name: 'Pulse Robotics',
    sector: 'AI manufacturing',
    hype: 'Oversubscribed',
  },
  {
    name: 'Aurora Health',
    sector: 'Bio-tech',
    hype: 'Anchor banks in',
  },
  {
    name: 'Nimbus Grid',
    sector: 'Clean energy',
    hype: 'Retail waitlist',
  },
]

const POP_SIGNALS = [
  { label: 'Demand spike', detail: 'Track order book momentum.', accent: 'bg-rose-400' },
  { label: 'Underwriter boost', detail: 'Stabilization keeps launch strong.', accent: 'bg-pink-400' },
  { label: 'Lockup watch', detail: 'Exit before insiders sell.', accent: 'bg-fuchsia-400' },
]

export function IpoFrenzy({ onClose }: IpoFrenzyProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeIpo = activeMiniGames.find(game => game.id === 'ipo-frenzy')
  const upcomingIpo = upcomingMiniGames.find(game => game.id === 'ipo-frenzy')
  const remaining = activeIpo ? getTimeRemaining(activeIpo) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeIpo) {
      return remaining ? `IPO Frenzy live • ${remaining.display} left` : 'IPO Frenzy live'
    }
    if (upcomingIpo) {
      return `Next IPO window • ${formatTime(upcomingIpo.startsAt)}`
    }
    return 'IPO schedule pending'
  }, [activeIpo, remaining, upcomingIpo])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-rose-950 via-fuchsia-950 to-slate-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/80">
            <Sparkle size={18} weight="fill" />
            IPO Frenzy
            <span className="rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-rose-100">
              Game 9 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Lock allocations, ride the pop, exit before the lockup.</h1>
              <p className="mt-3 max-w-xl text-sm text-rose-100/70 sm:text-base">
                IPO Frenzy is a timed launch window where you sift hot listings, book allocations, and
                cash out on first-day surges. Choose your syndicate and protect your upside.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-rose-500/30 bg-rose-950/40 p-5 shadow-[0_20px_60px_rgba(190,18,60,0.25)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-rose-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Launch window</p>
            <p className="mt-2 text-3xl font-bold text-white">2 hours</p>
            <p className="mt-2 text-xs text-rose-100/70">
              Limited trading time to secure first-day rewards.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Pop target</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <RocketLaunch size={26} weight="fill" className="text-rose-300" />
              1.8x
            </p>
            <p className="mt-2 text-xs text-rose-100/70">
              Hit the pop meter before the bell to unlock bonuses.
            </p>
          </div>
          <div className="rounded-2xl border border-rose-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Underwriter boost</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <ChartLineUp size={26} weight="fill" className="text-pink-200" />
              +15%
            </p>
            <p className="mt-2 text-xs text-rose-100/70">
              Stabilization support protects your allocation.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-rose-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Allocation Playbooks</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200/70">
                3 syndicates
              </span>
            </div>
            <div className="space-y-4">
              {IPO_ALLOCS.map(allocation => (
                <div
                  key={allocation.id}
                  className="rounded-2xl border border-rose-400/20 bg-black/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-100">
                          {allocation.perk}
                        </span>
                        <span className="text-sm font-semibold text-rose-100">{allocation.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-rose-200/70">{allocation.detail}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{allocation.bonus}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-rose-200 px-5 text-sm font-semibold text-rose-900 hover:bg-rose-100">
                      Lock allocation
                    </Button>
                    <span className="text-xs text-rose-200/70">
                      Stack with ring multipliers for max return.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200/70">
                Roadshow pipeline
              </p>
              <div className="mt-4 space-y-3">
                {ROADSHOWS.map(show => (
                  <div key={show.name} className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-black/40 px-3 py-2 text-xs text-rose-100/80">
                    <div>
                      <p className="font-semibold text-white">{show.name}</p>
                      <p className="text-rose-200/70">{show.sector}</p>
                    </div>
                    <span className="rounded-full bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-100">
                      {show.hype}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-500/20 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pop Signals</h2>
              <TrendUp size={22} className="text-rose-200" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-rose-100/80">
              {POP_SIGNALS.map(signal => (
                <li key={signal.label} className="rounded-xl border border-rose-500/20 bg-black/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className={`h-2 w-2 rounded-full ${signal.accent}`} />
                    {signal.label}
                  </div>
                  <p className="mt-2 text-xs text-rose-200/70">{signal.detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200/70">
                Syndicate crew
              </p>
              <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                <UsersThree size={22} weight="fill" className="text-rose-200" />
                5 underwriters
              </p>
              <p className="mt-2 text-xs text-rose-100/70">
                Crew strength raises the first-day pop meter faster.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-black/40 p-4 text-xs text-rose-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-rose-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-rose-200/80">
                  Ends in {remaining.display}. Lock your exit now.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200/70">
                Lockup risk
              </p>
              <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                <Warning size={22} weight="fill" className="text-amber-200" />
                Insider sell wall
              </p>
              <p className="mt-2 text-xs text-rose-100/70">
                Cash out before the lockup pressure hits.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
