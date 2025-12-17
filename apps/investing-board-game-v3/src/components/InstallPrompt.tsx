import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X } from '@phosphor-icons/react'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt if not previously dismissed
      const dismissed = localStorage.getItem('installPromptDismissed')
      const dismissedTime = localStorage.getItem('installPromptDismissedTime')
      
      // Reset dismissal after 7 days
      if (dismissed && dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed > 7) {
          localStorage.removeItem('installPromptDismissed')
          localStorage.removeItem('installPromptDismissedTime')
        }
      }
      
      if (!dismissed) {
        setShowPrompt(true)
      }
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  
  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('App installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }
  
  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
    localStorage.setItem('installPromptDismissedTime', Date.now().toString())
  }
  
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 p-4 bg-card border-2 border-accent/30 rounded-lg shadow-xl z-50 backdrop-blur-md"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="text-3xl">📱</div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Install Board Game</p>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for the best experience!
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  Install
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Later
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
