import { cn } from '@/lib/utils'

export type TileLabelTone = 'default' | 'accent' | 'premium' | 'success' | 'warning'

const TONE_STYLES: Record<TileLabelTone, string> = {
  default: 'bg-slate-900/80 border-white/15 text-slate-100',
  accent: 'bg-sky-900/80 border-sky-300/40 text-sky-100',
  premium: 'bg-amber-900/80 border-amber-300/50 text-amber-100',
  success: 'bg-emerald-900/80 border-emerald-300/45 text-emerald-100',
  warning: 'bg-rose-900/80 border-rose-300/45 text-rose-100',
}

interface TileLabelProps {
  label: string
  icon?: string
  sublabel?: string
  tone?: TileLabelTone
  className?: string
}

export const TileLabel = ({ label, icon, sublabel, tone = 'default', className }: TileLabelProps) => {
  const hasSubLabel = Boolean(sublabel)

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] shadow-[0_8px_18px_rgba(0,0,0,0.4)] backdrop-blur-sm',
        hasSubLabel ? 'flex-col gap-0.5' : 'items-center gap-1',
        TONE_STYLES[tone],
        className
      )}
    >
      {icon && <span className="text-[10px] leading-none">{icon}</span>}
      <span className="leading-none">{label}</span>
      {sublabel && (
        <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/70">
          {sublabel}
        </span>
      )}
    </div>
  )
}
