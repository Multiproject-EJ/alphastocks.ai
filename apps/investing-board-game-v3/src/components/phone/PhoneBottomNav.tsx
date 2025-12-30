import { useEffect, useState } from 'react';
import { useUIMode } from '@/hooks/useUIMode';
import { cn } from '@/lib/utils';
import type { UIMode } from '@/lib/uiModeStateMachine';
import { getTimeUntilNextRegen } from '@/lib/energy';
import { 
  Gamepad2, 
  Building2, 
  ShoppingBag, 
  Trophy 
} from 'lucide-react';
import { DiceButton } from './DiceButton';

const NAV_ITEMS: ReadonlyArray<{ id: UIMode; icon: typeof Gamepad2; label: string }> = [
  { id: 'board', icon: Gamepad2, label: 'Play' },
  { id: 'cityBuilder', icon: Building2, label: 'Build' },
] as const;

const NAV_ITEMS_RIGHT: ReadonlyArray<{ id: UIMode; icon: typeof Gamepad2; label: string }> = [
  { id: 'shop', icon: ShoppingBag, label: 'Shop' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
] as const;

interface PhoneBottomNavProps {
  onRollDice: (multiplier: number) => void;
  onCycleMultiplier: () => void;
  multiplier: number;
  rollsRemaining: number;
  isRolling: boolean;
  isAutoRolling: boolean;
  onToggleAutoRoll: () => void;
  lastEnergyCheck?: Date;
}

export function PhoneBottomNav({
  onRollDice,
  onCycleMultiplier,
  multiplier,
  rollsRemaining,
  isRolling,
  isAutoRolling,
  onToggleAutoRoll,
  lastEnergyCheck,
}: PhoneBottomNavProps) {
  const { mode, transitionTo } = useUIMode();
  const [energyCountdown, setEnergyCountdown] = useState('');

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

  useEffect(() => {
    if (!lastEnergyCheck) {
      setEnergyCountdown('');
      return;
    }

    const updateCountdown = () => {
      const { minutes, seconds } = getTimeUntilNextRegen(lastEnergyCheck);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const formatted = hours > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${remainingMinutes}m ${seconds}s`;
      setEnergyCountdown(formatted);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [lastEnergyCheck]);

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 backdrop-blur-sm border-t',
        'safe-bottom',
      )}
      style={{
        height: 90,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingBottom: 8,
      }}
    >
      {/* Left navigation items */}
      {NAV_ITEMS.map((item) => {
        const isActive = mode === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-h-[56px] min-w-[56px]',
              'touch-target',
              'cursor-pointer',
              'transition-[color,box-shadow,transform] duration-200',
              isActive
                ? 'text-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]'
                : 'text-muted-foreground',
            )}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
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
      
      {/* DICE - Larger, sticks out */}
      <div style={{
        position: 'relative',
        marginTop: -30,  // Sticks out above nav
      }}>
        <div className="flex flex-col items-center gap-1">
          <DiceButton
            onRoll={() => onRollDice(multiplier)}
            onToggleAutoRoll={onToggleAutoRoll}
            onCycleMultiplier={onCycleMultiplier}
            multiplier={multiplier}
            rollsRemaining={rollsRemaining}
            isRolling={isRolling}
            isAutoRolling={isAutoRolling}
          />
          {energyCountdown && (
            <span className="text-[10px] font-medium text-muted-foreground">
              Next dice in {energyCountdown}
            </span>
          )}
        </div>
      </div>
      
      {/* Right navigation items */}
      {NAV_ITEMS_RIGHT.map((item) => {
        const isActive = mode === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-h-[56px] min-w-[56px]',
              'touch-target',
              'cursor-pointer',
              'transition-[color,box-shadow,transform] duration-200',
              isActive
                ? 'text-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]'
                : 'text-muted-foreground',
            )}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
            data-tutorial={item.id === 'shop' ? 'shop' : undefined}
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
    </nav>
  );
}
