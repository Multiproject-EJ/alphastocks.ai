import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from '@phosphor-icons/react'

interface TutorialStep {
  target: string // CSS selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: '[data-tutorial="dice"]',
    title: 'Roll the Dice',
    description: 'Click here to roll and move around the board',
    position: 'top'
  },
  {
    target: '[data-tutorial="challenges"]',
    title: 'Daily Challenges',
    description: 'Complete challenges to earn stars and XP',
    position: 'bottom'
  },
  {
    target: '[data-tutorial="shop"]',
    title: 'Shop',
    description: 'Spend stars on cosmetics and power-ups',
    position: 'bottom'
  },
  {
    target: '[data-tutorial="portfolio"]',
    title: 'Portfolio',
    description: 'View your stock holdings and net worth',
    position: 'left'
  },
]

export function TutorialTooltip() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Check if tutorial has been completed
    const completed = localStorage.getItem('tutorialCompleted')
    if (!completed) {
      // Wait a bit before showing tutorial
      const timer = setTimeout(() => setShowTutorial(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!showTutorial) return

    const step = TUTORIAL_STEPS[currentStep]
    if (!step) return

    const targetElement = document.querySelector(step.target)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    
    // Calculate position based on step position
    let x = rect.left + rect.width / 2
    let y = rect.top

    if (step.position === 'bottom') {
      y = rect.bottom + 10
    } else if (step.position === 'top') {
      y = rect.top - 10
    } else if (step.position === 'left') {
      x = rect.left - 10
      y = rect.top + rect.height / 2
    } else if (step.position === 'right') {
      x = rect.right + 10
      y = rect.top + rect.height / 2
    }

    setPosition({ x, y })
  }, [currentStep, showTutorial])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setShowTutorial(false)
    localStorage.setItem('tutorialCompleted', 'true')
  }

  if (!showTutorial) return null

  const step = TUTORIAL_STEPS[currentStep]

  return (
    <AnimatePresence>
      {showTutorial && step && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 z-[90] pointer-events-none" />
          
          {/* Spotlight on target */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[95] pointer-events-none"
            style={{
              left: position.x - 100,
              top: position.y - 100,
              width: 200,
              height: 200,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
            }}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-[100] bg-card border-2 border-accent/50 rounded-lg shadow-2xl p-4 max-w-sm"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Skip tutorial"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-bold text-lg mb-2 pr-6">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === currentStep ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
