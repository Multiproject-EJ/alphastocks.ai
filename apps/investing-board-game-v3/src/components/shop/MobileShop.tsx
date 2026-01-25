import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { ShopTabs } from './ShopTabs';
import { ShopItem } from './ShopItem';
import { PropertyVault } from './PropertyVault';
import { usePurchase } from '@/hooks/usePurchase';
import { PROPERTY_VAULT_ITEMS, SHOP_ITEMS, ShopCategory } from '@/lib/shopItems';

interface MobileShopProps {
  cash: number;
  onPurchase: (itemId: string, cost: number) => void;
  onClose?: () => void;
}

export function MobileShop({ cash, onPurchase, onClose }: MobileShopProps) {
  const [activeTab, setActiveTab] = useState<ShopCategory>('utilities');
  const [pageIndex, setPageIndex] = useState(0);
  const { purchase, isPurchasing } = usePurchase();

  const pageSize = 6;
  const utilityItems = SHOP_ITEMS.filter(item => item.category === 'utilities');
  const vaultItems = PROPERTY_VAULT_ITEMS;
  const totalItems = activeTab === 'utilities' ? utilityItems : vaultItems;
  const totalPages = Math.max(1, Math.ceil(totalItems.length / pageSize));
  const utilityPageItems = utilityItems.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );
  const vaultPageItems = vaultItems.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );

  const handleBuy = async (itemId: string, cost: number) => {
    if (cash < cost) return;
    
    const success = await purchase(itemId, cost);
    if (success) {
      onPurchase(itemId, cost);
    }
  };

  const handleTabChange = (tab: ShopCategory) => {
    setActiveTab(tab);
    setPageIndex(0);
  };

  useEffect(() => {
    setPageIndex((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const paginationControls = (
    <div className="flex items-center justify-between rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
      <button
        type="button"
        onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
        disabled={pageIndex === 0}
        className="rounded-full px-2.5 py-1 text-xs font-semibold text-foreground transition disabled:cursor-not-allowed disabled:text-muted-foreground"
      >
        ← Prev
      </button>
      <span>
        Page {pageIndex + 1} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
        disabled={pageIndex >= totalPages - 1}
        className="rounded-full px-2.5 py-1 text-xs font-semibold text-foreground transition disabled:cursor-not-allowed disabled:text-muted-foreground"
      >
        Next →
      </button>
    </div>
  );

  return (
    <div className="mobile-shop flex flex-col h-full pt-[calc(env(safe-area-inset-top)+0.5rem)]">
      {/* Header with balance */}
      <div className="shop-header flex items-center justify-between px-3 py-2 border-b">
        <h1 className="text-lg font-bold">🛒 Shop</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-green-500">${cash.toLocaleString()}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shop"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-sm transition hover:bg-accent/20 touch-target"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Swipeable category tabs */}
      <ShopTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Item grid - 2 columns */}
      <div className="shop-grid flex-1 overflow-y-auto p-3">
        {activeTab === 'utilities' ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fresh picks</p>
                <p className="text-sm font-semibold">Limited drops ready to grab</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-accent/20"
              >
                🏆 Trophy Shop
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {utilityPageItems.map((item) => (
                <ShopItem
                  key={item.id}
                  item={item}
                  canAfford={cash >= item.price}
                  onBuy={() => handleBuy(item.id, item.price)}
                  isPurchasing={isPurchasing === item.id}
                />
              ))}
            </div>
            {paginationControls}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <PropertyVault
              cash={cash}
              isPurchasing={isPurchasing}
              items={vaultPageItems}
              onBuy={handleBuy}
            />
            {paginationControls}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="shop-footer px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-center text-sm font-semibold text-muted-foreground border-t">
        Buy unlimited items — no daily limits!
      </div>
    </div>
  );
}
