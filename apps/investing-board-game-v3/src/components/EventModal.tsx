import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { COIN_COSTS } from '@/lib/coins'

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventText: string
  // Coin-related props
  coins?: number
  canAffordSkip?: boolean
  onSkip?: () => void
}

export function EventModal({ open, onOpenChange, eventText, coins, canAffordSkip, onSkip }: EventModalProps) {
  const dialogClass = useResponsiveDialogClass('small')
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-purple-500/50 shadow-[0_0_40px_oklch(0.6_0.2_280_/_0.3)]`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400">Market Event</DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-4 leading-relaxed">
            {eventText}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 flex gap-2">
          <Button onClick={() => onOpenChange(false)} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white" size="lg">
            OK
          </Button>
          
          {/* Skip Button */}
          {onSkip && coins !== undefined && (
            <Button 
              onClick={() => {
                if (onSkip()) {
                  onOpenChange(false)
                }
              }}
              disabled={!canAffordSkip}
              variant="outline"
              size="lg"
            >
              Skip ({COIN_COSTS.skip_event} 🪙)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}