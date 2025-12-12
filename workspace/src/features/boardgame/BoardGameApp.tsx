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

const THRIFTY_PATH_LIBRARY: ThriftyPath[] = [
  {
    id: 'tp_sub_audit',
    title: 'Subscription Audit',
    description: 'Cancel or downgrade 1 subscription you don’t fully use.',
    category: 'Subscriptions',
    rewardStars: 8
  },
  {
    id: 'tp_meal_plan',
    title: 'Meal Plan Sprint',
    description: 'Plan 3 dinners before shopping to avoid impulse buys.',
    category: 'Meal Prep',
    rewardStars: 6
  },
  {
    id: 'tp_no_takeout',
    title: 'No Takeout Day',
    description: 'Cook at home today. Save the takeout cost.',
    category: 'Groceries',
    rewardStars: 5
  },
  {
    id: 'tp_sell_one',
    title: 'Sell One Item',
    description: 'List one unused item for sale (FB Marketplace/FINN/eBay).',
    category: 'Declutter & Sell',
    rewardStars: 10
  },
  {
    id: 'tp_drive_less',
    title: 'Drive Less Day',
    description: 'Replace one car errand with walking, biking, or public transport.',
    category: 'Transport',
    rewardStars: 5
  },
  {
    id: 'tp_price_compare',
    title: 'Price Compare 2x',
    description: 'Compare prices at two stores before buying a staple item.',
    category: 'Groceries',
    rewardStars: 6
  },
  {
    id: 'tp_cash_envelope',
    title: 'Cash Envelope Trial',
    description: 'Use cash for discretionary spend today to cap impulse buys.',
    category: 'Impulse Control',
    rewardStars: 7
  },
  {
    id: 'tp_insulation',
    title: 'Draft Blocker',
    description: 'Seal one drafty window/door to cut heating/cooling loss.',
    category: 'Energy Bills',
    rewardStars: 9
  },
  {
    id: 'tp_library_swap',
    title: 'Library Swap',
    description: 'Borrow a book/movie from the library instead of buying/renting.',
    category: 'Budgeting Habit',
    rewardStars: 5
  },
  {
    id: 'tp_brew_coffee',
    title: 'Home Brew Coffee',
    description: 'Skip café coffee twice this week and brew at home.',
    category: 'Groceries',
    rewardStars: 4
  },
  {
    id: 'tp_prep_snacks',
    title: 'Prep Snacks',
    description: 'Pack snacks to avoid vending machine or convenience store buys.',
    category: 'Meal Prep',
    rewardStars: 6
  },
  {
    id: 'tp_switch_light',
    title: 'LED Swap',
    description: 'Swap one high-use bulb with an LED to trim power usage.',
    category: 'Energy Bills',
    rewardStars: 6
  },
  {
    id: 'tp_negotiation',
    title: 'Negotiate a Bill',
    description: 'Call one provider to ask for a discount or promo rate.',
    category: 'Subscriptions',
    rewardStars: 9
  },
  {
    id: 'tp_bike_tune',
    title: 'DIY Bike Tune',
    description: 'Oil your chain and inflate tires to keep biking cheap and fun.',
    category: 'DIY / Repairs',
    rewardStars: 7
  },
  {
    id: 'tp_repair_clothes',
    title: 'Repair Clothes',
    description: 'Fix a button/hem instead of replacing the garment.',
    category: 'DIY / Repairs',
    rewardStars: 8
  },
  {
    id: 'tp_five_min_budget',
    title: '5-Min Budget Check',
    description: 'Review your spending app for 5 minutes; note one tweak.',
    category: 'Budgeting Habit',
    rewardStars: 5
  },
  {
    id: 'tp_free_activity',
    title: 'Free Activity Swap',
    description: 'Replace a paid outing with a free alternative today.',
    category: 'Impulse Control',
    rewardStars: 7
  },
  {
    id: 'tp_meal_batch',
    title: 'Batch Cook Base',
    description: 'Cook a base (rice/beans) to anchor two meals this week.',
    category: 'Meal Prep',
    rewardStars: 6
  },
  {
    id: 'tp_sell_digital',
    title: 'Digital Declutter Sale',
    description: 'Sell an unused digital subscription or license.',
    category: 'Declutter & Sell',
    rewardStars: 8
  },
  {
    id: 'tp_carpool',
    title: 'Arrange a Carpool',
    description: 'Share one commute/errand trip with someone this week.',
    category: 'Transport',
    rewardStars: 7
  },
  {
    id: 'tp_appliance_clean',
    title: 'Clean Filters',
    description: 'Clean dryer/AC filters to improve efficiency.',
    category: 'Energy Bills',
    rewardStars: 6
  }
];

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
  const [stars, setStars] = useState<number>(0);
  const [thriftyOffer, setThriftyOffer] = useState<ThriftyPath[] | null>(null);
  const [lastChosenThriftyPath, setLastChosenThriftyPath] =
    useState<ThriftyPath | null>(null);

  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.price,
    0
  );

  const totalNetWorth = cash + totalPortfolioValue;

  useEffect(() => {
    if (!lastLandedTile) return;
    setTurnHistory((prev) => [...prev, totalNetWorth]);
  }, [lastLandedTile, totalNetWorth]);

  function pickRandomUnique<T>(arr: T[], count: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    while (out.length < count && copy.length > 0) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

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

    const shouldOfferThrifty =
      tile.type === 'event' || (tile.type === 'category' && Math.random() < 0.2);

    if (shouldOfferThrifty) {
      setThriftyOffer(pickRandomUnique(THRIFTY_PATH_LIBRARY, 5));
      setLastChosenThriftyPath(null);
    } else {
      setThriftyOffer(null);
    }
  };

  const handleChooseThriftyPath = (path: ThriftyPath) => {
    setStars((prev) => prev + path.rewardStars);
    setLastChosenThriftyPath(path);
    setThriftyOffer(null);
  };

  const handleSkipThriftyPath = () => {
    setThriftyOffer(null);
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
          <h2>MarketTycoon</h2>
          <p className="detail-meta" style={subduedStyle}>
            Board game-style investing simulation powered by ValueBot
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
            stars={stars}
            thriftyOffer={thriftyOffer}
            lastChosenThriftyPath={lastChosenThriftyPath}
            onChooseThriftyPath={handleChooseThriftyPath}
            onSkipThriftyPath={handleSkipThriftyPath}
          />
        </div>
      </div>
    </div>
  );
};

export default BoardGameApp;
