/**
 * UIMode to Overlay Bridge
 * 
 * This component listens to UIMode changes and opens the appropriate overlays.
 * It bridges the UIMode state machine with the overlay manager system.
 */

import { useEffect, useRef } from 'react'
import { useUIMode } from '@/hooks/useUIMode'
import { useOverlayManager } from '@/hooks/useOverlayManager'
import type { UIMode } from '@/lib/uiModeStateMachine'
import { SHOP2_ENABLED } from '@/lib/featureFlags'
import { OVERLAY_REGISTRY, type OverlayType } from '@/lib/overlayRegistry'

// Map UI modes to overlay IDs
const MODE_TO_OVERLAY_MAP: Partial<Record<UIMode, string>> = {
  stockExchangeBuilder: 'stockExchangeBuilder',
  gallery: 'netWorthGallery',
  leaderboard: 'leaderboard',
  challenges: 'challenges',
  settings: 'settings',
  casino: 'casino',
  biasSanctuary: 'biasSanctuary',
  portfolio: 'portfolio',
  hub: 'hub',
  // board mode doesn't have an overlay
}

const getOverlayIdForMode = (mode: UIMode): string | undefined => {
  if (mode === 'shop') {
    return SHOP2_ENABLED ? 'shop2' : 'shop'
  }
  return MODE_TO_OVERLAY_MAP[mode]
}

interface UIModeOverlayBridgeProps {
  // Props for various overlays
  shopProps?: any
  stockExchangeBuilderProps?: any
  galleryProps?: any
  leaderboardProps?: any
  challengesProps?: any
  portfolioProps?: any
}

export function UIModeOverlayBridge({
  shopProps,
  stockExchangeBuilderProps,
  galleryProps,
  leaderboardProps,
  challengesProps,
  portfolioProps,
}: UIModeOverlayBridgeProps) {
  const { mode, transitionTo } = useUIMode()
  const { show: showOverlay, closeCurrent, getCurrentOverlay } = useOverlayManager()
  const previousModeRef = useRef<UIMode>(mode)

  useEffect(() => {
    // Skip if mode hasn't changed
    if (previousModeRef.current === mode) {
      return
    }

    const previousMode = previousModeRef.current
    previousModeRef.current = mode

    console.log('[UIModeOverlayBridge] Mode changed:', previousMode, '→', mode)

    // If transitioning to board mode, close any open overlay
    if (mode === 'board') {
      const current = getCurrentOverlay()
      if (current) {
        console.log('[UIModeOverlayBridge] Closing overlay for board mode')
        closeCurrent()
      }
      return
    }

    // Get overlay ID for this mode
    const overlayId = getOverlayIdForMode(mode)
    if (!overlayId) {
      console.warn('[UIModeOverlayBridge] No overlay mapping for mode:', mode)
      return
    }

    // Check if this overlay is already open
    const current = getCurrentOverlay()
    if (current?.id === overlayId) {
      console.log('[UIModeOverlayBridge] Overlay already open:', overlayId)
      return
    }

    // Open the appropriate overlay
    console.log('[UIModeOverlayBridge] Opening overlay:', overlayId)

    const component = OVERLAY_REGISTRY[overlayId as OverlayType]
    if (!component) {
      console.warn('[UIModeOverlayBridge] Overlay component missing for id:', overlayId)
      return
    }

    // Prepare overlay props based on mode
    let props: any = {}

    switch (mode) {
      case 'shop':
        props = shopProps || {}
        break
      case 'stockExchangeBuilder':
        props = stockExchangeBuilderProps || {}
        break
      case 'gallery':
        props = galleryProps || {}
        break
      case 'leaderboard':
        props = leaderboardProps || {}
        break
      case 'challenges':
        props = challengesProps || {}
        break
      case 'portfolio':
        props = portfolioProps || {}
        break
      default:
        console.warn('[UIModeOverlayBridge] Unhandled mode:', mode)
        return
    }

    // Show the overlay
    showOverlay({
      id: overlayId,
      component,
      props,
      priority: 'normal',
      onClose: () => {
        console.log('[UIModeOverlayBridge] Overlay closed, returning to board')
        // Return to board mode when overlay is closed
        transitionTo('board')
      },
    })
  }, [mode, showOverlay, closeCurrent, getCurrentOverlay, transitionTo, 
      shopProps, stockExchangeBuilderProps, galleryProps, leaderboardProps, challengesProps, portfolioProps])

  // This component doesn't render anything
  return null
}
