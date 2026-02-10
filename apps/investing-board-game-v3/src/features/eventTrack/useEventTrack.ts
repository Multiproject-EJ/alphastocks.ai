import { useCallback, useEffect, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { GameEvent } from '@/lib/events'
import type { GameState } from '@/lib/types'
import { toast } from 'sonner'
import { getEventTrackCtaCosts, getEventTrackDefinition } from './config'
import {
  clampPoints,
  createEventTrackProgress,
  getNextMilestone,
  getUnclaimedMilestones,
  isMilestoneReached,
  normalizeEventTrackProgress,
} from './store'
import type { EventTrackDefinition, EventTrackProgress } from './types'
import { applyEventTrackReward } from './rewards'

interface UseEventTrackProps {
  gameState: GameState
  setGameState: Dispatch<SetStateAction<GameState>>
  setRollsRemaining: Dispatch<SetStateAction<number>>
  addCoins: (amount: number, source: string) => void
  spendCoins: (amount: number, purpose: string) => boolean
  activeEvent: GameEvent | null
  notify?: (type: 'success' | 'info' | 'error', message: string, options?: Parameters<typeof toast.success>[1]) => void
}

interface EventTrackCTA {
  label: string
  cost: number
  mode: 'jump' | 'finish'
  disabled: boolean
}

interface UseEventTrackReturn {
  definition: EventTrackDefinition
  progress: EventTrackProgress
  nextMilestonePoints: number | null
  remainingRewards: number
  cta: EventTrackCTA | null
  addPoints: (amount: number, source?: string) => void
  claimMilestone: (milestoneId: string) => void
  purchaseCTA: () => void
}

export const useEventTrack = ({
  gameState,
  setGameState,
  setRollsRemaining,
  addCoins,
  spendCoins,
  activeEvent,
  notify,
}: UseEventTrackProps): UseEventTrackReturn => {
  const definition = useMemo(
    () => getEventTrackDefinition(activeEvent, gameState.eventTrack?.eventId),
    [activeEvent, gameState.eventTrack?.eventId]
  )

  const progress = useMemo(
    () => normalizeEventTrackProgress(gameState.eventTrack, definition.id),
    [gameState.eventTrack, definition.id]
  )

  useEffect(() => {
    if (!gameState.eventTrack || gameState.eventTrack.eventId !== definition.id) {
      setGameState(prev => ({
        ...prev,
        eventTrack: createEventTrackProgress(definition.id),
      }))
    }
  }, [definition.id, gameState.eventTrack, setGameState])

  const addPoints = useCallback(
    (amount: number, source = 'Gameplay') => {
      if (!definition.isActive || amount <= 0) return

      setGameState(prev => {
        const current = normalizeEventTrackProgress(prev.eventTrack, definition.id)
        const nextPoints = clampPoints(current.points + amount, definition)
        if (nextPoints === current.points) return prev

        return {
          ...prev,
          eventTrack: {
            ...current,
            points: nextPoints,
            lastUpdated: new Date().toISOString(),
          },
        }
      })

      notify?.('info', `+${amount} Event Points`, {
        description: source,
        duration: 2000,
      })
    },
    [definition, notify, setGameState]
  )

  const claimMilestone = useCallback(
    (milestoneId: string) => {
      const milestone = definition.milestones.find(item => item.id === milestoneId)
      if (!milestone) return

      const current = progress
      if (!isMilestoneReached(current, milestone.pointsRequired)) {
        notify?.('info', 'Keep rolling to unlock this milestone.', { duration: 2000 })
        return
      }
      if (current.claimedMilestones.includes(milestoneId)) {
        return
      }

      applyEventTrackReward({
        reward: milestone.reward,
        setGameState,
        setRollsRemaining,
        addCoins,
        notify,
      })

      setGameState(prev => {
        const latest = normalizeEventTrackProgress(prev.eventTrack, definition.id)
        return {
          ...prev,
          eventTrack: {
            ...latest,
            claimedMilestones: [...latest.claimedMilestones, milestoneId],
            lastUpdated: new Date().toISOString(),
          },
        }
      })
    },
    [addCoins, definition, notify, progress, setGameState, setRollsRemaining]
  )

  const nextMilestone = getNextMilestone(definition, progress)
  const remainingRewards = getUnclaimedMilestones(definition, progress).length
  const nextMilestonePoints = nextMilestone ? nextMilestone.pointsRequired : null

  const cta = useMemo<EventTrackCTA | null>(() => {
    if (!definition.isActive || remainingRewards === 0) return null

    if (!nextMilestonePoints) return null

    const pointsToNext = Math.max(nextMilestonePoints - progress.points, 0)
    const { jumpCost, finishCost } = getEventTrackCtaCosts({
      pointsToNext,
      remainingRewards,
    })

    if (pointsToNext <= definition.jumpThreshold) {
      return {
        label: `Jump to next milestone — ${jumpCost} coins`,
        cost: jumpCost,
        mode: 'jump',
        disabled: gameState.coins < jumpCost,
      }
    }

    return {
      label: `Finish ${remainingRewards} rewards — ${finishCost} coins`,
      cost: finishCost,
      mode: 'finish',
      disabled: gameState.coins < finishCost,
    }
  }, [definition, gameState.coins, nextMilestonePoints, progress.points, remainingRewards])

  const purchaseCTA = useCallback(() => {
    if (!cta) return
    if (cta.disabled) return

    if (!spendCoins(cta.cost, 'Event Track boost')) {
      return
    }

    if (cta.mode === 'jump' && nextMilestonePoints) {
      addPoints(nextMilestonePoints - progress.points, 'Event Track boost')
      return
    }

    if (cta.mode === 'finish') {
      addPoints(definition.pointsMax - progress.points, 'Event Track boost')
      return
    }
  }, [addPoints, cta, definition.pointsMax, nextMilestonePoints, progress.points, spendCoins])

  return {
    definition,
    progress,
    nextMilestonePoints,
    remainingRewards,
    cta,
    addPoints,
    claimMilestone,
    purchaseCTA,
  }
}
