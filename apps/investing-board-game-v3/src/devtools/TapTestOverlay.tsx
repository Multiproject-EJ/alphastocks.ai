import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, XCircle } from '@phosphor-icons/react'

interface TapIndicator {
  id: number
  x: number
  y: number
  timestamp: number
  targetElement?: string
}

interface TouchTargetStats {
  total: number
  compliant: number
  nonCompliant: number
}

/**
 * TapTestOverlay - Visual overlay for testing touch targets
 * 
 * Features:
 * - Shows visual feedback for all taps
 * - Highlights touch targets under 44x44px
 * - Displays real-time statistics
 * - Color codes elements by compliance
 */
export function TapTestOverlay() {
  const [isActive, setIsActive] = useState(false)
  const [tapIndicators, setTapIndicators] = useState<TapIndicator[]>([])
  const [highlightedElements, setHighlightedElements] = useState<Set<Element>>(new Set())
  const [stats, setStats] = useState<TouchTargetStats>({ total: 0, compliant: 0, nonCompliant: 0 })
  const nextIdRef = useRef(0)

  // Minimum touch target size (44x44px per Apple/Android guidelines)
  const MIN_TOUCH_SIZE = 44

  // Check if an element meets minimum touch target requirements
  const checkTouchTarget = (element: Element): boolean => {
    const rect = element.getBoundingClientRect()
    return rect.width >= MIN_TOUCH_SIZE && rect.height >= MIN_TOUCH_SIZE
  }

  // Get a readable identifier for an element
  const getElementIdentifier = (element: Element): string => {
    const tag = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : ''
    const ariaLabel = element.getAttribute('aria-label') ? `[${element.getAttribute('aria-label')}]` : ''
    
    return `${tag}${id}${classes}${ariaLabel}`.slice(0, 50)
  }

  // Find the interactive element at the tap position
  const findInteractiveElement = (x: number, y: number): Element | null => {
    const elements = document.elementsFromPoint(x, y)
    
    for (const element of elements) {
      // Check if element is interactive
      const isInteractive = 
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.getAttribute('role') === 'button' ||
        element.getAttribute('onclick') !== null ||
        element.classList.contains('touch-target') ||
        window.getComputedStyle(element).cursor === 'pointer'
      
      if (isInteractive) {
        return element
      }
    }
    
    return null
  }

  // Handle tap/touch events
  const handleTap = (e: TouchEvent | MouseEvent) => {
    if (!isActive) return

    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY

    const interactiveElement = findInteractiveElement(x, y)

    // Add tap indicator
    const indicator: TapIndicator = {
      id: nextIdRef.current++,
      x,
      y,
      timestamp: Date.now(),
      targetElement: interactiveElement ? getElementIdentifier(interactiveElement) : undefined,
    }

    setTapIndicators((prev) => [...prev, indicator])

    // Highlight the element
    if (interactiveElement) {
      setHighlightedElements((prev) => new Set(prev).add(interactiveElement))
      
      // Update stats
      const isCompliant = checkTouchTarget(interactiveElement)
      setStats((prev) => ({
        total: prev.total + 1,
        compliant: prev.compliant + (isCompliant ? 1 : 0),
        nonCompliant: prev.nonCompliant + (isCompliant ? 0 : 1),
      }))
    }

    // Remove indicator after animation
    setTimeout(() => {
      setTapIndicators((prev) => prev.filter((ind) => ind.id !== indicator.id))
    }, 1000)
  }

  // Scan all interactive elements on the page
  const scanAllElements = () => {
    const interactiveSelectors = [
      'button',
      'a',
      '[role="button"]',
      '[onclick]',
      '.touch-target',
      'input[type="button"]',
      'input[type="submit"]',
      '[tabindex]:not([tabindex="-1"])',
    ]

    const elements = document.querySelectorAll(interactiveSelectors.join(','))
    const newHighlighted = new Set<Element>()
    let compliant = 0
    let nonCompliant = 0

    elements.forEach((element) => {
      // Skip hidden elements
      const style = window.getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') return

      newHighlighted.add(element)
      if (checkTouchTarget(element)) {
        compliant++
      } else {
        nonCompliant++
      }
    })

    setHighlightedElements(newHighlighted)
    setStats({ total: compliant + nonCompliant, compliant, nonCompliant })
  }

  // Add visual overlays to highlighted elements
  useEffect(() => {
    if (!isActive) return

    const overlays: HTMLDivElement[] = []

    highlightedElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const isCompliant = checkTouchTarget(element)

      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.left = `${rect.left}px`
      overlay.style.top = `${rect.top}px`
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
      overlay.style.border = `2px solid ${isCompliant ? '#10b981' : '#ef4444'}`
      overlay.style.backgroundColor = isCompliant ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
      overlay.style.pointerEvents = 'none'
      overlay.style.zIndex = '9998'
      overlay.style.borderRadius = '4px'
      overlay.style.boxSizing = 'border-box'

      // Add size label
      const label = document.createElement('div')
      label.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}px`
      label.style.position = 'absolute'
      label.style.top = '-20px'
      label.style.left = '0'
      label.style.backgroundColor = isCompliant ? '#10b981' : '#ef4444'
      label.style.color = 'white'
      label.style.padding = '2px 6px'
      label.style.borderRadius = '3px'
      label.style.fontSize = '10px'
      label.style.fontWeight = 'bold'
      label.style.whiteSpace = 'nowrap'
      overlay.appendChild(label)

      document.body.appendChild(overlay)
      overlays.push(overlay)
    })

    return () => {
      overlays.forEach((overlay) => overlay.remove())
    }
  }, [isActive, highlightedElements])

  // Attach/detach event listeners
  useEffect(() => {
    if (!isActive) {
      setTapIndicators([])
      setHighlightedElements(new Set())
      setStats({ total: 0, compliant: 0, nonCompliant: 0 })
      return
    }

    // Scan on activation
    scanAllElements()

    // Listen for taps
    document.addEventListener('touchstart', handleTap, { passive: true })
    document.addEventListener('mousedown', handleTap, { passive: true })

    // Rescan on window resize
    const handleResize = () => scanAllElements()
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('touchstart', handleTap)
      document.removeEventListener('mousedown', handleTap)
      window.removeEventListener('resize', handleResize)
    }
  }, [isActive])

  // Keyboard shortcut to toggle (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setIsActive((prev) => !prev)
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsActive((prev) => !prev)}
        className={`fixed bottom-24 right-4 z-[9999] rounded-full shadow-lg ${
          isActive ? 'bg-accent text-accent-foreground' : 'bg-card/90 backdrop-blur'
        }`}
        size="icon"
        title="Toggle Tap Test Overlay (Ctrl+Shift+T)"
      >
        {isActive ? '👆' : '🔍'}
      </Button>

      {/* Stats Panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 right-4 z-[9999] bg-card/95 backdrop-blur-md border border-accent/30 rounded-lg p-4 shadow-xl min-w-[240px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Touch Target Test</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsActive(false)}
                className="h-6 w-6"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Elements:</span>
                <span className="font-bold text-foreground">{stats.total}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" />
                  Compliant (≥44px):
                </span>
                <span className="font-bold text-green-500">{stats.compliant}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle size={14} weight="fill" />
                  Non-compliant:
                </span>
                <span className="font-bold text-red-500">{stats.nonCompliant}</span>
              </div>

              <div className="pt-2 mt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Compliance:</span>
                  <span className={`font-bold ${stats.total > 0 && (stats.compliant / stats.total) >= 0.9 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Green = Compliant (≥44×44px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Red = Non-compliant (&lt;44×44px)</span>
              </div>
            </div>

            <Button
              onClick={scanAllElements}
              className="w-full mt-3"
              size="sm"
              variant="outline"
            >
              Rescan Elements
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Indicators */}
      <AnimatePresence>
        {tapIndicators.map((indicator) => (
          <motion.div
            key={indicator.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed w-8 h-8 rounded-full border-4 border-accent pointer-events-none z-[9999]"
            style={{
              left: indicator.x - 16,
              top: indicator.y - 16,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  )
}
