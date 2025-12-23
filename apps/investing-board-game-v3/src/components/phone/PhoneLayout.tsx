import { ReactNode } from 'react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { MobileBoard3D } from './MobileBoard3D';
import { BoardDebugOverlay } from './BoardDebugOverlay';
import { useUIMode } from '@/hooks/useUIMode';

// Layout constants for consistent sizing
const COMPACT_HUD_HEIGHT = 48;  // pixels
const BOTTOM_NAV_HEIGHT = 70;   // pixels (updated to match new nav height)

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
  isAutoRolling?: boolean;
  onToggleAutoRoll?: () => void;
}

export function PhoneLayout({ 
  children, 
  currentPosition,
  gameState, 
  onRollDice, 
  isRolling,
  isAutoRolling = false,
  onToggleAutoRoll = () => {},
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDebug = import.meta.env.DEV;
  
  const camera = {
    perspective: 800,
    rotateX: 55,
    rotateZ: 45,
    scale: 0.55,
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
            top: `${COMPACT_HUD_HEIGHT}px`,      // Below HUD
            left: 0,
            right: 0,
            bottom: `${BOTTOM_NAV_HEIGHT}px`,    // Above nav
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
      
      {/* Layer 50: Bottom Nav with Dice */}
      <div className="relative z-50">
        <PhoneBottomNav
          onRollDice={onRollDice}
          rollsRemaining={gameState.rolls}
          isRolling={isRolling}
          isAutoRolling={isAutoRolling}
          onToggleAutoRoll={onToggleAutoRoll}
        />
      </div>
      
      {/* Layer 100: Modal and Toast Portal - OUTSIDE board transform */}
      {/* This div serves as a container for portals that need to escape the 3D transform */}
      {/* Radix UI portals will automatically render to document.body, but we ensure high z-index */}
      <div 
        id="phone-portal-root"
        className="fixed inset-0 pointer-events-none z-[9000]"
        style={{
          // Ensure this layer is not affected by any parent transforms
          transform: 'none',
        }}
      >
        {/* Portal content will be injected here by Radix UI and Sonner */}
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
