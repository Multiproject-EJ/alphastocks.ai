import { cn } from '@/lib/utils';
import { ShopCategory } from '@/lib/shopItems';

interface ShopTabsProps {
  activeTab: ShopCategory;
  onTabChange: (tab: ShopCategory) => void;
}

const TABS: Array<{ id: ShopCategory; label: string; icon: string }> = [
  { id: 'utilities', label: 'Utilities', icon: '🧰' },
  { id: 'vault', label: 'Property Vault', icon: '🏛️' },
];

export function ShopTabs({ activeTab, onTabChange }: ShopTabsProps) {
  return (
    <div className="shop-tabs flex border-b overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2',
            'py-2.5 px-3 min-w-[92px]',
            'text-xs font-medium',
            'transition-colors',
            'touch-target',
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
