import { ShopItemData } from '@/lib/shopItems';
import { cn } from '@/lib/utils';

interface PurchaseConfirmProps {
  item: ShopItemData;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPurchasing: boolean;
}

export function PurchaseConfirm({ 
  item, 
  isOpen, 
  onConfirm, 
  onCancel,
  isPurchasing 
}: PurchaseConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl p-6 w-full max-w-xs shadow-xl">
        <div className="text-center">
          <div className="text-5xl mb-3">{item.icon}</div>
          <h2 className="text-xl font-bold mb-1">{item.name}</h2>
          <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
          
          <div className="text-2xl font-bold text-green-500 mb-4">
            ${item.price.toLocaleString()}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isPurchasing}
              className="flex-1 py-3 px-4 rounded-xl border font-medium touch-target"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPurchasing}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-bold touch-target',
                'bg-primary text-primary-foreground',
                isPurchasing && 'opacity-50',
              )}
            >
              {isPurchasing ? 'Buying...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
