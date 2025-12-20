import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { eventBus, GameEvent } from './eventBus'

interface DevToolsOverlayProps {
  phase?: string
  overlayStack?: { name: string }[]
}

export function DevToolsOverlay({ phase = 'unknown', overlayStack = [] }: DevToolsOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [dpr, setDpr] = useState(1)
  const [safeArea, setSafeArea] = useState({ top: 0, right: 0, bottom: 0, left: 0 })

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(() => {
      setEvents(eventBus.getEvents())
    })
    setEvents(eventBus.getEvents())
    return unsubscribe
  }, [])

  // Update viewport and device info
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      setDpr(window.devicePixelRatio || 1)
    }

    const updateSafeArea = () => {
      // Try to get real safe area insets from CSS env variables
      const computedStyle = getComputedStyle(document.documentElement)
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0')
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0')
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
      
      setSafeArea({ top, right, bottom, left })
    }

    updateViewport()
    updateSafeArea()

    window.addEventListener('resize', updateViewport)
    window.addEventListener('resize', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('resize', updateSafeArea)
    }
  }, [])

  const formatTimestamp = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const ms = date.getMilliseconds().toString().padStart(3, '0')
    return `${hours}:${minutes}:${seconds}.${ms}`
  }

  const topOverlay = overlayStack.length > 0 ? overlayStack[overlayStack.length - 1]?.name : 'none'

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 right-4 z-[9999] bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg font-mono text-xs font-bold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle DevTools"
      >
        🔧
      </motion.button>

      {/* Overlay panel */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-16 right-4 z-[9998] bg-black/95 text-white rounded-lg shadow-2xl border border-purple-500/50 w-80 max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-purple-600 px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold">🛠️ DevTools</span>
              <button
                onClick={() => eventBus.clearEvents()}
                className="text-[10px] bg-purple-700 hover:bg-purple-800 px-2 py-0.5 rounded"
                title="Clear events"
              >
                Clear
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 text-[10px] leading-tight">
              {/* Metrics section */}
              <div className="p-3 space-y-1.5 border-b border-purple-500/30">
                <div className="font-mono">
                  <span className="text-purple-300">Viewport:</span> {viewport.width}×{viewport.height}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">DPR:</span> {dpr.toFixed(2)}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Safe Area:</span> T:{safeArea.top} R:{safeArea.right} B:{safeArea.bottom} L:{safeArea.left}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Phase:</span>{' '}
                  <span className={`font-bold ${
                    phase === 'rolling' ? 'text-yellow-400' :
                    phase === 'moving' ? 'text-blue-400' :
                    phase === 'landed' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {phase}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Overlay Stack:</span> {overlayStack.length}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Top Overlay:</span> {topOverlay}
                </div>
              </div>

              {/* Events section */}
              <div className="p-3">
                <div className="font-mono font-bold text-purple-300 mb-2">
                  Last 20 Events:
                </div>
                <div className="space-y-1">
                  {events.length === 0 ? (
                    <div className="text-gray-500 italic">No events yet...</div>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-900/50 rounded px-2 py-1 border border-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-purple-400 font-bold">
                            {event.type}
                          </span>
                          <span className="font-mono text-gray-500 text-[9px]">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        {event.payload && (
                          <div className="font-mono text-gray-400 text-[9px] mt-0.5 truncate">
                            {event.payload}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
