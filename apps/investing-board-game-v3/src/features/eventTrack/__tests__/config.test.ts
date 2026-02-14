import { describe, expect, it } from 'vitest'

import { getEventTrackCtaCosts, getEventTrackDefinition } from '@/features/eventTrack/config'

describe('getEventTrackCtaCosts', () => {
  it('uses configured minimum values when computed cost is lower', () => {
    const costs = getEventTrackCtaCosts({
      pointsToNext: 4,
      remainingRewards: 0,
    })

    expect(costs).toEqual({
      jumpCost: 40,
      finishCost: 120,
    })
  })

  it('scales jump and finish costs using configured multipliers', () => {
    const costs = getEventTrackCtaCosts({
      pointsToNext: 15,
      remainingRewards: 3,
    })

    expect(costs).toEqual({
      jumpCost: 90,
      finishCost: 450,
    })
  })

  it('supports overriding pricing config for tuning experiments', () => {
    const costs = getEventTrackCtaCosts({
      pointsToNext: 8,
      remainingRewards: 2,
      costConfig: {
        jump: {
          minimum: 25,
          pointsMultiplier: 5,
        },
        finish: {
          minimum: 200,
          remainingRewardsMultiplier: 80,
        },
      },
    })

    expect(costs).toEqual({
      jumpCost: 40,
      finishCost: 200,
    })
  })
})

describe('getEventTrackDefinition', () => {
  it('uses shared progress config defaults for jump threshold', () => {
    const definition = getEventTrackDefinition(null, null)

    expect(definition.jumpThreshold).toBe(12)
  })

  it('supports overriding jump threshold for tuning experiments', () => {
    const definition = getEventTrackDefinition(null, null, {
      jumpThreshold: 18,
    })

    expect(definition.jumpThreshold).toBe(18)
  })
})
