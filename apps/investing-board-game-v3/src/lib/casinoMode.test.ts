import { describe, expect, it } from 'vitest'
import { createModeAPrizes, createRandomPick, createRouletteSpinPath, getEvenlySpacedTileIds, pickCasinoMode } from './casinoMode'

describe('casino mode helpers', () => {
  it('keeps mode selection 50/50 with deterministic RNG', () => {
    const values = [0.1, 0.9, 0.2, 0.8]
    let index = 0
    const results = Array.from({ length: 4 }, () => pickCasinoMode(() => values[index++]))
    expect(results).toEqual(['modeA', 'modeB', 'modeA', 'modeB'])
  })

  it('creates 8 evenly spaced tile ids', () => {
    expect(getEvenlySpacedTileIds(8)).toHaveLength(8)
  })

  it('creates exactly 5 unique roulette picks', () => {
    const picks = createRandomPick(35, 5, Math.random)
    expect(new Set(picks).size).toBe(5)
  })

  it('creates roulette path with 2-4 laps', () => {
    const spin = createRouletteSpinPath(0, 35, () => 0.5)
    expect(spin.laps).toBeGreaterThanOrEqual(2)
    expect(spin.laps).toBeLessThanOrEqual(4)
    expect(spin.path.length).toBeGreaterThan(70)
  })

  it('does not assign mode-a prizes to excluded game tiles', () => {
    const prizes = createModeAPrizes(Math.random, [0, 5])
    expect(prizes[0]).toBeUndefined()
    expect(prizes[5]).toBeUndefined()
  })
})
