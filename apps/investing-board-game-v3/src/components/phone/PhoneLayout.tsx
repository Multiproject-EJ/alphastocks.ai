import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, TrendingUp } from 'lucide-react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { MobileBoard3D } from './MobileBoard3D';
import { BoardDebugOverlay } from './BoardDebugOverlay';
import { useUIMode } from '@/hooks/useUIMode';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// Layout constants for consistent sizing
const COMPACT_HUD_HEIGHT = 48;  // pixels
const BOTTOM_NAV_HEIGHT = 90;   // pixels (updated to match new nav height)

interface PhoneLayoutProps {
  children: ReactNode;
  currentPosition: number;
  currentRing?: number; // Current ring player is on (1, 2, or 3)
  gameState: {
    cash: number;
    netWorth: number;
    level: number;
    xp: number;
    xpToNext: number;
    rolls: number;
    stars?: number; // Add stars
    coins?: number;
    seasonPoints?: number;
    cityLevel?: number; // Optional city level for backward compatibility
  };
  onRollDice: (multiplier: number) => void;
  multiplier: number;
  onCycleMultiplier: () => void;
  isRolling: boolean;
  isAutoRolling?: boolean;
  onToggleAutoRoll?: () => void;
  lastEnergyCheck?: Date;
  dice1?: number;
  dice2?: number;
  // Add handlers for floating buttons
  onOpenPortfolio?: () => void;
  onOpenProTools?: () => void;
  onOpenShop?: () => void;
  onOpenStockExchangeBuilder?: () => void;
  onOpenRightNow?: () => void;
  dailySpinAvailable?: boolean;
  onOpenDailySpin?: () => void;
  eventTrackNode?: ReactNode;
}

export function PhoneLayout({ 
  children, 
  currentPosition,
  currentRing = 1,
  gameState, 
  onRollDice, 
  multiplier,
  onCycleMultiplier,
  isRolling,
  isAutoRolling = false,
  onToggleAutoRoll = () => {},
  lastEnergyCheck,
  dice1,
  dice2,
  onOpenPortfolio = () => {},
  onOpenProTools = () => {},
  onOpenShop = () => {},
  onOpenStockExchangeBuilder = () => {},
  onOpenRightNow = () => {},
  dailySpinAvailable = false,
  onOpenDailySpin = () => {},
  eventTrackNode,
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDebug = import.meta.env.DEV;
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [spaceBackgroundEnabled, setSpaceBackgroundEnabled] = useState(false);
  const [backgroundChoice, setBackgroundChoice] = useState<'cycle' | 'finance-board'>(() => {
    if (typeof window === 'undefined') return 'cycle';
    const savedChoice = localStorage.getItem('alphastocks_phone_background');
    return savedChoice === 'finance-board' ? 'finance-board' : 'cycle';
  });
  const hideFloatingActions = isRolling;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  
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

  useEffect(() => {
    const handleBackgroundChange = () => {
      const savedChoice = localStorage.getItem('alphastocks_phone_background');
      setBackgroundChoice(savedChoice === 'finance-board' ? 'finance-board' : 'cycle');
    };

    window.addEventListener('phone-background-changed', handleBackgroundChange);
    window.addEventListener('storage', handleBackgroundChange);
    return () => {
      window.removeEventListener('phone-background-changed', handleBackgroundChange);
      window.removeEventListener('storage', handleBackgroundChange);
    };
  }, []);

  const phoneBackground = useMemo(() => {
    if (backgroundChoice === 'finance-board') {
      return '75A329D1-5D37-4EB7-B69E-9BA1D000C6DB 2.webp';
    }
    if (currentHour >= 0 && currentHour <= 4) return 'Phonebgdeepnight.webp';
    if (currentHour <= 6) return 'Phonebgdawnsunrise.webp';
    if (currentHour <= 8) return 'Phonebglatesunrise.webp';
    if (currentHour <= 16) return 'Phonebgday.webp';
    if (currentHour <= 18) return 'Phonebgsunset.webp';
    if (currentHour <= 20) return 'Phonebgearlynight.webp';
    return 'Phonebgdeepnight.webp';
  }, [backgroundChoice, currentHour]);

  const backgroundUrl = `${import.meta.env.BASE_URL}${phoneBackground}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.setProperty('--parallax-x', '0px');
    container.style.setProperty('--parallax-y', '0px');
    container.style.setProperty('--parallax-rotate-x', '0deg');
    container.style.setProperty('--parallax-rotate-y', '0deg');
    container.style.setProperty('--position-offset-x', '0px');
    container.style.setProperty('--position-offset-y', '0px');
  }, []);

  // Calculate UI element widths for board centering
  // Left side: Shop button + Exchanges/Right Now buttons occupy ~100px effective horizontal space
  const leftUIOffset = 100;
  // Right side: Portfolio button occupies ~40px effective space (with right-4 positioning)
  const rightUIOffset = 40;

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full flex flex-col overflow-hidden relative phone-layout"
    >
      {/* Single crisp background with 3D depth effect */}
      <div 
        className={`absolute inset-0 z-0 bg-cover bg-center pointer-events-none phone-background-3d ${spaceBackgroundEnabled ? 'phone-background-space' : ''}`}
        style={{ 
          backgroundImage: spaceBackgroundEnabled ? 'none' : `url('${backgroundUrl}')`,
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
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
            currentRing={currentRing}
            totalTiles={40}
            boardSize={1200}
            leftOffset={leftUIOffset}
            rightOffset={rightUIOffset}
          >
            {children}
          </MobileBoard3D>
        </div>
      )}
      
      {/* Layer 20: Floating Action Buttons - BOTTOM positioned, above dice area */}
      {mode === 'board' && (
        <>
          {/* Left side floating buttons - Shop, Exchanges, Right Now */}
          <div
            className={`fixed left-4 z-40 flex flex-col gap-2 transition-opacity ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ bottom: `${BOTTOM_NAV_HEIGHT + 20}px` }}
            aria-hidden={hideFloatingActions}
          >
            <button
              onClick={onOpenShop}
              className="flex items-center justify-center rounded-full bg-transparent p-0 shadow-lg shadow-sky-500/30 transition-all hover:shadow-xl"
              aria-label="Open Shop"
            >
              <img
                src={`${import.meta.env.BASE_URL}Shop.webp`}
                alt="Shop"
                className="h-14 w-14 object-contain"
              />
            </button>
            <button
              onClick={onOpenStockExchangeBuilder}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
              aria-label="Open Stock Exchange Builder"
            >
              📈 Exchanges
            </button>
            <button
              onClick={onOpenRightNow}
              className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
              aria-label="Open Right Now"
            >
              ⏰ Right Now
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            </button>
          </div>
        </>
      )}

      {/* Right side floating Daily Spin button */}
      {mode === 'board' && dailySpinAvailable && (
        <div
          className={`fixed right-4 z-40 transition-opacity ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          style={{ bottom: `${BOTTOM_NAV_HEIGHT + 20}px` }}
          aria-hidden={hideFloatingActions}
        >
          <button
            onClick={onOpenDailySpin}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl"
            aria-label="Open Daily Spin"
          >
            <span className="text-2xl">🎡</span>
          </button>
        </div>
      )}
      
      {/* Layer 30: Compact HUD */}
      <div className="relative z-[60]">
        <CompactHUD
          {...gameState}
          spaceBackgroundEnabled={spaceBackgroundEnabled}
          onToggleSpaceBackground={() => setSpaceBackgroundEnabled((enabled) => !enabled)}
        />
      </div>

      {eventTrackNode && (
        <div
          className="fixed left-3 right-3 z-40"
          style={{ top: `calc(${COMPACT_HUD_HEIGHT}px + 12px + var(--safe-area-top))` }}
        >
          {eventTrackNode}
        </div>
      )}
      
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
          onOpenProTools={onOpenProTools}
          lastEnergyCheck={lastEnergyCheck}
          dice1={dice1}
          dice2={dice2}
        />
      </div>

      {!authLoading && !isAuthenticated && (
        <div
          className="fixed left-3 right-3 z-[70] rounded-2xl border border-white/15 bg-black/60 p-3 text-white shadow-lg backdrop-blur"
          style={{ bottom: `${BOTTOM_NAV_HEIGHT + 16}px` }}
          role="status"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-semibold">Sign in to save your progress.</p>
              <p className="text-[11px] text-white/70">Sync across desktop, tablet, and mobile.</p>
            </div>
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => {
                window.location.href = 'https://www.alphastocks.ai/?proTools=1';
              }}
            >
              Sign in
            </Button>
          </div>
        </div>
      )}
      
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
