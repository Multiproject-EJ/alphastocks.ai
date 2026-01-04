import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, TrendingUp } from 'lucide-react';
import { CompactHUD } from './CompactHUD';
import { PhoneBottomNav } from './PhoneBottomNav';
import { MobileBoard3D } from './MobileBoard3D';
import { BoardDebugOverlay } from './BoardDebugOverlay';
import { useUIMode } from '@/hooks/useUIMode';

// Layout constants for consistent sizing
const COMPACT_HUD_HEIGHT = 48;  // pixels
const BOTTOM_NAV_HEIGHT = 90;   // pixels (updated to match new nav height)
const DEFAULT_TOTAL_TILES = 40; // Standard board size for position calculations

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
  dice1?: number;
  dice2?: number;
  // Add handlers for floating buttons
  onOpenPortfolio?: () => void;
  onOpenProTools?: () => void;
  onOpenShop?: () => void;
  onOpenStockExchangeBuilder?: () => void;
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
  dice1,
  dice2,
  onOpenPortfolio = () => {},
  onOpenProTools = () => {},
  onOpenShop = () => {},
  onOpenStockExchangeBuilder = () => {},
  onOpenRightNow = () => {},
}: PhoneLayoutProps) {
  const { mode } = useUIMode();
  const showDebug = import.meta.env.DEV;
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const hideFloatingActions = isRolling;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const parallaxTarget = useRef({ x: 0, y: 0 });
  
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
    if (currentHour <= 6) return 'Phonebgdawnsunrise.webp';
    if (currentHour <= 8) return 'Phonebglatesunrise.webp';
    if (currentHour <= 16) return 'Phonebgday.webp';
    if (currentHour <= 18) return 'Phonebgsunset.webp';
    if (currentHour <= 20) return 'Phonebgearlynight.webp';
    return 'Phonebgdeepnight.webp';
  }, [currentHour]);

  const backgroundUrl = `${import.meta.env.BASE_URL}${phoneBackground}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const maxOffset = 30; // Increased from 12 to 30 for more noticeable movement
    const updateTarget = (x: number, y: number) => {
      parallaxTarget.current.x = Math.max(-1, Math.min(1, x)) * maxOffset;
      parallaxTarget.current.y = Math.max(-1, Math.min(1, y)) * maxOffset;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth) * 2 - 1;
      const y = (event.clientY / innerHeight) * 2 - 1;
      updateTarget(x, y);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      // Increased sensitivity: divided by 15 instead of 30 for more responsive movement
      const x = event.gamma / 15;
      const y = event.beta / 15;
      updateTarget(x, y);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    let rafId = 0;
    const animate = () => {
      const { x, y } = parallaxTarget.current;
      container.style.setProperty('--parallax-x', `${x}px`);
      container.style.setProperty('--parallax-y', `${y}px`);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Add subtle background shift based on player position for extra depth
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate position-based offset (subtle, for background depth)
    // Normalized position around the circle (0-1)
    const normalizedPosition = currentPosition / DEFAULT_TOTAL_TILES;
    const angleRad = normalizedPosition * Math.PI * 2;
    
    // Create subtle circular movement pattern
    const bgOffsetX = Math.sin(angleRad) * 8; // Small 8px max offset
    const bgOffsetY = Math.cos(angleRad) * 8;
    
    container.style.setProperty('--position-offset-x', `${bgOffsetX}px`);
    container.style.setProperty('--position-offset-y', `${bgOffsetY}px`);
  }, [currentPosition]);

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
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none phone-background-3d"
        style={{ 
          backgroundImage: `url('${backgroundUrl}')`,
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
            totalTiles={40}
            boardSize={1200}
            leftOffset={leftUIOffset}
            rightOffset={rightUIOffset}
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
          
          <div
            className={`fixed left-4 z-40 flex flex-col gap-3 transition-opacity ${hideFloatingActions ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ top: `${COMPACT_HUD_HEIGHT + 80}px` }}
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
                className="h-[5.6rem] w-[5.6rem] object-contain"
              />
            </button>
            <button
              onClick={onOpenStockExchangeBuilder}
              className="flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm transition-all hover:bg-emerald-500"
              aria-label="Open Stock Exchange Builder"
            >
              <TrendingUp size={18} />
              Exchanges
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
          onOpenProTools={onOpenProTools}
          lastEnergyCheck={lastEnergyCheck}
          dice1={dice1}
          dice2={dice2}
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
