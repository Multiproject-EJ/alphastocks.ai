import { useState, useEffect } from 'react';
import { getLayoutMode, LayoutMode } from '@/lib/breakpoints';

export function useLayoutMode() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => 
    typeof window !== 'undefined' ? getLayoutMode(window.innerWidth) : 'desktop'
  );
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
      setLayoutMode(getLayoutMode(width));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    layoutMode,
    isPhone: layoutMode === 'phone',
    isTablet: layoutMode === 'tablet',
    isDesktop: layoutMode === 'desktop',
    dimensions,
    isLandscape: dimensions.width > dimensions.height,
    isPortrait: dimensions.height > dimensions.width,
  };
}
