import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DiceButtonProps {
  onRoll: () => void;
  onToggleAutoRoll: () => void;
  onCycleMultiplier: () => void;
  multiplier: number;
  rollsRemaining: number;
  isRolling: boolean;
  isAutoRolling: boolean;
}

export function DiceButton({
  onRoll,
  onToggleAutoRoll,
  onCycleMultiplier,
  multiplier,
  rollsRemaining,
  isRolling,
  isAutoRolling,
}: DiceButtonProps) {
  const autoRollHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [autoRollFlash, setAutoRollFlash] = useState(false);

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
          'w-[120px] h-[120px] rounded-full',
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
        <span className="phone-dice-face" aria-hidden="true">
          <span className="phone-dice-pip phone-dice-pip--tl" />
          <span className="phone-dice-pip phone-dice-pip--tr" />
          <span className="phone-dice-pip phone-dice-pip--c" />
          <span className="phone-dice-pip phone-dice-pip--bl" />
          <span className="phone-dice-pip phone-dice-pip--br" />
        </span>
      </button>

      <div className="absolute -right-12 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={onCycleMultiplier}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-background/90 text-[10px] font-semibold text-white shadow-md backdrop-blur"
          aria-label={`Dice multiplier ${multiplier}x. Tap to change.`}
        >
          {multiplier}x
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-background/90 text-[11px] font-bold text-white shadow-md backdrop-blur"
          aria-label={`${rollsRemaining} rolls remaining`}
        >
          {rollsRemaining}
        </div>
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
            'flex h-10 w-10 items-center justify-center rounded-full border text-[8px] font-semibold text-white shadow-md backdrop-blur',
            isAutoRolling ? 'border-yellow-300/70 bg-yellow-400/90' : 'border-white/30 bg-background/90',
            autoRollFlash && 'auto-roll-flash',
          )}
          aria-label={isAutoRolling ? 'Auto roll on. Tap dice to stop.' : 'Hold to enable auto roll.'}
        >
          <span className="flex flex-col leading-none">
            <span>AUTO</span>
            <span>{isAutoRolling ? 'ON' : 'HOLD'}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
