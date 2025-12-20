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
    let payloadString: string | undefined
    
    if (typeof payload === 'string') {
      payloadString = payload.slice(0, 100)
    } else if (payload) {
      try {
        const jsonStr = JSON.stringify(payload)
        payloadString = jsonStr.length > 100 ? jsonStr.slice(0, 100) + '...' : jsonStr
      } catch (error) {
        payloadString = '[Circular or non-serializable]'
      }
    }

    const event: GameEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      payload: payloadString
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
