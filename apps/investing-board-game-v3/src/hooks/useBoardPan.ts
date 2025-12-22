import { useState, useRef, useCallback } from 'react';

interface PanState {
  x: number;
  y: number;
}

export function useBoardPan() {
  const [panOffset, setPanOffset] = useState<PanState>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef<PanState>({ x: 0, y: 0 });
  const startPan = useRef<PanState>({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startPan.current = { ...panOffset };
    setIsPanning(true);
  }, [panOffset]);

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
    // Optionally snap back to player after delay
    setTimeout(() => {
      setPanOffset({ x: 0, y: 0 });
    }, 2000);
  }, []);

  const resetPan = useCallback(() => {
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
