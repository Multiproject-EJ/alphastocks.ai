import { FunctionalComponent, JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import AvatarToken from './AvatarToken';
import Dice from './Dice';
import { WealthThrone } from './WealthThrone';
import '../styles/BoardRoot.css';

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

  const renderTile = (tile: BoardTile, index: number) => {
    const isActive = index === currentTileIndex;
    const isHovered = hoveredTileIndex === index;

    let tileClassName = 'board-game-v2-tile';
    if (tile.type === 'corner') {
      tileClassName += ' board-game-v2-tile-corner';
    } else if (tile.type === 'category') {
      tileClassName += ' board-game-v2-tile-category';
    } else if (tile.type === 'event') {
      tileClassName += ' board-game-v2-tile-event';
    }
    if (isActive) {
      tileClassName += ' board-game-v2-tile-active';
    }
    if (isHovered && !isActive) {
      tileClassName += ' board-game-v2-tile-hovered';
    }

    return (
      <div
        key={tile.id}
        className={tileClassName}
        aria-label={`Tile ${tile.label}`}
        onMouseEnter={() => setHoveredTileIndex(index)}
        onMouseLeave={() =>
          setHoveredTileIndex((prev) => (prev === index ? null : prev))
        }
      >
        <span className="board-game-v2-tile-badge">{tile.type.toUpperCase()}</span>
        <div className="board-game-v2-tile-label-wrapper">
          <span className={tile.color ? 'board-game-v2-tile-label-colored' : ''}>
            {tile.label}
          </span>
        </div>
        <div className="board-game-v2-tile-token-container">
          <AvatarToken tileIndex={index} activeIndex={currentTileIndex} />
        </div>
      </div>
    );
  };

  return (
    <section className="board-game-v2-board-section" aria-label="Board game surface">
      <div className="board-game-v2-board-container">
        <div className="board-game-v2-board-inner-outline" />
        <div className="board-game-v2-board-center-area">
          <WealthThrone
            startingNetWorth={startingNetWorth}
            currentNetWorth={currentNetWorth}
            holdingsCount={holdingsCount}
          />
        </div>

        <div className="board-game-v2-board-tiles-wrapper">
          <div className="board-game-v2-board-tiles-row">
            {tiles.map((tile, index) => renderTile(tile, index))}
          </div>
        </div>
      </div>

      <div className="board-game-v2-controls">
        <Dice disabled={phase !== 'idle'} onRoll={handleRoll} />
        {phase === 'tile_action' && (
          <button
            type="button"
            onClick={handleEndTurn}
            className="board-game-v2-end-turn-button"
          >
            End Turn
          </button>
        )}
        <div className="board-game-v2-phase-indicator">
          Phase: {phase}
        </div>
      </div>
    </section>
  );
};

export default BoardRoot;
