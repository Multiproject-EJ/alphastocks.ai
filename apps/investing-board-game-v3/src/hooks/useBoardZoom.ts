import { useState, useCallback, useRef, useEffect } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'

interface BoardZoomState {
  scale: number
  translateX: number
  translateY: number
}

interface UseBoardZoomOptions {
  minScale?: number
  maxScale?: number
  defaultScale?: number
  isMobile?: boolean
  currentPosition?: number
  boardSize?: { width: number; height: number }
}

export function useBoardZoom({
  minScale = 0.5,
  maxScale = 2.0,
  defaultScale = 1.0,
  isMobile = false,
  currentPosition = 0,
  boardSize = { width: 1000, height: 1000 },
}: UseBoardZoomOptions = {}) {
  // Determine initial scale based on actual window size
  const getInitialScale = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 2.0
    }
    return defaultScale
  }

  const [zoom, setZoom] = useState<BoardZoomState>({
    scale: getInitialScale(),
    translateX: 0,
    translateY: 0,
  })

  const [isPanning, setIsPanning] = useState(false)
  const [autoFollow, setAutoFollow] = useState(typeof window !== 'undefined' && window.innerWidth < 1024) // Enable by default on mobile
  const lastPanPosition = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)

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

  // Center view on current position
  const centerOnPosition = useCallback((position: number, currentScale?: number) => {
    if (!isMobile) return

    const tilePos = getTilePosition(position)
    
    // Use currentScale parameter or default to 2.0 for mobile
    const scale = currentScale ?? (typeof window !== 'undefined' && window.innerWidth < 1024 ? 2.0 : 1.0)
    
    // Calculate translation to center the tile
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - 180 // Account for bottom nav + padding
    
    const targetX = viewportWidth / 2 - tilePos.x * scale
    const targetY = viewportHeight / 2 - tilePos.y * scale

    setZoom(prev => ({
      ...prev,
      scale,
      translateX: targetX,
      translateY: targetY,
    }))
  }, [isMobile, getTilePosition])

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

      setZoom(prev => ({
        ...prev,
        scale: Math.max(minScale, Math.min(maxScale, prev.scale * scaleDelta)),
      }))
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      const deltaX = e.touches[0].clientX - lastPanPosition.current.x
      const deltaY = e.touches[0].clientY - lastPanPosition.current.y

      lastPanPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }

      setZoom(prev => ({
        ...prev,
        translateX: prev.translateX + deltaX,
        translateY: prev.translateY + deltaY,
      }))
    }
  }, [isPanning, minScale, maxScale])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null
    setIsPanning(false)
  }, [])

  // Manual zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.min(maxScale, prev.scale + 0.2),
    }))
    setAutoFollow(false)
  }, [maxScale])

  const zoomOut = useCallback(() => {
    setZoom(prev => ({
      ...prev,
      scale: Math.max(minScale, prev.scale - 0.2),
    }))
    setAutoFollow(false)
  }, [minScale])

  const resetZoom = useCallback(() => {
    const initialScale = typeof window !== 'undefined' && window.innerWidth < 1024 ? 2.0 : defaultScale
    setZoom({
      scale: initialScale,
      translateX: 0,
      translateY: 0,
    })
    setAutoFollow(true)
  }, [defaultScale])

  const toggleAutoFollow = useCallback(() => {
    setAutoFollow(prev => !prev)
  }, [])

  // Auto-center when position changes (only when autoFollow is enabled)
  const previousPosition = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (autoFollow && isMobile && currentPosition !== undefined && currentPosition !== previousPosition.current) {
      previousPosition.current = currentPosition
      centerOnPosition(currentPosition)
    }
  }, [currentPosition, autoFollow, isMobile, centerOnPosition])

  return {
    zoom,
    isPanning,
    autoFollow,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleAutoFollow,
    centerOnPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
