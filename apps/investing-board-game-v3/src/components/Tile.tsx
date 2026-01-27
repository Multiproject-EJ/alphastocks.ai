import { motion } from 'framer-motion'
import { memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tile as TileType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useHaptics } from '@/hooks/useHaptics'
import { QuickRewardTile } from './QuickRewardTile'
import { QuickRewardType } from '@/lib/quickRewardTiles'
import { TILE_WIDTH, TILE_HEIGHT } from '@/lib/constants'
import { getLearningTileDefinition, LEARNING_CATEGORY_STYLES } from '@/lib/learningTiles'

interface TileProps {
  tile: TileType
  isActive: boolean
  isHopping: boolean
  isLanded: boolean
  onClick: () => void
  side?: 'top' | 'bottom' | 'left' | 'right'
  hasOwnership?: boolean // Indicates if player owns stock in this category
  ringNumber?: 1 | 2 | 3  // NEW: Which ring this tile belongs to
  isRing3Revealed?: boolean  // NEW: Whether Ring 3 has been unlocked
  isRing3Revealing?: boolean  // NEW: Whether Ring 3 is currently revealing
  isTeleporting?: boolean
  isPortal?: boolean
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

const TileComponent = ({ tile, isActive, isHopping, isLanded, onClick, side, hasOwnership = false, ringNumber, isRing3Revealed = false, isRing3Revealing = false, isTeleporting = false, isPortal = false }: TileProps) => {
  const { lightTap } = useHaptics();

  const handleClick = useCallback(() => {
    lightTap();  // Haptic feedback
    onClick();
  }, [onClick, lightTap]);

  // Determine ring-specific classes
  const getRingClasses = () => {
    if (!ringNumber || ringNumber === 1) {
      return 'ring-1-tile'
    }
    if (ringNumber === 2) {
      return 'ring-2-tile'
    }
    if (ringNumber === 3) {
      if (isRing3Revealing) {
        return 'ring-3-tile ring-3-tile--revealing'
      }
      return isRing3Revealed ? 'ring-3-tile ring-3-tile--revealed' : 'ring-3-tile ring-3-tile--locked'
    }
    return ''
  }

  // For Ring 3 locked state, show mystery content
  const shouldShowMysteryContent = ringNumber === 3 && !isRing3Revealed

  const getTypeColor = () => {
    switch (tile.type) {
      case 'corner':
        return 'text-accent'
      case 'category':
        return 'text-blue-400'
      case 'event':
        return 'text-purple-400'
      case 'learning':
        return 'text-emerald-200'
      default:
        return 'text-foreground'
    }
  }

  // Get tile type-specific gradient overlay
  const getTileGradient = () => {
    if (ringNumber === 2 || ringNumber === 3) {
      switch (tile.type) {
        case 'category':
          return 'from-sky-700 to-slate-900'
        case 'event':
          return 'from-blue-700 to-indigo-900'
        case 'corner':
          return 'from-amber-500 to-yellow-700'
        case 'mystery':
          return 'from-blue-700 to-cyan-900'
        case 'special':
          return 'from-amber-500 to-yellow-600'
        case 'learning':
          return 'from-emerald-700 to-slate-900'
        default:
          return 'from-slate-700 to-slate-900'
      }
    }
    switch (tile.type) {
      case 'category':
        return 'from-slate-700 to-slate-900'
      case 'event':
        return 'from-purple-700 to-purple-900'
      case 'corner':
        return 'from-emerald-600 to-green-800'
      case 'mystery':
        return 'from-indigo-600 to-violet-800'
      case 'special':
        return 'from-amber-500 to-orange-600'
      case 'learning':
        return 'from-emerald-600 to-teal-800'
      default:
        return 'from-gray-700 to-gray-900'
    }
  }

  const isCorner = tile.type === 'corner'
  const emojiMatch = tile.title.match(/\p{Extended_Pictographic}/u)
  const titleEmoji = emojiMatch?.[0] ?? null
  const titleText = titleEmoji
    ? tile.title.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim()
    : tile.title
  const learningDefinition = tile.type === 'learning' ? getLearningTileDefinition(tile.learningId) : null
  const learningCategoryStyle = learningDefinition
    ? LEARNING_CATEGORY_STYLES[learningDefinition.category]
    : null

  // Handle quick reward tiles
  if (tile.type === 'quick-reward' && tile.quickRewardType) {
    return (
      <QuickRewardTile
        type={tile.quickRewardType as QuickRewardType}
        isActive={isActive}
        isLanded={isLanded}
        onClick={handleClick}
        isPremium={tile.isPremium}
        ringNumber={ringNumber}
        isRing3Revealed={isRing3Revealed}
        isRing3Revealing={isRing3Revealing}
        isTeleporting={isTeleporting}
      />
    )
  }

  // For circular layout, we use a simpler border system
  // Category tiles get their category color, others get default/accent
  const borderStyles = useMemo(() => {
    const borderColor = isPortal
      ? 'oklch(0.62 0.28 300)'
      : isActive
      ? 'oklch(0.75 0.15 85)'
      : (tile.colorBorder || 'oklch(0.30 0.02 250)')

    return {
      borderColor,
    }
  }, [isActive, tile.colorBorder, isPortal]);

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-md cursor-pointer transition-all touch-target touch-feedback no-select',
        'bg-black/70 backdrop-blur-xl flex-shrink-0 overflow-visible shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_25px_45px_rgba(0,0,0,0.55)]',
        'border-[3px]',
        isActive
          ? 'shadow-[0_0_20px_oklch(0.75_0.15_85_/_0.5)]'
          : 'hover:bg-card/70',
        getRingClasses(),
        isPortal ? 'portal-tile-magic' : ''
      )}
      style={{
        ...borderStyles,
        clipPath: 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)',
        width: `${TILE_WIDTH}px`,
        height: `${TILE_HEIGHT}px`,
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
      {/* Colorful gradient overlay based on tile type */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${getTileGradient()} opacity-50 pointer-events-none`}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)',
        }}
      />

      {isTeleporting && (
        <div
          className="absolute inset-[-10px] teleport-flash-ring pointer-events-none"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)',
          }}
          aria-hidden
        />
      )}

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
        className="absolute -top-2 left-2 text-[10px] font-mono uppercase tracking-wider bg-background/80 backdrop-blur-sm z-10"
      >
        {tile.type}
      </Badge>

      {/* Ownership indicator for category tiles */}
      {hasOwnership && tile.type === 'category' && (
        <div 
          className="absolute -top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-md border border-white/30 z-10"
          role="img"
          aria-label="You own stocks in this category"
        >
          <span className="text-[10px]" aria-hidden="true">💰</span>
        </div>
      )}

      {/* Ring 3 locked content - show mystery */}
      {shouldShowMysteryContent ? (
        <div className="flex items-center justify-center w-full h-full relative z-10">
          <span className="text-4xl opacity-50">?</span>
        </div>
      ) : learningDefinition ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-2 gap-1">
          <div className="relative">
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-md',
                learningCategoryStyle?.glowClass ?? 'bg-emerald-400/30'
              )}
              aria-hidden
            />
            <span className="relative text-[42px] sm:text-[50px] leading-none drop-shadow-md">
              {learningDefinition.icon}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-slate-100">
            {learningDefinition.shortTitle}
          </span>
          <span className={cn('text-[10px] font-medium', learningCategoryStyle?.textClass)}>
            {learningCategoryStyle?.label}
          </span>
        </div>
      ) : TILE_IMAGES[tile.title] ? (
        <img
          src={`${import.meta.env.BASE_URL}${TILE_IMAGES[tile.title].src}`}
          alt={TILE_IMAGES[tile.title].alt}
          className="w-full h-full object-contain absolute inset-0 pt-4 px-2 pb-1 z-10"
          loading="lazy"
        />
      ) : titleEmoji ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-2">
          <span className="text-[44px] sm:text-[52px] leading-none drop-shadow-md">{titleEmoji}</span>
          {titleText && (
            <span
              className={cn(
                'text-[10px] sm:text-xs font-semibold leading-tight mt-1 drop-shadow-sm',
                getTypeColor()
              )}
            >
              {titleText}
            </span>
          )}
        </div>
      ) : (
        <div className={cn(
          'text-center px-3 font-semibold relative z-10',
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
    prevProps.tile.type === nextProps.tile.type &&
    prevProps.hasOwnership === nextProps.hasOwnership &&
    prevProps.ringNumber === nextProps.ringNumber &&
    prevProps.isRing3Revealed === nextProps.isRing3Revealed &&
    prevProps.isRing3Revealing === nextProps.isRing3Revealing &&
    prevProps.isTeleporting === nextProps.isTeleporting &&
    prevProps.isPortal === nextProps.isPortal
  );
});
