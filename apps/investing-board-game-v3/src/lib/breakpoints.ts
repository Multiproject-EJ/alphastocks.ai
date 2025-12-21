export const BREAKPOINTS = {
  xs: 320,   // Small phones (iPhone SE)
  sm: 375,   // Standard phones (iPhone 14)
  md: 428,   // Large phones (iPhone 14 Pro Max)
  lg: 768,   // Tablets
  xl: 1024,  // Small laptops
  '2xl': 1280, // Desktops
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const LAYOUT_MODES = {
  phone: 'phone',      // < 768px
  tablet: 'tablet',    // 768px - 1024px
  desktop: 'desktop',  // > 1024px
} as const;

export type LayoutMode = keyof typeof LAYOUT_MODES;

export function getLayoutMode(width: number): LayoutMode {
  if (width < BREAKPOINTS.lg) return 'phone';
  if (width < BREAKPOINTS.xl) return 'tablet';
  return 'desktop';
}
