/**
 * Vault Heist Timed Event Surface
 * Game 3 of 10
 */

import { ClockCountdown, LockKey, Siren, Sparkle, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface VaultHeistProps {
  onClose: () => void
}

const HEIST_LOCKERS = [
  {
    id: 'alpha-vault',
    label: 'Alpha Vault',
    tier: 'Platinum tier',
    payout: 'Coins + bonus rolls',
    risk: 'High alert',
  },
  {
    id: 'gold-run',
    label: 'Gold Run',
    tier: 'Gold tier',
    payout: 'Mega coins',
    risk: 'Medium alert',
  },
  {
    id: 'shadow-cache',
    label: 'Shadow Cache',
    tier: 'Silver tier',
    payout: 'Stars + boosters',
    risk: 'Low alert',
  },
]

export function VaultHeist({ onClose }: VaultHeistProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()

  const activeHeist = activeMiniGames.find(game => game.id === 'vault-heist')
  const upcomingHeist = upcomingMiniGames.find(game => game.id === 'vault-heist')
  const remaining = activeHeist ? getTimeRemaining(activeHeist) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activeHeist) {
      return remaining ? `Heist live • ${remaining.display} left` : 'Heist live'
    }
    if (upcomingHeist) {
      return `Next heist • ${formatTime(upcomingHeist.startsAt)}`
    }
    return 'Heist schedule pending'
  }, [activeHeist, upcomingHeist, remaining])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
            <Sparkle size={18} weight="fill" />
            Vault Heist
            <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-amber-100">
              Game 3 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Crack the vault before the alarm hits.</h1>
              <p className="mt-3 max-w-xl text-sm text-amber-100/70 sm:text-base">
                Vault Heist goes live on Saturdays. Build your crew, pick a lane, and claim the biggest coin haul of the week.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-amber-500/30 bg-amber-950/40 p-5 shadow-[0_20px_60px_rgba(251,191,36,0.12)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-amber-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Heist Window</p>
            <p className="mt-2 text-3xl font-bold text-white">60 min</p>
            <p className="mt-2 text-xs text-amber-100/70">
              Limited-time Saturday run with exclusive vault payouts.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Crew Boost</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <LockKey size={26} weight="fill" className="text-yellow-300" />
              +2 picks
            </p>
            <p className="mt-2 text-xs text-amber-100/70">
              Bring a squad for extra vault picks and combo bonuses.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Alarm Risk</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <Siren size={26} weight="fill" className="text-red-300" />
              High
            </p>
            <p className="mt-2 text-xs text-amber-100/70">
              Trip alarms end your run early — pick wisely.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-amber-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Heist Lanes</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
                3 vault paths
              </span>
            </div>
            <div className="space-y-4">
              {HEIST_LOCKERS.map(locker => (
                <div
                  key={locker.id}
                  className="rounded-2xl border border-amber-400/20 bg-black/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-100">
                          {locker.tier}
                        </span>
                        <span className="text-sm font-semibold text-amber-100">{locker.label}</span>
                      </div>
                      <p className="mt-2 text-xs text-amber-200/70">
                        {locker.payout}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-red-200/70">
                      {locker.risk}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button className="h-10 rounded-full bg-amber-500 px-5 text-sm font-semibold text-black hover:bg-amber-400">
                      Brief crew
                    </Button>
                    <span className="text-xs text-amber-200/70">
                      Rewards scale with ring multipliers.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold">Heist Checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-amber-100/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Choose a vault lane with the best risk/reward balance.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Avoid alarm tiles to keep the run alive.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Coordinate picks to maximize bonus coins.
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
                Heist Signal
              </p>
              <p className="mt-3 text-2xl font-bold text-white">VAULT OPEN</p>
              <p className="mt-2 text-xs text-amber-100/70">
                Coin rewards spike during the Saturday window.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-black/40 p-4 text-xs text-amber-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-amber-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-amber-200/80">
                  Ends in {remaining.display}. Secure the vault now.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
