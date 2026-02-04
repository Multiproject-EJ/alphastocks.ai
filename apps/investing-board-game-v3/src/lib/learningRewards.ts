import { LEARNING_REWARD_CONFIG } from '@/config/learning'
import { getDailyStreakUpdate } from '@/lib/streaks'

export type LearningRewardSummary = {
  nextStreak: number
  isRepeat: boolean
  todayKey: string
  baseStars: number
  baseXp: number
  bonusDays: number
  bonusStars: number
  bonusXp: number
  totalStars: number
  totalXp: number
}

export const getLearningRewardSummary = (
  lastLearningDate: string | null | undefined,
  currentStreak: number,
  now: Date = new Date()
): LearningRewardSummary => {
  const { nextStreak, isRepeat, todayKey } = getDailyStreakUpdate(lastLearningDate, currentStreak, now)
  const bonusDays = isRepeat ? 0 : Math.min(nextStreak - 1, LEARNING_REWARD_CONFIG.maxStreakBonusDays)
  const bonusStars = bonusDays * LEARNING_REWARD_CONFIG.streakBonusStars
  const bonusXp = bonusDays * LEARNING_REWARD_CONFIG.streakBonusXp
  const baseStars = LEARNING_REWARD_CONFIG.baseStars
  const baseXp = LEARNING_REWARD_CONFIG.baseXp

  return {
    nextStreak,
    isRepeat,
    todayKey,
    baseStars,
    baseXp,
    bonusDays,
    bonusStars,
    bonusXp,
    totalStars: baseStars + bonusStars,
    totalXp: baseXp + bonusXp,
  }
}
