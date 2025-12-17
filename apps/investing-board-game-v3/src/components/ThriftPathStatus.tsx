import { motion } from 'framer-motion'
import { Shield, Sparkle } from '@phosphor-icons/react'
import { ThriftPathStatus, THRIFT_PATH_LEVELS } from '@/lib/thriftPath'

// HUD widget showing Thrift Path status (top-left or bottom-left)
interface ThriftPathStatusProps {
  status: ThriftPathStatus
  onClick?: () => void
}

export function ThriftPathStatus({ status, onClick }: ThriftPathStatusProps) {
  if (!status.active) return null
  
  const levelInfo = THRIFT_PATH_LEVELS[status.level as keyof typeof THRIFT_PATH_LEVELS]
  const nextLevelInfo = THRIFT_PATH_LEVELS[(status.level + 1) as keyof typeof THRIFT_PATH_LEVELS]
  const progress = nextLevelInfo 
    ? (status.experience - levelInfo.experience) / (nextLevelInfo.experience - levelInfo.experience)
    : 1
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="bg-black/75 backdrop-blur-xl border-2 border-green-500/50 rounded-xl p-3 shadow-lg cursor-pointer hover:border-green-500 transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-2xl">🌿</div>
        <div className="flex-1">
          <div className="text-xs text-green-400 font-semibold">
            Thrift Path • Level {status.level}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {levelInfo.title}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {nextLevelInfo && (
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">
            {status.experience} / {nextLevelInfo.experience} XP
          </div>
        </div>
      )}
      
      {/* Benefits preview */}
      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
        <div className="text-[10px] text-green-400 flex items-center gap-1">
          <Sparkle size={10} /> +{((status.benefits.starMultiplier - 1) * 100).toFixed(0)}% Stars
        </div>
        <div className="text-[10px] text-blue-400 flex items-center gap-1">
          <Shield size={10} /> {(status.benefits.crashProtection * 100).toFixed(0)}% Protection
        </div>
      </div>
      
      {/* Streak indicator */}
      {status.streakDays > 0 && (
        <div className="mt-2 text-[10px] text-accent flex items-center gap-1">
          🔥 {status.streakDays} day streak
        </div>
      )}
    </motion.div>
  )
}
