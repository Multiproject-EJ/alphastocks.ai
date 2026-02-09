/**
 * Mini-Game Schedule System
 * Manages availability, limits, and scheduling for all mini-games
 */

import {
  WindowSchedule,
  getActiveScheduleWindow,
  getNextWindowStart,
  getScheduleTimeRemaining,
} from '@/lib/windowSchedule'

export interface MiniGameSchedule {
  id: string
  name: string
  category: 'always' | 'scheduled' | 'special'
  isActive: boolean
  
  // For 'always' category
  dailyLimit?: number
  cooldownMinutes?: number
  
  // For 'scheduled' category
  schedule?: WindowSchedule
  
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
  {
    id: 'market-mayhem',
    name: 'Market Mayhem',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'monthly-random',
      times: ['11:00', '19:00'],
      durationMinutes: 240,
      seedKey: 'market-mayhem',
      occurrences: {
        min: 2,
        max: 3,
      },
    },
  },
  {
    id: 'portfolio-poker',
    name: 'Portfolio Poker',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'daily',
      times: ['18:00'],
      durationMinutes: 180,
    },
  },
  {
    id: 'dividend-derby',
    name: 'Dividend Derby',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'monthly-random',
      times: ['12:00'],
      durationMinutes: 180,
      seedKey: 'dividend-derby',
      occurrences: {
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'bull-run',
    name: 'Bull Run',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'daily',
      times: ['15:00'],
      durationMinutes: 90,
    },
  },
  {
    id: 'bear-trap',
    name: 'Bear Trap',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'daily',
      times: ['21:00'],
      durationMinutes: 120,
    },
  },
  {
    id: 'ipo-frenzy',
    name: 'IPO Frenzy',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [2], // Tuesday
      times: ['19:00'],
      durationMinutes: 120,
    },
  },
  {
    id: 'merger-mania',
    name: 'Merger Mania',
    category: 'special',
    isActive: false,
    schedule: {
      type: 'weekly',
      days: [3], // Wednesday
      times: ['20:00'],
      durationMinutes: 120,
    },
  },
]

export function getMiniGameSchedule(gameId: string): MiniGameSchedule | undefined {
  return MINI_GAME_CONFIG.find(game => game.id === gameId)
}

/**
 * Get currently active mini-games
 */
export function getActiveMiniGames(): MiniGameSchedule[] {
  const now = new Date()
  
  return MINI_GAME_CONFIG.filter(game => {
    if (game.category === 'always') return true
    
    if (game.schedule) {
      return getActiveScheduleWindow(game.schedule, now) !== null
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
    
    const nextStart = game.schedule ? getNextWindowStart(game.schedule, now) : null
    if (nextStart && nextStart <= cutoff && nextStart > now) {
      upcoming.push({ ...game, startsAt: nextStart })
    }
  })
  
  return upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}


/**
 * Get time remaining for an active event
 */
export function getTimeRemaining(game: MiniGameSchedule): { minutes: number, display: string } | null {
  if (!game.schedule) return null

  return getScheduleTimeRemaining(game.schedule, new Date())
}
