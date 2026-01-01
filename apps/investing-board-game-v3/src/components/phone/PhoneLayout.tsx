import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Building2, Clock3, ShoppingBag, TrendingUp, Wrench } from 'lucide-react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { MobileBoard3D } from './MobileBoard3D';
import { BoardDebugOverlay } from './BoardDebugOverlay';
import { useUIMode } from '@/hooks/useUIMode';

// Layout constants for consistent sizing
const COMPACT_HUD_HEIGHT = 48;  // pixels
const BOTTOM_NAV_HEIGHT = 90;   // pixels (updated to match new nav height)

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
    stars?: number; // Add stars
    cityLevel?: number; // Optional city level for backward compatibility
  };
  onRollDice: (multiplier: number) => void;
  multiplier: number;
  onCycleMultiplier: () => void;
  isRolling: boolean;
  isAutoRolling?: boolean;
  onToggleAutoRoll?: () => void;
  lastEnergyCheck?: Date;
  // Add handlers for floating buttons
  onOpenPortfolio?: () => void;
  onOpenProTools?: () => void;
  onOpenShop?: () => void;
  onOpenCities?: () => void;
  onOpenRightNow?: () => void;
}

export function PhoneLayout({ 
  children, 
  currentPosition,
  gameState, 
  onRollDice, 
  multiplier,
  onCycleMultiplier,
  isRolling,
  isAutoRolling = false,
  onToggleAutoRoll = () => {},
  lastEnergyCheck,
  onOpenPortfolio = () => {},
  onOpenProTools = () => {},
  onOpenShop = () => {},
  onOpenCities = () => {},
  onOpenRightNow = () => {},
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDebug = import.meta.env.DEV;
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const hideFloatingActions = isRolling;
  
  const camera = {
    perspective: 800,
    rotateX: 55,
    rotateZ: 45,
    scale: 0.55,
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const phoneBackground = useMemo(() => {
    if (currentHour >= 0 && currentHour <= 4) return 'Phonebgdeepnight.webp';
    if (currentHour <= 6) return 'Phonebglatesunrise.webp';
    if (currentHour <= 8) return 'Phonebgdawnsunrise.webp';
    if (currentHour <= 16) return 'Phonebgday.webp';
    if (currentHour <= 18) return 'Phonebgsunset.webp';
    if (currentHour <= 20) return 'Phonebgearlynight.webp';
    return 'Phonebgdeepnight.webp';
  }, [currentHour]);

  const backgroundUrl = `${import.meta.env.BASE_URL}${phoneBackground}`;

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative phone-layout">
      {/* Layer 0: Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60 pointer-events-none"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
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
      
      {/* Layer 20: Floating Action Buttons - OUTSIDE board transform */}
      {mode === 'board' && (
        <>
          {/* Portfolio button - Right side */}
          <button
            onClick={onOpenPortfolio}
            className={`fixed right-4 z-40 rounded-full bg-accent/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-accent hover:shadow-xl ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ top: `${COMPACT_HUD_HEIGHT + 80}px` }}
            aria-label="Open Portfolio"
            aria-hidden={hideFloatingActions}
            data-tutorial="portfolio"
          >
            <TrendingUp size={24} className="text-accent-foreground" />
          </button>
          
          {/* ProTools button - Right side below portfolio */}
          <div
            className={`fixed right-3 z-40 flex flex-col items-center gap-1 transition-opacity ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ top: `${COMPACT_HUD_HEIGHT + 150}px` }}
            aria-hidden={hideFloatingActions}
          >
            <button
              onClick={onOpenProTools}
              className="bg-primary/90 hover:bg-primary backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
              aria-label="Open ProTools"
            >
              <Wrench size={24} className="text-primary-foreground" />
            </button>
            <span className="text-[10px] font-semibold text-white/80 tracking-wide">
              ProTools
            </span>
          </div>

          <div
            className={`fixed left-4 z-40 flex flex-col gap-3 transition-opacity ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ top: `${COMPACT_HUD_HEIGHT + 80}px` }}
            aria-hidden={hideFloatingActions}
          >
            <button
              onClick={onOpenShop}
              className="flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 backdrop-blur-sm transition-all hover:bg-sky-500"
              aria-label="Open Shop"
            >
              <ShoppingBag size={18} />
              Shop
            </button>
            <button
              onClick={onOpenCities}
              className="flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm transition-all hover:bg-emerald-500"
              aria-label="Open Cities"
            >
              <Building2 size={18} />
              Cities
            </button>
            <button
              onClick={onOpenRightNow}
              className="relative flex items-center gap-2 rounded-full bg-amber-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 backdrop-blur-sm transition-all hover:bg-amber-500"
              aria-label="Open Right Now"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-400" />
              </span>
              <Clock3 size={18} />
              Right Now
            </button>
          </div>
        </>
      )}
      
      {/* Layer 30: Compact HUD */}
      <div className="relative z-30">
        <CompactHUD {...gameState} />
      </div>
      
      {/* Layer 50: Bottom Nav with Dice */}
      <div className="relative z-50">
        <PhoneBottomNav
          onRollDice={onRollDice}
          multiplier={multiplier}
          onCycleMultiplier={onCycleMultiplier}
          rollsRemaining={gameState.rolls}
          isRolling={isRolling}
          isAutoRolling={isAutoRolling}
          onToggleAutoRoll={onToggleAutoRoll}
          lastEnergyCheck={lastEnergyCheck}
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
