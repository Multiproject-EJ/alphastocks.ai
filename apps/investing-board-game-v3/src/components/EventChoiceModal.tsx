import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import type { EventTileOption } from '@/lib/eventTiles'

interface EventChoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  icon: string
  options: EventTileOption[]
  onSelect: (option: EventTileOption) => void
}

export function EventChoiceModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  options,
  onSelect,
}: EventChoiceModalProps) {
  const dialogClass = useResponsiveDialogClass('small')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-indigo-500/40 shadow-[0_0_40px_oklch(0.55_0.12_250_/_0.35)]`}>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-indigo-200 flex items-center gap-2">
            <span className="text-3xl">{icon}</span>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-foreground/80 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              onClick={() => {
                onSelect(option)
                onOpenChange(false)
              }}
              className="w-full h-auto py-3 px-4 border-indigo-400/30 bg-slate-900/60 hover:bg-indigo-900/40 text-left flex items-start gap-3"
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="flex-1 space-y-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {option.title}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-indigo-200 bg-indigo-500/20 border border-indigo-400/40 px-2 py-0.5 rounded-full">
                    {option.rewardPreview}
                  </span>
                </span>
                <span className="block text-xs sm:text-sm text-foreground/70">
                  {option.description}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
