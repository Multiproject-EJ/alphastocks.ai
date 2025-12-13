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
        'bg-card/50 backdrop-blur-sm flex-shrink-0',
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
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-10"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold shadow-lg">
            ●
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