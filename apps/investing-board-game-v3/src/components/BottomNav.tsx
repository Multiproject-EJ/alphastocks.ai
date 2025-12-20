import { motion } from 'framer-motion'
import { CompactDice } from '@/components/CompactDice'

// DevTools event logging (only loads in dev mode)
let logEvent: ((type: string, payload?: Record<string, unknown> | string) => void) | undefined
if (import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === '1') {
  import('@/devtools/eventBus').then(module => {
    logEvent = module.logEvent
  })
}

interface BottomNavProps {
  onNavigate: (section: 'challenges' | 'shop' | 'home' | 'leaderboard' | 'settings') => void
  activeSection: string
  badges?: {
    challenges?: number
    shop?: number
    leaderboard?: boolean
  }
  // Dice props for mobile
  dice1?: number
  dice2?: number
  isRolling?: boolean
  rollsRemaining?: number
  onRoll?: () => void
  canRoll?: boolean
  showDice?: boolean
}

export function BottomNav({ 
  onNavigate, 
  activeSection, 
  badges,
  dice1 = 1,
  dice2 = 1,
  isRolling = false,
  rollsRemaining = 0,
  onRoll,
  canRoll = false,
  showDice = true,
}: BottomNavProps) {
  const leftTabs = [
    { id: 'challenges', label: 'Challenges', icon: '🎯', badge: badges?.challenges },
    { id: 'shop', label: 'Shop', icon: '🛒', badge: badges?.shop },
  ]

  const rightTabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', badge: badges?.leaderboard ? 1 : undefined },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleNavigate = (section: string) => {
    logEvent?.('nav_switch', { section, from: activeSection })
    onNavigate(section as any)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-md border-t-2 border-accent/30 safe-bottom">
      <div className="flex items-center justify-between h-[56px] px-2">
        {/* Left tabs */}
        <div className="flex items-center flex-1">
          {leftTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`
                relative flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200
                ${activeSection === tab.id ? 'text-accent' : 'text-muted-foreground'}
                hover:text-accent
                touch-target touch-feedback
              `}
              aria-label={tab.label}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              
              {/* Badge indicator */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                >
                  {tab.badge}
                </motion.div>
              )}
              
              {/* Active indicator */}
              {activeSection === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Center - Dice (on mobile only) */}
        {showDice && onRoll && (
          <div className="flex items-center justify-center px-4">
            <CompactDice
              dice1={dice1}
              dice2={dice2}
              isRolling={isRolling}
              rollsRemaining={rollsRemaining}
              onRoll={onRoll}
              canRoll={canRoll}
            />
          </div>
        )}

        {/* Right tabs */}
        <div className="flex items-center flex-1">
          {rightTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`
                relative flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200
                ${activeSection === tab.id ? 'text-accent' : 'text-muted-foreground'}
                hover:text-accent
                touch-target touch-feedback
              `}
              aria-label={tab.label}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              
              {/* Badge indicator */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                >
                  {tab.badge}
                </motion.div>
              )}
              
              {/* Active indicator */}
              {activeSection === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
