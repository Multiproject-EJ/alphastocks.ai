import { Dice5 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingDiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isRolling?: boolean;
  rollsRemaining: number;
}

export function FloatingDiceButton({ 
  onClick, 
  disabled, 
  isRolling,
  rollsRemaining 
}: FloatingDiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isRolling}
      className={cn(
        'fixed z-50',
        'bottom-20 right-4',  // Above bottom nav
        'w-16 h-16',
        'rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg shadow-primary/25',
        'flex items-center justify-center',
        'safe-right',
        'transition-all duration-200',
        isRolling && 'animate-bounce',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      aria-label={`Roll dice (${rollsRemaining} remaining)`}
    >
      <div className="relative">
        <Dice5 className={cn('w-8 h-8', isRolling && 'animate-spin')} />
        {/* Rolls remaining badge */}
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {rollsRemaining}
        </span>
      </div>
    </button>
  );
}
