import { FunctionalComponent, JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import AvatarToken from './AvatarToken.js';
import Dice from './Dice.js';
import { WealthThrone } from './WealthThrone.js';

export type BoardTileType = 'corner' | 'category' | 'event';

export interface BoardTile {
  id: string;
  label: string;
  type: BoardTileType;
  color?: string;
}

interface BoardRootProps {
  onTileLanded?: (tile: BoardTile, tileIndex: number, rollValue: number) => void;
  startingNetWorth: number;
  currentNetWorth: number;
  holdingsCount: number;
}

const BoardRoot: FunctionalComponent<BoardRootProps> = ({
  onTileLanded,
  startingNetWorth,
  currentNetWorth,
  holdingsCount,
}) => {
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
      { id: 'corner_bias', label: 'Investment Phycology', type: 'corner' },
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
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);
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

  const boardContainerStyle: JSX.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    aspectRatio: '16 / 9',
    margin: '0 auto',
    borderRadius: 32,
    background: '#020617',
    boxShadow: '0 0 40px rgba(0,0,0,0.9)',
    border: '2px solid rgba(148, 163, 184, 0.35)',
    padding: '1.5rem 1.5rem 3.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden'
  };

  const innerOutlineStyle: JSX.CSSProperties = {
    position: 'absolute',
    inset: '0.75rem',
    borderRadius: 26,
    border: '1px solid rgba(148, 163, 184, 0.25)',
    pointerEvents: 'none'
  };

  const centerAreaStyle: JSX.CSSProperties = {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '1rem',
    zIndex: 1
  };

  const tileRowStyle: JSX.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    gap: '0.85rem',
    alignItems: 'stretch',
    overflowX: 'auto',
    padding: '0.25rem 0.25rem 0.5rem',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(148, 163, 184, 0.5) transparent'
  };

  const renderTile = (tile: BoardTile, index: number) => {
    const isActive = index === currentTileIndex;
    const isHovered = hoveredTileIndex === index;

    const tileStyle: JSX.CSSProperties = {
      position: 'relative',
      minWidth: 120,
      padding: '0.55rem 0.75rem',
      borderRadius: 18,
      background: 'linear-gradient(145deg, #020617, #020617)',
      border: '1px solid rgba(51, 65, 85, 0.9)',
      boxShadow: '0 8px 16px rgba(15, 23, 42, 0.75)',
      color: 'var(--boardgame-tile-fg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.35rem',
      transition: 'box-shadow 180ms ease, transform 180ms ease, border 180ms ease',
      cursor: 'pointer',
      transform: 'translateY(0)'
    };

    if (tile.type === 'corner') {
      tileStyle.background = 'linear-gradient(145deg, #111827, #020617)';
      tileStyle.border = '1px solid rgba(148, 163, 184, 0.55)';
    }

    if (tile.type === 'category') {
      tileStyle.border = '1px solid rgba(94, 234, 212, 0.25)';
    }

    if (tile.type === 'event') {
      tileStyle.border = '1px solid rgba(56, 189, 248, 0.35)';
      tileStyle.background = 'linear-gradient(145deg, #0b1220, #0f172a)';
    }

    if (isHovered && !isActive) {
      tileStyle.boxShadow = '0 10px 20px rgba(15, 23, 42, 0.85)';
      tileStyle.transform = 'translateY(-2px)';
      tileStyle.border = tileStyle.border ?? '1px solid rgba(148, 163, 184, 0.4)';
    }

    const badgeStyle: JSX.CSSProperties = {
      alignSelf: 'flex-start',
      padding: '0.22rem 0.55rem',
      borderRadius: '999px',
      background:
        tile.type === 'corner'
          ? 'var(--boardgame-corner-bg)'
          : 'var(--boardgame-tile-chip-bg)',
      color: 'var(--boardgame-tile-chip-fg)',
      fontSize: '0.68rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 700,
      border: '1px solid rgba(148, 163, 184, 0.25)'
    };

    const labelStyle: JSX.CSSProperties = {
      fontWeight: 700,
      fontSize: '1.1rem',
      letterSpacing: '0.01em'
    };

    const colorStyle: JSX.CSSProperties | undefined = tile.color
      ? { color: 'var(--boardgame-tile-fg-strong)', opacity: 0.9 }
      : undefined;

    if (isActive) {
      tileStyle.border = '1px solid rgba(212, 175, 55, 0.9)';
      tileStyle.boxShadow =
        '0 0 18px rgba(212, 175, 55, 0.8), 0 10px 24px rgba(15, 23, 42, 0.85)';
      tileStyle.transform = 'translateY(-4px)';
    }

    return (
      <div
        key={tile.id}
        className="boardgame-tile"
        style={tileStyle}
        aria-label={`Tile ${tile.label}`}
        onMouseEnter={() => setHoveredTileIndex(index)}
        onMouseLeave={() =>
          setHoveredTileIndex((prev) => (prev === index ? null : prev))
        }
      >
        <span style={badgeStyle}>{tile.type.toUpperCase()}</span>
        <div style={labelStyle}>
          <span style={colorStyle}>{tile.label}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AvatarToken tileIndex={index} activeIndex={currentTileIndex} />
        </div>
      </div>
    );
  };

  return (
    <section className="boardgame-board" aria-label="Board game surface">
      <div style={boardContainerStyle}>
        <div style={innerOutlineStyle} />
        <div style={centerAreaStyle}>
          <WealthThrone
            startingNetWorth={startingNetWorth}
            currentNetWorth={currentNetWorth}
            holdingsCount={holdingsCount}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={tileRowStyle}>
            {tiles.map((tile, index) => renderTile(tile, index))}
          </div>
        </div>
      </div>

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
