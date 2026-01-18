/**
 * Game Overlay Component
 * Wrapper for game content with animations and close functionality
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface GameOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function GameOverlay({ isOpen, onClose, children }: GameOverlayProps) {
  const prefersReducedMotion = useReducedMotion()

  const overlayVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 50,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: "easeIn",
      },
    },
  }

  const handleBackdropClick = () => {
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close game overlay"
          />

          {/* Overlay Content */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative h-full w-full max-w-7xl">
              {/* Close Button */}
              <Button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 h-12 w-12 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                aria-label="Close game"
              >
                <X size={24} weight="bold" />
              </Button>

              {/* Game Content */}
              <div 
                className="h-full w-full overflow-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl"
                role="dialog"
                aria-label="Game content"
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
