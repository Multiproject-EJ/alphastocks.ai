import { useRef, useState, useCallback, useEffect } from 'react';
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
  const auxButtonBaseClass =
    'flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-semibold text-white shadow-md backdrop-blur';
  const auxButtonGlowClass =
    'border-yellow-200/50 bg-yellow-400/15 shadow-[0_0_14px_rgba(250,204,21,0.35)]';
  const autoRollHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [autoRollFlash, setAutoRollFlash] = useState(false);
  const isDoubles = dice1 === dice2;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoRollHoldTimer.current) {
        clearTimeout(autoRollHoldTimer.current);
      }
    };
  }, []);

  const triggerAutoRollFlash = () => {
    setAutoRollFlash(true);
    window.setTimeout(() => {
      setAutoRollFlash(false);
    }, 600);
  };

  const handleAutoRollHoldStart = useCallback(() => {
    if (isAutoRolling) return;
    if (autoRollHoldTimer.current) {
      clearTimeout(autoRollHoldTimer.current);
    }
    autoRollHoldTimer.current = setTimeout(() => {
      triggerAutoRollFlash();
      onToggleAutoRoll();
      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    }, 1400);
  }, [isAutoRolling, onToggleAutoRoll]);

  const handleAutoRollHoldEnd = useCallback(() => {
    if (autoRollHoldTimer.current) {
      clearTimeout(autoRollHoldTimer.current);
      autoRollHoldTimer.current = null;
    }
  }, []);

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
      </button>

      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-12 items-center gap-2">
        <button
          type="button"
          onClick={onCycleMultiplier}
          className={cn(auxButtonBaseClass, auxButtonGlowClass)}
          aria-label={`Dice multiplier ${multiplier}x. Tap to change.`}
        >
          {multiplier}x
        </button>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleAutoRollHoldStart();
          }}
          onPointerUp={handleAutoRollHoldEnd}
          onPointerLeave={handleAutoRollHoldEnd}
          onPointerCancel={handleAutoRollHoldEnd}
          className={cn(
            auxButtonBaseClass,
            auxButtonGlowClass,
            'text-[8px]',
            isAutoRolling && 'border-yellow-200/80 bg-yellow-400/40',
            autoRollFlash && 'auto-roll-flash',
          )}
          aria-label={isAutoRolling ? 'Auto roll on. Tap dice to stop.' : 'Hold to enable auto roll.'}
        >
          <span className="flex flex-col leading-none">
            <span>AUTO</span>
            <span>{isAutoRolling ? 'ON' : 'HOLD'}</span>
          </span>
        </button>
        <div
          className={cn(
            auxButtonBaseClass,
            auxButtonGlowClass,
            'text-[11px] font-bold',
          )}
          aria-label={`${rollsRemaining} rolls remaining`}
        >
          {rollsRemaining}
        </div>
      </div>
    </div>
  );
}
