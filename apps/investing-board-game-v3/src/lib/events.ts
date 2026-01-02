/**
 * Events System
 * Recurring and special events that provide temporary bonuses and effects
 */

export interface GameEvent {
  id: string
  title: string
  description: string
  type: 'recurring' | 'special' | 'flash'
  startDate: Date
  endDate: Date
  isActive: boolean
  
  effects: {
    starsMultiplier?: number // e.g., 2 for 2x stars
    xpMultiplier?: number
    rollsBonus?: number // bonus rolls granted
    shopDiscount?: number // % off shop items (0-100)
    guaranteedWin?: boolean // casino guaranteed win
    customEffect?: string // special logic identifier
  }
  
  icon: string // emoji
  currency?: EventCurrencyRules
  theme?: string // optional UI theme during event
  
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    dayOfWeek?: number // 0-6 for weekly (0 = Sunday)
    dayOfMonth?: number // 1-31 for monthly
    hour?: number // for time-specific events
    duration: number // hours
  }
}

export interface EventCurrencyRules {
  emoji: string
  earnOnMarketEvent: number
  goal: number
  rewardStars: number
}

const createCurrencyRules = (
  emoji: string,
  earnOnMarketEvent: number,
  goal: number,
  rewardStars: number
): EventCurrencyRules => ({
  emoji,
  earnOnMarketEvent,
  goal,
  rewardStars,
})

/**
 * Calculate the next occurrence of a recurring event
 */
function getNextOccurrence(recurrence: GameEvent['recurrence']): { start: Date; end: Date } {
  if (!recurrence) {
    return { start: new Date(), end: new Date() }
  }

  const now = new Date()
  let start = new Date(now)

  if (recurrence.frequency === 'weekly' && recurrence.dayOfWeek !== undefined) {
    const currentDay = now.getDay()
    const targetDay = recurrence.dayOfWeek
    let daysUntilTarget = targetDay - currentDay

    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && now.getHours() >= (recurrence.hour || 0))) {
      daysUntilTarget += 7
    }

    start.setDate(now.getDate() + daysUntilTarget)
    start.setHours(recurrence.hour || 0, 0, 0, 0)
  } else if (recurrence.frequency === 'daily') {
    if (now.getHours() >= (recurrence.hour || 0)) {
      start.setDate(now.getDate() + 1)
    }
    start.setHours(recurrence.hour || 0, 0, 0, 0)
  } else if (recurrence.frequency === 'monthly' && recurrence.dayOfMonth !== undefined) {
    start.setDate(recurrence.dayOfMonth)
    if (start <= now) {
      start.setMonth(start.getMonth() + 1)
    }
    start.setHours(recurrence.hour || 0, 0, 0, 0)
  }

  const end = new Date(start)
  end.setHours(end.getHours() + recurrence.duration)

  return { start, end }
}

/**
 * Check if an event is currently active
 */
function isEventActive(event: GameEvent, now: Date): boolean {
  return now >= event.startDate && now < event.endDate
}

// Recurring events
export const RECURRING_EVENTS: GameEvent[] = [
  {
    id: 'star-rush-weekend',
    title: 'Star Rush Weekend',
    description: '2x stars on ALL rewards!',
    type: 'recurring',
    startDate: new Date(), // calculated dynamically
    endDate: new Date(),
    isActive: false,
    effects: { starsMultiplier: 2 },
    icon: '🌟',
    currency: createCurrencyRules('🌟', 6, 30, 600),
    recurrence: { 
      frequency: 'weekly', 
      dayOfWeek: 5, // Friday
      hour: 18, // 6 PM
      duration: 48 // 48 hours (all weekend)
    }
  },
  {
    id: 'thrifty-thursday',
    title: 'Thrifty Thursday',
    description: '2x stars from Thrifty Path challenges',
    type: 'recurring',
    startDate: new Date(),
    endDate: new Date(),
    isActive: false,
    effects: { customEffect: 'thrifty_2x' },
    icon: '💰',
    currency: createCurrencyRules('💰', 4, 20, 350),
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 4, // Thursday
      hour: 0,
      duration: 24
    }
  },
  {
    id: 'casino-happy-hour',
    title: 'Casino Happy Hour',
    description: 'Guaranteed scratchcard win!',
    type: 'recurring',
    startDate: new Date(),
    endDate: new Date(),
    isActive: false,
    effects: { guaranteedWin: true },
    icon: '🎰',
    currency: createCurrencyRules('🎰', 5, 25, 400),
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 5, // Friday
      hour: 18,
      duration: 24
    }
  },
  {
    id: 'roll-fest-sunday',
    title: 'Roll Fest Sunday',
    description: '+5 bonus dice rolls',
    type: 'recurring',
    startDate: new Date(),
    endDate: new Date(),
    isActive: false,
    effects: { rollsBonus: 5 },
    icon: '🎲',
    currency: createCurrencyRules('🎲', 5, 20, 450),
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 0, // Sunday
      hour: 0,
      duration: 24
    }
  },
  {
    id: 'midweek-madness',
    title: 'Midweek Madness',
    description: '1.5x XP on everything!',
    type: 'recurring',
    startDate: new Date(),
    endDate: new Date(),
    isActive: false,
    effects: { xpMultiplier: 1.5 },
    icon: '⚡',
    currency: createCurrencyRules('⚡', 4, 24, 375),
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 3, // Wednesday
      hour: 12,
      duration: 36
    }
  }
]

// Special events (manually scheduled)
export const SPECIAL_EVENTS: GameEvent[] = [
  {
    id: 'new-year-2026',
    title: 'New Year Celebration',
    description: '3x stars and XP for 24 hours!',
    type: 'special',
    startDate: new Date('2026-01-01T00:00:00'),
    endDate: new Date('2026-01-02T00:00:00'),
    isActive: false,
    effects: { starsMultiplier: 3, xpMultiplier: 3 },
    icon: '🎊',
    currency: createCurrencyRules('🎊', 6, 24, 750),
  },
  {
    id: 'new-year-2025',
    title: 'New Year Celebration',
    description: '3x stars and XP for 24 hours!',
    type: 'special',
    startDate: new Date('2025-01-01T00:00:00'),
    endDate: new Date('2025-01-02T00:00:00'),
    isActive: false,
    effects: { starsMultiplier: 3, xpMultiplier: 3 },
    icon: '🎊',
    currency: createCurrencyRules('🎊', 6, 24, 750),
  },
]

const ROTATION_EVENT_TEMPLATES: Array<Omit<GameEvent, 'startDate' | 'endDate' | 'isActive' | 'id'>> = [
  {
    title: 'Market Momentum',
    description: '1.25x XP on all moves and challenges.',
    type: 'special',
    effects: { xpMultiplier: 1.25 },
    icon: '📈',
    currency: createCurrencyRules('📈', 5, 25, 500),
  },
  {
    title: 'Dividend Days',
    description: '2x stars from passive rewards.',
    type: 'special',
    effects: { starsMultiplier: 2 },
    icon: '💸',
    currency: createCurrencyRules('💸', 4, 20, 400),
  },
  {
    title: 'Bull Run Rally',
    description: 'Bonus rolls and 1.5x XP.',
    type: 'special',
    effects: { rollsBonus: 3, xpMultiplier: 1.5 },
    icon: '🐂',
    currency: createCurrencyRules('🐂', 6, 30, 600),
  },
  {
    title: 'Savings Surge',
    description: 'Shop discounts up to 20%.',
    type: 'special',
    effects: { shopDiscount: 20 },
    icon: '🛍️',
    currency: createCurrencyRules('🛍️', 3, 18, 350),
  },
  {
    title: 'Star Harvest',
    description: '1.75x stars on everything.',
    type: 'special',
    effects: { starsMultiplier: 1.75 },
    icon: '✨',
    currency: createCurrencyRules('✨', 5, 22, 450),
  },
  {
    title: 'Investor Advantage',
    description: 'Extra rolls and boosted XP.',
    type: 'special',
    effects: { rollsBonus: 2, xpMultiplier: 1.4 },
    icon: '🧠',
    currency: createCurrencyRules('🧠', 4, 24, 425),
  },
  {
    title: 'Momentum Marathon',
    description: 'Extended streak buffs and bonus XP.',
    type: 'special',
    effects: { xpMultiplier: 1.35 },
    icon: '🏁',
    currency: createCurrencyRules('🏁', 5, 28, 500),
  },
  {
    title: 'High Yield Weekend',
    description: '2.25x stars and lucky perks.',
    type: 'special',
    effects: { starsMultiplier: 2.25 },
    icon: '🏦',
    currency: createCurrencyRules('🏦', 6, 30, 650),
  },
]

const ROTATION_DURATIONS_DAYS = [2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2]
const ROTATION_GAP_AFTER_INDEX = new Set([2, 6])

function generateMonthlyRotationEvents(now: Date = new Date()): GameEvent[] {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const monthEndExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
  const events: GameEvent[] = []
  let cursor = new Date(monthStart)
  let templateIndex = 0
  let durationIndex = 0
  let gapDaysUsed = 0

  while (cursor < monthEndExclusive) {
    if (ROTATION_GAP_AFTER_INDEX.has(events.length) && gapDaysUsed < 3) {
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() + 1)
      gapDaysUsed += 1
      continue
    }

    const template = ROTATION_EVENT_TEMPLATES[templateIndex % ROTATION_EVENT_TEMPLATES.length]
    const durationDays = ROTATION_DURATIONS_DAYS[durationIndex % ROTATION_DURATIONS_DAYS.length]
    const startDate = new Date(cursor)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + durationDays)

    if (startDate >= monthEndExclusive) break

    const cappedEndDate = endDate > monthEndExclusive ? new Date(monthEndExclusive) : endDate

    events.push({
      ...template,
      id: `${template.title.toLowerCase().replace(/\s+/g, '-')}-${now.getFullYear()}-${now.getMonth() + 1}-${events.length + 1}`,
      startDate,
      endDate: cappedEndDate,
      isActive: false,
    })

    cursor = new Date(cappedEndDate)
    templateIndex += 1
    durationIndex += 1
  }

  return events
}

/**
 * Initialize recurring event dates
 */
function initializeRecurringEvents(): GameEvent[] {
  return RECURRING_EVENTS.map(event => {
    if (!event.recurrence) return event
    
    const { start, end } = getNextOccurrence(event.recurrence)
    return {
      ...event,
      startDate: start,
      endDate: end,
      isActive: false
    }
  })
}

// Store for initialized events
let initializedRecurringEvents: GameEvent[] | null = null

/**
 * Get all events (recurring + special) with proper dates
 */
export function getAllEvents(): GameEvent[] {
  if (!initializedRecurringEvents) {
    initializedRecurringEvents = initializeRecurringEvents()
  }
  return [
    ...initializedRecurringEvents,
    ...SPECIAL_EVENTS,
    ...generateMonthlyRotationEvents(),
  ]
}

/**
 * Get currently active events
 */
export function getActiveEvents(now: Date = new Date()): GameEvent[] {
  const allEvents = getAllEvents()
  return allEvents.filter(event => isEventActive(event, now))
}

/**
 * Get upcoming events (next N events)
 */
export function getUpcomingEvents(limit: number = 5, now: Date = new Date()): GameEvent[] {
  const allEvents = getAllEvents()
  
  // Filter to future events and sort by start date
  const upcomingEvents = allEvents
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, limit)
  
  return upcomingEvents
}

/**
 * Check if any event should start now
 * Returns the event if it just started (within the last minute)
 */
export function checkEventStart(now: Date = new Date()): GameEvent | null {
  const allEvents = getAllEvents()
  const oneMinuteAgo = new Date(now.getTime() - 60000)
  
  for (const event of allEvents) {
    if (event.startDate > oneMinuteAgo && event.startDate <= now && !event.isActive) {
      return event
    }
  }
  
  return null
}

/**
 * Check if any event should end now
 * Returns the event if it just ended (within the last minute)
 */
export function checkEventEnd(now: Date = new Date()): GameEvent | null {
  const allEvents = getAllEvents()
  const oneMinuteAgo = new Date(now.getTime() - 60000)
  
  for (const event of allEvents) {
    if (event.endDate > oneMinuteAgo && event.endDate <= now && event.isActive) {
      return event
    }
  }
  
  return null
}

/**
 * Update event active status
 * Should be called when an event starts or ends
 */
export function updateEventStatus(eventId: string, isActive: boolean): void {
  if (initializedRecurringEvents) {
    const index = initializedRecurringEvents.findIndex(e => e.id === eventId)
    if (index !== -1) {
      initializedRecurringEvents[index] = {
        ...initializedRecurringEvents[index],
        isActive
      }
      
      // If event ended and is recurring, calculate next occurrence
      if (!isActive && initializedRecurringEvents[index].recurrence) {
        const { start, end } = getNextOccurrence(initializedRecurringEvents[index].recurrence!)
        initializedRecurringEvents[index] = {
          ...initializedRecurringEvents[index],
          startDate: start,
          endDate: end
        }
      }
    }
  }
}
