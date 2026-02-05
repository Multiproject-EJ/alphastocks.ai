import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { ScratchcardGame } from '@/components/ScratchcardGame'
import type { ScratchcardTierId } from '@/lib/scratchcardTiers'

interface CasinoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWin?: (amount: number) => void
  luckBoost?: number
  tierId?: ScratchcardTierId
}

export function CasinoModal({ open, onOpenChange, onWin, luckBoost, tierId }: CasinoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 shadow-none max-w-[calc(100vw-2rem)] sm:max-w-md p-0">
        <ScratchcardGame
          onWin={onWin}
          onClose={() => onOpenChange(false)}
          luckBoost={luckBoost}
          tierId={tierId}
        />
      </DialogContent>
    </Dialog>
  )
}
