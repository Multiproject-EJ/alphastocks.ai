import { useState, useCallback, type KeyboardEvent, type MouseEvent } from 'react';
import { AnimatedDice } from '@/components/AnimatedDice';
import { EconomyWindowStatus } from '@/components/EconomyWindowStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MULTIPLIERS } from '@/lib/constants';
import { getUnlockedMultipliers } from '@/lib/leverage';
import { cn } from '@/lib/utils';

interface DiceButtonProps {
  onRoll: () => void;
  onToggleAutoRoll: () => void;
  onCycleMultiplier: () => void;
  multiplier: number;
  multiplierCap?: number;
  availableMultipliers?: number[];
  leverageLevel?: number;
  momentum?: number;
  momentumMax?: number;
  economyWindowLabel?: string | null;
  economyWindowEndsAt?: string | null;
  economyWindowStarsMultiplier?: number;
  economyWindowXpMultiplier?: number;
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
  multiplierCap = 1,
  availableMultipliers = [1],
  leverageLevel = 0,
  momentum = 0,
  momentumMax = 100,
  economyWindowLabel = null,
  economyWindowEndsAt = null,
  economyWindowStarsMultiplier = 1,
  economyWindowXpMultiplier = 1,
  rollsRemaining,
  isRolling,
  isAutoRolling,
  dice1 = 1,
  dice2 = 1,
}: DiceButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isTapAnimating, setIsTapAnimating] = useState(false);
  const [autoRollFlash, setAutoRollFlash] = useState(false);
  const isDoubles = dice1 === dice2;
  const unlockedMultipliers = getUnlockedMultipliers(leverageLevel);
  const nextLockedMultiplier = MULTIPLIERS[unlockedMultipliers.length];
  const safeMomentumMax = momentumMax > 0 ? momentumMax : 100;
  const momentumPercent = Math.max(0, Math.min(100, Math.round((momentum / safeMomentumMax) * 100)));
  const hasEconomyWindow = Boolean(economyWindowLabel && economyWindowEndsAt);
  const multiplierStep = Math.max(0, availableMultipliers.indexOf(multiplier));
  const glowStrength = 0.2 + multiplierStep * 0.13;
  const leverageGlow = multiplier > 1 ? `0 0 ${12 + multiplierStep * 5}px rgba(250,204,21,${Math.min(0.95, glowStrength).toFixed(2)})` : '0 0 8px rgba(250,204,21,0.2)';

  const triggerAutoRollFlash = () => {
    setAutoRollFlash(true);
    window.setTimeout(() => {
      setAutoRollFlash(false);
    }, 600);
  };

  const handleAutoRollToggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
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
    setIsTapAnimating(true);
    window.setTimeout(() => setIsPressed(false), 150);
    window.setTimeout(() => setIsTapAnimating(false), 700);
    if (isAutoRolling) {
      onToggleAutoRoll();
      return;
    }
    onRoll();
  }, [isAutoRolling, onRoll, onToggleAutoRoll]);

  const handleDiceKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDiceClick();
    }
  }, [handleDiceClick]);

  return (
    <div className="relative flex items-center justify-center">
      {hasEconomyWindow && (
        <EconomyWindowStatus
          label={economyWindowLabel}
          endsAt={economyWindowEndsAt}
          starsMultiplier={economyWindowStarsMultiplier}
          xpMultiplier={economyWindowXpMultiplier}
          className="pointer-events-none absolute -top-16 left-1/2 z-20 w-[210px] -translate-x-1/2 rounded-2xl border-emerald-300/50 bg-emerald-500/15 text-[11px] text-emerald-50 shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
        />
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={handleDiceClick}
        onKeyDown={handleDiceKeyDown}
        className={cn(
          'dice-button',
          'phone-dice-button',
          'w-[150px] h-[150px] rounded-full',
          'flex flex-col items-center justify-center',
          'font-bold text-white',
          'shadow-lg',
          'transition-all duration-200',
          'touch-target',
          'relative overflow-visible',
          isAutoRolling && 'phone-dice-button--auto shadow-orange-500/50',
          isTapAnimating && 'phone-dice-button--tap',
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
          className={cn('absolute top-11 left-1/2 z-30 flex h-11 w-[136px] -translate-x-1/2 flex-col items-center justify-center gap-0.5 rounded-md border px-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-yellow-100 backdrop-blur-sm transition-all', multiplier > 1 ? 'border-yellow-200/90 bg-yellow-300/20 animate-pulse' : 'border-yellow-200/60 bg-background/70')}
          style={{ boxShadow: leverageGlow }}
          aria-label={`Leverage ${multiplier}x. Tap to change.`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-yellow-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5h18" />
            <path d="M4.5 10.5L12 5l7.5 5.5" />
            <path d="M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7" />
            <path d="M4 17.5h16" />
          </svg>
          Leverage {multiplier}x
          <span className="text-[8px] tracking-[0.15em] text-yellow-100/85">Max now {multiplierCap}x</span>
          {nextLockedMultiplier && nextLockedMultiplier <= multiplierCap && (
            <span className="text-[8px] tracking-[0.2em] text-yellow-200/80">
              Next {nextLockedMultiplier}x
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={handleAutoRollToggle}
          className={cn(
            'absolute top-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white',
            isAutoRolling ? 'border-yellow-200/80 bg-yellow-400/30' : 'border-white/30 bg-background/80',
            autoRollFlash && 'auto-roll-flash',
          )}
          aria-label={isAutoRolling ? 'Auto roll on. Tap to stop.' : 'Tap to enable auto roll.'}
        >
          <span className="text-[9px]">Auto</span>
          <span
            aria-hidden="true"
            className={cn('auto-toggle-track', isAutoRolling && 'auto-toggle-track--on')}
          >
            <span className={cn('auto-toggle-thumb', isAutoRolling && 'auto-toggle-thumb--on')} />
          </span>
        </button>
        <span className="flex items-center gap-2" aria-hidden="true">
          <AnimatedDice
            value={dice1}
            isRolling={isRolling}
            isMoving={false}
            isDoubles={isDoubles}
            className={cn('scale-[0.99]', isRolling && 'animate-dice-shake')}
          />
          <AnimatedDice
            value={dice2}
            isRolling={isRolling}
            isMoving={false}
            isDoubles={isDoubles}
            className={cn('scale-[0.99]', isRolling && 'animate-dice-shake')}
          />
        </span>
        <div className="absolute -bottom-5 left-1/2 flex w-[138px] -translate-x-1/2 flex-col items-center gap-1 text-white">
          <div className="flex w-full items-center justify-between text-[8px] uppercase tracking-[0.24em] text-white/70">
            <span className="flex items-center gap-1.5">
              Momentum
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[8px] font-semibold text-white/90"
                    aria-label="Momentum info"
                  >
                    i
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-[10px] normal-case">
                  Momentum grows when your net worth rises and decays over time. Higher momentum can trigger
                  bonus economy windows with extra stars and XP.
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="font-mono text-white">{momentumPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/20 bg-black/25">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 transition-all duration-500"
              style={{ width: `${momentumPercent}%` }}
            />
          </div>
          <div className="flex flex-col items-center text-white">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">Rolls</span>
            <span className="text-lg font-bold">{rollsRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
