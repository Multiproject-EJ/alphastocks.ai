import { useState, useCallback, useRef, useEffect } from 'react'

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
  const [zoom, setZoom] = useState<BoardZoomState>({
    scale: isMobile ? 1.5 : defaultScale,
    translateX: 0,
    translateY: 0,
  })

  const [isPanning, setIsPanning] = useState(false)
  const [autoFollow, setAutoFollow] = useState(true)
  const lastPanPosition = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)

  // Calculate position of a tile on the board (approximate)
  const getTilePosition = useCallback((position: number) => {
    // Board has 28 tiles arranged in a square
    // Bottom: 0-7, Right: 8-12, Top: 13-21, Left: 22-27
    const tileSize = 140 // Approximate tile size
    const cornerSize = 140
    const edgeCount = 8 // tiles per edge (excluding corners)
    
    let x = 0
    let y = 0

    if (position <= 7) {
      // Bottom edge
      x = position * (boardSize.width / edgeCount)
      y = boardSize.height
    } else if (position <= 12) {
      // Right edge
      x = boardSize.width
      y = boardSize.height - (position - 7) * (boardSize.height / 6)
    } else if (position <= 21) {
      // Top edge
      x = boardSize.width - (position - 13) * (boardSize.width / edgeCount)
      y = 0
    } else {
      // Left edge
      x = 0
      y = (position - 22) * (boardSize.height / 6)
    }

    return { x, y }
  }, [boardSize])

  // Center view on current position
  const centerOnPosition = useCallback((position: number) => {
    if (!isMobile || !autoFollow) return

    const tilePos = getTilePosition(position)
    
    // Calculate translation to center the tile
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight - 160 // Account for bottom nav
    
    const targetX = viewportWidth / 2 - tilePos.x * zoom.scale
    const targetY = viewportHeight / 2 - tilePos.y * zoom.scale

    setZoom(prev => ({
      ...prev,
      translateX: targetX,
      translateY: targetY,
    }))
  }, [isMobile, autoFollow, getTilePosition, zoom.scale])

  // Handle pinch zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
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

  const handleTouchMove = useCallback((e: TouchEvent) => {
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
    setZoom({
      scale: isMobile ? 1.5 : defaultScale,
      translateX: 0,
      translateY: 0,
    })
    setAutoFollow(true)
  }, [isMobile, defaultScale])

  const toggleAutoFollow = useCallback(() => {
    setAutoFollow(prev => !prev)
  }, [])

  // Auto-center when position changes
  useEffect(() => {
    if (autoFollow && isMobile) {
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
