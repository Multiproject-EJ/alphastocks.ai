import { motion } from 'framer-motion'
import { QUICK_REWARD_CONFIG, QuickRewardType } from '../lib/quickRewardTiles'

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

  return (
    <motion.div
      className={`
        relative w-full h-full rounded-xl overflow-hidden
        flex flex-col items-center justify-center
        cursor-pointer select-none
        bg-gradient-to-br ${config.color}
        border-2 border-white/30
        shadow-lg
        ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
        ${isLanded ? 'scale-110' : ''}
      `}
      style={{
        boxShadow: isActive ? `0 0 20px ${config.glowColor}` : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
      }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
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
      {/* Big emoji - Mobile friendly touch target */}
      <span className="text-3xl sm:text-4xl mb-1">{config.emoji}</span>
      
      {/* Label - Compact for mobile */}
      <span className="text-[10px] sm:text-xs text-white/90 font-bold text-center px-1 leading-tight">
        {config.label}
      </span>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  )
}
