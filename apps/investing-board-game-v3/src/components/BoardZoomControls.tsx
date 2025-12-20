import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ArrowsOut, NavigationArrow, FrameCorners, MapTrifold } from '@phosphor-icons/react'

interface BoardZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFitToScreen?: () => void
  onViewFullBoard?: () => void
  autoFollow: boolean
  onToggleAutoFollow: () => void
  isMobile: boolean
  cameraMode?: 'classic' | 'immersive'
}

export function BoardZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  onViewFullBoard,
  autoFollow,
  onToggleAutoFollow,
  isMobile,
  cameraMode = 'classic',
}: BoardZoomControlsProps) {
  if (!isMobile) return null
  
  // Show different controls based on camera mode
  const isImmersiveMode = cameraMode === 'immersive'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
      style={{
        right: 'calc(1rem + var(--safe-area-right))',
      }}
    >
      {/* View Full Board - Only in immersive mode */}
      {isImmersiveMode && onViewFullBoard && (
        <Button
          size="icon"
          variant="default"
          onClick={onViewFullBoard}
          className="rounded-full w-11 h-11 min-touch bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90 active:scale-95 transition-transform touch-feedback"
          aria-label="View full board"
          title="View full board (3 seconds)"
        >
          <MapTrifold size={20} weight="bold" />
        </Button>
      )}
      
      {/* Classic mode controls */}
      {!isImmersiveMode && (
        <>
          {/* Zoom In */}
          <Button
            size="icon"
            variant="default"
            onClick={onZoomIn}
            className="rounded-full w-11 h-11 min-touch bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90 active:scale-95 transition-transform touch-feedback"
            aria-label="Zoom in"
          >
            <Plus size={20} weight="bold" />
          </Button>

          {/* Zoom Out */}
          <Button
            size="icon"
            variant="default"
            onClick={onZoomOut}
            className="rounded-full w-11 h-11 min-touch bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90 active:scale-95 transition-transform touch-feedback"
            aria-label="Zoom out"
          >
            <Minus size={20} weight="bold" />
          </Button>

          {/* Fit to Screen */}
          {onFitToScreen && (
            <Button
              size="icon"
              variant="default"
              onClick={onFitToScreen}
              className="rounded-full w-11 h-11 min-touch bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90 active:scale-95 transition-transform touch-feedback"
              aria-label="Fit to screen"
            >
              <FrameCorners size={20} weight="bold" />
            </Button>
          )}
        </>
      )}

      {/* Reset Zoom - Classic mode only */}
      {!isImmersiveMode && (
        <>
          <Button
            size="icon"
            variant="default"
            onClick={onReset}
            className="rounded-full w-11 h-11 min-touch bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90 active:scale-95 transition-transform touch-feedback"
            aria-label="Reset zoom"
          >
            <ArrowsOut size={20} weight="bold" />
          </Button>

          {/* Toggle Auto-Follow */}
          <Button
            size="icon"
            variant={autoFollow ? 'default' : 'outline'}
            onClick={onToggleAutoFollow}
            className={`rounded-full w-11 h-11 min-touch backdrop-blur-md border-2 shadow-lg active:scale-95 transition-transform touch-feedback ${
              autoFollow
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-card/90 border-accent/30 hover:bg-accent/90'
            }`}
            aria-label={autoFollow ? 'Disable auto-follow' : 'Enable auto-follow'}
          >
            <NavigationArrow size={20} weight="bold" />
          </Button>
        </>
      )}
    </motion.div>
  )
}
