import { useUIMode } from '@/hooks/useUIMode';
import { cn } from '@/lib/utils';
import type { UIMode } from '@/lib/uiModeStateMachine';
import { 
  Gamepad2, 
  Building2, 
  Image, 
  ShoppingBag, 
  Trophy 
} from 'lucide-react';

const NAV_ITEMS: ReadonlyArray<{ id: UIMode; icon: typeof Gamepad2; label: string }> = [
  { id: 'board', icon: Gamepad2, label: 'Play' },
  { id: 'cityBuilder', icon: Building2, label: 'Build' },
  { id: 'gallery', icon: Image, label: 'Gallery' },
  { id: 'shop', icon: ShoppingBag, label: 'Shop' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
] as const;

export function PhoneBottomNav() {
  const { mode, transitionTo } = useUIMode();

  const handleNavClick = async (targetMode: UIMode) => {
    console.log('Nav clicked:', targetMode);  // Debug log
    
    try {
      const success = await transitionTo(targetMode);
      if (!success) {
        console.error('Failed to transition to:', targetMode);
      }
    } catch (error) {
      console.error('Transition error:', error);
    }
  };

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-background/95 backdrop-blur-sm border-t',
      'safe-bottom',
    )}>
      <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = mode === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center',
                'min-h-[56px] min-w-[56px]',
                'touch-target touch-feedback',
                'cursor-pointer',  // Ensure it looks clickable
                'transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',  // Optimize for touch
              }}
            >
              <Icon className={cn(
                'w-6 h-6 mb-0.5',
                isActive && 'scale-110 transition-transform'
              )} />
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
