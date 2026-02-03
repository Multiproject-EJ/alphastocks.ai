/**
 * EventCalendar Component
 * Shows upcoming events in a calendar view
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { GameEvent } from '@/lib/events'
import { MiniGameSchedule, getTimeRemaining } from '@/lib/miniGameSchedule'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'

interface EventCalendarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeEvents: GameEvent[]
  upcomingEvents: GameEvent[]
  activeMiniGames: MiniGameSchedule[]
  upcomingMiniGames: Array<MiniGameSchedule & { startsAt: Date }>
}

export function EventCalendar({
  open,
  onOpenChange,
  activeEvents,
  upcomingEvents,
  activeMiniGames,
  upcomingMiniGames,
}: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth] = useState(new Date())

  // Get all days in current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get events for a specific date
  const getEventsForDate = (date: Date): GameEvent[] => {
    const allEvents = [...activeEvents, ...upcomingEvents]
    return allEvents.filter(event => {
      return isSameDay(event.startDate, date) || 
             (event.startDate <= date && event.endDate >= date)
    })
  }

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    return getEventsForDate(date).length > 0
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Format countdown for upcoming events
  const getCountdown = (event: GameEvent) => {
    const now = new Date()
    const diff = event.startDate.getTime() - now.getTime()
    
    if (diff < 0) return 'Active Now'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `Starts in ${days}d ${hours}h`
    if (hours > 0) return `Starts in ${hours}h`
    return 'Starting soon!'
  }

  const getMiniGameCountdown = (startsAt: Date) => {
    const now = new Date()
    const diff = startsAt.getTime() - now.getTime()

    if (diff < 0) return 'Active Now'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `Starts in ${days}d ${hours}h`
    if (hours > 0) return `Starts in ${hours}h`
    return 'Starting soon!'
  }

  const activeMiniGameWindows = activeMiniGames.filter(game => game.category !== 'always')
  const upcomingMiniGameWindows = upcomingMiniGames.filter(game => game.category !== 'always')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] bg-card border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
            <span>📅</span>
            Event Calendar
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)] pr-4">
          {/* Calendar Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Month days */}
              {daysInMonth.map(date => {
                const hasEvent = hasEvents(date)
                const isTodayDate = isToday(date)
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                
                return (
                  <motion.button
                    key={date.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg border-2 p-2 text-sm font-semibold transition-all ${
                      isTodayDate
                        ? 'bg-accent/20 border-accent'
                        : isSelected
                        ? 'bg-accent/10 border-accent/50'
                        : 'border-border/30 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={isTodayDate ? 'text-accent' : 'text-foreground'}>
                        {format(date, 'd')}
                      </span>
                      {hasEvent && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 bg-accent rounded-full mt-1"
                        />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Selected date events */}
            {selectedDate && selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-card/50 rounded-lg border-2 border-accent/30"
              >
                <h4 className="font-bold text-foreground mb-2">
                  Events on {format(selectedDate, 'MMM d, yyyy')}
                </h4>
                <div className="space-y-2">
                  {selectedEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded"
                    >
                      <span className="text-xl">{event.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.description}</div>
                      </div>
                      {activeEvents.includes(event) && (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          Active
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Upcoming Events List */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">
              Upcoming Events
            </h3>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-card/50 rounded-lg border-2 border-border/30 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{event.icon}</span>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-muted-foreground">
                            {format(event.startDate, 'MMM d, h:mm a')}
                          </div>
                          <div className="text-accent font-semibold">
                            {getCountdown(event)}
                          </div>
                        </div>
                      </div>
                      
                      {activeEvents.includes(event) && (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          Active Now
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No upcoming events scheduled
              </div>
            )}
          </div>

          {/* Mini-Game Windows List */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-foreground">
              Mini-Game Windows
            </h3>

            {activeMiniGameWindows.length > 0 && (
              <div className="space-y-3 mb-4">
                {activeMiniGameWindows.map((game, index) => {
                  const remaining = getTimeRemaining(game)
                  return (
                    <motion.div
                      key={`active-${game.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-card/60 rounded-lg border-2 border-emerald-400/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🎮</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-1">
                            {game.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Window live right now.
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="text-muted-foreground">
                              {remaining ? `Ends in ${remaining.display}` : 'Ending soon'}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-300/40">
                          Active Now
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {upcomingMiniGameWindows.length > 0 ? (
              <div className="space-y-3">
                {upcomingMiniGameWindows.map((game, index) => (
                  <motion.div
                    key={`upcoming-${game.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-card/50 rounded-lg border-2 border-border/30 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">🎮</span>

                      <div className="flex-1">
                        <h4 className="font-bold text-foreground mb-1">
                          {game.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Next scheduled window.
                        </p>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-muted-foreground">
                            {format(game.startsAt, 'MMM d, h:mm a')}
                          </div>
                          <div className="text-accent font-semibold">
                            {getMiniGameCountdown(game.startsAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No upcoming mini-game windows scheduled
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default EventCalendar
