/**
 * Event Bus for DevTools
 * Simple event logger that stores the last 20 events with timestamp, type, and payload summary
 */

export interface GameEvent {
  id: string
  timestamp: Date
  type: string
  payload?: string
}

class EventBus {
  private events: GameEvent[] = []
  private maxEvents = 20
  private listeners: Set<() => void> = new Set()

  logEvent(type: string, payload?: Record<string, unknown> | string) {
    const event: GameEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      payload: typeof payload === 'string' 
        ? payload 
        : payload 
          ? (() => {
              try {
                return JSON.stringify(payload, null, 0).slice(0, 100) // Limit payload length
              } catch (error) {
                return '[Circular or non-serializable]'
              }
            })()
          : undefined
    }

    this.events.unshift(event) // Add to beginning
    
    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener())
  }

  getEvents(): GameEvent[] {
    return [...this.events]
  }

  clearEvents() {
    this.events = []
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

// Singleton instance
export const eventBus = new EventBus()

// Helper function to log events
export function logEvent(type: string, payload?: Record<string, unknown> | string) {
  eventBus.logEvent(type, payload)
}
