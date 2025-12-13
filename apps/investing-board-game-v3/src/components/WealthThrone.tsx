import { motion } from 'framer-motion'

interface WealthThroneProps {
  netWorthChange: number
  holdingsCount: number
}

export function WealthThrone({ netWorthChange, holdingsCount }: WealthThroneProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      animate={{
        filter: [
          'drop-shadow(0 0 20px oklch(0.75 0.15 85 / 0.3))',
          'drop-shadow(0 0 40px oklch(0.75 0.15 85 / 0.5))',
          'drop-shadow(0 0 20px oklch(0.75 0.15 85 / 0.3))',
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg width="240" height="240" viewBox="0 0 240 240" className="absolute">
        <motion.circle
          cx="120"
          cy="120"
          r="80"
          fill="none"
          stroke="oklch(0.75 0.15 85)"
          strokeWidth="2"
          opacity="0.3"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.circle
          cx="120"
          cy="120"
          r="60"
          fill="none"
          stroke="oklch(0.75 0.15 85)"
          strokeWidth="1.5"
          opacity="0.4"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="120"
          cy="120"
          r="40"
          fill="oklch(0.75 0.15 85 / 0.1)"
          stroke="oklch(0.75 0.15 85)"
          strokeWidth="2"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-2 px-8 py-6">
        <h3 className="text-xl font-bold text-accent tracking-tight">Wealth Throne</h3>
        <div className="text-3xl font-bold text-accent">
          {netWorthChange >= 0 ? '+' : ''}
          {netWorthChange.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          Holdings: {holdingsCount}
        </div>
      </div>
    </motion.div>
  )
}