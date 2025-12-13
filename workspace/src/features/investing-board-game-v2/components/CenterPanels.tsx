import { FunctionalComponent } from 'preact';
import type { BoardTile } from './BoardRoot';
import '../styles/CenterPanels.css';

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

type ThriftyCategory =
  | 'Groceries'
  | 'Subscriptions'
  | 'Transport'
  | 'Impulse Control'
  | 'Energy Bills'
  | 'DIY / Repairs'
  | 'Meal Prep'
  | 'Budgeting Habit'
  | 'Declutter & Sell';

interface ThriftyPath {
  id: string;
  title: string;
  description: string;
  category: ThriftyCategory;
  rewardStars: number;
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
  stars: number;
  thriftyOffer: ThriftyPath[] | null;
  lastChosenThriftyPath: ThriftyPath | null;
  onChooseThriftyPath: (path: ThriftyPath) => void;
  onSkipThriftyPath: () => void;
}

export const CenterPanels: FunctionalComponent<CenterPanelsProps> = ({
  cash,
  totalPortfolioValue,
  totalNetWorth,
  holdings,
  lastLandedTile,
  candidateStock,
  onBuyStock,
  onPassStock,
  stars,
  thriftyOffer,
  lastChosenThriftyPath,
  onChooseThriftyPath,
  onSkipThriftyPath
}) => {
  return (
    <div className="board-game-v2-panels">
      <section className="board-game-v2-panel">
        <h3 className="board-game-v2-panel-heading">MarketTycoon – Hub</h3>
        <p className="board-game-v2-panel-text">Mission: Build a resilient portfolio without going broke.</p>
        <div className="board-game-v2-summary">
          <div className="board-game-v2-summary-item">
            <div className="board-game-v2-label">Cash</div>
            <div className="board-game-v2-value">${cash.toLocaleString()}</div>
          </div>
          <div className="board-game-v2-summary-item">
            <div className="board-game-v2-label">Net Worth</div>
            <div className="board-game-v2-value">${totalNetWorth.toLocaleString()}</div>
          </div>
          <div className="board-game-v2-summary-item">
            <div className="board-game-v2-label">Holdings count</div>
            <div className="board-game-v2-value">{holdings.length}</div>
          </div>
          <div className="board-game-v2-summary-item">
            <div className="board-game-v2-label">Stars</div>
            <div className="board-game-v2-value">{stars}</div>
          </div>
        </div>
        <button
          type="button"
          className="board-game-v2-button board-game-v2-button-secondary board-game-v2-button-disabled"
        >
          Support development (coming soon)
        </button>

        <div className="board-game-v2-thrifty-path-card">
          {!thriftyOffer ? (
            <>
              <div className="board-game-v2-label">Thrifty Path</div>
              {lastChosenThriftyPath ? (
                <div className="board-game-v2-panel-text">
                  Last Thrifty Path: {lastChosenThriftyPath.title} (+
                  {lastChosenThriftyPath.rewardStars} ⭐)
                </div>
              ) : (
                <p className="board-game-v2-panel-text board-game-v2-text-muted">No Thrifty Path opportunity right now.</p>
              )}
            </>
          ) : (
            <div>
              <div className="board-game-v2-thrifty-header">
                <div className="board-game-v2-label">Thrifty Path Opportunity</div>
                <div className="board-game-v2-text-muted">Choose 1 of 5 to earn Stars</div>
              </div>
              <div className="board-game-v2-thrifty-options">
                {thriftyOffer.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    className="board-game-v2-button board-game-v2-button-secondary board-game-v2-thrifty-option"
                    onClick={() => onChooseThriftyPath(path)}
                  >
                    <div className="board-game-v2-thrifty-title">{path.title}</div>
                    <div className="board-game-v2-text-muted">{path.description}</div>
                    <div className="board-game-v2-thrifty-stars">+{path.rewardStars} ⭐</div>
                  </button>
                ))}
                <button
                  type="button"
                  className="board-game-v2-button board-game-v2-button-secondary"
                  onClick={onSkipThriftyPath}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="board-game-v2-panel">
        <h3 className="board-game-v2-panel-heading">Company / Tile</h3>
        {!candidateStock || lastLandedTile?.type !== 'category' ? (
          <p className="board-game-v2-panel-text">Land on a category tile to see a stock idea.</p>
        ) : (
          <div className="board-game-v2-stock-card">
            <div>
              <div className="board-game-v2-label board-game-v2-label-uppercase">
                {candidateStock.categoryLabel}
              </div>
              <div className="board-game-v2-stock-name">
                {candidateStock.name} ({candidateStock.ticker})
              </div>
            </div>
            <div>
              <div className="board-game-v2-label">Mock price</div>
              <div className="board-game-v2-value">${candidateStock.mockPrice.toFixed(2)}</div>
            </div>
            <div className="board-game-v2-stock-actions">
              <button type="button" className="board-game-v2-button" onClick={() => onBuyStock('small')}>
                Buy small
              </button>
              <button type="button" className="board-game-v2-button" onClick={() => onBuyStock('medium')}>
                Buy normal
              </button>
              <button type="button" className="board-game-v2-button" onClick={() => onBuyStock('large')}>
                Buy high conviction
              </button>
              <button type="button" className="board-game-v2-button board-game-v2-button-secondary" onClick={onPassStock}>
                Pass
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="board-game-v2-panel">
        <h3 className="board-game-v2-panel-heading">Portfolio / Results</h3>
        <div className="board-game-v2-portfolio-summary">
          <div className="board-game-v2-label">Cash</div>
          <div className="board-game-v2-value">${cash.toLocaleString()}</div>
          <div className="board-game-v2-label">Portfolio Value</div>
          <div className="board-game-v2-value">${totalPortfolioValue.toLocaleString()}</div>
          <div className="board-game-v2-label">Total Net Worth</div>
          <div className="board-game-v2-value">${totalNetWorth.toLocaleString()}</div>
        </div>

        {holdings.length === 0 ? (
          <p className="board-game-v2-panel-text">You don't own any stocks yet.</p>
        ) : (
          <div className="board-game-v2-holdings">
            <div className="board-game-v2-holdings-header">
              <div>Ticker</div>
              <div>Name</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Value</div>
            </div>
            {holdings.map((holding) => (
              <div
                key={holding.ticker}
                className="board-game-v2-holdings-row"
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
