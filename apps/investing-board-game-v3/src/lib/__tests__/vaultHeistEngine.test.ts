import { describe, expect, it } from 'vitest'
import { resolveVaultHeistPick } from '../vaultHeistEngine'
import type { VaultPrizeTableEntry } from '../vaultHeistRewards'

describe('resolveVaultHeistPick', () => {
  it('returns deterministic results for the same seed', () => {
    const resultA = resolveVaultHeistPick({
      alarmWeight: 5,
      totalMultiplier: 2,
      seed: 'vault-heist-seed',
    })
    const resultB = resolveVaultHeistPick({
      alarmWeight: 5,
      totalMultiplier: 2,
      seed: 'vault-heist-seed',
    })

    expect(resultA).toEqual(resultB)
  })

  it('applies multipliers to non-alarm rewards', () => {
    const prizeTable: VaultPrizeTableEntry[] = [
      { prize: { type: 'cash', amount: 1000, emoji: '💰', label: '$1,000' }, weight: 10 },
    ]

    const result = resolveVaultHeistPick({
      alarmWeight: 0,
      totalMultiplier: 1.5,
      prizeTable,
      seed: 'multiplier-test',
    })

    expect(result.isAlarm).toBe(false)
    expect(result.prize.amount).toBe(1500)
    expect(result.prize.label).toBe('$1,500')
  })

  it('returns an alarm prize when alarm weight dominates', () => {
    const prizeTable: VaultPrizeTableEntry[] = [
      { prize: { type: 'coins', amount: 50, emoji: '🪙', label: '50 Coins' }, weight: 0 },
    ]

    const result = resolveVaultHeistPick({
      alarmWeight: 10,
      totalMultiplier: 2,
      prizeTable,
      seed: 'alarm-test',
    })

    expect(result.isAlarm).toBe(true)
    expect(result.prize.type).toBe('alarm')
  })
})
