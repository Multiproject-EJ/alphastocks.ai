import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DiceButtonProps {
  onClick: () => void;
  onLongPress: () => void;
  rollsRemaining: number;
  isRolling: boolean;
  isAutoRolling: boolean;
}

export function DiceButton({
  onClick,
  onLongPress,
  rollsRemaining,
  isRolling,
  isAutoRolling,
}: DiceButtonProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      // Long press detected - toggle auto-roll
      onLongPress();
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }, 2000);  // 2 seconds for long press
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      // Short press - normal roll
      if (!isAutoRolling) {
        onClick();
      }
    }
  }, [onClick, isAutoRolling]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      className={cn(
        'dice-button',
        'w-20 h-20 rounded-full',
        'flex flex-col items-center justify-center',
        'font-bold text-white',
        'shadow-lg',
        'transition-all duration-200',
        'touch-target',
        isAutoRolling 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse shadow-orange-500/50' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600',
        isPressed && 'scale-95',
        isRolling && 'animate-bounce',
      )}
      style={{
        boxShadow: isAutoRolling 
          ? '0 0 20px rgba(255,165,0,0.6)' 
          : '0 4px 15px rgba(0,0,0,0.3)',
      }}
    >
      <span className="text-3xl">🎲</span>
      <span className="text-xs mt-1">{rollsRemaining}</span>
      {isAutoRolling && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          AUTO
        </span>
      )}
    </button>
  );
}
