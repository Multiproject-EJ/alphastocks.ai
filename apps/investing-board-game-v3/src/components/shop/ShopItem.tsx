import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { ShopItemData } from '@/lib/shopItems';

interface ShopItemProps {
  item: ShopItemData;
  canAfford: boolean;
  onBuy: () => void;
  isPurchasing: boolean;
}

export function ShopItem({ item, canAfford, onBuy, isPurchasing }: ShopItemProps) {
  const { error } = useHaptics();

  const handleClick = () => {
    if (!canAfford) {
      error();  // Haptic feedback for can't afford
      return;
    }
    // Success haptic will be triggered by the purchase hook after successful purchase
    onBuy();
  };

  return (
    <div
      className={cn(
        'shop-item flex flex-col items-center p-3 rounded-xl border-2',
        'transition-all duration-200',
        'touch-target touch-feedback',
        canAfford 
          ? 'bg-card border-border hover:border-primary' 
          : 'bg-muted/50 border-muted opacity-60',
        isPurchasing && 'scale-95 animate-pulse',
      )}
    >
      {/* Icon */}
      <div className="text-3xl mb-1.5">{item.icon}</div>
      
      {/* Name */}
      <div className="text-xs font-semibold text-center">{item.name}</div>
      
      {/* Description */}
      <div className="mt-1 text-[11px] text-muted-foreground text-center">
        {item.description}
      </div>
      
      {/* Price & Buy Button */}
      <button
        onClick={handleClick}
        disabled={!canAfford || isPurchasing}
        className={cn(
          'mt-2.5 w-full rounded-lg px-3 py-1.5 text-xs font-bold',
          'transition-colors',
          'touch-target',
          canAfford
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed',
        )}
      >
        {isPurchasing ? '...' : `$${item.price.toLocaleString()}`}
      </button>
    </div>
  );
}
