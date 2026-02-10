import { Button } from '@/components/ui/button'
import { casinoConfig } from '@/config/casino'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'
import { getRewardSound } from '@/lib/sounds'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type Card = {
  label: string
  value: number
  altValue?: number
  suit: string
}

type RoundStatus = 'idle' | 'player' | 'dealer' | 'done'

type RoundResult = {
  outcome: 'win' | 'loss' | 'push' | 'blackjack'
  payout: number
  sidePayout: number
  playerTotal: number
  dealerTotal: number
  sideBetWin: boolean
}

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = [
  { label: 'A', value: 11, altValue: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 10 },
  { label: 'Q', value: 10 },
  { label: 'K', value: 10 },
]

const buildDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      label: rank.label,
      value: rank.value,
      altValue: rank.altValue,
      suit,
    })),
  )

const shuffleDeck = (deck: Card[]) => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const drawFromDeck = (deck: Card[]) => {
  if (deck.length === 0) {
    const freshDeck = shuffleDeck(buildDeck())
    const [card, ...rest] = freshDeck
    return { card, deck: rest }
  }
  const [card, ...rest] = deck
  return { card, deck: rest }
}

const scoreHand = (hand: Card[]) => {
  let total = hand.reduce((sum, card) => sum + card.value, 0)
  let aces = hand.filter((card) => card.label === 'A').length
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

const isBlackjack = (hand: Card[]) => hand.length === 2 && scoreHand(hand) === 21

const formatCard = (card: Card) => `${card.label}${card.suit}`

interface MarketBlackjackGameProps {
  cashBalance: number
  onSpend?: (amount: number) => boolean
  onWin?: (amount: number) => void
  luckBoost?: number
}

export function MarketBlackjackGame({
  cashBalance,
  onSpend,
  onWin,
  luckBoost,
}: MarketBlackjackGameProps) {
  const blackjackConfig = casinoConfig.blackjack
  const { play } = useSound()
  const { lightTap, success, warning } = useHaptics()
  const [betAmount, setBetAmount] = useState(blackjackConfig.tableLimits.minBet)
  const [sideBetId, setSideBetId] = useState<string | null>(null)
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('idle')
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [initialPlayerTotal, setInitialPlayerTotal] = useState<number | null>(null)

  const minBet = blackjackConfig.tableLimits.minBet
  const maxBet = blackjackConfig.tableLimits.maxBet
  const clampedBet = Math.min(maxBet, Math.max(minBet, Math.floor(betAmount || minBet)))
  const sideBetCost = sideBetId
    ? Math.max(1, Math.round(clampedBet * blackjackConfig.sideBetCostRate))
    : 0
  const totalStake = clampedBet + sideBetCost
  const isActionLocked = roundStatus === 'player' || roundStatus === 'dealer'
  const dealerStand = blackjackConfig.dealerStand
  const payouts = blackjackConfig.payouts
  const selectedSideBet = blackjackConfig.sideBets.find((sideBet) => sideBet.id === sideBetId)

  const playerTotal = useMemo(() => scoreHand(playerHand), [playerHand])
  const dealerTotal = useMemo(() => scoreHand(dealerHand), [dealerHand])
  const playerHasBlackjack = useMemo(() => isBlackjack(playerHand), [playerHand])
  const dealerHasBlackjack = useMemo(() => isBlackjack(dealerHand), [dealerHand])

  const resetRoundState = () => {
    setRoundStatus('idle')
    setPlayerHand([])
    setDealerHand([])
    setRoundResult(null)
    setInitialPlayerTotal(null)
  }

  const setSafeBetAmount = (nextBet: number) => {
    const clamped = Math.min(maxBet, Math.max(minBet, Math.floor(nextBet)))
    setBetAmount(clamped)
  }

  const settleRound = (finalPlayerHand: Card[], finalDealerHand: Card[]) => {
    const finalPlayerTotal = scoreHand(finalPlayerHand)
    const finalDealerTotal = scoreHand(finalDealerHand)
    const playerBlackjack = isBlackjack(finalPlayerHand)
    const dealerBlackjack = isBlackjack(finalDealerHand)
    let outcome: RoundResult['outcome'] = 'loss'

    if (finalPlayerTotal > 21) {
      outcome = 'loss'
    } else if (finalDealerTotal > 21) {
      outcome = 'win'
    } else if (playerBlackjack && !dealerBlackjack) {
      outcome = 'blackjack'
    } else if (dealerBlackjack && !playerBlackjack) {
      outcome = 'loss'
    } else if (finalPlayerTotal > finalDealerTotal) {
      outcome = 'win'
    } else if (finalPlayerTotal < finalDealerTotal) {
      outcome = 'loss'
    } else {
      outcome = 'push'
    }

    const payout =
      outcome === 'blackjack'
        ? Math.round(clampedBet * payouts.blackjack)
        : outcome === 'win'
          ? Math.round(clampedBet * payouts.win)
          : outcome === 'push'
            ? Math.round(clampedBet * payouts.push)
            : 0

    const sideBetWin =
      sideBetId === 'macro-momentum'
        ? initialPlayerTotal === 20
        : sideBetId === 'earnings-beat'
          ? finalDealerTotal >= dealerStand
          : false
    const sidePayout = sideBetWin && selectedSideBet
      ? Math.round(sideBetCost * selectedSideBet.payout)
      : 0
    const totalPayout = payout + sidePayout

    setRoundResult({
      outcome,
      payout,
      sidePayout,
      playerTotal: finalPlayerTotal,
      dealerTotal: finalDealerTotal,
      sideBetWin,
    })
    setRoundStatus('done')

    if (totalPayout > 0) {
      onWin?.(totalPayout)
      success()
      play(getRewardSound('cash', totalPayout))
      const outcomeLabel =
        outcome === 'blackjack'
          ? 'Blackjack win!'
          : outcome === 'win'
            ? 'Dealer beaten'
            : 'Push — bet returned'
      toast.success(outcomeLabel, {
        description: `Payout: $${totalPayout.toLocaleString()}.`,
      })
    } else {
      warning()
      play('swipe-no')
      toast.error('House win', {
        description: 'The dealer took the round. Try another hand.',
      })
    }
  }

  const handleDeal = () => {
    if (isActionLocked) {
      return
    }
    if (cashBalance < totalStake) {
      toast.error('Not enough cash for the table', {
        description: `You need $${(totalStake - cashBalance).toLocaleString()} more to cover the bet.`,
      })
      return
    }
    if (onSpend && !onSpend(totalStake)) {
      return
    }
    play('button-click')
    lightTap()

    const freshDeck = shuffleDeck(buildDeck())
    let workingDeck = freshDeck
    const firstPlayer = drawFromDeck(workingDeck)
    workingDeck = firstPlayer.deck
    const firstDealer = drawFromDeck(workingDeck)
    workingDeck = firstDealer.deck
    const secondPlayer = drawFromDeck(workingDeck)
    workingDeck = secondPlayer.deck
    const secondDealer = drawFromDeck(workingDeck)
    workingDeck = secondDealer.deck

    const nextPlayerHand = [firstPlayer.card, secondPlayer.card]
    const nextDealerHand = [firstDealer.card, secondDealer.card]

    setDeck(workingDeck)
    setPlayerHand(nextPlayerHand)
    setDealerHand(nextDealerHand)
    setRoundStatus('player')
    setRoundResult(null)
    setInitialPlayerTotal(scoreHand(nextPlayerHand))

    if (isBlackjack(nextPlayerHand) || isBlackjack(nextDealerHand)) {
      settleRound(nextPlayerHand, nextDealerHand)
    }
  }

  const handleHit = () => {
    if (roundStatus !== 'player') {
      return
    }
    play('button-click')
    lightTap()

    let workingDeck = deck
    let draw = drawFromDeck(workingDeck)
    workingDeck = draw.deck
    let candidateHand = [...playerHand, draw.card]
    let candidateTotal = scoreHand(candidateHand)

    if (luckBoost && candidateTotal > 21 && Math.random() < luckBoost) {
      const retry = drawFromDeck(workingDeck)
      workingDeck = retry.deck
      const retryHand = [...playerHand, retry.card]
      if (scoreHand(retryHand) < candidateTotal) {
        candidateHand = retryHand
        candidateTotal = scoreHand(retryHand)
      }
    }

    setDeck(workingDeck)
    setPlayerHand(candidateHand)

    if (candidateTotal > 21) {
      settleRound(candidateHand, dealerHand)
    }
  }

  const handleStand = () => {
    if (roundStatus !== 'player') {
      return
    }
    play('button-click')
    lightTap()
    setRoundStatus('dealer')

    let workingDeck = deck
    let workingDealerHand = [...dealerHand]
    let workingDealerTotal = scoreHand(workingDealerHand)

    while (workingDealerTotal < dealerStand) {
      const draw = drawFromDeck(workingDeck)
      workingDeck = draw.deck
      workingDealerHand = [...workingDealerHand, draw.card]
      workingDealerTotal = scoreHand(workingDealerHand)
    }

    setDeck(workingDeck)
    setDealerHand(workingDealerHand)
    settleRound(playerHand, workingDealerHand)
  }

  const betStep = Math.max(100, Math.round(minBet / 2))
  const balanceLabel = `$${cashBalance.toLocaleString()}`
  const betLabel = `$${clampedBet.toLocaleString()}`
  const sideBetLabel = sideBetId ? `$${sideBetCost.toLocaleString()}` : '—'
  const totalStakeLabel = `$${totalStake.toLocaleString()}`
  const handStatusLabel =
    roundStatus === 'player'
      ? 'Your move'
      : roundStatus === 'dealer'
        ? 'Dealer drawing'
        : roundStatus === 'done'
          ? 'Hand settled'
          : 'Ready to deal'

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-slate-950/70 p-4 text-emerald-50/80">
      <p className="text-xs uppercase tracking-wide text-emerald-100/60">Market Blackjack</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{blackjackConfig.title}</h3>
      <p className="text-sm text-emerald-100/70">{blackjackConfig.description}</p>

      {luckBoost && luckBoost > 0 && (
        <div className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100/80">
          Casino Luck active: tailwinds can soften a bust.
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-lg border border-emerald-300/20 bg-emerald-950/40 p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase text-emerald-100/60">Cash</span>
          <span className="text-sm font-semibold text-white">{balanceLabel}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <label className="text-xs uppercase text-emerald-100/60">Main bet</label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isActionLocked}
                onClick={() => setSafeBetAmount(clampedBet - betStep)}
                className="h-9 border-emerald-300/30 text-emerald-100/80"
              >
                -{betStep.toLocaleString()}
              </Button>
              <input
                type="number"
                value={betAmount}
                min={minBet}
                max={maxBet}
                onChange={(event) => setBetAmount(Number(event.target.value))}
                onBlur={() => setSafeBetAmount(betAmount)}
                disabled={isActionLocked}
                className="w-full rounded-lg border border-emerald-300/30 bg-slate-950/40 px-3 py-2 text-right text-base font-semibold text-white"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isActionLocked}
                onClick={() => setSafeBetAmount(clampedBet + betStep)}
                className="h-9 border-emerald-300/30 text-emerald-100/80"
              >
                +{betStep.toLocaleString()}
              </Button>
            </div>
            <p className="mt-1 text-[11px] text-emerald-100/60">
              Limits: ${minBet.toLocaleString()}–${maxBet.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-slate-950/50 p-3 text-xs text-emerald-100/70">
            <p className="text-[11px] uppercase text-emerald-100/60">Table stake</p>
            <p className="mt-1 text-base font-semibold text-white">{betLabel}</p>
            <p className="mt-2 text-[11px] text-emerald-100/60">Side bet</p>
            <p className="text-sm text-white">{sideBetLabel}</p>
            <p className="mt-2 text-[11px] text-emerald-100/60">Total stake</p>
            <p className="text-sm text-white">{totalStakeLabel}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-emerald-100/60">Side bet</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {blackjackConfig.sideBets.map((sideBet) => {
              const isSelected = sideBet.id === sideBetId
              return (
                <Button
                  key={sideBet.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  disabled={isActionLocked}
                  onClick={() => setSideBetId(isSelected ? null : sideBet.id)}
                  className={
                    isSelected
                      ? 'h-auto min-h-[72px] items-start whitespace-normal border-emerald-200/70 bg-gradient-to-br from-emerald-500/70 to-teal-500/60 px-3 py-2 text-left text-white'
                      : 'h-auto min-h-[72px] items-start whitespace-normal border-emerald-300/30 px-3 py-2 text-left text-emerald-100/80'
                  }
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{sideBet.label}</span>
                    <span className="text-[11px] text-emerald-100/70">{sideBet.description}</span>
                    <span className="text-[11px] uppercase text-emerald-100/60">
                      Pays {sideBet.payout}x
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-300/30 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between text-xs uppercase text-emerald-100/60">
          <span>Market tape</span>
          <span>{handStatusLabel}</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-emerald-100/60">Dealer</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dealerHand.length === 0 && (
                <span className="rounded-lg border border-emerald-300/20 bg-slate-950/40 px-3 py-2 text-sm text-emerald-100/70">
                  Awaiting deal
                </span>
              )}
              {dealerHand.map((card, index) => {
                const shouldHide = roundStatus === 'player' && index === 1
                return (
                  <span
                    key={`dealer-${index}`}
                    className="rounded-lg border border-emerald-300/30 bg-emerald-950/40 px-3 py-2 text-sm text-white"
                  >
                    {shouldHide ? '🂠' : formatCard(card)}
                  </span>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-emerald-100/70">
              Total: {roundStatus === 'player' ? '—' : dealerTotal}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-emerald-100/60">You</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {playerHand.length === 0 && (
                <span className="rounded-lg border border-emerald-300/20 bg-slate-950/40 px-3 py-2 text-sm text-emerald-100/70">
                  Tap deal to start
                </span>
              )}
              {playerHand.map((card, index) => (
                <span
                  key={`player-${index}`}
                  className="rounded-lg border border-emerald-300/30 bg-emerald-950/50 px-3 py-2 text-sm text-white"
                >
                  {formatCard(card)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-emerald-100/70">
              Total: {playerTotal} {playerHasBlackjack ? '· Blackjack' : ''}
            </p>
          </div>
        </div>

        {roundResult && (
          <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100/80">
            <p className="text-[11px] uppercase text-emerald-100/60">Round recap</p>
            <p className="mt-1 text-sm text-white">
              {roundResult.outcome === 'push'
                ? 'Push'
                : roundResult.outcome === 'blackjack'
                  ? 'Blackjack win'
                  : roundResult.outcome === 'win'
                    ? 'Dealer beaten'
                    : 'House wins'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-emerald-300/30 bg-slate-950/50 px-2 py-0.5">
                Player {roundResult.playerTotal}
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-slate-950/50 px-2 py-0.5">
                Dealer {roundResult.dealerTotal}
              </span>
              <span className="rounded-full border border-emerald-300/30 bg-slate-950/50 px-2 py-0.5">
                Main payout ${roundResult.payout.toLocaleString()}
              </span>
              {sideBetId && (
                <span className="rounded-full border border-emerald-300/30 bg-slate-950/50 px-2 py-0.5">
                  Side bet {roundResult.sideBetWin ? 'hit' : 'miss'} · $
                  {roundResult.sidePayout.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {roundStatus === 'player' ? (
            <>
              <Button
                type="button"
                onClick={handleHit}
                className="flex-1 bg-emerald-500/80 text-white hover:bg-emerald-500"
              >
                Hit
              </Button>
              <Button
                type="button"
                onClick={handleStand}
                variant="outline"
                className="flex-1 border-emerald-300/40 text-emerald-100 hover:text-white"
              >
                Stand
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleDeal}
                className="flex-1 bg-emerald-500/80 text-white hover:bg-emerald-500"
              >
                {roundStatus === 'done' ? 'Deal next hand' : 'Deal hand'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetRoundState}
                disabled={roundStatus === 'player' || roundStatus === 'dealer'}
                className="flex-1 border-emerald-300/40 text-emerald-100 hover:text-white"
              >
                Reset table
              </Button>
            </>
          )}
        </div>
        <p className="mt-3 text-[11px] text-emerald-100/60">
          Dealer stands on {dealerStand}. Side bets cost {Math.round(blackjackConfig.sideBetCostRate * 100)}% of the
          main wager.
        </p>
      </div>
    </div>
  )
}
