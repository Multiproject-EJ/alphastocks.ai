import { BOARD_TILES } from '@/lib/mockData'

export type CasinoMode = 'none' | 'modeA' | 'modeB'
export type CasinoModePhase = 'idle' | 'active' | 'spinning' | 'miniGame' | 'celebrating'

export const MODE_A_GAMES = [
  { id: 'scratchcard', label: 'Scratchcard Vault', icon: '🎟️', status: 'live' as const },
  { id: 'high-roller-dice', label: 'High Roller Dice', icon: '🎲', status: 'live' as const },
  { id: 'market-blackjack', label: 'Market Blackjack', icon: '🂡', status: 'live' as const },
  { id: 'portfolio-poker', label: 'Portfolio Poker', icon: '🃏', status: 'placeholder' as const },
  { id: 'macro-slots', label: 'Macro Slots', icon: '🎰', status: 'placeholder' as const },
  { id: 'bull-bear-race', label: 'Bull/Bear Race', icon: '🐂', status: 'placeholder' as const },
  { id: 'insider-wheel', label: 'Insider Wheel', icon: '🎡', status: 'placeholder' as const },
  { id: 'vault-jackpot', label: 'Vault Jackpot', icon: '💎', status: 'placeholder' as const },
]

export const MODE_A_PRIZE_MIN = 10
export const MODE_A_PRIZE_MAX = 250_000
export const MODE_B_REQUIRED_PICKS = 5
export const MODE_B_WIN_PAYOUT = 125_000
export const MODE_B_CONSOLATION_PAYOUT = 1_000

const ring1TileIds = BOARD_TILES.map((tile) => tile.id)
export const RING1_TILE_COUNT = ring1TileIds.length

export const pickCasinoMode = (rng: () => number): Exclude<CasinoMode, 'none'> =>
  rng() < 0.5 ? 'modeA' : 'modeB'

export const getEvenlySpacedTileIds = (count: number): number[] => {
  const step = ring1TileIds.length / count
  return Array.from({ length: count }, (_, index) => ring1TileIds[Math.floor(index * step) % ring1TileIds.length])
}

export const createModeAPrizes = (rng: () => number, excludedTileIds: number[]) => {
  const excluded = new Set(excludedTileIds)
  const prizes: Record<number, number> = {}

  ring1TileIds.forEach((tileId) => {
    if (excluded.has(tileId)) return
    prizes[tileId] = Math.floor(MODE_A_PRIZE_MIN + rng() * (MODE_A_PRIZE_MAX - MODE_A_PRIZE_MIN))
  })

  return prizes
}

export const createRandomPick = (tileCount: number, picks: number, rng: () => number): number[] => {
  const chosen = new Set<number>()
  while (chosen.size < picks) {
    chosen.add(Math.floor(rng() * tileCount))
  }
  return Array.from(chosen).sort((a, b) => a - b)
}

export const createRouletteSpinPath = (
  startIndex: number,
  tileCount: number,
  rng: () => number,
): { laps: number; endIndex: number; path: number[] } => {
  const laps = 2 + Math.floor(rng() * 3)
  const extraSteps = Math.floor(rng() * tileCount)
  const totalSteps = laps * tileCount + extraSteps
  const path = Array.from({ length: totalSteps }, (_, offset) => (startIndex + offset + 1) % tileCount)
  const endIndex = path[path.length - 1] ?? startIndex
  return { laps, endIndex, path }
}

export const resolveRouletteOutcome = (selectedNumbers: number[], winningIndex: number) => {
  const hit = selectedNumbers.includes(winningIndex)
  return {
    hit,
    payout: hit ? MODE_B_WIN_PAYOUT : MODE_B_CONSOLATION_PAYOUT,
  }
}
