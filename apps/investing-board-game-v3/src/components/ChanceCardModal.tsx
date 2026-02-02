import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'

interface ChanceCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDraw: () => void
}

export function ChanceCardModal({ open, onOpenChange, onDraw }: ChanceCardModalProps) {
  const dialogClass = useResponsiveDialogClass('small')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-sky-500/50 shadow-[0_0_40px_oklch(0.6_0.2_240_/_0.3)]`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-300">Chance Card</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center gap-4">
          <img
            src={`${import.meta.env.BASE_URL}Chance.webp`}
            alt="Chance card"
            className="w-full max-w-[220px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
          />
          <p className="text-sm text-muted-foreground text-center">
            Flip the card to see if you hit the jackpot lift or snag an executive perk.
          </p>
        </div>

        <div className="pt-4 flex gap-2">
          <Button onClick={onDraw} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white" size="lg">
            Draw Chance
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" size="lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
