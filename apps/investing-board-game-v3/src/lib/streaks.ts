export const getDateKey = (date: Date) => date.toISOString().split('T')[0]

export const getDailyStreakUpdate = (
  lastDate: string | null | undefined,
  currentStreak: number,
  now: Date = new Date()
) => {
  const todayKey = getDateKey(now)

  if (lastDate === todayKey) {
    return { nextStreak: currentStreak, isRepeat: true, todayKey }
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayKey = getDateKey(yesterday)

  if (lastDate === yesterdayKey) {
    return { nextStreak: currentStreak + 1, isRepeat: false, todayKey }
  }

  return { nextStreak: 1, isRepeat: false, todayKey }
}
