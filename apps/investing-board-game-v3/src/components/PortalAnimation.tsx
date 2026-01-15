import { motion, AnimatePresence } from 'framer-motion'
import type { PortalTransition, RingNumber } from '@/lib/types'
import { RING_CONFIG } from '@/lib/mockData'

interface PortalAnimationProps {
  transition: PortalTransition | null
  isAnimating: boolean
}

export function PortalAnimation({ transition, isAnimating }: PortalAnimationProps) {
  if (!transition || !isAnimating) return null

  const isAscending = transition.direction === 'up'
  const isThrone = transition.toRing === 0

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background flash */}
        <motion.div
          className={`absolute inset-0 ${
            isThrone 
              ? 'bg-gradient-to-b from-yellow-500/30 to-amber-600/30'
              : isAscending 
                ? 'bg-gradient-to-b from-purple-500/20 to-blue-500/20'
                : 'bg-gradient-to-t from-gray-500/20 to-transparent'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
        />

        {/* Portal vortex effect */}
        <motion.div
          className={`w-32 h-32 rounded-full ${
            isThrone
              ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-2xl shadow-yellow-500/50'
              : isAscending
                ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl shadow-purple-500/50'
                : 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-xl'
          }`}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1.5, 1.2, 0],
            rotate: [0, 180, 360, 540],
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Direction indicator */}
        <motion.div
          className="absolute text-6xl"
          initial={{ opacity: 0, y: isAscending ? 50 : -50 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: isAscending ? [50, 0, -50, -100] : [-50, 0, 50, 100],
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {isThrone ? '👑' : isAscending ? '⬆️' : '⬇️'}
        </motion.div>

        {/* Ring transition text */}
        <motion.div
          className="absolute bottom-1/3 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <div className={`text-2xl font-bold ${
            isThrone
              ? 'text-yellow-400'
              : isAscending 
                ? 'text-purple-400' 
                : 'text-gray-400'
          }`}>
            {isThrone 
              ? '👑 THRONE REACHED! 👑'
              : isAscending 
                ? `ASCENDING TO RING ${transition.toRing}`
                : 'FALLING TO RING 1'
            }
          </div>
          <div className="text-lg text-white/70 mt-2">
            {isThrone
              ? 'You have conquered the Wealth Spiral!'
              : isAscending && transition.toRing !== 0
                ? `Welcome to ${RING_CONFIG[transition.toRing as RingNumber].name}!`
                : 'Complete another lap to ascend again'
            }
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
