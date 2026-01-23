import { useEffect, useState } from 'react';
import { useUIMode } from '@/hooks/useUIMode';
import { cn } from '@/lib/utils';
import type { UIMode } from '@/lib/uiModeStateMachine';
import { getTimeUntilNextRegen } from '@/lib/energy';
import { 
  Briefcase,
  Building2, 
  Gamepad2,
  Wrench,
} from 'lucide-react';
import { DiceButton } from './DiceButton';

type NavItem = {
  id: UIMode | 'proTools';
  icon: typeof Gamepad2;
  label: string;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { id: 'proTools', icon: Wrench, label: 'ProTools' },
  { id: 'stockExchangeBuilder', icon: Building2, label: 'Stocks' },
] as const;

const NAV_ITEMS_RIGHT: ReadonlyArray<{ id: UIMode; icon?: typeof Gamepad2; label: string }> = [
  { id: 'shop', label: 'Shop' },
  { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
] as const;

interface PhoneBottomNavProps {
  onRollDice: (multiplier: number) => void;
  onCycleMultiplier: () => void;
  multiplier: number;
  rollsRemaining: number;
  isRolling: boolean;
  isAutoRolling: boolean;
  onToggleAutoRoll: () => void;
  onOpenProTools: () => void;
  lastEnergyCheck?: Date;
  dice1?: number;
  dice2?: number;
}

export function PhoneBottomNav({
  onRollDice,
  onCycleMultiplier,
  multiplier,
  rollsRemaining,
  isRolling,
  isAutoRolling,
  onToggleAutoRoll,
  onOpenProTools,
  lastEnergyCheck,
  dice1,
  dice2,
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

  const handleDiceRoll = async () => {
    if (mode !== 'board') {
      const success = await transitionTo('board');
      if (!success) {
        return;
      }
    }
    onRollDice(multiplier);
  };

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
        const isActive = item.id !== 'proTools' && mode === item.id;
        const Icon = item.icon;
        const isBuildItem = item.id === 'stockExchangeBuilder';
        const isNearDice = item.id === 'stockExchangeBuilder';
        const handleClick = () => {
          if (item.id === 'proTools') {
            onOpenProTools();
            return;
          }
          handleNavClick(item.id);
        };
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-h-[56px] min-w-[56px]',
              'touch-target',
              'cursor-pointer',
              'transition-[color,box-shadow,transform] duration-200',
              isNearDice && '-translate-y-6',
              isActive
                ? 'text-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]'
                : 'text-muted-foreground',
            )}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            {isBuildItem ? (
              <img
                src={`${import.meta.env.BASE_URL}Build.webp`}
                alt="Build"
                className={cn(
                  'h-[4.4rem] w-[4.4rem] mb-0.5 object-contain',
                  isActive && 'scale-110 transition-transform'
                )}
              />
            ) : (
              <Icon className={cn(
                'w-6 h-6 mb-0.5',
                isActive && 'scale-110 transition-transform'
              )} />
            )}
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
            onRoll={handleDiceRoll}
            onToggleAutoRoll={onToggleAutoRoll}
            onCycleMultiplier={onCycleMultiplier}
            multiplier={multiplier}
            rollsRemaining={rollsRemaining}
            isRolling={isRolling}
            isAutoRolling={isAutoRolling}
            dice1={dice1}
            dice2={dice2}
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
        const isNearDice = item.id === 'shop';
        
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
              isNearDice && '-translate-y-6',
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
            {item.id === 'shop' ? (
              <img
                src={`${import.meta.env.BASE_URL}Shop.webp`}
                alt="Shop"
                className={cn(
                  'h-[4.4rem] w-[4.4rem] mb-0.5 object-contain',
                  isActive && 'scale-110 transition-transform'
                )}
              />
            ) : (
              Icon && (
                <Icon className={cn(
                  'w-6 h-6 mb-0.5',
                  isActive && 'scale-110 transition-transform'
                )} />
              )
            )}
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
