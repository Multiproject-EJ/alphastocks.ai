import { useHaptics } from '@/hooks/useHaptics';
import {
  PROPERTY_VAULT_ITEMS,
  PROPERTY_VAULT_PROGRESS,
  PROPERTY_VAULT_REWARDS,
} from '@/lib/shopItems';
import { cn } from '@/lib/utils';

interface PropertyVaultProps {
  cash: number;
  isPurchasing: string | null;
  items?: typeof PROPERTY_VAULT_ITEMS;
  onBuy: (itemId: string, cost: number) => void;
}

export function PropertyVault({
  cash,
  isPurchasing,
  items = PROPERTY_VAULT_ITEMS,
  onBuy,
}: PropertyVaultProps) {
  const { error } = useHaptics();
  const progressPercent = Math.round(
    (PROPERTY_VAULT_PROGRESS.current / PROPERTY_VAULT_PROGRESS.total) * 100,
  );

  const handleBuy = (itemId: string, cost: number) => {
    if (cash < cost) {
      error();
      return;
    }
    onBuy(itemId, cost);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border border-[#f5d38b]/40 bg-gradient-to-br from-[#2d1a4a] via-[#3a1b4f] to-[#1c0f2f] p-3 text-white shadow-[0_20px_40px_rgba(18,8,31,0.45)]">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            🏰
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold tracking-wide">Property Vault</div>
            <p className="text-[11px] text-white/70">
              Complete the album to win premium rewards.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PROPERTY_VAULT_REWARDS.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold"
                >
                  <span>{reward.icon}</span>
                  <span>{reward.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2.5 text-[11px] text-white/70">
          <span className="whitespace-nowrap">Time left: {PROPERTY_VAULT_PROGRESS.timeLeft}</span>
          <div className="h-1.5 flex-1 rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f7d488] via-[#f8e4b1] to-[#f5d38b]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-white">
            {PROPERTY_VAULT_PROGRESS.current}/{PROPERTY_VAULT_PROGRESS.total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#231236] p-2.5 text-white shadow-[0_12px_24px_rgba(15,7,28,0.35)]"
          >
            <div className="relative mx-auto mb-2.5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d38b]/40 via-[#9b6cff]/30 to-[#3a1b4f]/80 text-2xl">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{item.icon}</span>
              )}
              {item.isComplete && (
                <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-lg">
                  ✓
                </span>
              )}
            </div>
            <div className="text-xs font-semibold">{item.name}</div>
            <div className="text-[11px] text-white/60">{item.description}</div>
            <button
              onClick={() => handleBuy(item.id, item.price)}
              disabled={cash < item.price || isPurchasing === item.id}
              className={cn(
                'mt-2.5 w-full rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                cash >= item.price
                  ? 'bg-[#f7d488] text-[#2b1a3f] hover:bg-[#f9e1a5]'
                  : 'cursor-not-allowed bg-white/10 text-white/40',
              )}
            >
              {isPurchasing === item.id ? '...' : `Unlock $${item.price.toLocaleString()}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
