import { ReactNode } from 'react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { FloatingDiceButton } from './FloatingDiceButton';
import { useUIMode } from '@/hooks/useUIMode';

interface PhoneLayoutProps {
  children: ReactNode;
  gameState: {
    cash: number;
    netWorth: number;
    level: number;
    xp: number;
    xpToNext: number;
    rolls: number;
  };
  onRollDice: () => void;
  isRolling: boolean;
}

export function PhoneLayout({ 
  children, 
  gameState, 
  onRollDice, 
  isRolling 
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDiceButton = mode === 'board';

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      {/* Compact HUD at top */}
      <CompactHUD {...gameState} />
      
      {/* Main content area */}
      <main className="flex-1 overflow-hidden pt-12 pb-14">
        {children}
      </main>
      
      {/* Floating dice button (only on board) */}
      {showDiceButton && (
        <FloatingDiceButton
          onClick={onRollDice}
          isRolling={isRolling}
          rollsRemaining={gameState.rolls}
          disabled={gameState.rolls <= 0}
        />
      )}
      
      {/* Bottom navigation */}
      <PhoneBottomNav />
    </div>
  );
}
