import type { GameEvent } from '@/lib/events'
import type { EventTrackDefinition } from './types'

const DEFAULT_TRACK_ID = 'market-rally'

export const getEventTrackDefinition = (
  activeEvent: GameEvent | null,
  fallbackEventId?: string | null
): EventTrackDefinition => {
  const eventId = activeEvent?.id ?? fallbackEventId ?? DEFAULT_TRACK_ID
  const name = activeEvent?.title ?? 'Market Rally'
  const description = activeEvent?.description ?? 'Stack event points to unlock investor rewards.'

  return {
    id: eventId,
    name,
    description,
    endTime: activeEvent?.endDate.toISOString(),
    pointsMax: 200,
    jumpThreshold: 12,
    isActive: Boolean(activeEvent),
    event: activeEvent,
    milestones: [
      {
        id: 'milestone-1',
        pointsRequired: 30,
        reward: {
          type: 'rolls',
          amount: 3,
          label: '+3 Rolls',
          description: 'Extra dice rolls to keep the streak alive.',
        },
      },
      {
        id: 'milestone-2',
        pointsRequired: 70,
        reward: {
          type: 'coins',
          amount: 80,
          label: '+80 Coins',
          description: 'A coin cache for skips and boosts.',
        },
      },
      {
        id: 'milestone-3',
        pointsRequired: 120,
        reward: {
          type: 'boost',
          amount: 1,
          label: 'Double Reward Card',
          description: 'Your next Thrifty Path challenge pays double.',
          boostId: 'double-reward-card',
        },
      },
      {
        id: 'milestone-4',
        pointsRequired: 170,
        reward: {
          type: 'rolls',
          amount: 5,
          label: '+5 Rolls',
          description: 'Sprint toward the final reward.',
        },
      },
      {
        id: 'milestone-5',
        pointsRequired: 200,
        reward: {
          type: 'boost',
          amount: 1,
          label: 'Market Shield',
          description: 'Block one negative market event.',
          boostId: 'market-shield',
        },
      },
    ],
  }
}
