import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tile as TileType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TileProps {
  tile: TileType
  isActive: boolean
  isHopping: boolean
  isLanded: boolean
  onClick: () => void
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tile({ tile, isActive, isHopping, isLanded, onClick, side }: TileProps) {
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
  const isEvent = tile.type === 'event'
  const isVertical = side === 'left' || side === 'right'

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all',
        'bg-black/70 backdrop-blur-xl flex-shrink-0 overflow-visible shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_25px_45px_rgba(0,0,0,0.55)]',
        isCorner
          ? 'w-[200px] h-[200px] border-4'
          : isVertical
          ? isEvent
            ? 'w-[120px] h-[80px] border-l-8 border-y-2 border-r-2'
            : 'w-[120px] border-l-8 border-y-2 border-r-2'
          : isEvent
          ? 'h-[120px] w-[80px] border-t-8 border-x-2 border-b-2'
          : 'h-[120px] border-t-8 border-x-2 border-b-2',
        isActive
          ? 'shadow-[0_0_20px_oklch(0.75_0.15_85_/_0.5)]'
          : 'hover:bg-card/70'
      )}
      style={{
        flexGrow: isCorner ? 0 : 1,
        flexBasis: isCorner ? 'auto' : isVertical ? '0' : '0',
        borderTopColor: isVertical 
          ? (isCorner ? (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)') : 'oklch(0.30 0.02 250)')
          : (tile.colorBorder || (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)')),
        borderLeftColor: isVertical
          ? (tile.colorBorder || (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)'))
          : (isCorner ? (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)') : 'oklch(0.30 0.02 250)'),
        borderRightColor: isCorner ? (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)') : 'oklch(0.30 0.02 250)',
        borderBottomColor: isCorner ? (isActive ? 'oklch(0.75 0.15 85)' : 'oklch(0.30 0.02 250)') : 'oklch(0.30 0.02 250)',
      }}
      onClick={onClick}
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

      <div className={cn(
        'text-center px-3 font-semibold',
        isCorner ? 'text-lg' : 'text-xs',
        getTypeColor()
      )}>
        {tile.title}
      </div>
    </motion.div>
  )
}