import { FunctionalComponent, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { BoardTile } from './components/BoardRoot';
import BoardRoot from './components/BoardRoot.js';
import CenterPanels from './components/CenterPanels.js';

interface BoardGameAppProps {
  onOpenProTools?: () => void;
  showProToolsButton?: boolean;
}

interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  price: number; // last purchase price (cost basis)
}

interface CandidateStock {
  ticker: string;
  name: string;
  categoryLabel: string;
  mockPrice: number;
}

const BoardGameApp: FunctionalComponent<BoardGameAppProps> = ({
  onOpenProTools,
  showProToolsButton = Boolean(onOpenProTools)
}) => {
  const [cash, setCash] = useState<number>(100_000);
  const [startingNetWorth] = useState<number>(100_000);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [turnHistory, setTurnHistory] = useState<number[]>([]);
  const [lastLandedTile, setLastLandedTile] = useState<BoardTile | null>(null);
  const [lastRollValue, setLastRollValue] = useState<number | null>(null);
  const [candidateStock, setCandidateStock] = useState<CandidateStock | null>(null);

  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.price,
    0
  );

  const totalNetWorth = cash + totalPortfolioValue;

  useEffect(() => {
    if (!lastLandedTile) return;
    setTurnHistory((prev) => [...prev, totalNetWorth]);
  }, [lastLandedTile, totalNetWorth]);

  const handleTileLanded = (tile: BoardTile, index: number, rollValue: number) => {
    setLastLandedTile(tile);
    setLastRollValue(rollValue);

    if (tile.type === 'category') {
      const mockPrice = 100 + index * 3;
      setCandidateStock({
        ticker: `DUMMY-${tile.id.toUpperCase()}`,
        name: `${tile.label} Corp`,
        categoryLabel: tile.label,
        mockPrice
      });
    } else {
      setCandidateStock(null);
    }
  };

  const handlePassStock = () => {
    // For now we keep candidateStock visible; no state change required.
    // eslint-disable-next-line no-console
    console.log('Pass on stock');
  };

  const handleBuyStock = (size: 'small' | 'medium' | 'large') => {
    if (!candidateStock) return;

    const { ticker, name, mockPrice } = candidateStock;

    const netWorth = totalNetWorth;
    let targetPct = 0.02;
    if (size === 'medium') targetPct = 0.05;
    if (size === 'large') targetPct = 0.1;

    const targetAmount = netWorth * targetPct;

    const spend = Math.min(targetAmount, cash);
    if (spend <= 0) return;

    const quantity = Math.floor(spend / mockPrice);
    if (quantity <= 0) return;

    const actualCost = quantity * mockPrice;

    setCash((prev) => prev - actualCost);

    setHoldings((prev) => {
      const existing = prev.find((h) => h.ticker === ticker);
      if (!existing) {
        return [
          ...prev,
          { ticker, name, quantity, price: mockPrice }
        ];
      }

      const newQuantity = existing.quantity + quantity;
      const newCostBasis =
        (existing.quantity * existing.price + quantity * mockPrice) / newQuantity;

      return prev.map((h) =>
        h.ticker === ticker
          ? { ...h, quantity: newQuantity, price: newCostBasis }
          : h
      );
    });
  };

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
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  };

  const boardColumnStyle: JSX.CSSProperties = {
    flex: 2,
    width: '100%',
    minWidth: 'min(100%, 640px)',
    maxWidth: '980px',
    marginInline: 'auto'
  };

  const panelColumnStyle: JSX.CSSProperties = {
    flex: 1.25,
    width: '100%',
    minWidth: '320px'
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
        {showProToolsButton && (
          <button type="button" className="pro-tools-cta" onClick={onOpenProTools}>
            Pro Tools
          </button>
        )}
      </header>

      <div className="boardgame-layout" style={layoutStyle}>
        <div style={boardColumnStyle}>
          <BoardRoot
            onTileLanded={handleTileLanded}
            startingNetWorth={startingNetWorth}
            currentNetWorth={totalNetWorth}
            holdingsCount={holdings.length}
          />
        </div>
        <div style={panelColumnStyle}>
          <CenterPanels
            cash={cash}
            totalPortfolioValue={totalPortfolioValue}
            totalNetWorth={totalNetWorth}
            holdings={holdings}
            lastLandedTile={lastLandedTile}
            candidateStock={candidateStock}
            onBuyStock={handleBuyStock}
            onPassStock={handlePassStock}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardGameApp;
