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
  "💡 Learn about investing biases in Bias Sanctuary",
  "💡 Upgrade your dice in the shop for unique styles",
  "💡 Check the leaderboard to see how you rank",
  "💡 Level up to unlock new features and rewards",
  "💡 Visit the Casino for a chance to win big",
  "💡 Complete weekly challenges for rare rewards",
]

export function LoadingScreen({ show, tip }: LoadingScreenProps) {
  const displayTip = tip || TIPS[Math.floor(Math.random() * TIPS.length)]
  
  if (!show) return null
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      <div className="text-center space-y-6 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-accent"
        >
          Investing Board Game
        </motion.div>
        
        <div className="w-48 h-1 bg-accent/20 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: '50%' }}
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground max-w-xs mx-auto"
        >
          {displayTip}
        </motion.p>
      </div>
    </motion.div>
  )
}
