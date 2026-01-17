import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { PortalTransition, RingNumber } from '@/lib/types'
import { RING_CONFIG } from '@/lib/mockData'

interface PortalAnimationProps {
  transition: PortalTransition | null
  isAnimating: boolean
}

export function PortalAnimation({ transition, isAnimating }: PortalAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'glow' | 'fade' | 'materialize' | 'celebrate'>('idle')
  
  useEffect(() => {
    if (!transition || !isAnimating) {
      setPhase('idle')
      return
    }
    
    // Start animation sequence
    const isAscending = transition.direction === 'up'
    const totalDuration = isAscending ? 1500 : 1200
    
    setPhase('glow')
    
    const timers = [
      setTimeout(() => setPhase('fade'), isAscending ? 400 : 300),
      setTimeout(() => setPhase('materialize'), isAscending ? 700 : 700),
      setTimeout(() => setPhase('celebrate'), isAscending ? 1200 : 900),
      setTimeout(() => {
        setPhase('idle')
      }, totalDuration),
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [transition, isAnimating])
  
  if (!transition || !isAnimating || phase === 'idle') return null
  
  const isAscending = transition.direction === 'up'
  const isThrone = transition.toRing === 0
  
  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: phase === 'fade' ? 1 : phase === 'materialize' ? 0.5 : 0,
          backgroundColor: isThrone
            ? 'rgba(252, 211, 77, 0.9)' // Golden for throne
            : isAscending 
              ? 'rgba(255, 255, 255, 0.9)' 
              : 'rgba(30, 30, 30, 0.85)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Glow Effect */}
      {phase === 'glow' && (
        <motion.div
          className={`fixed z-50 rounded-full pointer-events-none
            ${isThrone
              ? 'bg-gradient-radial from-yellow-400/60 via-amber-500/40 to-transparent'
              : isAscending 
                ? 'bg-gradient-radial from-purple-500/60 via-blue-500/40 to-transparent' 
                : 'bg-gradient-radial from-gray-600/60 via-slate-700/40 to-transparent'
            }`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: 300, height: 300, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
      
      {/* Particles */}
      {(phase === 'glow' || phase === 'materialize' || phase === 'celebrate') && (
        <PortalParticles direction={transition.direction} phase={phase} isThrone={isThrone} />
      )}
      
      {/* Ring Name Toast */}
      {phase === 'celebrate' && (
        <motion.div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-2xl
            ${isThrone
              ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
              : isAscending 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                : 'bg-gradient-to-r from-gray-600 to-slate-700'
            }`}
          >
            {isThrone 
              ? '👑 THRONE REACHED! 👑'
              : isAscending 
                ? `✨ Welcome to ${getRingName(transition.toRing as RingNumber)}! ✨`
                : `Back to ${getRingName(transition.toRing as RingNumber)} — try again!`
            }
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getRingName(ring: RingNumber | 0): string {
  if (ring === 0) return 'Throne'
  switch (ring) {
    case 1: return RING_CONFIG[1].name
    case 2: return RING_CONFIG[2].name
    case 3: return RING_CONFIG[3].name
  }
}

function PortalParticles({ direction, phase, isThrone }: { direction: 'up' | 'down', phase: string, isThrone: boolean }) {
  const count = phase === 'celebrate' ? 80 : 30
  const isAscending = direction === 'up'
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full
            ${isThrone
              ? i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-amber-500' : 'bg-white'
              : isAscending 
                ? i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-white'
                : 'bg-gray-400'
            }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: isAscending ? '100%' : '0%',
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            y: isAscending ? -window.innerHeight * 1.2 : window.innerHeight * 1.2,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
          }}
          transition={{ 
            duration: 1.2 + Math.random() * 0.5,
            delay: Math.random() * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
