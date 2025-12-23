import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WildcardEvent } from '@/lib/types'
import { CASH_PERCENTAGE_PENALTY } from '@/lib/wildcardEvents'
import { CelebrationEffect } from '@/components/CelebrationEffect'

interface WildcardEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: WildcardEvent
  onContinue: (event: WildcardEvent) => void
}

// Helper function to determine if event is positive
const isPositiveEvent = (event: WildcardEvent): boolean => {
  return event.type === 'cash' || 
         event.type === 'stars' || 
         (event.type === 'mixed' && (event.effect.cash || 0) > 0)
}

// Helper function to determine if event is a penalty
const isPenaltyEvent = (event: WildcardEvent): boolean => {
  return event.type === 'penalty'
}

export function WildcardEventModal({
  open,
  onOpenChange,
  event,
  onContinue,
}: WildcardEventModalProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  const handleContinue = () => {
    // Show celebration for positive events
    if (isPositiveEvent(event)) {
      setShowCelebration(true)
      setTimeout(() => {
        onContinue(event)
        onOpenChange(false)
        setShowCelebration(false)
      }, 500)
    } else {
      onContinue(event)
      onOpenChange(false)
    }
  }

  const getEffectDisplay = () => {
    const parts: string[] = []
    
    if (event.effect.cash !== undefined) {
      if (event.effect.cash === CASH_PERCENTAGE_PENALTY) {
        parts.push('💵 -10% Cash')
      } else {
        const sign = event.effect.cash > 0 ? '+' : ''
        parts.push(`💵 ${sign}$${Math.abs(event.effect.cash).toLocaleString()}`)
      }
    }
    
    if (event.effect.stars !== undefined) {
      const sign = event.effect.stars > 0 ? '+' : ''
      parts.push(`⭐ ${sign}${event.effect.stars}`)
    }
    
    if (event.effect.teleportTo !== undefined) {
      parts.push(`🎯 Jump to Tile ${event.effect.teleportTo}`)
    }
    
    return parts
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
            <span className="text-3xl sm:text-4xl">{event.icon}</span>
            <span>{event.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-foreground/80 mt-2">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Effect Preview */}
          <div className={`p-4 rounded-lg border-2 ${
            isPositiveEvent(event) ? 'bg-green-500/10 border-green-500/30' :
            isPenaltyEvent(event) ? 'bg-red-500/10 border-red-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          }`}>
            <div className="text-xs sm:text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Effect:
            </div>
            <div className="space-y-1">
              {getEffectDisplay().map((effect, index) => (
                <div key={index} className={`text-base sm:text-lg font-bold ${
                  isPositiveEvent(event) ? 'text-green-400' :
                  isPenaltyEvent(event) ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {effect}
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-10 sm:h-11 text-sm sm:text-base font-semibold"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
