import { describe, expect, it } from 'vitest'
import {
  MODE_A_GAMES,
  MODE_B_CONSOLATION_PAYOUT,
  MODE_B_REQUIRED_PICKS,
  MODE_B_WIN_PAYOUT,
  RING1_TILE_COUNT,
  createModeAPrizes,
  createRandomPick,
  createRouletteSpinPath,
  getEvenlySpacedTileIds,
  pickCasinoMode,
  resolveRouletteOutcome,
} from './casinoMode'

describe('casino mode helpers', () => {
  it('keeps mode selection 50/50 with deterministic RNG', () => {
    const values = [0.1, 0.9, 0.2, 0.8]
    let index = 0
    const results = Array.from({ length: 4 }, () => pickCasinoMode(() => values[index++]))
    expect(results).toEqual(['modeA', 'modeB', 'modeA', 'modeB'])
  })

  it('stays close to 50/50 over 1000 picks', () => {
    const samples = Array.from({ length: 1000 }, () => pickCasinoMode(Math.random))
    const modeACount = samples.filter((mode) => mode === 'modeA').length
    const modeARatio = modeACount / samples.length
    expect(modeARatio).toBeGreaterThan(0.4)
    expect(modeARatio).toBeLessThan(0.6)
  })

  it('includes scratchcard, dice, and blackjack in mode A game list', () => {
    const gameIds = MODE_A_GAMES.map((game) => game.id)
    expect(gameIds).toContain('scratchcard')
    expect(gameIds).toContain('high-roller-dice')
    expect(gameIds).toContain('market-blackjack')
    expect(MODE_A_GAMES).toHaveLength(8)
  })

  it('creates 8 evenly spaced tile ids from ring-1 tile count', () => {
    expect(RING1_TILE_COUNT).toBe(35)
    expect(getEvenlySpacedTileIds(8)).toHaveLength(8)
  })

  it('creates exactly 5 unique roulette picks', () => {
    const picks = createRandomPick(35, MODE_B_REQUIRED_PICKS, Math.random)
    expect(new Set(picks).size).toBe(MODE_B_REQUIRED_PICKS)
  })

  it('creates roulette path with 2-4 laps', () => {
    const spin = createRouletteSpinPath(0, 35, () => 0.5)
    expect(spin.laps).toBeGreaterThanOrEqual(2)
    expect(spin.laps).toBeLessThanOrEqual(4)
    expect(spin.path.length).toBeGreaterThan(70)
  })


  it('resolves roulette win and miss payouts', () => {
    expect(resolveRouletteOutcome([1, 2, 3], 2)).toEqual({ hit: true, payout: MODE_B_WIN_PAYOUT })
    expect(resolveRouletteOutcome([1, 2, 3], 4)).toEqual({ hit: false, payout: MODE_B_CONSOLATION_PAYOUT })
  })
  it('does not assign mode-a prizes to excluded game tiles', () => {
    const prizes = createModeAPrizes(Math.random, [0, 5])
    expect(prizes[0]).toBeUndefined()
    expect(prizes[5]).toBeUndefined()
  })
})
