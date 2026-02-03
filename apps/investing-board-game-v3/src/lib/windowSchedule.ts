export type WindowScheduleType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'monthly-weekday'
  | 'monthly-random'
  | 'custom'

export interface WindowSchedule {
  type: WindowScheduleType
  times?: string[]
  days?: number[]
  dayOfMonth?: number
  weekOfMonth?: number
  durationMinutes: number
  seedKey?: string
  occurrences?: {
    min: number
    max: number
  }
}

export interface ScheduleWindow {
  start: Date
  end: Date
}

const DEFAULT_TIME = '00:00'

export function getActiveScheduleWindow(schedule: WindowSchedule, now: Date): ScheduleWindow | null {
  if (schedule.type === 'custom') {
    return null
  }

  if (schedule.type === 'monthly-random') {
    const occurrences = [
      ...getMonthlyRandomOccurrences(schedule, now),
      ...getMonthlyRandomOccurrences(schedule, new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    ]
    return findActiveWindow(occurrences, schedule.durationMinutes, now)
  }

  const starts = getScheduledStartsForDate(schedule, now)
  return findActiveWindow(starts, schedule.durationMinutes, now)
}

export function getNextScheduleWindow(schedule: WindowSchedule, from: Date): ScheduleWindow | null {
  if (schedule.type === 'custom') {
    return null
  }

  const start = getNextWindowStart(schedule, from)
  if (!start) return null

  return {
    start,
    end: new Date(start.getTime() + schedule.durationMinutes * 60 * 1000),
  }
}

export function getNextWindowStart(schedule: WindowSchedule, from: Date): Date | null {
  if (schedule.type === 'custom') {
    return null
  }

  if (schedule.type === 'monthly-random') {
    const occurrences = [
      ...getMonthlyRandomOccurrences(schedule, from),
      ...getMonthlyRandomOccurrences(schedule, new Date(from.getFullYear(), from.getMonth() + 1, 1)),
    ]
    return occurrences.find(date => date > from) ?? null
  }

  const times = getScheduleTimes(schedule.times)

  if (schedule.type === 'daily') {
    const todayStarts = buildStartsForDay(from, times)
    const todayNext = todayStarts.find(date => date > from)
    if (todayNext) return todayNext

    const tomorrow = new Date(from)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return buildStartsForDay(tomorrow, times)[0] ?? null
  }

  if (schedule.type === 'weekly') {
    if (!schedule.days || schedule.days.length === 0) return null
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const checkDate = new Date(from)
      checkDate.setDate(checkDate.getDate() + dayOffset)
      if (!schedule.days.includes(checkDate.getDay())) {
        continue
      }

      const starts = buildStartsForDay(checkDate, times)
      const next = starts.find(date => date > from)
      if (next) return next
    }
    return null
  }

  if (schedule.type === 'monthly') {
    if (!schedule.dayOfMonth) return null
    const currentMonthDate = new Date(from.getFullYear(), from.getMonth(), schedule.dayOfMonth)
    const starts = buildStartsForDay(currentMonthDate, times)
    const next = starts.find(date => date > from)
    if (next) return next

    const nextMonthDate = new Date(from.getFullYear(), from.getMonth() + 1, schedule.dayOfMonth)
    return buildStartsForDay(nextMonthDate, times)[0] ?? null
  }

  if (schedule.type === 'monthly-weekday') {
    const dayOfWeek = schedule.days?.[0]
    if (dayOfWeek === undefined || schedule.weekOfMonth === undefined) return null

    const currentMonthTarget = getNthWeekdayOfMonth(
      from.getFullYear(),
      from.getMonth(),
      dayOfWeek,
      schedule.weekOfMonth
    )
    const starts = buildStartsForDay(currentMonthTarget, times)
    const next = starts.find(date => date > from)
    if (next) return next

    const nextMonthTarget = getNthWeekdayOfMonth(
      from.getFullYear(),
      from.getMonth() + 1,
      dayOfWeek,
      schedule.weekOfMonth
    )
    return buildStartsForDay(nextMonthTarget, times)[0] ?? null
  }

  return null
}

export function getScheduleTimeRemaining(
  schedule: WindowSchedule,
  now: Date
): { minutes: number; display: string } | null {
  const activeWindow = getActiveScheduleWindow(schedule, now)
  if (!activeWindow) return null

  const remaining = Math.max(0, Math.floor((activeWindow.end.getTime() - now.getTime()) / 60000))
  const hours = Math.floor(remaining / 60)
  const mins = remaining % 60

  return {
    minutes: remaining,
    display: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
  }
}

function getScheduledStartsForDate(schedule: WindowSchedule, date: Date): Date[] {
  const times = getScheduleTimes(schedule.times)

  if (schedule.type === 'daily') {
    return buildStartsForDay(date, times)
  }

  if (schedule.type === 'weekly') {
    if (!schedule.days || !schedule.days.includes(date.getDay())) return []
    return buildStartsForDay(date, times)
  }

  if (schedule.type === 'monthly') {
    if (!schedule.dayOfMonth || date.getDate() !== schedule.dayOfMonth) return []
    return buildStartsForDay(date, times)
  }

  if (schedule.type === 'monthly-weekday') {
    const dayOfWeek = schedule.days?.[0]
    if (dayOfWeek === undefined || schedule.weekOfMonth === undefined) return []
    const targetDate = getNthWeekdayOfMonth(
      date.getFullYear(),
      date.getMonth(),
      dayOfWeek,
      schedule.weekOfMonth
    )
    if (
      targetDate.getFullYear() !== date.getFullYear() ||
      targetDate.getMonth() !== date.getMonth() ||
      targetDate.getDate() !== date.getDate()
    ) {
      return []
    }
    return buildStartsForDay(targetDate, times)
  }

  return []
}

function buildStartsForDay(date: Date, times: string[]): Date[] {
  return times
    .map(time => {
      const [hour, minute] = time.split(':').map(Number)
      const startDate = new Date(date)
      startDate.setHours(hour, minute, 0, 0)
      return startDate
    })
    .sort((a, b) => a.getTime() - b.getTime())
}

function getScheduleTimes(times?: string[]): string[] {
  return times && times.length > 0 ? times : [DEFAULT_TIME]
}

function findActiveWindow(starts: Date[], durationMinutes: number, now: Date): ScheduleWindow | null {
  for (const startDate of starts) {
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    if (now >= startDate && now <= endDate) {
      return { start: startDate, end: endDate }
    }
  }
  return null
}

function getMonthlyRandomOccurrences(schedule: WindowSchedule, referenceDate: Date): Date[] {
  if (schedule.type !== 'monthly-random') return []

  const { times, occurrences } = schedule
  const seedKey = schedule.seedKey ?? 'window'
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const [minOccurrences, maxOccurrences] = occurrences
    ? [occurrences.min, occurrences.max]
    : [2, 3]
  const count =
    minOccurrences +
    Math.floor(
      createSeededRandom(`${seedKey}-${year}-${month}-occurrences`)() *
        (maxOccurrences - minOccurrences + 1)
    )
  const scheduleTimes = times && times.length > 0 ? times : [DEFAULT_TIME]
  const rand = createSeededRandom(`${seedKey}-${year}-${month}-slots`)
  const selectedDays = new Set<number>()

  let attempts = 0
  while (selectedDays.size < count && attempts < daysInMonth * 2) {
    selectedDays.add(1 + Math.floor(rand() * daysInMonth))
    attempts += 1
  }

  const starts = Array.from(selectedDays).map(day => {
    const [hour, minute] = scheduleTimes[Math.floor(rand() * scheduleTimes.length)].split(':').map(Number)
    return new Date(year, month, day, hour, minute, 0, 0)
  })

  return starts.sort((a, b) => a.getTime() - b.getTime())
}

function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, weekOfMonth: number): Date {
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekdayOffset = (dayOfWeek - firstOfMonth.getDay() + 7) % 7
  const dayOfMonth = 1 + firstWeekdayOffset + (weekOfMonth - 1) * 7
  return new Date(year, month, dayOfMonth)
}

function createSeededRandom(seed: string): () => number {
  const seedFn = xmur3(seed)
  return mulberry32(seedFn())
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function mulberry32(a: number): () => number {
  return () => {
    let t = a += 0x6d2b79f5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
