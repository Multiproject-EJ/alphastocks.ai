interface BoardDebugProps {
  currentPosition: number;
  camera: {
    perspective: number;
    rotateX: number;
    scale: number;
  };
  isVisible: boolean;
}

export function BoardDebugOverlay({ currentPosition, camera, isVisible }: BoardDebugProps) {
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 60,
      left: 10,
      background: 'rgba(0,0,0,0.8)',
      color: '#0f0',
      padding: 8,
      fontSize: 11,
      fontFamily: 'monospace',
      zIndex: 9999,
      borderRadius: 4,
    }}>
      <div>🎯 Position: {currentPosition}</div>
      <div>📐 Tilt: {camera.rotateX}°</div>
      <div>🔍 Zoom: {camera.scale}x</div>
      <div>👁️ Perspective: {camera.perspective}px</div>
      <div style={{ color: camera.rotateX > 0 ? '#0f0' : '#f00' }}>
        3D: {camera.rotateX > 0 ? '✓ ACTIVE' : '✗ OFF'}
      </div>
    </div>
  );
}
