/**
 * Portfolio Poker Timed Event Surface
 * Game 5 of 10
 */

import { Cards, ClockCountdown, CrownSimple, Sparkle, X } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useMiniGames } from '@/hooks/useMiniGames'

interface PortfolioPokerProps {
  onClose: () => void
}

const HAND_COMBOS = [
  {
    name: 'Dividend Flush',
    bonus: '+30% dividends',
    detail: '5 dividend stocks in the same sector.',
  },
  {
    name: 'Growth Straight',
    bonus: '+25% cash prize',
    detail: 'Stack growth picks by score to climb the ladder.',
  },
  {
    name: 'Value Full House',
    bonus: '+2 rolls',
    detail: 'Mix blue chips with value builders for safety.',
  },
]

const OPPONENTS = [
  { name: 'Quant Queen', style: 'Math-first, loves low volatility', badge: 'AA' },
  { name: 'Momentum Ace', style: 'Aggressive, stacks growth runs', badge: '🔥' },
  { name: 'Dividend Don', style: 'Slow burn, stacks payouts', badge: '💰' },
]

const ROUNDS = [
  { label: 'Deal', status: 'Stock cards drop', accent: 'bg-cyan-400' },
  { label: 'Swap', status: 'Trade 2 cards', accent: 'bg-sky-400' },
  { label: 'Showdown', status: 'Score the hand', accent: 'bg-indigo-400' },
]

export function PortfolioPoker({ onClose }: PortfolioPokerProps) {
  const { activeMiniGames, upcomingMiniGames, getTimeRemaining } = useMiniGames()
  const activePoker = activeMiniGames.find(game => game.id === 'portfolio-poker')
  const upcomingPoker = upcomingMiniGames.find(game => game.id === 'portfolio-poker')
  const remaining = activePoker ? getTimeRemaining(activePoker) : null
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const statusLabel = useMemo(() => {
    if (activePoker) {
      return remaining ? `Poker live • ${remaining.display} left` : 'Poker live'
    }
    if (upcomingPoker) {
      return `Next table • ${formatTime(upcomingPoker.startsAt)}`
    }
    return 'Poker schedule pending'
  }, [activePoker, remaining, upcomingPoker])

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-sky-950 to-indigo-950 px-4 pb-16 pt-6 text-white sm:px-10">
      <Button
        onClick={onClose}
        className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/40 p-0 text-white hover:bg-black/60"
        aria-label="Close"
      >
        <X size={22} weight="bold" />
      </Button>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
            <Sparkle size={18} weight="fill" />
            Portfolio Poker
            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-[11px] font-bold tracking-wide text-cyan-100">
              Game 5 of 10
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">Deal a winning portfolio hand against AI traders.</h1>
              <p className="mt-3 max-w-xl text-sm text-cyan-100/70 sm:text-base">
                Portfolio Poker is a timed table where stock cards combine into investing-themed hands.
                Win showdowns to claim bonus stocks and roll boosts.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-100">
              <ClockCountdown size={18} />
              {statusLabel}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-cyan-500/30 bg-cyan-950/40 p-5 shadow-[0_20px_60px_rgba(14,116,144,0.2)] sm:grid-cols-3 sm:gap-6 sm:p-6">
          <div className="rounded-2xl border border-cyan-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Table stakes</p>
            <p className="mt-2 text-3xl font-bold text-white">3 rounds</p>
            <p className="mt-2 text-xs text-cyan-100/70">
              Each round locks in one bonus. Stack them to finish strong.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Wild cards</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
              <Cards size={26} weight="fill" className="text-cyan-300" />
              2 swaps
            </p>
            <p className="mt-2 text-xs text-cyan-100/70">
              Swap two cards to pivot into a stronger hand.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Top prize</p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
              <CrownSimple size={26} weight="fill" className="text-yellow-300" />
              Bonus stock
            </p>
            <p className="mt-2 text-xs text-cyan-100/70">
              Highest hand wins a premium portfolio pick.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-xl">Signature Hands</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                Bonus tiers
              </span>
            </div>
            <div className="space-y-4">
              {HAND_COMBOS.map(combo => (
                <div
                  key={combo.name}
                  className="rounded-2xl border border-cyan-400/20 bg-black/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-100">
                          {combo.name}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-cyan-200/70">
                        {combo.detail}
                      </p>
                    </div>
                    <div className="text-right text-lg font-bold text-white">
                      {combo.bonus}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                Round flow
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {ROUNDS.map(round => (
                  <div key={round.label} className="rounded-xl border border-cyan-500/30 bg-black/40 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className={`h-2 w-2 rounded-full ${round.accent}`} />
                      {round.label}
                    </div>
                    <p className="mt-2 text-xs text-cyan-100/70">{round.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold">Table Foes</h2>
            <ul className="mt-4 space-y-3 text-sm text-cyan-100/80">
              {OPPONENTS.map(opponent => (
                <li key={opponent.name} className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-black/30 p-3">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-semibold text-cyan-100">
                    {opponent.badge}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{opponent.name}</p>
                    <p className="text-xs text-cyan-200/70">{opponent.style}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                Poker Window
              </p>
              <p className="mt-3 text-2xl font-bold text-white">Table open</p>
              <p className="mt-2 text-xs text-cyan-100/70">
                Enter during the window to lock the prize pool.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-black/40 p-4 text-xs text-cyan-100/70">
              <p className="font-semibold uppercase tracking-[0.2em] text-cyan-200/70">Live status</p>
              <p className="mt-2">{statusLabel}</p>
              {remaining && (
                <p className="mt-1 text-cyan-200/80">
                  Ends in {remaining.display}. Queue your best hand.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
