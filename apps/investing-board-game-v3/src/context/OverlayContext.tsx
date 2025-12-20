import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

export type OverlayPriority = 'critical' | 'high' | 'normal' | 'low'

export interface OverlayConfig {
  id: string
  component: React.ComponentType<any>
  props?: Record<string, any>
  priority: OverlayPriority
  dismissible?: boolean  // can user close it?
  autoClose?: number  // auto-close after N ms
  onClose?: () => void
}

export interface OverlayManagerState {
  stack: OverlayConfig[]  // currently displayed (only top one visible)
  queue: OverlayConfig[]  // waiting to be shown
  history: Array<{ id: string; timestamp: Date }>  // for frequency caps
}

export interface OverlayManagerAPI {
  // Show an overlay (adds to queue if one is open)
  show: (config: Omit<OverlayConfig, 'id'> & { id?: string }) => string
  
  // Close specific overlay
  close: (id: string) => void
  
  // Close current (top of stack)
  closeCurrent: () => void
  
  // Close all
  closeAll: () => void
  
  // Check if overlay was recently shown
  wasRecentlyShown: (overlayType: string, withinMs: number) => boolean
  
  // Get current state
  getCurrentOverlay: () => OverlayConfig | null
  getStackSize: () => number
  getQueueSize: () => number
  getStack: () => OverlayConfig[]
  getQueue: () => OverlayConfig[]
}

const OverlayContext = createContext<OverlayManagerAPI | null>(null)

interface OverlayProviderProps {
  children: React.ReactNode
}

// Priority levels for sorting (higher number = higher priority)
const PRIORITY_LEVELS: Record<OverlayPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [state, setState] = useState<OverlayManagerState>({
    stack: [],
    queue: [],
    history: [],
  })
  
  const autoCloseTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  
  // Generate unique ID if not provided
  const generateId = useCallback((type: string) => {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  // Clean up auto-close timer
  const clearAutoCloseTimer = useCallback((id: string) => {
    const timer = autoCloseTimersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      autoCloseTimersRef.current.delete(id)
    }
  }, [])
  
  // Set up auto-close timer
  const setupAutoCloseTimer = useCallback((config: OverlayConfig) => {
    if (config.autoClose) {
      const timer = setTimeout(() => {
        close(config.id)
      }, config.autoClose)
      autoCloseTimersRef.current.set(config.id, timer)
    }
  }, [])
  
  // Process queue - show next overlay if stack is empty or priority allows
  const processQueue = useCallback((currentState: OverlayManagerState) => {
    if (currentState.queue.length === 0) return currentState
    
    // Sort queue by priority (higher priority first)
    const sortedQueue = [...currentState.queue].sort((a, b) => 
      PRIORITY_LEVELS[b.priority] - PRIORITY_LEVELS[a.priority]
    )
    
    const currentOverlay = currentState.stack[currentState.stack.length - 1]
    
    // If nothing on stack, show the highest priority item from queue
    if (!currentOverlay) {
      const [next, ...remainingQueue] = sortedQueue
      return {
        ...currentState,
        stack: [next],
        queue: remainingQueue,
      }
    }
    
    // If there's a critical overlay in queue and current is not critical, interrupt
    const nextCritical = sortedQueue.find(o => o.priority === 'critical')
    if (nextCritical && currentOverlay.priority !== 'critical') {
      const remainingQueue = sortedQueue.filter(o => o.id !== nextCritical.id)
      return {
        ...currentState,
        stack: [...currentState.stack, nextCritical],
        queue: remainingQueue,
      }
    }
    
    // Otherwise, keep current state (queue waits)
    return currentState
  }, [])
  
  // Show an overlay
  const show = useCallback((config: Omit<OverlayConfig, 'id'> & { id?: string }) => {
    const overlayId = config.id || generateId(config.component.name || 'overlay')
    
    const fullConfig: OverlayConfig = {
      ...config,
      id: overlayId,
      dismissible: config.dismissible ?? true,
    }
    
    setState(prevState => {
      // Check if this overlay is already in stack or queue (dedupe by ID prefix)
      const idPrefix = overlayId.split('-')[0]
      const isDuplicate = 
        prevState.stack.some(o => o.id.startsWith(idPrefix)) ||
        prevState.queue.some(o => o.id.startsWith(idPrefix))
      
      if (isDuplicate) {
        return prevState
      }
      
      // Add to history
      const newHistory = [
        ...prevState.history,
        { id: overlayId, timestamp: new Date() }
      ].slice(-50) // Keep last 50 entries
      
      // Critical overlays interrupt current if current is not critical
      const currentOverlay = prevState.stack[prevState.stack.length - 1]
      if (fullConfig.priority === 'critical' && currentOverlay && currentOverlay.priority !== 'critical') {
        return {
          ...prevState,
          stack: [...prevState.stack, fullConfig],
          history: newHistory,
        }
      }
      
      // If stack is empty, add directly
      if (prevState.stack.length === 0) {
        return {
          ...prevState,
          stack: [fullConfig],
          history: newHistory,
        }
      }
      
      // Otherwise add to queue
      const newState = {
        ...prevState,
        queue: [...prevState.queue, fullConfig],
        history: newHistory,
      }
      
      return processQueue(newState)
    })
    
    // Set up auto-close timer after state update
    if (fullConfig.autoClose) {
      setTimeout(() => setupAutoCloseTimer(fullConfig), 0)
    }
    
    return overlayId
  }, [generateId, processQueue, setupAutoCloseTimer])
  
  // Close specific overlay
  const close = useCallback((id: string) => {
    clearAutoCloseTimer(id)
    
    setState(prevState => {
      // Find and remove from stack
      const overlayInStack = prevState.stack.find(o => o.id === id)
      if (overlayInStack) {
        // Call onClose callback if exists
        overlayInStack.onClose?.()
        
        const newStack = prevState.stack.filter(o => o.id !== id)
        const newState = {
          ...prevState,
          stack: newStack,
        }
        
        // Process queue to show next overlay
        return processQueue(newState)
      }
      
      // Remove from queue if it's there
      const overlayInQueue = prevState.queue.find(o => o.id === id)
      if (overlayInQueue) {
        overlayInQueue.onClose?.()
        return {
          ...prevState,
          queue: prevState.queue.filter(o => o.id !== id),
        }
      }
      
      return prevState
    })
  }, [clearAutoCloseTimer, processQueue])
  
  // Close current (top of stack)
  const closeCurrent = useCallback(() => {
    setState(prevState => {
      const current = prevState.stack[prevState.stack.length - 1]
      if (!current) return prevState
      
      clearAutoCloseTimer(current.id)
      current.onClose?.()
      
      const newStack = prevState.stack.slice(0, -1)
      const newState = {
        ...prevState,
        stack: newStack,
      }
      
      return processQueue(newState)
    })
  }, [clearAutoCloseTimer, processQueue])
  
  // Close all overlays
  const closeAll = useCallback(() => {
    setState(prevState => {
      // Clear all timers
      prevState.stack.forEach(overlay => {
        clearAutoCloseTimer(overlay.id)
        overlay.onClose?.()
      })
      prevState.queue.forEach(overlay => {
        overlay.onClose?.()
      })
      
      return {
        ...prevState,
        stack: [],
        queue: [],
      }
    })
  }, [clearAutoCloseTimer])
  
  // Check if overlay was recently shown
  const wasRecentlyShown = useCallback((overlayType: string, withinMs: number) => {
    const now = new Date().getTime()
    return state.history.some(entry => {
      const isMatch = entry.id.startsWith(overlayType)
      const isRecent = now - entry.timestamp.getTime() < withinMs
      return isMatch && isRecent
    })
  }, [state.history])
  
  // Get current overlay (top of stack)
  const getCurrentOverlay = useCallback(() => {
    return state.stack[state.stack.length - 1] || null
  }, [state.stack])
  
  const getStackSize = useCallback(() => state.stack.length, [state.stack])
  const getQueueSize = useCallback(() => state.queue.length, [state.queue])
  const getStack = useCallback(() => state.stack, [state.stack])
  const getQueue = useCallback(() => state.queue, [state.queue])
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      autoCloseTimersRef.current.forEach(timer => clearTimeout(timer))
      autoCloseTimersRef.current.clear()
    }
  }, [])
  
  const api: OverlayManagerAPI = {
    show,
    close,
    closeCurrent,
    closeAll,
    wasRecentlyShown,
    getCurrentOverlay,
    getStackSize,
    getQueueSize,
    getStack,
    getQueue,
  }
  
  return (
    <OverlayContext.Provider value={api}>
      {children}
    </OverlayContext.Provider>
  )
}

export function useOverlayContext() {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlayContext must be used within OverlayProvider')
  }
  return context
}
