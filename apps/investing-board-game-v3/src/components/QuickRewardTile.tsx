import { motion } from 'framer-motion'
import { QUICK_REWARD_CONFIG, QUICK_REWARD_TILE_STYLES, QuickRewardType, getPremiumTileStyle, PREMIUM_TILE_CONFIG } from '../lib/quickRewardTiles'

// Trapezoid shape matching all board tiles
const TILE_CLIP_PATH = 'polygon(0% 0%, 100% 0%, 86% 100%, 14% 100%)'

interface QuickRewardTileProps {
  type: QuickRewardType
  isActive: boolean
  isLanded: boolean
  onClick: () => void
  isPremium?: boolean
}

export function QuickRewardTile({
  type,
  isActive,
  isLanded,
  onClick,
  isPremium = false,
}: QuickRewardTileProps) {
  const config = QUICK_REWARD_CONFIG[type]
  const styles = isPremium ? getPremiumTileStyle() : QUICK_REWARD_TILE_STYLES[type]

  return (
    <motion.div
      className={`
        relative w-[112px] h-[128px] rounded-md overflow-hidden
        flex flex-col items-center justify-center
        cursor-pointer select-none touch-target touch-feedback no-select
        bg-black/70 backdrop-blur-xl
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_25px_45px_rgba(0,0,0,0.55)]
        border-[3px] ${styles.borderColor}
        transition-all duration-200
        ${isActive ? 'shadow-[0_0_20px_oklch(0.75_0.15_85_/_0.5)]' : 'hover:bg-card/70'}
        ${isLanded ? 'scale-110' : ''}
        ${isPremium ? 'animate-pulse' : ''}
      `}
      style={{
        clipPath: TILE_CLIP_PATH,
      }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
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
      {/* Colorful gradient overlay - this makes Quick Reward tiles distinct */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-60 pointer-events-none`}
        style={{
          clipPath: TILE_CLIP_PATH,
        }}
      />

      {/* Glow effect for the specific reward type */}
      <div 
        className={`absolute inset-0 shadow-lg ${styles.shadowColor} ${isPremium ? 'opacity-70' : 'opacity-40'} pointer-events-none`}
        style={{
          clipPath: TILE_CLIP_PATH,
        }}
      />

      {/* Premium badge */}
      {isPremium && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-300 to-amber-400 
                        text-black text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        shadow-lg z-20 animate-bounce">
          {PREMIUM_TILE_CONFIG.badgeText}
        </div>
      )}

      {/* Content layer - above the gradient */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Large emoji - drop shadow for depth */}
        <span className="text-2xl sm:text-3xl drop-shadow-md">{styles.emoji}</span>
        
        {/* Label - white with drop shadow for readability */}
        <span className="text-[10px] sm:text-xs font-semibold text-white text-center leading-tight mt-1 drop-shadow-sm">
          {isPremium ? 'PREMIUM' : styles.label}
        </span>
        {isPremium && (
          <span className="text-[8px] sm:text-[9px] font-medium text-yellow-100 text-center leading-tight">
            {QUICK_REWARD_TILE_STYLES[type].label}
          </span>
        )}
      </div>

      {/* Subtle shine effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
        style={{
          clipPath: TILE_CLIP_PATH,
        }}
      />
    </motion.div>
  )
}
