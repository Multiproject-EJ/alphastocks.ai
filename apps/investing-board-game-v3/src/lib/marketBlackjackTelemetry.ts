export type MarketBlackjackOutcome = 'win' | 'loss' | 'push' | 'blackjack'

export type MarketBlackjackSessionStats = {
  hands: number
  wins: number
  blackjacks: number
  pushes: number
  netCash: number
  bestPayout: number
}

export const createInitialMarketBlackjackSessionStats = (): MarketBlackjackSessionStats => ({
  hands: 0,
  wins: 0,
  blackjacks: 0,
  pushes: 0,
  netCash: 0,
  bestPayout: 0,
})

export const updateMarketBlackjackSessionStats = (
  previous: MarketBlackjackSessionStats,
  params: {
    outcome: MarketBlackjackOutcome
    payout: number
    stake: number
  },
): MarketBlackjackSessionStats => {
  const net = params.payout - params.stake
  return {
    hands: previous.hands + 1,
    wins: previous.wins + (params.outcome === 'win' || params.outcome === 'blackjack' ? 1 : 0),
    blackjacks: previous.blackjacks + (params.outcome === 'blackjack' ? 1 : 0),
    pushes: previous.pushes + (params.outcome === 'push' ? 1 : 0),
    netCash: previous.netCash + net,
    bestPayout: Math.max(previous.bestPayout, params.payout),
  }
}

export const getMarketBlackjackWinRate = (stats: MarketBlackjackSessionStats): number => {
  if (stats.hands <= 0) {
    return 0
  }
  return stats.wins / stats.hands
}
