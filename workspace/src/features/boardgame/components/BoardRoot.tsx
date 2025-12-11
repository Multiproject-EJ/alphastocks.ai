import { FunctionalComponent, JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import AvatarToken from './AvatarToken.js';
import Dice from './Dice.js';

export type BoardTileType = 'corner' | 'category' | 'event';

export interface BoardTile {
  id: string;
  label: string;
  type: BoardTileType;
  color?: string;
}

interface BoardRootProps {
  onTileLanded?: (tile: BoardTile, tileIndex: number, rollValue: number) => void;
}

const BoardRoot: FunctionalComponent<BoardRootProps> = ({ onTileLanded }) => {
  const tiles: BoardTile[] = useMemo(
    () => [
      { id: 'corner_go', label: 'GO', type: 'corner' },
      { id: 'cat_turnaround_1', label: 'Turnarounds', type: 'category', color: 'brown' },
      { id: 'event_market_1', label: 'Market Event', type: 'event' },
      { id: 'cat_dividend_1', label: 'Dividends', type: 'category', color: 'light-blue' },
      { id: 'corner_court', label: 'Court of Capital', type: 'corner' },
      { id: 'cat_growth_1', label: 'Growth', type: 'category', color: 'orange' },
      { id: 'event_quiz_1', label: 'Quiz', type: 'event' },
      { id: 'cat_moat_1', label: 'Moats', type: 'category', color: 'red' },
      { id: 'corner_bias', label: 'Bias Sanctuary', type: 'corner' },
      { id: 'cat_value_1', label: 'Value', type: 'category', color: 'green' },
      { id: 'event_news_1', label: 'News Event', type: 'event' },
      { id: 'cat_income_1', label: 'Income', type: 'category', color: 'blue' },
      { id: 'corner_free', label: 'Free Rest', type: 'corner' }
    ],
    []
  );

  const [currentTileIndex, setCurrentTileIndex] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'moving' | 'tile_action'>('idle');
  const [lastRollValue, setLastRollValue] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastRollValueRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleRoll = (value: number) => {
    if (phase !== 'idle') return;
    setPhase('rolling');
    setLastRollValue(value);
    lastRollValueRef.current = value;

    const steps = value;
    let step = 0;
    let latestIndex = currentTileIndex;
    setPhase('moving');

    const intervalId = window.setInterval(() => {
      step += 1;
      setCurrentTileIndex((prev) => {
        const nextIndex = (prev + 1) % tiles.length;
        latestIndex = nextIndex;
        return nextIndex;
      });

      if (step >= steps) {
        window.clearInterval(intervalId);
        intervalRef.current = null;
        setPhase('tile_action');
        if (onTileLanded && lastRollValueRef.current != null) {
          const landedTile = tiles[latestIndex];
          onTileLanded(landedTile, latestIndex, lastRollValueRef.current);
        }
      }
    }, 200);

    intervalRef.current = intervalId;
  };

  const handleEndTurn = () => {
    setPhase('idle');
  };

  const boardStyle: JSX.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${tiles.length}, minmax(96px, 1fr))`,
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    background: 'var(--boardgame-board-bg)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
  };

  const renderTile = (tile: BoardTile, index: number) => {
    const isActive = index === currentTileIndex;

    const tileStyle: JSX.CSSProperties = {
      position: 'relative',
      padding: '0.75rem',
      minHeight: '96px',
      background: 'var(--boardgame-tile-bg)',
      border: '1px solid var(--boardgame-tile-border)',
      borderRadius: '0.75rem',
      color: 'var(--boardgame-tile-fg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: isActive
        ? '0 0 0 3px var(--boardgame-tile-glow-color), 0 10px 24px rgba(0, 0, 0, 0.35)'
        : '0 10px 24px rgba(0, 0, 0, 0.2)',
      transition: 'box-shadow 150ms ease, transform 150ms ease'
    };

    const badgeStyle: JSX.CSSProperties = {
      alignSelf: 'flex-start',
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      background: tile.type === 'corner' ? 'var(--boardgame-corner-bg)' : 'var(--boardgame-tile-chip-bg)',
      color: 'var(--boardgame-tile-chip-fg)',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    };

    const labelStyle: JSX.CSSProperties = {
      fontWeight: 700,
      fontSize: '1rem'
    };

    const colorStyle: JSX.CSSProperties | undefined = tile.color
      ? { color: 'var(--boardgame-tile-fg-strong)', opacity: 0.9 }
      : undefined;

    return (
      <div key={tile.id} className="boardgame-tile" style={tileStyle} aria-label={`Tile ${tile.label}`}>
        <span style={badgeStyle}>{tile.type}</span>
        <div style={labelStyle}>
          <span style={colorStyle}>{tile.label}</span>
        </div>
        <AvatarToken tileIndex={index} activeIndex={currentTileIndex} />
      </div>
    );
  };

  return (
    <section className="boardgame-board" aria-label="Board game surface">
      <div style={boardStyle}>{tiles.map((tile, index) => renderTile(tile, index))}</div>

      <div className="boardgame-controls" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
        <Dice disabled={phase !== 'idle'} onRoll={handleRoll} />
        {phase === 'tile_action' && (
          <button
            type="button"
            onClick={handleEndTurn}
            className="boardgame-end-turn"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--boardgame-tile-border)',
              background: 'var(--boardgame-tile-bg)',
              color: 'var(--boardgame-tile-fg)',
              cursor: 'pointer'
            }}
          >
            End Turn
          </button>
        )}
        <div style={{ alignSelf: 'center', color: 'var(--boardgame-app-fg)', opacity: 0.8 }}>
          Phase: {phase}
        </div>
      </div>
    </section>
  );
};

export default BoardRoot;
