import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { PortalTransition, RingNumber } from '@/lib/types'
import { RING_CONFIG } from '@/lib/mockData'

interface PortalAnimationProps {
  transition: PortalTransition | null
  isAnimating: boolean
}

export function PortalAnimation({ transition, isAnimating }: PortalAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'glow' | 'fade' | 'materialize' | 'celebrate'>('idle')
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    if (!transition || !isAnimating) {
      setPhase('idle')
      return
    }
    
    // Start animation sequence
    const isAscending = transition.direction === 'up'
    const totalDuration = isAscending ? 1600 : 1300
    const timings = {
      fade: isAscending ? 420 : 320,
      materialize: isAscending ? 780 : 660,
      celebrate: isAscending ? 1180 : 980,
    }
    
    setPhase('glow')
    
    const timers = [
      setTimeout(() => setPhase('fade'), timings.fade),
      setTimeout(() => setPhase('materialize'), timings.materialize),
      setTimeout(() => setPhase('celebrate'), timings.celebrate),
      setTimeout(() => {
        setPhase('idle')
      }, totalDuration),
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [transition, isAnimating])

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])
  
  if (!transition || !isAnimating || phase === 'idle') return null
  
  const isAscending = transition.direction === 'up'
  const isThrone = transition.toRing === 0
  const portalPalette = getPortalPalette(isAscending, isThrone)
  const portalSize = useMemo(() => {
    const base = Math.min(viewport.width || 800, viewport.height || 600)
    return base * (isThrone ? 0.62 : 0.52)
  }, [viewport.width, viewport.height, isThrone])
  const beamWidth = Math.max(portalSize * 0.12, 56)
  const beamHeight = Math.max((viewport.height || 700) * 1.1, 520)
  
  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: phase === 'fade' ? 0.9 : phase === 'materialize' ? 0.55 : 0,
          backgroundColor: isThrone
            ? 'rgba(252, 211, 77, 0.85)' // Golden for throne
            : isAscending 
              ? 'rgba(255, 255, 255, 0.82)' 
              : 'rgba(20, 25, 35, 0.82)'
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
          animate={{ width: portalSize * 0.8, height: portalSize * 0.8, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}

      {/* Portal beam */}
      {(phase === 'fade' || phase === 'materialize') && (
        <motion.div
          className="fixed left-1/2 top-1/2 z-50 pointer-events-none"
          style={{
            width: `${beamWidth}px`,
            height: `${beamHeight}px`,
            transform: 'translate(-50%, -50%)',
            background: isAscending
              ? `linear-gradient(to top, transparent, ${portalPalette.beamStrong}, ${portalPalette.beamSoft}, transparent)`
              : `linear-gradient(to bottom, transparent, ${portalPalette.beamStrong}, ${portalPalette.beamSoft}, transparent)`,
            filter: 'blur(8px)',
          }}
          initial={{ opacity: 0, scaleY: 0.65 }}
          animate={{
            opacity: phase === 'materialize' ? 0.7 : 0.45,
            scaleY: phase === 'materialize' ? 1 : 0.8,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      )}

      {/* Portal ripples */}
      {(phase === 'glow' || phase === 'fade' || phase === 'materialize') && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: portalSize * (0.7 + index * 0.12),
                height: portalSize * (0.7 + index * 0.12),
                border: `1px solid ${portalPalette.ring}`,
                boxShadow: `0 0 24px ${portalPalette.glow}`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: phase === 'fade' ? 0.9 : 0.55,
                scale: phase === 'materialize' ? 1.05 : 1,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Particles */}
      {(phase === 'glow' || phase === 'materialize' || phase === 'celebrate') && (
        <PortalParticles
          direction={transition.direction}
          phase={phase}
          isThrone={isThrone}
          viewportHeight={viewport.height || 800}
        />
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
    default: return 'Unknown Ring'
  }
}

function getPortalPalette(isAscending: boolean, isThrone: boolean) {
  if (isThrone) {
    return {
      beamStrong: 'rgba(251, 191, 36, 0.9)',
      beamSoft: 'rgba(245, 158, 11, 0.55)',
      ring: 'rgba(252, 211, 77, 0.8)',
      glow: 'rgba(251, 191, 36, 0.7)',
    }
  }

  if (isAscending) {
    return {
      beamStrong: 'rgba(168, 85, 247, 0.85)',
      beamSoft: 'rgba(59, 130, 246, 0.55)',
      ring: 'rgba(147, 197, 253, 0.7)',
      glow: 'rgba(129, 140, 248, 0.6)',
    }
  }

  return {
    beamStrong: 'rgba(148, 163, 184, 0.8)',
    beamSoft: 'rgba(71, 85, 105, 0.5)',
    ring: 'rgba(148, 163, 184, 0.6)',
    glow: 'rgba(100, 116, 139, 0.6)',
  }
}

function PortalParticles({
  direction,
  phase,
  isThrone,
  viewportHeight,
}: {
  direction: 'up' | 'down'
  phase: string
  isThrone: boolean
  viewportHeight: number
}) {
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
            y: isAscending ? -viewportHeight * 1.2 : viewportHeight * 1.2,
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
