import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star } from '@phosphor-icons/react'
import { ThriftyChallenge } from '@/lib/types'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { ThriftPathStatus as ThriftPathStatusType } from '@/lib/thriftPath'

interface ThriftyPathModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challenges: ThriftyChallenge[]
  onChoose: (challenge: ThriftyChallenge) => void
  thriftPathStatus?: ThriftPathStatusType
}

export function ThriftyPathModal({
  open,
  onOpenChange,
  challenges,
  onChoose,
  thriftPathStatus,
}: ThriftyPathModalProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<ThriftyChallenge | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleChoose = (challenge: ThriftyChallenge) => {
    setSelectedChallenge(challenge)
    setShowCelebration(true)
    timerRef.current = setTimeout(() => {
      onChoose(challenge)
      onOpenChange(false)
      setShowCelebration(false)
      setSelectedChallenge(null)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            🌿 Thrifty Path Opportunity
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            Complete challenges to earn Thrift Path XP and unlock persistent benefits!
          </DialogDescription>
          
          {thriftPathStatus?.active && (
            <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-sm text-green-400">
                Level {thriftPathStatus.level} • {thriftPathStatus.experience} XP
              </div>
              <div className="text-xs text-muted-foreground">
                Active benefits: +{((thriftPathStatus.benefits.starMultiplier - 1) * 100).toFixed(0)}% stars
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="grid gap-2.5 py-4">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="p-3 bg-background/50 border-2 border-border hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1 text-sm">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{challenge.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-accent font-bold text-sm">
                    <Star size={14} weight="fill" />
                    +{challenge.reward}
                  </div>
                  <Button
                    onClick={() => handleChoose(challenge)}
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-7 px-3 text-xs"
                  >
                    Choose
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
          Skip
        </Button>
      </DialogContent>
    </Dialog>
  )
}