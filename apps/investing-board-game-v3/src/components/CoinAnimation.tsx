import { motion } from 'framer-motion'

// Floating coin animation when earned
interface CoinAnimationProps {
  show: boolean
  amount: number
  position: { x: number, y: number }
  onComplete?: () => void
}

export function CoinAnimation({ show, amount, position, onComplete }: CoinAnimationProps) {
  if (!show) return null
  
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.5 }}
      transition={{ duration: 1 }}
      onAnimationComplete={onComplete}
    >
      <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
        <span>🪙</span>
        <span>+{amount}</span>
      </div>
    </motion.div>
  )
}
