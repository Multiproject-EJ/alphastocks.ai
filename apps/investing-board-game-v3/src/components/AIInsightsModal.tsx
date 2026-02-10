import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { AI_INSIGHTS_FIXTURES, AI_INSIGHTS_SURFACE } from '@/lib/aiInsightsFixtures'
import { Sparkle } from '@phosphor-icons/react'

interface AIInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIInsightsModal({ open, onOpenChange }: AIInsightsModalProps) {
  const dialogClass = useResponsiveDialogClass('medium')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-accent/30 shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-accent">{AI_INSIGHTS_SURFACE.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
            <div className="flex items-start gap-2">
              <Sparkle size={18} className="mt-0.5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">{AI_INSIGHTS_SURFACE.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{AI_INSIGHTS_SURFACE.disclaimer}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {AI_INSIGHTS_FIXTURES.map((insight) => (
              <div key={insight.id} className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{insight.symbol}</p>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                    {insight.horizon}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-foreground">{insight.headline}</p>
                <p className="mt-1 text-xs text-muted-foreground">{insight.summary}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                  <span>{new Date(insight.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" disabled>
            {AI_INSIGHTS_SURFACE.ctaLabel} (provider wiring next)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
