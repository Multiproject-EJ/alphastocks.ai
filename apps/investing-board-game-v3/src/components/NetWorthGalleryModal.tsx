import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NET_WORTH_TIERS } from '@/lib/netWorthTiers'
import { useNetWorthTier } from '@/hooks/useNetWorthTier'
import { TierCard } from '@/components/TierCard'

interface NetWorthGalleryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNetWorth: number
}

export function NetWorthGalleryModal({ open, onOpenChange, currentNetWorth }: NetWorthGalleryModalProps) {
  const dialogClass = useResponsiveDialogClass('large')
  const { currentTier, nextTier, progress } = useNetWorthTier(currentNetWorth)
  const [expandedTier, setExpandedTier] = useState<number | null>(currentTier.tier)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} max-h-[80vh] overflow-hidden bg-card/95 backdrop-blur-xl`}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-accent flex items-center gap-3">
            <span className="text-4xl">{currentTier.icon}</span>
            Net Worth Gallery
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Your Prestige: <span className="text-accent font-semibold">{currentTier.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Net Worth: ${currentNetWorth.toLocaleString()}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {NET_WORTH_TIERS.map((tier) => (
              <TierCard
                key={tier.tier}
                tier={tier}
                isUnlocked={currentNetWorth >= tier.minNetWorth}
                isCurrent={tier.tier === currentTier.tier}
                isExpanded={expandedTier === tier.tier}
                onToggleExpand={() => setExpandedTier(expandedTier === tier.tier ? null : tier.tier)}
                progress={tier.tier === currentTier.tier ? progress : undefined}
              />
            ))}
          </div>
        </ScrollArea>
        
        <div className="border-t border-border pt-4 space-y-2">
          {nextTier && (
            <div className="text-sm text-muted-foreground">
              Next: <span className="text-foreground font-semibold">{nextTier.name}</span> at ${nextTier.minNetWorth.toLocaleString()}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {NET_WORTH_TIERS.filter(t => currentNetWorth >= t.minNetWorth).length} / {NET_WORTH_TIERS.length} Tiers Unlocked
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
