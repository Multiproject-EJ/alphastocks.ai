import { motion } from 'framer-motion'
import { memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tile as TileType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useHaptics } from '@/hooks/useHaptics'

interface TileProps {
  tile: TileType
  isActive: boolean
  isHopping: boolean
  isLanded: boolean
  onClick: () => void
  side?: 'top' | 'bottom' | 'left' | 'right'
}

// Configuration for corner tiles and event tiles that use images instead of text
const TILE_IMAGES: Record<string, { src: string; alt: string }> = {
  'Bias Sanctuary': {
    src: 'BiasSanctuary.webp',
    alt: 'Bias Sanctuary - Learn about cognitive biases in investing',
  },
  'Court of Capital': {
    src: 'Courtofcapital.webp',
    alt: 'Court of Capital - Face financial challenges and legal decisions',
  },
  'Casino': {
    src: 'Casinotile.webp',
    alt: 'Casino - Test your luck with investment games',
  },
  'Start / ThriftyPath': {
    src: 'Starttitle.webp',
    alt: 'Start / ThriftyPath - Begin your investment journey',
  },
  'Wildcard': {
    src: 'Wildcard.webp',
    alt: 'Wildcard - A surprise event awaits',
  },
}

const TileComponent = ({ tile, isActive, isHopping, isLanded, onClick, side }: TileProps) => {
  const { lightTap } = useHaptics();

  const handleClick = useCallback(() => {
    lightTap();  // Haptic feedback
    onClick();
  }, [onClick, lightTap]);

  const getTypeColor = () => {
    switch (tile.type) {
      case 'corner':
        return 'text-accent'
      case 'category':
        return 'text-blue-400'
      case 'event':
        return 'text-purple-400'
      default:
        return 'text-foreground'
    }
  }

  const isCorner = tile.type === 'corner'

  // For circular layout, we use a simpler border system
  // Category tiles get their category color, others get default/accent
  const borderStyles = useMemo(() => {
    const borderColor = isActive
      ? 'oklch(0.75 0.15 85)'
      : (tile.colorBorder || 'oklch(0.30 0.02 250)')

    return {
      borderColor,
    }
  }, [isActive, tile.colorBorder]);

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-md cursor-pointer transition-all touch-target touch-feedback no-select',
        'bg-black/70 backdrop-blur-xl flex-shrink-0 overflow-visible shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_25px_45px_rgba(0,0,0,0.55)]',
        'w-[112px] h-[128px] border-[3px]',
        isActive
          ? 'shadow-[0_0_20px_oklch(0.75_0.15_85_/_0.5)]'
          : 'hover:bg-card/70'
      )}
      style={{
        ...borderStyles,
        clipPath: 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)',
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: isHopping 
          ? [
              '0 0 0px oklch(0.75 0.15 85 / 0)',
              '0 0 30px oklch(0.75 0.15 85 / 0.6)',
              '0 0 0px oklch(0.75 0.15 85 / 0)',
            ]
          : isLanded
          ? '0 0 25px oklch(0.75 0.15 85 / 0.7)'
          : undefined,
      }}
      transition={{
        boxShadow: isHopping
          ? { duration: 0.4, times: [0, 0.5, 1] }
          : { duration: 0.3 }
      }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: isHopping ? -12 : isLanded ? -6 : -2,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <div className="relative">
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-lg bg-accent/40',
                isHopping ? 'animate-pulse' : 'animate-[pulse_2s_ease-in-out_infinite]'
              )}
              aria-hidden
            />
            <div
              className={cn(
                'w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold shadow-[0_10px_25px_oklch(0.75_0.15_85_/_0.35)]',
                isLanded ? 'ring-4 ring-accent/60' : 'ring-2 ring-accent/40'
              )}
            >
              ●
            </div>
          </div>
        </motion.div>
      )}

      <Badge
        variant="outline"
        className="absolute -top-2 left-2 text-[10px] font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm"
      >
        {tile.type}
      </Badge>

      {TILE_IMAGES[tile.title] ? (
        <img
          src={`${import.meta.env.BASE_URL}${TILE_IMAGES[tile.title].src}`}
          alt={TILE_IMAGES[tile.title].alt}
          className="w-full h-full object-contain absolute inset-0 pt-4 px-2 pb-1"
          loading="lazy"
        />
      ) : (
        <div className={cn(
          'text-center px-3 font-semibold',
          isCorner ? 'text-base' : 'text-xs',
          getTypeColor()
        )}>
          {tile.title}
        </div>
      )}
    </motion.div>
  )
}

export const Tile = memo(TileComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these change
  return (
    prevProps.tile.id === nextProps.tile.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isHopping === nextProps.isHopping &&
    prevProps.isLanded === nextProps.isLanded &&
    prevProps.tile.title === nextProps.tile.title &&
    prevProps.tile.type === nextProps.tile.type
  );
});
