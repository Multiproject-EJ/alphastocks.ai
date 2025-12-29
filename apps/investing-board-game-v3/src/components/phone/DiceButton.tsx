import { useRef, useState, useCallback, useEffect } from 'react';
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
  const wasLongPress = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);


  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    wasLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      // Long press detected - toggle auto-roll
      wasLongPress.current = true;
      onLongPress();
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }, 2000);  // 2 seconds for long press
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Only trigger onClick if it was a short press (not a long press)
    if (!wasLongPress.current && !isAutoRolling) {
      onClick();
    }
    
    wasLongPress.current = false;
  }, [onClick, isAutoRolling]);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      className={cn(
        'dice-button',
        'w-[120px] h-[120px] rounded-full',
        'flex flex-col items-center justify-center',
        'font-bold text-white',
        'shadow-lg',
        'transition-all duration-200',
        'touch-target',
        'relative overflow-visible',
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
      data-tutorial="dice"
    >
      <span className="absolute inset-0 -z-10 pointer-events-none">
        <span className="dice-orb dice-orb-a" />
        <span className="dice-orb dice-orb-b" />
        <span className="dice-orb dice-orb-c" />
      </span>
      <span className="text-5xl">🎲</span>
      <span className="text-sm mt-1">{rollsRemaining}</span>
      {isAutoRolling && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
          AUTO
        </span>
      )}
    </button>
  );
}
