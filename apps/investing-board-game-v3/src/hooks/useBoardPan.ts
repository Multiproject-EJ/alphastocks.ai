import { useState, useRef, useCallback, useEffect } from 'react';

interface PanState {
  x: number;
  y: number;
}

export function useBoardPan() {
  const [panOffset, setPanOffset] = useState<PanState>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef<PanState>({ x: 0, y: 0 });
  const startPan = useRef<PanState>({ x: 0, y: 0 });
  const panOffsetRef = useRef<PanState>({ x: 0, y: 0 });
  const snapBackTimer = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (snapBackTimer.current) {
        clearTimeout(snapBackTimer.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startPan.current = { ...panOffsetRef.current };
    setIsPanning(true);
    
    // Clear any pending snap-back
    if (snapBackTimer.current) {
      clearTimeout(snapBackTimer.current);
      snapBackTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setPanOffset({
      x: startPan.current.x + deltaX,
      y: startPan.current.y + deltaY,
    });
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    
    // Clear any existing timer
    if (snapBackTimer.current) {
      clearTimeout(snapBackTimer.current);
    }
    
    // Snap back to player after delay
    snapBackTimer.current = setTimeout(() => {
      setPanOffset({ x: 0, y: 0 });
      snapBackTimer.current = null;
    }, 2000);
  }, []);

  const resetPan = useCallback(() => {
    if (snapBackTimer.current) {
      clearTimeout(snapBackTimer.current);
      snapBackTimer.current = null;
    }
    setPanOffset({ x: 0, y: 0 });
  }, []);

  return {
    panOffset,
    isPanning,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetPan,
  };
}
