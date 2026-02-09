import { useEffect, useState } from 'react';
import { clearProToolsDiagnostics, getProToolsDiagnostics, subscribeToProToolsDiagnostics } from '@/lib/proToolsDiagnostics';

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
  const [diagnostics, setDiagnostics] = useState(() => getProToolsDiagnostics().slice(0, 4));

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setDiagnostics(getProToolsDiagnostics().slice(0, 4));
    return subscribeToProToolsDiagnostics(() => {
      setDiagnostics(getProToolsDiagnostics().slice(0, 4));
    });
  }, [isVisible]);

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
      <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span>🔁 ProTools</span>
          <button
            type="button"
            onClick={() => clearProToolsDiagnostics()}
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#0f0',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
        {diagnostics.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>No entries yet.</div>
        ) : (
          diagnostics.map((entry) => (
            <div key={entry.id}>
              {entry.timestamp.slice(11, 19)} {entry.action}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
