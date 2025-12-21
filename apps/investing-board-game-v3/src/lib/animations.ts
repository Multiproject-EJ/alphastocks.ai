// Spring animation config for smooth, natural motion
export const SPRING_CONFIG = {
  gentle: { tension: 120, friction: 14 },
  default: { tension: 170, friction: 26 },
  snappy: { tension: 300, friction: 30 },
  stiff: { tension: 400, friction: 40 },
};

// Easing functions
export const easing = {
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Duration presets
export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// CSS transition builder
export function transition(
  properties: string | string[],
  durationMs: number = duration.normal,
  easingFn: string = easing.easeOutCubic
): string {
  const props = Array.isArray(properties) ? properties : [properties];
  return props.map(p => `${p} ${durationMs}ms ${easingFn}`).join(', ');
}

// Stagger delay calculator for list animations
export function staggerDelay(index: number, baseDelay: number = 50, maxDelay: number = 500): number {
  return Math.min(index * baseDelay, maxDelay);
}
