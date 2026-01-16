import { motion } from 'framer-motion'
import { QUICK_REWARD_CONFIG, QUICK_REWARD_TILE_STYLES, QuickRewardType } from '../lib/quickRewardTiles'

interface QuickRewardTileProps {
  type: QuickRewardType
  isActive: boolean
  isLanded: boolean
  onClick: () => void
}

export function QuickRewardTile({
  type,
  isActive,
  isLanded,
  onClick,
}: QuickRewardTileProps) {
  const config = QUICK_REWARD_CONFIG[type]
  const styles = QUICK_REWARD_TILE_STYLES[type]

  return (
    <motion.div
      className={`
        relative w-full h-full rounded-xl overflow-hidden
        flex flex-col items-center justify-center
        cursor-pointer select-none
        bg-gradient-to-br ${styles.gradient}
        ${styles.borderColor}
        shadow-lg ${styles.shadowColor}
        p-2 min-w-[60px] min-h-[70px]
        transition-all duration-200
        ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
        ${isLanded ? 'scale-110' : ''}
        hover:scale-105 hover:brightness-110
      `}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      animate={isLanded ? {
        scale: [1, 1.1, 1.05],
        boxShadow: [
          `0 0 10px ${config.glowColor}`,
          `0 0 30px ${config.glowColor}`,
          `0 0 20px ${config.glowColor}`,
        ],
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Large emoji - drop shadow for depth */}
      <span className="text-2xl sm:text-3xl drop-shadow-md">{styles.emoji}</span>
      
      {/* Label - white with drop shadow for readability */}
      <span className="text-[10px] sm:text-xs font-semibold text-white text-center leading-tight mt-1 drop-shadow-sm">
        {styles.label}
      </span>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  )
}
