import { useState, useCallback, type PointerEvent } from 'react';
import { AnimatedDice } from '@/components/AnimatedDice';
import { cn } from '@/lib/utils';

interface DiceButtonProps {
  onRoll: () => void;
  onToggleAutoRoll: () => void;
  onCycleMultiplier: () => void;
  multiplier: number;
  rollsRemaining: number;
  isRolling: boolean;
  isAutoRolling: boolean;
  dice1?: number;
  dice2?: number;
}

export function DiceButton({
  onRoll,
  onToggleAutoRoll,
  onCycleMultiplier,
  multiplier,
  rollsRemaining,
  isRolling,
  isAutoRolling,
  dice1 = 1,
  dice2 = 1,
}: DiceButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [autoRollFlash, setAutoRollFlash] = useState(false);
  const isDoubles = dice1 === dice2;

  const triggerAutoRollFlash = () => {
    setAutoRollFlash(true);
    window.setTimeout(() => {
      setAutoRollFlash(false);
    }, 600);
  };

  const handleAutoRollToggle = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (isAutoRolling) {
        onToggleAutoRoll();
        return;
      }
      triggerAutoRollFlash();
      onToggleAutoRoll();
      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    },
    [isAutoRolling, onToggleAutoRoll],
  );

  const handleDiceClick = useCallback(() => {
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 150);
    if (isAutoRolling) {
      onToggleAutoRoll();
      return;
    }
    onRoll();
  }, [isAutoRolling, onRoll, onToggleAutoRoll]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={handleDiceClick}
        className={cn(
          'dice-button',
          'phone-dice-button',
          'w-[136px] h-[136px] rounded-full',
          'flex flex-col items-center justify-center',
          'font-bold text-white',
          'shadow-lg',
          'transition-all duration-200',
          'touch-target',
          'relative overflow-visible',
          isAutoRolling && 'phone-dice-button--auto animate-pulse shadow-orange-500/50',
          isPressed && 'scale-95',
          isRolling && 'animate-bounce',
        )}
        style={{
          boxShadow: isAutoRolling 
            ? '0 0 20px rgba(255,165,0,0.6)' 
            : '0 4px 15px rgba(0,0,0,0.3)',
        }}
        data-tutorial="dice"
      >
        <span className="absolute inset-0 -z-10 pointer-events-none">
          <span className="dice-orb dice-orb-a" />
          <span className="dice-orb dice-orb-b" />
          <span className="dice-orb dice-orb-c" />
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCycleMultiplier();
          }}
          className="absolute -top-6 left-1/2 flex h-12 w-[150px] -translate-x-1/2 items-start justify-center rounded-t-full border-2 border-yellow-200/60 bg-background/40 pt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-100 shadow-[0_0_14px_rgba(250,204,21,0.25)] backdrop-blur-sm"
          aria-label={`Leverage ${multiplier}x. Tap to change.`}
        >
          Leverage {multiplier}x
        </button>
        <button
          type="button"
          onPointerDown={handleAutoRollToggle}
          className={cn(
            'absolute top-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white',
            isAutoRolling ? 'border-yellow-200/80 bg-yellow-400/40' : 'border-white/30 bg-background/80',
            autoRollFlash && 'auto-roll-flash',
          )}
          aria-label={isAutoRolling ? 'Auto roll on. Tap to stop.' : 'Tap to enable auto roll.'}
        >
          Auto {isAutoRolling ? 'ON' : 'OFF'}
        </button>
        <span className="flex items-center gap-2" aria-hidden="true">
          <AnimatedDice
            value={dice1}
            isRolling={isRolling}
            isMoving={false}
            isDoubles={isDoubles}
            className={cn('scale-90', isRolling && 'animate-dice-shake')}
          />
          <AnimatedDice
            value={dice2}
            isRolling={isRolling}
            isMoving={false}
            isDoubles={isDoubles}
            className={cn('scale-90', isRolling && 'animate-dice-shake')}
          />
        </span>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center text-white">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">Rolls</span>
          <span className="text-lg font-bold">{rollsRemaining}</span>
        </div>
      </button>
    </div>
  );
}
