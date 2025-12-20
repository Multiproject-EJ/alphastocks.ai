import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { calculateTilePositions, TilePosition } from '@/lib/tilePositions'
import { eventBus } from '@/devtools/eventBus'

export type CameraMode = 'classic' | 'immersive'

export interface CameraState {
  mode: CameraMode
  // 3D perspective settings
  perspective: number      // e.g., 1000px
  rotateX: number          // tilt angle in degrees (0 = flat, 25 = tilted)
  rotateZ: number          // rotation around Z axis (for board orientation)
  // Zoom and position
  scale: number            // zoom level (1 = 100%, 2.5 = 250%)
  translateX: number       // camera X offset
  translateY: number       // camera Y offset
  // Animation state
  isAnimating: boolean
  targetTile: number       // tile we're animating toward
}

export interface UseBoardCameraOptions {
  isMobile: boolean
  currentPosition: number
  boardSize: { width: number; height: number }
  tilePositions?: TilePosition[] // optional pre-calculated positions
}

const STORAGE_KEY = 'alphastocks_camera_mode'

// Default scale values
const MOBILE_DEFAULT_SCALE = 0.4
const DESKTOP_DEFAULT_SCALE = 1.0

// Shared validation function to check if camera state is valid
export const isCameraStateValid = (state: {
  scale: number
  translateX: number
  translateY: number
}): boolean => {
  return (
    !isNaN(state.scale) &&
    state.scale > 0 &&
    state.scale <= 10 &&
    !isNaN(state.translateX) &&
    !isNaN(state.translateY) &&
    Math.abs(state.translateX) <= 2000 &&
    Math.abs(state.translateY) <= 2000
  )
}

// Validation functions to prevent invalid camera states
const validateScale = (s: number, isMobile: boolean): number => {
  if (isNaN(s) || s === 0 || s > 10) {
    console.warn('⚠️ Invalid scale detected, using default:', s)
    return isMobile ? MOBILE_DEFAULT_SCALE : DESKTOP_DEFAULT_SCALE
  }
  return Math.max(0.2, Math.min(3, s))
}

const validateTranslate = (t: number): number => {
  if (isNaN(t)) {
    console.warn('⚠️ Invalid translate detected (NaN), using 0')
    return 0
  }
  // Clamp to safe range
  return Math.max(-2000, Math.min(2000, t))
}

const validateRotate = (r: number): number => {
  if (isNaN(r) || Math.abs(r) > 360) {
    console.warn('⚠️ Invalid rotation detected, using 0:', r)
    return 0
  }
  return r
}

// Default immersive camera settings (updated for better mobile visibility)
const IMMERSIVE_DEFAULTS = {
  perspective: 1000,
  rotateX: 20, // 20 degree tilt for immersive view
  rotateZ: 0,
  scale: MOBILE_DEFAULT_SCALE, // Reasonable zoom for mobile
}

// Classic mode settings (flat bird's-eye view)
const CLASSIC_DEFAULTS = {
  perspective: 1000,
  rotateX: 0,
  rotateZ: 0,
  scale: DESKTOP_DEFAULT_SCALE,
}

export function useBoardCamera(options: UseBoardCameraOptions) {
  const { isMobile, currentPosition, boardSize } = options
  
  // Calculate tile positions once
  const tilePositions = useMemo(
    () => options.tilePositions || calculateTilePositions(boardSize),
    [boardSize, options.tilePositions]
  )
  
  // Load saved camera mode preference
  const getInitialMode = useCallback((): CameraMode => {
    // Default mode based on screen size
    const defaultMode: CameraMode = isMobile ? 'immersive' : 'classic'
    
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'immersive' || saved === 'classic') {
        return saved
      }
    }
    
    return defaultMode
  }, [isMobile])
  
  const [mode, setModeState] = useState<CameraMode>(getInitialMode)
  const [camera, setCamera] = useState<CameraState>(() => {
    const initialMode = getInitialMode()
    const defaults = initialMode === 'immersive' ? IMMERSIVE_DEFAULTS : CLASSIC_DEFAULTS
    
    return {
      mode: initialMode,
      ...defaults,
      translateX: 0,
      translateY: 0,
      isAnimating: false,
      targetTile: currentPosition,
    }
  })
  
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const zoomOutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Save mode preference to localStorage
  const setMode = useCallback((newMode: CameraMode) => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode)
    }
    
    // Apply mode settings immediately
    const defaults = newMode === 'immersive' ? IMMERSIVE_DEFAULTS : CLASSIC_DEFAULTS
    setCamera(prev => ({
      ...prev,
      mode: newMode,
      ...defaults,
    }))
  }, [])
  
  // Get center position of a tile
  const getTileCenterPosition = useCallback((tileId: number): { x: number; y: number } => {
    const tile = tilePositions.find(t => t.id === tileId)
    if (!tile) {
      // Fallback to board center if tile not found
      return { x: boardSize.width / 2, y: boardSize.height / 2 }
    }
    return { x: tile.x, y: tile.y }
  }, [tilePositions, boardSize])
  
  // Calculate translation needed to center a tile in viewport
  const calculateTranslation = useCallback((tileId: number, scale: number = camera.scale): { x: number; y: number } => {
    const tilePos = getTileCenterPosition(tileId)
    
    // For classic mode or desktop, keep centered
    if (!isMobile || camera.mode === 'classic') {
      return { x: 0, y: 0 }
    }
    
    // For immersive mode, calculate offset to center tile
    // The tile should appear in the center of the viewport
    const boardCenterX = boardSize.width / 2
    const boardCenterY = boardSize.height / 2
    
    // Calculate how much to offset the board so tile appears centered
    const offsetX = (boardCenterX - tilePos.x) * scale
    const offsetY = (boardCenterY - tilePos.y) * scale
    
    return { x: offsetX, y: offsetY }
  }, [getTileCenterPosition, isMobile, camera.mode, camera.scale, boardSize])
  
  // Center camera on a specific tile
  const centerOnTile = useCallback((tileId: number, animate: boolean = true) => {
    if (!isMobile || camera.mode === 'classic') {
      return
    }
    
    const translation = calculateTranslation(tileId)
    
    setCamera(prev => ({
      ...prev,
      translateX: validateTranslate(translation.x),
      translateY: validateTranslate(translation.y),
      targetTile: tileId,
      isAnimating: animate,
    }))
    
    if (animate && animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    if (animate) {
      animationTimeoutRef.current = setTimeout(() => {
        setCamera(prev => ({ ...prev, isAnimating: false }))
      }, 600) // Animation duration
    }
  }, [isMobile, camera.mode, calculateTranslation])
  
  // Animate along a path of tiles
  const animateAlongPath = useCallback(async (tileIds: number[], onComplete?: () => void): Promise<void> => {
    if (!isMobile || camera.mode === 'classic' || tileIds.length === 0) {
      onComplete?.()
      return
    }
    
    // Animate to each tile in sequence
    for (let i = 0; i < tileIds.length; i++) {
      const tileId = tileIds[i]
      centerOnTile(tileId, true)
      
      // Wait for animation to complete before moving to next tile
      await new Promise(resolve => setTimeout(resolve, 400)) // Slightly faster than full animation
    }
    
    onComplete?.()
  }, [isMobile, camera.mode, centerOnTile])
  
  // Temporarily zoom out to show full board
  const zoomOutTemporarily = useCallback(() => {
    if (!isMobile || camera.mode === 'classic') {
      return
    }
    
    // Save current state
    const previousState = { ...camera }
    
    // Zoom out and flatten
    setCamera(prev => ({
      ...prev,
      rotateX: 0,
      scale: 0.6, // Zoom out to show full board
      translateX: 0,
      translateY: 0,
      isAnimating: true,
    }))
    
    // Clear any existing timeout
    if (zoomOutTimeoutRef.current) {
      clearTimeout(zoomOutTimeoutRef.current)
    }
    
    // Return to immersive view after 3 seconds
    zoomOutTimeoutRef.current = setTimeout(() => {
      setCamera(previousState)
      centerOnTile(currentPosition, true)
    }, 3000)
  }, [isMobile, camera, centerOnTile, currentPosition])
  
  // Reset camera to default for current mode
  const resetCamera = useCallback(() => {
    const defaults = camera.mode === 'immersive' ? IMMERSIVE_DEFAULTS : CLASSIC_DEFAULTS
    setCamera(prev => ({
      ...prev,
      ...defaults,
      translateX: 0,
      translateY: 0,
      isAnimating: true,
    }))
    
    if (camera.mode === 'immersive') {
      setTimeout(() => {
        centerOnTile(currentPosition, false)
      }, 100)
    }
  }, [camera.mode, currentPosition, centerOnTile])
  
  // Auto-center on position changes in immersive mode
  const previousPosition = useRef(currentPosition)
  useEffect(() => {
    if (isMobile && camera.mode === 'immersive' && currentPosition !== previousPosition.current) {
      previousPosition.current = currentPosition
      // Don't auto-center if user is in zoom-out temporary view
      if (!zoomOutTimeoutRef.current) {
        centerOnTile(currentPosition, false) // No animation for auto-follow
      }
    }
  }, [currentPosition, isMobile, camera.mode, centerOnTile])
  
  // Update mode when screen size changes
  useEffect(() => {
    // Only auto-switch if user hasn't set a preference
    const savedMode = localStorage.getItem(STORAGE_KEY)
    if (!savedMode) {
      const newMode: CameraMode = isMobile ? 'immersive' : 'classic'
      if (newMode !== mode) {
        setMode(newMode)
      }
    }
  }, [isMobile, mode, setMode])
  
  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (zoomOutTimeoutRef.current) {
        clearTimeout(zoomOutTimeoutRef.current)
      }
    }
  }, [])
  
  // Emergency fallback: detect invalid camera state and reset
  useEffect(() => {
    if (
      isNaN(camera.scale) ||
      camera.scale === 0 ||
      camera.scale > 10 ||
      Math.abs(camera.translateX) > 5000 ||
      Math.abs(camera.translateY) > 5000
    ) {
      console.error('❌ Camera state invalid, resetting to classic mode:', {
        scale: camera.scale,
        translateX: camera.translateX,
        translateY: camera.translateY,
      })
      setMode('classic')
      resetCamera()
    }
  }, [camera.scale, camera.translateX, camera.translateY, setMode, resetCamera])
  
  // Debug logging for camera state changes
  useEffect(() => {
    console.log('🎥 Camera state:', {
      mode: camera.mode,
      scale: camera.scale,
      translateX: camera.translateX,
      translateY: camera.translateY,
      rotateX: camera.rotateX,
      isMobile,
      currentPosition,
      isValid: (
        !isNaN(camera.scale) &&
        camera.scale > 0 &&
        camera.scale < 10 &&
        Math.abs(camera.translateX) < 5000 &&
        Math.abs(camera.translateY) < 5000
      ),
    })
    
    // Publish camera state to DevTools
    eventBus.setCameraState(camera)
  }, [camera, isMobile, currentPosition])
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
           localStorage.getItem('reducedMotion') === 'true'
  }, [])
  
  // Generate CSS styles for board container
  // Note: Transform is applied by Board3DViewport, this just provides transition/animation
  const boardStyle = useMemo((): React.CSSProperties => {
    if (!isMobile || camera.mode === 'classic') {
      return {}
    }
    
    const duration = prefersReducedMotion || !camera.isAnimating ? '0s' : '0.5s'
    const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring-like easing
    
    return {
      transform: `
        rotateX(${camera.rotateX}deg)
        rotateZ(${camera.rotateZ}deg)
        scale(${camera.scale})
        translate(${camera.translateX}px, ${camera.translateY}px)
      `.replace(/\s+/g, ' ').trim(),
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center',
      transition: `transform ${duration} ${easing}`,
      willChange: camera.isAnimating ? 'transform' : 'auto',
    }
  }, [camera.isAnimating, isMobile, camera.mode, prefersReducedMotion])
  
  // Generate CSS styles for viewport container
  // Note: Perspective is applied by Board3DViewport, this is for any additional container styles
  const containerStyle = useMemo((): React.CSSProperties => {
    if (!isMobile || camera.mode === 'classic') {
      return {}
    }
    
    // Board3DViewport handles perspective, overflow, etc. Return empty for now
    return {}
  }, [camera.mode, isMobile])
  
  return {
    camera,
    setMode,
    centerOnTile,
    animateAlongPath,
    zoomOutTemporarily,
    resetCamera,
    boardStyle,
    containerStyle,
    tilePositions,
  }
}
