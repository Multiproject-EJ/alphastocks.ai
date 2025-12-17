import { motion } from 'framer-motion'

interface BottomNavProps {
  onNavigate: (section: 'challenges' | 'shop' | 'home' | 'leaderboard' | 'settings') => void
  activeSection: string
  badges?: {
    challenges?: number
    shop?: number
    leaderboard?: boolean
  }
}

export function BottomNav({ onNavigate, activeSection, badges }: BottomNavProps) {
  const tabs = [
    { id: 'challenges', label: 'Challenges', icon: '🎯', badge: badges?.challenges },
    { id: 'shop', label: 'Shop', icon: '🛒', badge: badges?.shop },
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', badge: badges?.leaderboard ? 1 : undefined },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-md border-t-2 border-accent/30 pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id as any)}
            className={`
              relative flex flex-col items-center justify-center w-full h-full
              transition-colors duration-200
              ${activeSection === tab.id ? 'text-accent' : 'text-muted-foreground'}
              hover:text-accent
              touch-target
            `}
            aria-label={tab.label}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
            
            {/* Badge indicator */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                {tab.badge}
              </motion.div>
            )}
            
            {/* Active indicator */}
            {activeSection === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
