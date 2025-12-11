import React from 'react';
import type { BoardTile } from './BoardRoot';

interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  price: number;
}

interface CandidateStock {
  ticker: string;
  name: string;
  categoryLabel: string;
  mockPrice: number;
}

interface CenterPanelsProps {
  cash: number;
  totalPortfolioValue: number;
  totalNetWorth: number;
  holdings: Holding[];
  lastLandedTile: BoardTile | null;
  candidateStock: CandidateStock | null;
  onBuyStock: (size: 'small' | 'medium' | 'large') => void;
  onPassStock: () => void;
}

export const CenterPanels: React.FC<CenterPanelsProps> = ({
  cash,
  totalPortfolioValue,
  totalNetWorth,
  holdings,
  lastLandedTile,
  candidateStock,
  onBuyStock,
  onPassStock
}) => {
  return (
    <div className="boardgame-panels">
      <section className="boardgame-panel">
        <h3>Investing Board Game – Hub</h3>
        <p>Mission: Build a resilient portfolio without going broke.</p>
        <div className="boardgame-summary" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '160px' }}>
            <div className="label">Cash</div>
            <div className="value">${cash.toLocaleString()}</div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <div className="label">Net Worth</div>
            <div className="value">${totalNetWorth.toLocaleString()}</div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <div className="label">Holdings count</div>
            <div className="value">{holdings.length}</div>
          </div>
        </div>
        <button
          type="button"
          className="button button-secondary"
          style={{ marginTop: '0.75rem', opacity: 0.7, cursor: 'not-allowed' }}
        >
          Support development (coming soon)
        </button>
      </section>

      <section className="boardgame-panel">
        <h3>Company / Tile</h3>
        {!candidateStock || lastLandedTile?.type !== 'category' ? (
          <p>Land on a category tile to see a stock idea.</p>
        ) : (
          <div className="stock-card" style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <div className="label" style={{ textTransform: 'uppercase', opacity: 0.7 }}>
                {candidateStock.categoryLabel}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {candidateStock.name} ({candidateStock.ticker})
              </div>
            </div>
            <div>
              <div className="label">Mock price</div>
              <div className="value">${candidateStock.mockPrice.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="button" onClick={() => onBuyStock('small')}>
                Buy small
              </button>
              <button type="button" className="button" onClick={() => onBuyStock('medium')}>
                Buy normal
              </button>
              <button type="button" className="button" onClick={() => onBuyStock('large')}>
                Buy high conviction
              </button>
              <button type="button" className="button button-secondary" onClick={onPassStock}>
                Pass
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="boardgame-panel">
        <h3>Portfolio / Results</h3>
        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div className="label">Cash</div>
          <div className="value">${cash.toLocaleString()}</div>
          <div className="label">Portfolio Value</div>
          <div className="value">${totalPortfolioValue.toLocaleString()}</div>
          <div className="label">Total Net Worth</div>
          <div className="value">${totalNetWorth.toLocaleString()}</div>
        </div>

        {holdings.length === 0 ? (
          <p>You don’t own any stocks yet.</p>
        ) : (
          <div className="boardgame-holdings" style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', fontWeight: 700 }}>
              <div>Ticker</div>
              <div>Name</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Value</div>
            </div>
            {holdings.map((holding) => (
              <div
                key={holding.ticker}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', alignItems: 'center' }}
              >
                <div>{holding.ticker}</div>
                <div>{holding.name}</div>
                <div>{holding.quantity}</div>
                <div>${holding.price.toFixed(2)}</div>
                <div>${(holding.quantity * holding.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CenterPanels;
