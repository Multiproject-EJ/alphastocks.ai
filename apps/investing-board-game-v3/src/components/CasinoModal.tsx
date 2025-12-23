import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { ScratchcardGame } from '@/components/ScratchcardGame'

interface CasinoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWin?: (amount: number) => void
  luckBoost?: number
}

export function CasinoModal({ open, onOpenChange, onWin, luckBoost }: CasinoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[calc(100vw-2rem)] sm:max-w-md p-0">
        <ScratchcardGame
          onWin={onWin}
          onClose={() => onOpenChange(false)}
          luckBoost={luckBoost}
        />
      </DialogContent>
    </Dialog>
  )
}
