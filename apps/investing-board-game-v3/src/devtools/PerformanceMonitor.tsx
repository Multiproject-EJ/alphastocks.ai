import { useState, useEffect, useRef } from 'react';
import { isLowEndDevice } from '@/lib/performance';

export function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
    
    let animationId: number;
    
    const measureFps = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;
      
      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationId = requestAnimationFrame(measureFps);
    };
    
    animationId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const fpsColor = fps >= 55 ? 'green' : fps >= 30 ? 'orange' : 'red';

  return (
    <div className="devtools-section">
      <h3>⚡ Performance</h3>
      <div style={{ color: fpsColor }}>
        FPS: <strong>{fps}</strong>
      </div>
      <div>
        Device: {isLowEnd ? '🐢 Low-end' : '🚀 Normal'}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Target: 60fps
      </div>
    </div>
  );
}
