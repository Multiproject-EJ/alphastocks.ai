import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import '../styles/WealthThrone.css';

interface WealthThroneProps {
  startingNetWorth: number;
  currentNetWorth: number;
  holdingsCount: number;
}

export const WealthThrone: FunctionalComponent<WealthThroneProps> = ({
  startingNetWorth,
  currentNetWorth,
  holdingsCount,
}) => {
  const ratio = useMemo(() => {
    if (startingNetWorth <= 0) return 0;
    const raw = (currentNetWorth - startingNetWorth) / startingNetWorth;
    const normalized = (raw + 0.5) / 2.5; // map approx -50%..+200% to 0..1
    return Math.min(1, Math.max(0, normalized));
  }, [startingNetWorth, currentNetWorth]);

  const delta = currentNetWorth - startingNetWorth;
  const deltaPct =
    startingNetWorth > 0 ? (delta / startingNetWorth) * 100 : 0;

  return (
    <div className="board-game-v2-wealth-throne-wrapper">
      <div className="board-game-v2-wealth-throne-outer">
        <div className="board-game-v2-wealth-throne-middle">
          <div 
            className="board-game-v2-wealth-throne-inner"
            style={{
              boxShadow: `0 0 ${40 + ratio * 40}px rgba(212, 175, 55, ${0.2 + ratio * 0.4})`,
              transform: `scale(${1 + ratio * 0.06})`,
            }}
          >
            <div className="board-game-v2-wealth-throne-content">
              <div className="board-game-v2-wealth-throne-title">
                Wealth Throne
              </div>
              <div className="board-game-v2-wealth-throne-percent">
                {deltaPct >= 0 ? '+' : ''}
                {deltaPct.toFixed(1)}%
              </div>
              <div className="board-game-v2-wealth-throne-holdings">
                Holdings: {holdingsCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WealthThrone;
