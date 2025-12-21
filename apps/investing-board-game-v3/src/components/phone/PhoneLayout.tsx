import { ReactNode } from 'react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { FloatingDiceButton } from './FloatingDiceButton';
import { MobileBoard3D } from './MobileBoard3D';
import { BoardDebugOverlay } from './BoardDebugOverlay';
import { useUIMode } from '@/hooks/useUIMode';

interface PhoneLayoutProps {
  children: ReactNode;
  currentPosition: number;
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
  currentPosition,
  gameState, 
  onRollDice, 
  isRolling 
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDiceButton = mode === 'board';
  const showDebug = import.meta.env.DEV;
  
  const camera = {
    perspective: 600,
    rotateX: 28,
    scale: 2.2,
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative phone-layout">
      {/* Layer 0: Background */}
      <div 
        className="absolute inset-0 z-0 bg-[url('/board-game-v3/BG.webp')] bg-cover bg-center opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Layer 10: Board - MUST be above background */}
      {mode === 'board' && (
        <div 
          className="absolute board-area"
          style={{
            top: '48px',      // Below HUD
            left: 0,
            right: 0,
            bottom: '56px',   // Above nav
            zIndex: 10,
            overflow: 'visible',
          }}
        >
          <MobileBoard3D
            currentPosition={currentPosition}
            totalTiles={40}
            boardSize={1200}
          >
            {children}
          </MobileBoard3D>
        </div>
      )}
      
      {/* Layer 30: Compact HUD */}
      <div className="relative z-30">
        <CompactHUD {...gameState} />
      </div>
      
      {/* Layer 40: Floating Dice */}
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
      
      {/* Layer 50: Bottom Nav */}
      <div className="relative z-50">
        <PhoneBottomNav />
      </div>

      {/* Debug Overlay */}
      <BoardDebugOverlay 
        currentPosition={currentPosition}
        camera={camera}
        isVisible={showDebug}
      />
    </div>
  );
}
