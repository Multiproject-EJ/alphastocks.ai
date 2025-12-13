import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventText: string
}

export function EventModal({ open, onOpenChange, eventText }: EventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-purple-500/50 shadow-[0_0_40px_oklch(0.6_0.2_280_/_0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400">Market Event</DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-4 leading-relaxed">
            {eventText}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full bg-purple-500 hover:bg-purple-600 text-white" size="lg">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}