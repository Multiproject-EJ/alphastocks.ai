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
    cityLevel?: number; // Optional city level for backward compatibility
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
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative">
      {/* City background - z-index 0 */}
      <div 
        className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Compact HUD at top - z-index 30 */}
      <div className="relative z-30">
        <CompactHUD {...gameState} />
      </div>
      
      {/* BOARD AREA - z-index 10, CRITICAL: Above background, below HUD/nav */}
      <main 
        className="flex-1 relative board-area"
        style={{
          zIndex: 10,
          overflow: 'visible', // Don't clip the board
          display: 'block',
          opacity: 1,
          visibility: 'visible',
        }}
      >
        {children}
      </main>
      
      {/* Floating dice button (only on board) - z-index 40 */}
      {showDiceButton && (
        <div className="relative z-40">
          <FloatingDiceButton
            onClick={onRollDice}
            isRolling={isRolling}
            rollsRemaining={gameState.rolls}
            disabled={gameState.rolls <= 0}
          />
        </div>
      )}
      
      {/* Bottom navigation - z-index 50 */}
      <div className="relative z-50">
        <PhoneBottomNav />
      </div>
    </div>
  );
}
