/**
 * ChallengeTracker Component
 * Compact HUD widget showing daily challenge progress
 */

import { motion } from 'framer-motion'
import { Challenge } from '@/lib/challenges'

interface ChallengeTrackerProps {
  dailyChallenges: Challenge[]
  onOpenModal: () => void
}

export function ChallengeTracker({ dailyChallenges, onOpenModal }: ChallengeTrackerProps) {
  const completedCount = dailyChallenges.filter(c => c.completed).length
  const totalCount = dailyChallenges.length
  const starsEarnedToday = dailyChallenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.reward.stars, 0)

  // Check if there are new challenges available (none completed yet)
  const hasNewChallenges = completedCount === 0 && totalCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      onClick={onOpenModal}
      className="bg-card/95 backdrop-blur-sm border-2 border-accent/30 rounded-lg p-3 cursor-pointer shadow-lg hover:shadow-xl transition-all"
    >
      {/* Pulsing indicator for new challenges */}
      {hasNewChallenges && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <span className="font-bold text-sm text-foreground">Challenges</span>
      </div>

      {/* Progress indicators */}
      <div className="flex items-center gap-1 mb-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {i < completedCount ? (
              <span className="text-xl">⭐</span>
            ) : (
              <span className="text-xl opacity-30">⬜</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress text */}
      <div className="text-xs text-muted-foreground">
        {completedCount}/{totalCount} Complete
      </div>

      {/* Stars earned today */}
      {starsEarnedToday > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-accent font-semibold mt-1"
        >
          +{starsEarnedToday} stars today
        </motion.div>
      )}

      {/* Completion celebration */}
      {completedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-accent/20 rounded-lg pointer-events-none"
        />
      )}
    </motion.div>
  )
}
