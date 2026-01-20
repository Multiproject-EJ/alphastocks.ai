import { useState } from 'react';
import { ShopTabs } from './ShopTabs';
import { ShopItem } from './ShopItem';
import { PropertyVault } from './PropertyVault';
import { usePurchase } from '@/hooks/usePurchase';
import { SHOP_ITEMS, ShopCategory } from '@/lib/shopItems';

interface MobileShopProps {
  cash: number;
  onPurchase: (itemId: string, cost: number) => void;
}

export function MobileShop({ cash, onPurchase }: MobileShopProps) {
  const [activeTab, setActiveTab] = useState<ShopCategory>('utilities');
  const { purchase, isPurchasing } = usePurchase();

  const items = SHOP_ITEMS.filter(item => item.category === activeTab);

  const handleBuy = async (itemId: string, cost: number) => {
    if (cash < cost) return;
    
    const success = await purchase(itemId, cost);
    if (success) {
      onPurchase(itemId, cost);
    }
  };

  return (
    <div className="mobile-shop flex flex-col h-full">
      {/* Header with balance */}
      <div className="shop-header flex items-center justify-between px-3 py-2 border-b">
        <h1 className="text-lg font-bold">🛒 Shop</h1>
        <div className="text-sm font-semibold text-green-500">${cash.toLocaleString()}</div>
      </div>

      {/* Swipeable category tabs */}
      <ShopTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Item grid - 2 columns */}
      <div className="shop-grid flex-1 overflow-y-auto p-3">
        {activeTab === 'utilities' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {items.map((item) => (
              <ShopItem
                key={item.id}
                item={item}
                canAfford={cash >= item.price}
                onBuy={() => handleBuy(item.id, item.price)}
                isPurchasing={isPurchasing === item.id}
              />
            ))}
          </div>
        ) : (
          <PropertyVault
            cash={cash}
            isPurchasing={isPurchasing}
            onBuy={handleBuy}
          />
        )}
      </div>

      {/* Footer info */}
      <div className="shop-footer px-4 py-2 text-center text-sm text-muted-foreground border-t">
        Buy unlimited items — no daily limits!
      </div>
    </div>
  );
}
