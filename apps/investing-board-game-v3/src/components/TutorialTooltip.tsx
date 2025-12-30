import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from '@phosphor-icons/react'
import { useLayoutMode } from '@/hooks/useLayoutMode'
import { useAuth } from '@/context/AuthContext'

interface TutorialStep {
  target: string // CSS selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const DESKTOP_TUTORIAL_STEPS: TutorialStep[] = [
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

const PHONE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: '[data-tutorial="dice"]',
    title: 'Roll the Dice',
    description: 'Tap to roll and move around the board',
    position: 'top'
  },
  {
    target: '[data-tutorial="shop"]',
    title: 'Shop',
    description: 'Grab cosmetics and power-ups from the shop',
    position: 'top'
  },
  {
    target: '[data-tutorial="portfolio"]',
    title: 'Portfolio',
    description: 'Track your holdings and net worth here',
    position: 'left'
  },
]

export function TutorialTooltip() {
  const { isPhone } = useLayoutMode()
  const { isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [spotlight, setSpotlight] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [tutorialEnabled, setTutorialEnabled] = useState(true)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const previousAuth = useRef(isAuthenticated)

  const tutorialSteps = useMemo(
    () => (isPhone ? PHONE_TUTORIAL_STEPS : DESKTOP_TUTORIAL_STEPS),
    [isPhone]
  )

  useEffect(() => {
    const stored = localStorage.getItem('tutorialEnabled')
    setTutorialEnabled(stored !== 'false')
  }, [])

  useEffect(() => {
    const handleSettingsChange = () => {
      const stored = localStorage.getItem('tutorialEnabled')
      const enabled = stored !== 'false'
      setTutorialEnabled(enabled)
      if (!enabled) {
        setShowTutorial(false)
      }
    }

    window.addEventListener('tutorial-settings-changed', handleSettingsChange)
    return () => window.removeEventListener('tutorial-settings-changed', handleSettingsChange)
  }, [])

  useEffect(() => {
    if (!tutorialEnabled) return
    // Check if tutorial has been completed
    const completed = localStorage.getItem('tutorialCompleted')
    if (!completed) {
      // Wait a bit before showing tutorial
      const timer = setTimeout(() => setShowTutorial(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [tutorialEnabled])

  useEffect(() => {
    if (!showTutorial) {
      previousAuth.current = isAuthenticated
      return
    }

    if (!previousAuth.current && isAuthenticated) {
      handleComplete()
    }

    previousAuth.current = isAuthenticated
  }, [isAuthenticated, showTutorial])

  useEffect(() => {
    if (currentStep > tutorialSteps.length - 1) {
      setCurrentStep(0)
    }
  }, [currentStep, tutorialSteps.length])

  const preferredPlacement = useMemo(() => {
    const step = tutorialSteps[currentStep]
    return step?.position ?? 'top'
  }, [currentStep, tutorialSteps])

  const updatePositions = () => {
    if (!showTutorial || !tutorialEnabled) return

    const step = tutorialSteps[currentStep]
    if (!step) return

    const targetElement = document.querySelector(step.target)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current?.getBoundingClientRect() ?? {
      width: 320,
      height: 180,
    }
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 16

    const candidates: Array<{ placement: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number }> = [
      {
        placement: 'top',
        x: rect.left + rect.width / 2,
        y: rect.top - margin,
      },
      {
        placement: 'bottom',
        x: rect.left + rect.width / 2,
        y: rect.bottom + margin,
      },
      {
        placement: 'right',
        x: rect.right + margin,
        y: rect.top + rect.height / 2,
      },
      {
        placement: 'left',
        x: rect.left - margin,
        y: rect.top + rect.height / 2,
      },
    ]

    const orderedPlacements = [
      candidates.find((candidate) => candidate.placement === preferredPlacement),
      ...candidates.filter((candidate) => candidate.placement !== preferredPlacement),
    ].filter(Boolean) as Array<{ placement: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number }>

    if (isPhone && currentStep === 0) {
      setPlacement('top')
      setPosition({
        x: viewportWidth / 2,
        y: viewportHeight / 2 + tooltipRect.height / 2,
      })
      setSpotlight({
        left: Math.max(rect.left - 16, 8),
        top: Math.max(rect.top - 16, 8),
        width: rect.width + 32,
        height: rect.height + 32,
      })
      return
    }

    const fitsViewport = (candidate: { placement: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number }) => {
      let left = candidate.x - tooltipRect.width / 2
      let top = candidate.y - tooltipRect.height

      if (candidate.placement === 'bottom') {
        top = candidate.y
      }
      if (candidate.placement === 'left') {
        left = candidate.x - tooltipRect.width
        top = candidate.y - tooltipRect.height / 2
      }
      if (candidate.placement === 'right') {
        left = candidate.x
        top = candidate.y - tooltipRect.height / 2
      }

      return (
        left >= margin &&
        top >= margin &&
        left + tooltipRect.width <= viewportWidth - margin &&
        top + tooltipRect.height <= viewportHeight - margin
      )
    }

    const bestCandidate = orderedPlacements.find((candidate) => fitsViewport(candidate)) ?? orderedPlacements[0]

    setPlacement(bestCandidate.placement)
    setPosition({ x: bestCandidate.x, y: bestCandidate.y })
    setSpotlight({
      left: Math.max(rect.left - 16, 8),
      top: Math.max(rect.top - 16, 8),
      width: rect.width + 32,
      height: rect.height + 32,
    })
  }

  useLayoutEffect(() => {
    if (!showTutorial) return
    const handleUpdate = () => {
      updatePositions()
    }
    handleUpdate()
    window.addEventListener('resize', handleUpdate)
    window.addEventListener('scroll', handleUpdate, true)
    return () => {
      window.removeEventListener('resize', handleUpdate)
      window.removeEventListener('scroll', handleUpdate, true)
    }
  }, [currentStep, isAuthenticated, isPhone, showTutorial])

  useEffect(() => {
    if (!showTutorial) return
    const id = window.setTimeout(() => updatePositions(), 0)
    return () => window.clearTimeout(id)
  }, [showTutorial, currentStep, isAuthenticated, isPhone, tutorialEnabled])

  useEffect(() => {
    if (!showTutorial) return
    const step = tutorialSteps[currentStep]
    if (!step) return
    if (!document.querySelector(step.target)) {
      const nextIndex = tutorialSteps.findIndex((candidate, index) => {
        if (index <= currentStep) return false
        return Boolean(document.querySelector(candidate.target))
      })
      if (nextIndex !== -1) {
        setCurrentStep(nextIndex)
      } else {
        handleComplete()
      }
    }
  }, [showTutorial, currentStep, tutorialSteps])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSelectStep = (index: number) => {
    setCurrentStep(index)
    setShowMenu(false)
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setShowTutorial(false)
    localStorage.setItem('tutorialCompleted', 'true')
  }

  if (!showTutorial || !tutorialEnabled) return null
  if (typeof document === 'undefined') return null

  const step = tutorialSteps[currentStep]

  return createPortal(
    <AnimatePresence>
      {showTutorial && step && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/45 z-[90] pointer-events-none" />
          
          {/* Spotlight on target */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[95] pointer-events-none"
            style={{
              left: spotlight.left,
              top: spotlight.top,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 25px rgba(99, 102, 241, 0.35)',
              borderRadius: '20px',
            }}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            ref={tooltipRef}
            className="fixed z-[100] w-[min(90vw,360px)] rounded-2xl border border-white/10 bg-card/80 p-4 text-foreground shadow-[0_0_30px_rgba(99,102,241,0.25)] backdrop-blur-md"
            style={{
              left: position.x,
              top: position.y,
              transform:
                placement === 'top'
                  ? 'translate(-50%, -100%)'
                  : placement === 'bottom'
                    ? 'translate(-50%, 0)'
                    : placement === 'left'
                      ? 'translate(-100%, -50%)'
                      : 'translate(0, -50%)',
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
            {!isAuthenticated && currentStep === 0 && (
              <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Sign in to save progress and sync across devices.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    window.location.href = 'https://www.alphastocks.ai/?proTools=1'
                  }}
                >
                  Sign in to save
                </Button>
              </div>
            )}

            {showMenu && (
              <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  All scenes
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {tutorialSteps.map((tutorialStep, index) => (
                    <button
                      key={tutorialStep.title}
                      type="button"
                      onClick={() => handleSelectStep(index)}
                      className={`w-full rounded-md px-2 py-1 text-left text-sm transition hover:bg-white/10 ${
                        index === currentStep ? 'text-accent' : 'text-foreground/80'
                      }`}
                    >
                      {tutorialStep.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {tutorialSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === currentStep ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowMenu((prev) => !prev)}
                >
                  All
                </Button>
                <Button size="sm" variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  , document.body)
}
