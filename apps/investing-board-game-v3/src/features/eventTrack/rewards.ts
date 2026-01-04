import type { Dispatch, SetStateAction } from 'react'
import type { EventTrackReward } from './types'
import type { GameState } from '@/lib/types'
import { toast } from 'sonner'
import { ENERGY_MAX } from '@/lib/constants'

interface ApplyRewardParams {
  reward: EventTrackReward
  setGameState: Dispatch<SetStateAction<GameState>>
  setRollsRemaining: Dispatch<SetStateAction<number>>
  addCoins: (amount: number, source: string) => void
  notify?: (type: 'success' | 'info' | 'error', message: string, options?: Parameters<typeof toast.success>[1]) => void
}

export const applyEventTrackReward = ({
  reward,
  setGameState,
  setRollsRemaining,
  addCoins,
  notify,
}: ApplyRewardParams) => {
  const showToast = notify
    ? (type: 'success' | 'info' | 'error', message: string, options?: Parameters<typeof toast.success>[1]) =>
        notify(type, message, options)
    : (type: 'success' | 'info' | 'error', message: string, options?: Parameters<typeof toast.success>[1]) => {
        switch (type) {
          case 'success':
            toast.success(message, options)
            break
          case 'info':
            toast.info(message, options)
            break
          case 'error':
            toast.error(message, options)
            break
        }
      }

  switch (reward.type) {
    case 'rolls': {
      setRollsRemaining(prev => prev + reward.amount)
      setGameState(prev => ({
        ...prev,
        energyRolls: Math.min((prev.energyRolls ?? 0) + reward.amount, ENERGY_MAX),
      }))
      showToast('success', 'Event reward claimed!', {
        description: `${reward.label} added to your rolls.`,
        duration: 3000,
      })
      return
    }
    case 'coins': {
      addCoins(reward.amount, 'Event reward')
      showToast('success', 'Event reward claimed!', {
        description: `${reward.label} added to your balance.`,
        duration: 3000,
      })
      return
    }
    case 'boost': {
      setGameState(prev => ({
        ...prev,
        activeEffects: [
          ...(prev.activeEffects ?? []),
          {
            itemId: reward.boostId ?? 'double-reward-card',
            activated: true,
          },
        ],
      }))
      showToast('success', 'Boost unlocked!', {
        description: reward.label,
        duration: 3000,
      })
      return
    }
    default:
      return
  }
}
