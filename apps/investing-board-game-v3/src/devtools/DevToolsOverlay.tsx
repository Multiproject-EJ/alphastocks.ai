import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { eventBus, GameEvent, ZoomState, CameraState } from './eventBus'
import { useOverlayManager } from '@/hooks/useOverlayManager'
import { useUIMode } from '@/hooks/useUIMode'
import { isCameraStateValid } from '@/hooks/useBoardCamera'

// Board configuration constant - should match the board size used in App.tsx
const BOARD_SIZE = 1200

interface DevToolsOverlayProps {
  phase?: string
}

export function DevToolsOverlay({ phase = 'unknown' }: DevToolsOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [dpr, setDpr] = useState(1)
  const [safeArea, setSafeArea] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
  const [zoomState, setZoomState] = useState<ZoomState | null>(null)
  const [cameraState, setCameraState] = useState<CameraState | null>(null)
  
  // Get overlay manager state
  const { getCurrentOverlay, getStackSize, getQueueSize, getStack, getQueue } = useOverlayManager()
  
  // Get UI mode state
  const { mode: uiMode, phase: uiPhase, previousMode, modeData } = useUIMode()

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(() => {
      setEvents(eventBus.getEvents())
    })
    setEvents(eventBus.getEvents())
    return unsubscribe
  }, [])

  // Subscribe to zoom state updates
  useEffect(() => {
    const unsubscribe = eventBus.subscribeToZoom(() => {
      setZoomState(eventBus.getZoomState())
    })
    setZoomState(eventBus.getZoomState())
    return unsubscribe
  }, [])
  
  // Subscribe to camera state updates
  useEffect(() => {
    const unsubscribe = eventBus.subscribeToCamera(() => {
      setCameraState(eventBus.getCameraState())
    })
    setCameraState(eventBus.getCameraState())
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
      const parsePx = (value: string): number => {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0 : parsed
      }
      
      const top = parsePx(computedStyle.getPropertyValue('--safe-area-top'))
      const right = parsePx(computedStyle.getPropertyValue('--safe-area-right'))
      const bottom = parsePx(computedStyle.getPropertyValue('--safe-area-bottom'))
      const left = parsePx(computedStyle.getPropertyValue('--safe-area-left'))
      
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

  // Calculate board visible area percentage
  const calculateVisibleArea = () => {
    if (!zoomState) return 100
    
    const scaledSize = BOARD_SIZE * zoomState.scale
    const availableWidth = viewport.width - safeArea.left - safeArea.right
    const availableHeight = viewport.height - safeArea.top - safeArea.bottom - 180
    
    const visibleWidth = Math.min(scaledSize, availableWidth)
    const visibleHeight = Math.min(scaledSize, availableHeight)
    const visibleArea = (visibleWidth * visibleHeight) / (BOARD_SIZE * BOARD_SIZE) * 100
    
    return Math.round(visibleArea)
  }

  const currentOverlay = getCurrentOverlay()
  const overlayStack = getStack()
  const overlayQueue = getQueue()

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
                  <span className="text-purple-300">DPR:</span> {(dpr || 1).toFixed(2)}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Safe Area:</span> T:{safeArea.top} R:{safeArea.right} B:{safeArea.bottom} L:{safeArea.left}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Available:</span> {viewport.width - safeArea.left - safeArea.right}×{viewport.height - safeArea.top - safeArea.bottom - 180}
                </div>
                <div className="font-mono mt-2 pt-2 border-t border-purple-500/30">
                  <span className="text-purple-300 font-bold">📐 Layout:</span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Mode:</span>{' '}
                  <span className="text-green-400 font-bold">
                    {viewport.width < 768 ? 'phone' : viewport.width < 1024 ? 'tablet' : 'desktop'}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Size:</span> {viewport.width}×{viewport.height}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Orientation:</span>{' '}
                  {viewport.width > viewport.height ? 'Landscape' : 'Portrait'}
                </div>
                {zoomState && (
                  <>
                    <div className="font-mono">
                      <span className="text-purple-300">Zoom Scale:</span>{' '}
                      <span className="text-green-400 font-bold">{zoomState.scale.toFixed(2)}x</span>
                    </div>
                    <div className="font-mono">
                      <span className="text-purple-300">Zoom Limits:</span> {zoomState.limits.minScale.toFixed(2)} - {zoomState.limits.maxScale.toFixed(2)}
                    </div>
                    <div className="font-mono">
                      <span className="text-purple-300">Initial Scale:</span> {zoomState.limits.initialScale.toFixed(2)}
                    </div>
                    <div className="font-mono">
                      <span className="text-purple-300">Visible Area:</span>{' '}
                      <span className={`font-bold ${
                        calculateVisibleArea() > 80 ? 'text-green-400' :
                        calculateVisibleArea() > 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {calculateVisibleArea()}%
                      </span>
                    </div>
                  </>
                )}
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
                <div className="font-mono mt-2 pt-2 border-t border-purple-500/30">
                  <span className="text-purple-300 font-bold">🎮 UI Mode:</span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Current:</span>{' '}
                  <span className="text-green-400 font-bold">{uiMode}</span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Phase:</span>{' '}
                  <span className={`font-bold ${
                    uiPhase === 'rolling' ? 'text-yellow-400' :
                    uiPhase === 'moving' ? 'text-blue-400' :
                    uiPhase === 'landed' ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {uiPhase}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Previous:</span>{' '}
                  <span className="text-gray-400">{previousMode || 'none'}</span>
                </div>
                {Object.keys(modeData || {}).length > 0 && (
                  <div className="font-mono">
                    <span className="text-purple-300">Mode Data:</span>{' '}
                    <span className="text-cyan-400">{JSON.stringify(modeData)}</span>
                  </div>
                )}
                <div className="font-mono mt-2 pt-2 border-t border-purple-500/30">
                  <span className="text-purple-300 font-bold">Overlay Manager:</span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Current:</span>{' '}
                  <span className="text-cyan-400">{currentOverlay?.id || 'none'}</span>
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Stack Size:</span> {getStackSize()}
                </div>
                <div className="font-mono">
                  <span className="text-purple-300">Queue Size:</span> {getQueueSize()}
                </div>
                {overlayStack.length > 0 && (
                  <div className="mt-1 pl-2 border-l-2 border-purple-500/30 space-y-0.5">
                    {overlayStack.map((overlay, idx) => (
                      <div key={overlay.id} className="font-mono text-[9px]">
                        <span className="text-gray-400">#{idx + 1}</span>{' '}
                        <span className="text-cyan-400">{overlay.id}</span>{' '}
                        <span className={`text-xs ${
                          overlay.priority === 'critical' ? 'text-red-400' :
                          overlay.priority === 'high' ? 'text-orange-400' :
                          overlay.priority === 'normal' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          [{overlay.priority}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {overlayQueue.length > 0 && (
                  <>
                    <div className="font-mono mt-1">
                      <span className="text-purple-300">Queued:</span>
                    </div>
                    <div className="mt-1 pl-2 border-l-2 border-yellow-500/30 space-y-0.5">
                      {overlayQueue.map((overlay, idx) => (
                        <div key={overlay.id} className="font-mono text-[9px]">
                          <span className="text-gray-400">Q{idx + 1}</span>{' '}
                          <span className="text-yellow-400">{overlay.id}</span>{' '}
                          <span className={`text-xs ${
                            overlay.priority === 'critical' ? 'text-red-400' :
                            overlay.priority === 'high' ? 'text-orange-400' :
                            overlay.priority === 'normal' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            [{overlay.priority}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Camera State (3D mode) */}
                {cameraState && (
                  <>
                    <div className="font-mono mt-2 pt-2 border-t border-purple-500/30">
                      <span className="text-purple-300 font-bold">Camera Mode:</span>{' '}
                      <span className={`font-bold ${
                        cameraState.mode === 'immersive' ? 'text-cyan-400' : 'text-gray-400'
                      }`}>
                        {cameraState.mode.toUpperCase()}
                      </span>
                    </div>
                    {cameraState.mode === 'immersive' && (
                      <>
                        <div className="font-mono">
                          <span className="text-purple-300">Tilt:</span> {cameraState.rotateX.toFixed(1)}°
                        </div>
                        <div className="font-mono">
                          <span className="text-purple-300">Scale:</span>{' '}
                          <span className="text-cyan-400 font-bold">{cameraState.scale.toFixed(2)}x</span>
                        </div>
                        <div className="font-mono">
                          <span className="text-purple-300">Position:</span> X:{cameraState.translateX.toFixed(0)} Y:{cameraState.translateY.toFixed(0)}
                        </div>
                        <div className="font-mono">
                          <span className="text-purple-300">Target Tile:</span> {cameraState.targetTile}
                        </div>
                        <div className="font-mono">
                          <span className="text-purple-300">Animating:</span>{' '}
                          <span className={cameraState.isAnimating ? 'text-yellow-400' : 'text-gray-500'}>
                            {cameraState.isAnimating ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="font-mono">
                          <span className="text-purple-300">Valid:</span>{' '}
                          <span className={`font-bold ${
                            !isNaN(cameraState.scale) &&
                            cameraState.scale > 0 &&
                            cameraState.scale < 10 &&
                            Math.abs(cameraState.translateX) < 5000 &&
                            Math.abs(cameraState.translateY) < 5000
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {!isNaN(cameraState.scale) &&
                            cameraState.scale > 0 &&
                            cameraState.scale < 10 &&
                            Math.abs(cameraState.translateX) < 5000 &&
                            Math.abs(cameraState.translateY) < 5000
                              ? '✓ Valid'
                              : '✗ Invalid!'}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
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
