/**
 * OverlayRenderer Component
 * 
 * Renders the current overlay from the overlay manager stack.
 * Only renders the topmost overlay at any given time.
 */

import { Suspense } from 'react'
import { useOverlayManager } from '@/hooks/useOverlayManager'
import { OVERLAY_REGISTRY, OverlayType } from '@/lib/overlayRegistry'

export function OverlayRenderer() {
  const { getCurrentOverlay, closeCurrent } = useOverlayManager()
  const current = getCurrentOverlay()
  
  if (!current) return null
  
  // Get the component from the registry
  const Component = OVERLAY_REGISTRY[current.id as OverlayType]
  
  // If component not found in registry, try to use the component from config
  const ComponentToRender = Component || current.component
  
  if (!ComponentToRender) {
    console.warn(`Overlay component not found for id: ${current.id}`)
    return null
  }
  
  // Handle modal close
  const handleOpenChange = (open: boolean) => {
    if (!open && current.dismissible !== false) {
      closeCurrent()
    }
  }
  
  return (
    <Suspense fallback={null}>
      <ComponentToRender
        open={true}
        onOpenChange={handleOpenChange}
        {...current.props}
      />
    </Suspense>
  )
}
