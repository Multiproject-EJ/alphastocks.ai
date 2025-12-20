import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ArrowsOut, NavigationArrow } from '@phosphor-icons/react'

interface BoardZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  autoFollow: boolean
  onToggleAutoFollow: () => void
  isMobile: boolean
}

export function BoardZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  autoFollow,
  onToggleAutoFollow,
  isMobile,
}: BoardZoomControlsProps) {
  if (!isMobile) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
      style={{
        right: 'calc(1rem + var(--safe-area-right))',
      }}
    >
      {/* Zoom In */}
      <Button
        size="icon"
        variant="default"
        onClick={onZoomIn}
        className="rounded-full w-12 h-12 bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90"
        aria-label="Zoom in"
      >
        <Plus size={20} weight="bold" />
      </Button>

      {/* Zoom Out */}
      <Button
        size="icon"
        variant="default"
        onClick={onZoomOut}
        className="rounded-full w-12 h-12 bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90"
        aria-label="Zoom out"
      >
        <Minus size={20} weight="bold" />
      </Button>

      {/* Reset Zoom */}
      <Button
        size="icon"
        variant="default"
        onClick={onReset}
        className="rounded-full w-12 h-12 bg-card/90 backdrop-blur-md border-2 border-accent/30 shadow-lg hover:bg-accent/90"
        aria-label="Reset zoom"
      >
        <ArrowsOut size={20} weight="bold" />
      </Button>

      {/* Toggle Auto-Follow */}
      <Button
        size="icon"
        variant={autoFollow ? 'default' : 'outline'}
        onClick={onToggleAutoFollow}
        className={`rounded-full w-12 h-12 backdrop-blur-md border-2 shadow-lg ${
          autoFollow
            ? 'bg-accent border-accent text-accent-foreground'
            : 'bg-card/90 border-accent/30 hover:bg-accent/90'
        }`}
        aria-label={autoFollow ? 'Disable auto-follow' : 'Enable auto-follow'}
      >
        <NavigationArrow size={20} weight="bold" />
      </Button>
    </motion.div>
  )
}
