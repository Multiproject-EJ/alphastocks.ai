import type { EventTrackDefinition, EventTrackProgress } from './types'

export const createEventTrackProgress = (eventId: string | null): EventTrackProgress => ({
  eventId,
  points: 0,
  claimedMilestones: [],
  premiumPurchased: false,
  lastUpdated: null,
})

export const normalizeEventTrackProgress = (
  progress: EventTrackProgress | undefined,
  eventId: string | null
): EventTrackProgress => {
  if (!progress || progress.eventId !== eventId) {
    return createEventTrackProgress(eventId)
  }

  return {
    ...progress,
    claimedMilestones: progress.claimedMilestones ?? [],
    premiumPurchased: progress.premiumPurchased ?? false,
    lastUpdated: progress.lastUpdated ?? null,
  }
}

export const clampPoints = (points: number, definition: EventTrackDefinition) =>
  Math.max(0, Math.min(points, definition.pointsMax))

export const isMilestoneReached = (progress: EventTrackProgress, milestonePoints: number) =>
  progress.points >= milestonePoints

export const getUnclaimedMilestones = (
  definition: EventTrackDefinition,
  progress: EventTrackProgress
) => definition.milestones.filter(milestone => !progress.claimedMilestones.includes(milestone.id))

export const getNextMilestone = (
  definition: EventTrackDefinition,
  progress: EventTrackProgress
) =>
  definition.milestones.find(
    milestone => !progress.claimedMilestones.includes(milestone.id)
  )
