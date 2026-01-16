/**
 * Mini-Game Schedule System
 * Manages availability, limits, and scheduling for all mini-games
 */

export interface MiniGameSchedule {
  id: string
  name: string
  category: 'always' | 'scheduled' | 'special'
  isActive: boolean
  
  // For 'always' category
  dailyLimit?: number
  cooldownMinutes?: number
  
  // For 'scheduled' category
  schedule?: {
    type: 'daily' | 'weekly' | 'custom'
    times?: string[]  // e.g., ['09:00', '13:00', '18:00']
    days?: number[]   // 0-6 for weekly (0 = Sunday)
    durationMinutes: number
  }
  
  // For 'special' category
  startTime?: Date
  endTime?: Date
}

export const MINI_GAME_CONFIG: MiniGameSchedule[] = [
  // Always Available
  {
    id: 'scratchcard',
    name: 'Scratchcard',
    category: 'always',
    isActive: true,
    dailyLimit: 3,
    cooldownMinutes: 60,
  },
  {
    id: 'quiz',
    name: 'Quiz Challenge',
    category: 'always',
    isActive: true,
    dailyLimit: 5,
    cooldownMinutes: 0,
  },
  {
    id: 'bias-sanctuary',
    name: 'Bias Sanctuary',
    category: 'always',
    isActive: true,
    dailyLimit: 3,
    cooldownMinutes: 0,
  },
  {
    id: 'daily-dividends',
    name: 'Daily Dividends',
    category: 'always',
    isActive: true,
    dailyLimit: 1,
    cooldownMinutes: 1440, // 24 hours
  },
  
  // Scheduled Events
  {
    id: 'happy-hour-wheel',
    name: 'Happy Hour Wheel',
    category: 'scheduled',
    isActive: false, // Activated by schedule
    schedule: {
      type: 'daily',
      times: ['18:00'],
      durationMinutes: 180, // 3 hours
    },
  },
  {
    id: 'stock-rush',
    name: 'Stock Rush',
    category: 'scheduled',
    isActive: false,
    schedule: {
      type: 'daily',
      times: ['09:00', '13:00', '18:00'],
      durationMinutes: 120, // 2 hours each
    },
  },
  {
    id: 'casino-happy-hour',
    name: 'Casino Happy Hour',
    category: 'scheduled',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [5], // Friday
      times: ['18:00'],
      durationMinutes: 180,
    },
  },
  {
    id: 'thrifty-thursday',
    name: 'Thrifty Thursday',
    category: 'scheduled',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [4], // Thursday
      times: ['00:00'],
      durationMinutes: 1440, // 24 hours
    },
  },
  {
    id: 'roll-fest-sunday',
    name: 'Roll Fest Sunday',
    category: 'scheduled',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [0], // Sunday
      times: ['00:00'],
      durationMinutes: 1440,
    },
  },
  
  // Special Events (examples - would be dynamically loaded)
  {
    id: 'vault-heist',
    name: 'Vault Heist',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [6], // Saturday
      times: ['14:00'],
      durationMinutes: 60,
    },
  },
]

/**
 * Get currently active mini-games
 */
export function getActiveMiniGames(): MiniGameSchedule[] {
  const now = new Date()
  
  return MINI_GAME_CONFIG.filter(game => {
    if (game.category === 'always') return true
    
    if (game.schedule) {
      return isGameActiveNow(game, now)
    }
    
    if (game.startTime && game.endTime) {
      return now >= game.startTime && now <= game.endTime
    }
    
    return false
  })
}

/**
 * Get upcoming mini-games (starting within next N hours)
 */
export function getUpcomingMiniGames(hoursAhead: number = 24): Array<MiniGameSchedule & { startsAt: Date }> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
  
  const upcoming: Array<MiniGameSchedule & { startsAt: Date }> = []
  
  MINI_GAME_CONFIG.forEach(game => {
    if (game.category === 'always') return
    
    const nextStart = getNextStartTime(game, now)
    if (nextStart && nextStart <= cutoff && nextStart > now) {
      upcoming.push({ ...game, startsAt: nextStart })
    }
  })
  
  return upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

/**
 * Check if a scheduled game is active right now
 */
function isGameActiveNow(game: MiniGameSchedule, now: Date): boolean {
  if (!game.schedule) return false
  
  const { type, times, days, durationMinutes } = game.schedule
  const currentDay = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  // Check if today is a valid day
  if (type === 'weekly' && days && !days.includes(currentDay)) {
    return false
  }
  
  // Check if we're within any of the time windows
  if (times) {
    for (const startTime of times) {
      const [startHour, startMin] = startTime.split(':').map(Number)
      const startDate = new Date(now)
      startDate.setHours(startHour, startMin, 0, 0)
      
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
      
      if (now >= startDate && now <= endDate) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Get the next start time for a scheduled game
 */
function getNextStartTime(game: MiniGameSchedule, from: Date): Date | null {
  if (!game.schedule) return null
  
  const { type, times, days, durationMinutes } = game.schedule
  
  if (!times || times.length === 0) return null
  
  // Find next occurrence
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDate = new Date(from)
    checkDate.setDate(checkDate.getDate() + dayOffset)
    const checkDay = checkDate.getDay()
    
    // Skip if not a valid day for weekly events
    if (type === 'weekly' && days && !days.includes(checkDay)) {
      continue
    }
    
    for (const time of times) {
      const [hour, min] = time.split(':').map(Number)
      const startDate = new Date(checkDate)
      startDate.setHours(hour, min, 0, 0)
      
      if (startDate > from) {
        return startDate
      }
    }
  }
  
  return null
}

/**
 * Get time remaining for an active event
 */
export function getTimeRemaining(game: MiniGameSchedule): { minutes: number, display: string } | null {
  if (!game.schedule) return null
  
  const now = new Date()
  const { times, durationMinutes } = game.schedule
  
  if (!times) return null
  
  for (const time of times) {
    const [hour, min] = time.split(':').map(Number)
    const startDate = new Date(now)
    startDate.setHours(hour, min, 0, 0)
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    
    if (now >= startDate && now <= endDate) {
      const remaining = Math.floor((endDate.getTime() - now.getTime()) / 60000)
      const hours = Math.floor(remaining / 60)
      const mins = remaining % 60
      
      return {
        minutes: remaining,
        display: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      }
    }
  }
  
  return null
}
