import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NetWorthTier } from '@/lib/netWorthTiers'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { useSound } from '@/hooks/useSound'
import { useHaptics } from '@/hooks/useHaptics'
import { Check } from '@phosphor-icons/react'

interface TierUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tier: NetWorthTier
}

export function TierUpModal({ open, onOpenChange, tier }: TierUpModalProps) {
  const { play: playSound } = useSound()
  const { celebration: hapticCelebration } = useHaptics()
  
  useEffect(() => {
    if (open) {
      playSound('celebration')
      hapticCelebration()
    }
  }, [open, playSound, hapticCelebration])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-card to-background border-2 border-accent/50 shadow-2xl">
        <CelebrationEffect show={open} level={tier.particleEffect as any || 'epic'} />
        
        <div className="text-center space-y-6 py-8">
          {/* Icon */}
          <motion.div
            className="text-9xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {tier.icon}
          </motion.div>
          
          {/* Title */}
          <div className="space-y-2">
            <motion.h2
              className="text-4xl font-bold text-accent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              TIER UP!
            </motion.h2>
            <motion.p
              className="text-2xl font-semibold"
              style={{ color: tier.color }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              You are now a {tier.name}
            </motion.p>
          </div>
          
          {/* Description */}
          <motion.p
            className="text-sm text-muted-foreground italic max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            "{tier.description}"
          </motion.p>
          
          {/* Unlocks preview */}
          <motion.div
            className="bg-card/50 rounded-lg p-4 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-accent">New Unlocks:</h3>
            <ul className="space-y-1 text-xs text-left">
              {tier.unlocks.slice(0, 3).map((unlock, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={14} className="text-green-500 mt-0.5" />
                  {unlock}
                </li>
              ))}
              {tier.unlocks.length > 3 && (
                <li className="text-muted-foreground">
                  +{tier.unlocks.length - 3} more...
                </li>
              )}
            </ul>
          </motion.div>
          
          {/* CTA */}
          <Button
            size="lg"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
