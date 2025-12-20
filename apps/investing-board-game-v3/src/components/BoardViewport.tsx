import { useEffect, useRef, ReactNode } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'

interface BoardViewportProps {
  children: ReactNode
  boardSize: { width: number; height: number }
  isMobile: boolean
  currentPosition: number
  safeArea: { top: number; right: number; bottom: number; left: number }
  zoom: {
    scale: number
    translateX: number
    translateY: number
  }
  isPanning: boolean
  onTouchStart?: (e: ReactTouchEvent<HTMLDivElement>) => void
  onTouchMove?: (e: ReactTouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (e: ReactTouchEvent<HTMLDivElement>) => void
  boardRef?: React.RefObject<HTMLDivElement>
  boardClassName?: string
}

/**
 * BoardViewport - Responsive wrapper for the game board
 * 
 * Handles:
 * - Viewport constraints based on safe-areas
 * - Touch gesture handling for zoom/pan
 * - Responsive container sizing
 * 
 * The actual zoom/pan logic is handled by useBoardZoom hook
 */
export function BoardViewport({
  children,
  boardSize,
  isMobile,
  safeArea,
  zoom,
  isPanning,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  boardRef,
  boardClassName,
}: BoardViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate available viewport height accounting for safe-areas and bottom nav
  const getViewportHeight = () => {
    if (!isMobile) return 'auto'
    
    // Account for: safe-area-top + safe-area-bottom + bottom nav (estimated ~180px)
    const bottomNavHeight = 180
    const totalVerticalInsets = safeArea.top + safeArea.bottom + bottomNavHeight
    
    return `calc(100vh - ${totalVerticalInsets}px)`
  }

  const viewportHeight = getViewportHeight()

  // Desktop: no special viewport handling
  if (!isMobile) {
    return (
      <div ref={boardRef} className={boardClassName}>
        {children}
      </div>
    )
  }

  // Mobile: controlled viewport with zoom/pan
  return (
    <div
      ref={containerRef}
      className="overflow-hidden touch-none"
      style={{
        height: viewportHeight,
        position: 'relative',
        // Add safe-area padding to prevent content from going under notches
        paddingTop: safeArea.top ? `${safeArea.top}px` : undefined,
        paddingLeft: safeArea.left ? `${safeArea.left}px` : undefined,
        paddingRight: safeArea.right ? `${safeArea.right}px` : undefined,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={boardRef}
        className={boardClassName}
        style={{
          width: `${boardSize.width}px`,
          height: `${boardSize.height}px`,
          transform: `translate(calc(-50% + ${zoom.translateX}px), calc(-50% + ${zoom.translateY}px)) scale(${zoom.scale})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.3s ease-out',
          willChange: 'transform',
          position: 'absolute',
          top: '50%',
          left: '50%',
        }}
      >
        {children}
      </div>
    </div>
  )
}
