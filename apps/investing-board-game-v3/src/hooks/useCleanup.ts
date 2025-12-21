import { useEffect, useRef, useCallback } from 'react';

type CleanupFn = () => void;

export function useCleanup() {
  const cleanupFns = useRef<CleanupFn[]>([]);

  const registerCleanup = useCallback((fn: CleanupFn) => {
    cleanupFns.current.push(fn);
  }, []);

  useEffect(() => {
    return () => {
      // Run all cleanup functions on unmount
      cleanupFns.current.forEach(fn => {
        try {
          fn();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      });
      cleanupFns.current = [];
    };
  }, []);

  return registerCleanup;
}

// Auto-cleanup for event listeners
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
