import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps {
  show: boolean
  tip?: string
}

const TIPS = [
  "💡 Diversify your portfolio across all 5 categories",
  "💡 Complete daily challenges for bonus stars",
  "💡 Save your game progress by signing in",
  "💡 Weekend events offer 2x rewards",
  "💡 Learn about investing biases in Investment Phycology",
  "💡 Upgrade your dice in the shop for unique styles",
  "💡 Check the leaderboard to see how you rank",
  "💡 Level up to unlock new features and rewards",
  "💡 Visit the Casino for a chance to win big",
  "💡 Complete weekly challenges for rare rewards",
]

export function LoadingScreen({ show, tip }: LoadingScreenProps) {
  const displayTip = useMemo(() => tip || TIPS[Math.floor(Math.random() * TIPS.length)], [tip])
  const stages = useMemo(
    () => [
      'Warming up your trading desk…',
      'Syncing market data…',
      'Lining up today’s events…',
      'Almost ready to roll…',
    ],
    []
  )
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!show) return
    const interval = window.setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length)
    }, 650)
    return () => window.clearInterval(interval)
  }, [show, stages.length])

  if (!show) return null
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 30%, rgba(99,102,241,0.12), transparent 45%)',
        }}
      />

      <div className="relative text-center space-y-6 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-bold text-accent drop-shadow-sm"
        >
          Investing Board Game
        </motion.div>

        <motion.div
          className="mx-auto w-64 rounded-full bg-accent/10 p-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="h-2 rounded-full bg-accent"
            animate={{
              width: ['20%', '65%', '85%', '100%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </motion.div>

        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-sm font-medium text-foreground/80"
        >
          {stages[stageIndex]}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground max-w-xs mx-auto"
        >
          {displayTip}
        </motion.p>
      </div>
    </motion.div>
  )
}
