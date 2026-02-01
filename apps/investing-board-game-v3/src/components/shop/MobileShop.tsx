import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X } from '@phosphor-icons/react';
import { ShopTabs } from './ShopTabs';
import { ShopItem } from './ShopItem';
import { PropertyVault } from './PropertyVault';
import { usePurchase } from '@/hooks/usePurchase';
import { useAuth } from '@/context/AuthContext';
import { PROPERTY_VAULT_ITEMS, SHOP_ITEMS, ShopCategory } from '@/lib/shopItems';
import { hasSupabaseConfig, supabaseClient } from '@/lib/supabaseClient';

interface MobileShopProps {
  cash: number;
  onPurchase: (itemId: string, cost: number, category: ShopCategory) => void;
  onClose?: () => void;
}

export function MobileShop({ cash, onPurchase, onClose }: MobileShopProps) {
  const [activeTab, setActiveTab] = useState<ShopCategory>('vault');
  const [pageIndex, setPageIndex] = useState(0);
  const { purchase, isPurchasing } = usePurchase();
  const { user } = useAuth();
  const [ownedVaultItems, setOwnedVaultItems] = useState<Set<string>>(new Set());

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

  const handleBuy = async (itemId: string, cost: number, category: ShopCategory) => {
    if (cash < cost) return;

    if (category === 'vault' && ownedVaultItems.has(itemId)) {
      return;
    }

    const success = await purchase(itemId, cost);
    if (success) {
      if (category === 'vault') {
        if (supabaseClient && hasSupabaseConfig && user) {
          const { error } = await supabaseClient.rpc('shop_vault_purchase', {
            item_id: itemId,
          });

          if (error) {
            toast.error('Vault purchase failed', {
              description: error.message,
            });
            return;
          }
        } else {
          toast.message('Vault purchase saved locally', {
            description: 'Connect your account to sync vault ownership.',
          });
        }

        setOwnedVaultItems((prev) => new Set(prev).add(itemId));
      }

      onPurchase(itemId, cost, category);
    }
  };

  const handleTabChange = (tab: ShopCategory) => {
    setActiveTab(tab);
    setPageIndex(0);
  };

  useEffect(() => {
    setPageIndex((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (!supabaseClient || !hasSupabaseConfig || !user) {
      setOwnedVaultItems(new Set());
      return;
    }

    let isActive = true;

    const loadOwnership = async () => {
      const { data, error } = await supabaseClient
        .from('shop_vault_item_ownership')
        .select('item_id')
        .eq('profile_id', user.id);

      if (!isActive) return;

      if (error) {
        toast.error('Unable to load vault ownership', {
          description: error.message,
        });
        return;
      }

      setOwnedVaultItems(new Set((data ?? []).map((record) => record.item_id as string)));
    };

    loadOwnership();

    return () => {
      isActive = false;
    };
  }, [user]);

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
                  onBuy={() => handleBuy(item.id, item.price, 'utilities')}
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
              ownedItemIds={ownedVaultItems}
              items={vaultPageItems}
              onBuy={(itemId, cost) => handleBuy(itemId, cost, 'vault')}
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
