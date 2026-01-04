import type { GameEvent } from '@/lib/events'

export type EventTrackRewardType = 'rolls' | 'coins' | 'boost'

export interface EventTrackReward {
  type: EventTrackRewardType
  amount: number
  label: string
  description?: string
  boostId?: 'double-reward-card' | 'market-shield'
}

export interface EventTrackMilestone {
  id: string
  pointsRequired: number
  reward: EventTrackReward
}

export interface EventTrackDefinition {
  id: string
  name: string
  description: string
  endTime?: string
  pointsMax: number
  milestones: EventTrackMilestone[]
  jumpThreshold: number
  isActive: boolean
  event?: GameEvent | null
}

export interface EventTrackProgress {
  eventId: string | null
  points: number
  claimedMilestones: string[]
  premiumPurchased: boolean
  lastUpdated: string | null
}
