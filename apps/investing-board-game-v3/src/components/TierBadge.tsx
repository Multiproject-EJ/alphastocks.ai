import { NetWorthTier } from '@/lib/netWorthTiers'
import { cn } from '@/lib/utils'

interface TierBadgeProps {
  tier: NetWorthTier
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function TierBadge({ tier, size = 'md', showName = true }: TierBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border-2",
        sizeClasses[size]
      )}
      style={{
        borderColor: tier.color,
        backgroundColor: `${tier.color}20`,
        color: tier.color
      }}
    >
      <span>{tier.icon}</span>
      {showName && <span>{tier.name}</span>}
    </div>
  )
}
