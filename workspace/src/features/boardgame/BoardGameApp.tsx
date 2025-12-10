import { FunctionalComponent, JSX } from 'preact';
import BoardRoot from './components/BoardRoot.js';
import CenterPanels from './components/CenterPanels.js';

const BoardGameApp: FunctionalComponent = () => {
  const shellStyle: JSX.CSSProperties = {
    background: 'var(--boardgame-app-bg)',
    color: 'var(--boardgame-app-fg)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  };

  const subduedStyle: JSX.CSSProperties = {
    color: 'rgba(245, 245, 245, 0.8)'
  };

  const layoutStyle: JSX.CSSProperties = {
    display: 'grid',
    gap: '1.25rem',
    gridTemplateColumns: '2fr 1fr',
    alignItems: 'start'
  };

  const boardColumnStyle: JSX.CSSProperties = {
    width: '100%',
    maxWidth: '980px',
    marginInline: 'auto'
  };

  return (
    <div className="boardgame-app" style={shellStyle}>
      <header className="boardgame-header">
        <div>
          <p className="badge">Beta</p>
          <h2>Investing Board Game (Beta)</h2>
          <p className="detail-meta" style={subduedStyle}>
            Dice-driven investing simulation powered by ValueBot
          </p>
        </div>
      </header>

      <div className="boardgame-layout" style={layoutStyle}>
        <div style={boardColumnStyle}>
          <BoardRoot />
        </div>
        <CenterPanels />
      </div>
    </div>
  );
};

export default BoardGameApp;
