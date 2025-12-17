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
  theme?: string // optional UI theme during event
  
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    dayOfWeek?: number // 0-6 for weekly (0 = Sunday)
    dayOfMonth?: number // 1-31 for monthly
    hour?: number // for time-specific events
    duration: number // hours
  }
}

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
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 5, // Friday
      hour: 18,
      duration: 3
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
    recurrence: {
      frequency: 'weekly',
      dayOfWeek: 3, // Wednesday
      hour: 12,
      duration: 12
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
    icon: '🎊'
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
    icon: '🎊'
  },
]

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
  return [...initializedRecurringEvents, ...SPECIAL_EVENTS]
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
