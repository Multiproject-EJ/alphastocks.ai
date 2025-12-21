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
  const { success, error } = useHaptics();

  const handleClick = () => {
    if (!canAfford) {
      error();  // Haptic feedback for can't afford
      return;
    }
    success();  // Haptic feedback for purchase
    onBuy();
  };

  return (
    <div
      className={cn(
        'shop-item flex flex-col items-center p-4 rounded-xl border-2',
        'transition-all duration-200',
        'touch-target touch-feedback',
        canAfford 
          ? 'bg-card border-border hover:border-primary' 
          : 'bg-muted/50 border-muted opacity-60',
        isPurchasing && 'scale-95 animate-pulse',
      )}
    >
      {/* Icon */}
      <div className="text-4xl mb-2">{item.icon}</div>
      
      {/* Name */}
      <div className="font-semibold text-sm text-center">{item.name}</div>
      
      {/* Description */}
      <div className="text-xs text-muted-foreground text-center mt-1">
        {item.description}
      </div>
      
      {/* Price & Buy Button */}
      <button
        onClick={handleClick}
        disabled={!canAfford || isPurchasing}
        className={cn(
          'mt-3 w-full py-2 px-4 rounded-lg font-bold text-sm',
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
