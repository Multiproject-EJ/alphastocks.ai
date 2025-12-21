// Throttle function for scroll/resize handlers
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// RAF-based animation frame scheduler
export function scheduleFrame(callback: () => void): number {
  return requestAnimationFrame(callback);
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check device memory (Chrome only)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  return false;
}

// Measure component render time
export function measureRender(componentName: string) {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) {  // Over 1 frame (16ms)
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}
