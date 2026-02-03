/**
 * Merger Mania Timed Event Surface
 * Game 10 of 10
 */

import {
  ArrowsClockwise,
  Briefcase,
  Buildings,
  ChartLineUp,
  ClockCountdown,
  Handshake,
  Scales,
  ShieldCheck,
  Sparkle,
  TrendUp,
  UsersThree,
  X,
} from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface MergerManiaProps {
  onClose: () => void
}

const DEAL_TARGETS = [
  {
    id: 'lumen-stream',
    name: 'Lumen Stream',
    sector: 'Media tech',
    leverage: 'Dual-class shares',
    boost: '+18% cash',
  },
  {
    id: 'nova-grid',
    name: 'Nova Grid',
    sector: 'Energy infra',
    leverage: 'Regulatory fast-track',
    boost: '+2 rolls',
  },
  {
    id: 'quantum-ward',
    name: 'Quantum Ward',
    sector: 'Cyber defense',
    leverage: 'Defense contracts',
    boost: '+22% stars',
  },
]

const SYNERGY_TRACKS = [
  {
    label: 'Revenue synergy',
    detail: 'Cross-sell the winning pipeline.',
    value: '2.4x',
  },
  {
    label: 'Cost synergy',
    detail: 'Shrink burn within 90 days.',
    value: '-28%',
  },
  {
    label: 'Integration pace',
    detail: 'Lock the merger before the window closes.',
    value: '6 weeks',
  },
]

const NEGOTIATION_LEVERS = [
  {
    label: 'Earnout escalator',
    detail: 'Trigger bonus payouts on milestone hits.',
    accent: 'bg-teal-400',
  },
  {
    label: 'Share swap hedge',
    detail: 'Offset volatility with swap collars.',
    accent: 'bg-cyan-400',
  },
  {
    label: 'Antitrust buffer',
    detail: 'Build a regulatory proof pack.',
    accent: 'bg-sky-400',
  },
]

export function MergerMania({ onClose }: MergerManiaProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activeMerger = activeMiniGames.find(game => game.id === 'merger-mania')
  const upcomingMerger = upcomingMiniGames.find(game => game.id === 'merger-mania')
  const remaining = activeMerger ? getTimeRemaining(activeMerger) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeMerger) {
      return remaining ? `Merger Mania live • ${remaining.display} left` : 'Merger Mania live'
    }
    if (upcomingMerger) {
      return `Next deal window • ${formatTime(upcomingMerger.startsAt)}`
    }
    return 'Deal schedule pending'
  }, [activeMerger, remaining, upcomingMerger])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-teal-950 via-cyan-950 to-slate-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200/80">
            <Sparkle size={18} weight="fill" />
            Merger Mania
            <span className="rounded-full border border-teal-400/40 bg-teal-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-teal-100">
              Game 10 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Broker the biggest deals before rivals steal the synergies.</h1>
              <p className="mt-3 max-w-xl text-sm text-teal-100/70 sm:text-base">
                Merger Mania is a timed M&amp;A sprint. Scout target lists, balance negotiation levers, and
                lock in integration wins before the window closes.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-teal-500/30 bg-teal-950/40 p-5 shadow-[0_20px_60px_rgba(13,148,136,0.25)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-teal-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">Deal window</p>
            <p className="mt-2 text-3xl font-bold text-white">90 min</p>
            <p className="mt-2 text-xs text-teal-100/70">
              Close before the window cools and rivals scoop targets.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">Synergy target</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <TrendUp size={26} weight="fill" className="text-teal-200" />
              2.4x
            </p>
            <p className="mt-2 text-xs text-teal-100/70">
              Hit the synergy meter to unlock payout boosts.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/70">Regulatory risk</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <ShieldCheck size={26} weight="fill" className="text-cyan-200" />
              Medium
            </p>
            <p className="mt-2 text-xs text-teal-100/70">
              Keep the antitrust gauge below 65%.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-teal-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Deal Targets</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                3 active
              </span>
            </div>
            <div className="space-y-4">
              {DEAL_TARGETS.map(target => (
                <div
                  key={target.id}
                  className="rounded-2xl border border-teal-400/20 bg-black/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-teal-500/20 px-2 py-1 text-xs font-bold text-teal-100">
                          {target.sector}
                        </span>
                        <span className="text-sm font-semibold text-teal-100">{target.name}</span>
                      </div>
                      <p className="mt-2 text-xs text-teal-200/70">{target.leverage}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{target.boost}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-teal-200 px-5 text-sm font-semibold text-teal-900 hover:bg-teal-100">
                      Draft term sheet
                    </Button>
                    <span className="text-xs text-teal-200/70">
                      Secure exclusivity for bonus points.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                Integration map
              </p>
              <div className="mt-4 space-y-3">
                {SYNERGY_TRACKS.map(track => (
                  <div
                    key={track.label}
                    className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-black/40 px-3 py-2 text-xs text-teal-100/80"
                  >
                    <div>
                      <p className="font-semibold text-white">{track.label}</p>
                      <p className="text-teal-200/70">{track.detail}</p>
                    </div>
                    <span className="rounded-full bg-teal-500/20 px-2 py-1 text-[11px] font-semibold text-teal-100">
                      {track.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-teal-500/20 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Negotiation Levers</h2>
              <Handshake size={22} className="text-teal-200" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-teal-100/80">
              {NEGOTIATION_LEVERS.map(lever => (
                <li key={lever.label} className="rounded-xl border border-teal-500/20 bg-black/30 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className={`h-2 w-2 rounded-full ${lever.accent}`} />
                    {lever.label}
                  </div>
                  <p className="mt-2 text-xs text-teal-200/70">{lever.detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                Deal squad
              </p>
              <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                <UsersThree size={22} weight="fill" className="text-teal-200" />
                6 advisors
              </p>
              <p className="mt-2 text-xs text-teal-100/70">
                Senior advisors unlock premium term-sheet clauses.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-black/40 p-4 text-xs text-teal-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-teal-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-teal-200/80">
                  Ends in {remaining.display}. Finalize integration now.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-teal-400/20 bg-teal-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                  Deal valuation
                </p>
                <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                  <ChartLineUp size={22} weight="fill" className="text-cyan-200" />
                  $4.2B
                </p>
                <p className="mt-2 text-xs text-teal-100/70">
                  Use leverage slots to raise the final multiple.
                </p>
              </div>
              <div className="rounded-2xl border border-teal-400/20 bg-black/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                  Integration guardrails
                </p>
                <p className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
                  <Scales size={22} weight="fill" className="text-teal-200" />
                  3/5
                </p>
                <p className="mt-2 text-xs text-teal-100/70">
                  Clear compliance gates before closing.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-black/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/70">
                Executive briefing
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-teal-100/80">
                <Buildings size={20} className="text-teal-200" />
                Consolidate towers to unlock a final synergy surge.
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-teal-100/80">
                <Briefcase size={20} className="text-teal-200" />
                Protect staff retention to keep momentum high.
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-teal-100/80">
                <ArrowsClockwise size={20} className="text-teal-200" />
                Rotate advisory leads to refresh leverage options.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
