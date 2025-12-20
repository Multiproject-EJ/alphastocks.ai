import { useState, useCallback, useRef, useEffect } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'

// DevTools support - conditionally import
let eventBus: any = null
if (import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1') {
  import('@/devtools/eventBus').then(module => {
    eventBus = module.eventBus
  })
}

interface BoardZoomState {
  scale: number
  translateX: number
  translateY: number
}

interface ZoomLimits {
  minScale: number
  maxScale: number
  initialScale: number
}

interface UseBoardZoomOptions {
  minScale?: number
  maxScale?: number
  defaultScale?: number
  isMobile?: boolean
  currentPosition?: number
  boardSize?: { width: number; height: number }
  safeArea?: { top: number; right: number; bottom: number; left: number }
}

/**
 * Calculate optimal zoom limits based on viewport and board size
 * 
 * Strategy:
 * - initialScale: Fit board to viewport with 10% margin
 * - minScale: Allow zooming out to see more (at least 50% of initial)
 * - maxScale: Allow zooming in for detail (device-dependent)
 */
function getZoomLimitsForViewport(
  viewportWidth: number,
  viewportHeight: number,
  boardSize: { width: number; height: number },
  safeArea: { top: number; right: number; bottom: number; left: number } = { top: 0, right: 0, bottom: 0, left: 0 }
): ZoomLimits {
  // Calculate available space after safe-areas and bottom nav
  const bottomNavHeight = 180
  const availableWidth = viewportWidth - safeArea.left - safeArea.right - 32 // 16px padding each side
  const availableHeight = viewportHeight - safeArea.top - safeArea.bottom - bottomNavHeight - 32
  
  // Calculate scale needed to fit board in viewport
  const scaleToFitWidth = availableWidth / boardSize.width
  const scaleToFitHeight = availableHeight / boardSize.height
  const fitScale = Math.min(scaleToFitWidth, scaleToFitHeight) * 0.9 // 90% to leave margin
  
  // Device-specific max scale based on viewport width
  let maxScale = 2.0
  if (viewportWidth <= 320) {
    // iPhone SE - allow more zoom
    maxScale = 1.5
  } else if (viewportWidth <= 375) {
    // iPhone 12 mini, small Android
    maxScale = 1.8
  } else if (viewportWidth <= 430) {
    // iPhone 14 Pro, standard phones
    maxScale = 2.0
  } else if (viewportWidth >= 768) {
    // Tablets and larger
    maxScale = 2.5
  }
  
  return {
    minScale: Math.max(0.2, fitScale * 0.5),
    maxScale: Math.min(2.5, maxScale),
    initialScale: Math.max(0.2, Math.min(2.5, fitScale)),
  }
}

export function useBoardZoom({
  minScale: overrideMinScale,
  maxScale: overrideMaxScale,
  defaultScale = 1.0,
  isMobile = false,
  currentPosition = 0,
  boardSize = { width: 1000, height: 1000 },
  safeArea = { top: 0, right: 0, bottom: 0, left: 0 },
}: UseBoardZoomOptions = {}) {
  // Determine initial scale based on actual window size
  const getInitialScale = () => {
    if (typeof window === 'undefined') return defaultScale
    
    if (isMobile) {
      const limits = getZoomLimitsForViewport(
        window.innerWidth,
        window.innerHeight,
        boardSize,
        safeArea
      )
      return limits.initialScale
    }
    return defaultScale
  }
  
  // Get zoom limits (can be overridden or calculated)
  const getZoomLimits = (): ZoomLimits => {
    if (typeof window === 'undefined') {
      return {
        minScale: overrideMinScale ?? 0.5,
        maxScale: overrideMaxScale ?? 2.0,
        initialScale: defaultScale,
      }
    }
    
    if (isMobile) {
      const calculated = getZoomLimitsForViewport(
        window.innerWidth,
        window.innerHeight,
        boardSize,
        safeArea
      )
      return {
        minScale: overrideMinScale ?? calculated.minScale,
        maxScale: overrideMaxScale ?? calculated.maxScale,
        initialScale: calculated.initialScale,
      }
    }
    
    return {
      minScale: overrideMinScale ?? 0.5,
      maxScale: overrideMaxScale ?? 2.0,
      initialScale: defaultScale,
    }
  }
  
  const zoomLimits = getZoomLimits()

  const [zoom, setZoom] = useState<BoardZoomState>({
    scale: getInitialScale(),
    translateX: 0,
    translateY: 0,
  })

  const [isPanning, setIsPanning] = useState(false)
  const [autoFollow, setAutoFollow] = useState(isMobile) // Enable by default on mobile
  const lastPanPosition = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)
  const userInteractionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Calculate position of a tile on the board (approximate)
  const getTilePosition = useCallback((position: number) => {
    // Board has 28 tiles arranged in a square (1200x1200)
    // Bottom: 0-7 (8 tiles), Right: 8-12 (5 tiles), Top: 13-21 (9 tiles), Left: 22-27 (6 tiles)
    const tileSize = 140 // Approximate tile size
    const padding = 32 // Board padding (p-8 = 2rem = 32px)
    
    let x = 0
    let y = 0

    if (position >= 0 && position <= 7) {
      // Bottom edge (0-7): left to right
      x = padding + position * tileSize
      y = boardSize.height - padding - tileSize
    } else if (position >= 8 && position <= 12) {
      // Right edge (8-12): bottom to top
      x = boardSize.width - padding - tileSize
      y = boardSize.height - padding - tileSize - (position - 7) * tileSize
    } else if (position >= 13 && position <= 21) {
      // Top edge (13-21): right to left
      x = boardSize.width - padding - tileSize - (position - 13) * tileSize
      y = padding
    } else if (position >= 22 && position <= 27) {
      // Left edge (22-27): top to bottom
      x = padding
      y = padding + (position - 22) * tileSize
    }

    return { x, y }
  }, [boardSize])

  // Center view on current position (improved with safe-area support)
  const centerOnPosition = useCallback((position: number, animate: boolean = true) => {
    if (!isMobile) return

    const tilePos = getTilePosition(position)
    
    // Use current scale if zoomed, otherwise use limits
    const currentScale = zoom.scale || zoomLimits.initialScale
    
    // Calculate translation to center the tile
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Account for safe areas and bottom nav
    const bottomNavHeight = 180
    const availableHeight = viewportHeight - safeArea.top - safeArea.bottom - bottomNavHeight
    const availableWidth = viewportWidth - safeArea.left - safeArea.right
    
    const targetX = availableWidth / 2 - tilePos.x * currentScale
    const targetY = availableHeight / 2 - tilePos.y * currentScale

    setZoom(prev => ({
      ...prev,
      scale: currentScale,
      translateX: targetX,
      translateY: targetY,
    }))
  }, [isMobile, getTilePosition, zoomLimits, safeArea, zoom.scale])

  // Constrain translation to prevent board from going completely off-screen
  const constrainTranslation = useCallback((translateX: number, translateY: number, scale: number) => {
    if (!isMobile || typeof window === 'undefined') {
      return { translateX, translateY }
    }
    
    const viewportWidth = window.innerWidth - safeArea.left - safeArea.right
    const viewportHeight = window.innerHeight - safeArea.top - safeArea.bottom - 180 // bottom nav
    
    const scaledBoardWidth = boardSize.width * scale
    const scaledBoardHeight = boardSize.height * scale
    
    // Allow board to be panned, but keep at least 20% visible
    const minVisiblePercentage = 0.2
    const maxOffsetX = (scaledBoardWidth * (1 - minVisiblePercentage)) / 2
    const maxOffsetY = (scaledBoardHeight * (1 - minVisiblePercentage)) / 2
    
    // Center position in viewport
    const centerX = viewportWidth / 2
    const centerY = viewportHeight / 2
    
    // Calculate bounds
    const minTranslateX = centerX - scaledBoardWidth / 2 - maxOffsetX
    const maxTranslateX = centerX + scaledBoardWidth / 2 + maxOffsetX - viewportWidth
    const minTranslateY = centerY - scaledBoardHeight / 2 - maxOffsetY
    const maxTranslateY = centerY + scaledBoardHeight / 2 + maxOffsetY - viewportHeight
    
    return {
      translateX: Math.max(minTranslateX, Math.min(maxTranslateX, translateX)),
      translateY: Math.max(minTranslateY, Math.min(maxTranslateY, translateY)),
    }
  }, [isMobile, boardSize, safeArea])

  // Handle pinch zoom - works with React SyntheticEvent
  const handleTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      lastTouchDistance.current = distance
      setAutoFollow(false)
    } else if (e.touches.length === 1) {
      lastPanPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      setIsPanning(true)
      setAutoFollow(false)
    }
  }, [])

  const handleTouchMove = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      
      const scaleDelta = distance / lastTouchDistance.current
      lastTouchDistance.current = distance

      setZoom(prev => {
        const newScale = Math.max(zoomLimits.minScale, Math.min(zoomLimits.maxScale, prev.scale * scaleDelta))
        return {
          ...prev,
          scale: newScale,
        }
      })
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      const deltaX = e.touches[0].clientX - lastPanPosition.current.x
      const deltaY = e.touches[0].clientY - lastPanPosition.current.y

      lastPanPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }

      setZoom(prev => {
        const constrained = constrainTranslation(
          prev.translateX + deltaX,
          prev.translateY + deltaY,
          prev.scale
        )
        return {
          ...prev,
          ...constrained,
        }
      })
    }
  }, [isPanning, zoomLimits, constrainTranslation])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null
    setIsPanning(false)
  }, [])

  // Manual zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.min(zoomLimits.maxScale, prev.scale + 0.2),
    }))
    setAutoFollow(false)
  }, [zoomLimits])

  const zoomOut = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.max(zoomLimits.minScale, prev.scale - 0.2),
    }))
    setAutoFollow(false)
  }, [zoomLimits])

  const resetZoom = useCallback(() => {
    const initialScale = zoomLimits.initialScale
    setZoom({
      scale: initialScale,
      translateX: 0,
      translateY: 0,
    })
    setAutoFollow(true)
  }, [zoomLimits])
  
  const fitToScreen = useCallback(() => {
    const initialScale = zoomLimits.initialScale
    setZoom({
      scale: initialScale,
      translateX: 0,
      translateY: 0,
    })
    setAutoFollow(false)
  }, [zoomLimits])

  const toggleAutoFollow = useCallback(() => {
    setAutoFollow(prev => !prev)
  }, [])

  // Auto-center when position changes (only when autoFollow is enabled and user isn't interacting)
  const previousPosition = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (autoFollow && isMobile && currentPosition !== undefined && currentPosition !== previousPosition.current) {
      previousPosition.current = currentPosition
      centerOnPosition(currentPosition, true)
    }
  }, [currentPosition, autoFollow, isMobile, centerOnPosition])

  // Update DevTools with zoom state
  useEffect(() => {
    if (eventBus && isMobile) {
      eventBus.setZoomState({
        scale: zoom.scale,
        limits: zoomLimits,
      })
    }
  }, [zoom.scale, zoomLimits, isMobile])

  return {
    zoom,
    zoomLimits,
    isPanning,
    autoFollow,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    toggleAutoFollow,
    centerOnPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
