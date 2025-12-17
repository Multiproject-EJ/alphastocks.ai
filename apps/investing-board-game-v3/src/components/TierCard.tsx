import { motion, AnimatePresence } from 'framer-motion'
import { NetWorthTier } from '@/lib/netWorthTiers'
import { Badge } from '@/components/ui/badge'
import { Lock, CaretDown, Check, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TierCardProps {
  tier: NetWorthTier
  isUnlocked: boolean
  isCurrent: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  progress?: number // 0-1 if showing progress to next tier
}

export function TierCard({ tier, isUnlocked, isCurrent, isExpanded, onToggleExpand, progress }: TierCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl p-4 border-2 cursor-pointer transition-all",
        isCurrent && "ring-4 ring-accent/50 shadow-lg shadow-accent/20",
        isUnlocked ? "bg-card/80 backdrop-blur-sm" : "bg-card/30 opacity-50 grayscale",
      )}
      style={{ borderColor: isUnlocked ? tier.color : '#64748B' }}
      onClick={onToggleExpand}
      whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{tier.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold" style={{ color: tier.color }}>
                {tier.name}
              </h3>
              {isCurrent && (
                <Badge className="bg-accent text-accent-foreground">CURRENT</Badge>
              )}
              {!isUnlocked && (
                <Lock size={16} className="text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tier {tier.tier} • ${tier.minNetWorth.toLocaleString()} Net Worth
            </p>
          </div>
        </div>
        <CaretDown
          size={20}
          className={cn(
            "text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mt-2 italic">
        "{tier.description}"
      </p>
      
      {/* Progress bar (only for current tier) */}
      {isCurrent && progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress to next tier</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tier.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3 border-t border-border pt-3"
          >
            {/* Unlocks */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">🔓 Unlocks:</h4>
              <ul className="space-y-1">
                {tier.unlocks.map((unlock, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {unlock}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Benefits */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">✨ Benefits:</h4>
              <ul className="space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <Sparkle size={14} className="text-accent mt-0.5 flex-shrink-0" />
                    {benefit.description}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
