export const tileTypes = ['stock', 'fishing', 'jail'];

export const groupColors = ['tech', 'consumer', 'finance', 'industrial', 'other'];

export const TILES = [
  { id: 'start-cash', positionIndex: 0, type: 'fishing', label: 'Fresh Cast' },
  { id: 'aapl', positionIndex: 1, type: 'stock', label: 'Apple', ticker: 'AAPL', sector: 'Consumer Tech', groupColor: 'tech' },
  { id: 'msft', positionIndex: 2, type: 'stock', label: 'Microsoft', ticker: 'MSFT', sector: 'Enterprise Software', groupColor: 'tech' },
  { id: 'googl', positionIndex: 3, type: 'stock', label: 'Alphabet', ticker: 'GOOGL', sector: 'Search & Ads', groupColor: 'tech' },
  { id: 'nvda', positionIndex: 4, type: 'stock', label: 'NVIDIA', ticker: 'NVDA', sector: 'Semiconductors', groupColor: 'tech' },
  { id: 'fishing-1', positionIndex: 5, type: 'fishing', label: 'Fishing Break' },
  { id: 'meta', positionIndex: 6, type: 'stock', label: 'Meta', ticker: 'META', sector: 'Social Platforms', groupColor: 'tech' },

  { id: 'tsm', positionIndex: 7, type: 'stock', label: 'TSMC', ticker: 'TSM', sector: 'Foundry', groupColor: 'industrial' },
  { id: 'avgo', positionIndex: 8, type: 'stock', label: 'Broadcom', ticker: 'AVGO', sector: 'Chips & Infrastructure', groupColor: 'industrial' },
  { id: 'intc', positionIndex: 9, type: 'stock', label: 'Intel', ticker: 'INTC', sector: 'Compute', groupColor: 'industrial' },
  { id: 'baba', positionIndex: 10, type: 'stock', label: 'Alibaba', ticker: 'BABA', sector: 'E-Commerce', groupColor: 'consumer' },
  { id: 'fishing-2', positionIndex: 11, type: 'fishing', label: 'Deep Sea Pause' },
  { id: 'shop', positionIndex: 12, type: 'stock', label: 'Shopify', ticker: 'SHOP', sector: 'E-Commerce Infra', groupColor: 'consumer' },
  { id: 'amzn', positionIndex: 13, type: 'stock', label: 'Amazon', ticker: 'AMZN', sector: 'Online Retail & Cloud', groupColor: 'consumer' },

  { id: 'jail', positionIndex: 14, type: 'jail', label: 'Investing Jail' },
  { id: 'jpm', positionIndex: 15, type: 'stock', label: 'JPMorgan', ticker: 'JPM', sector: 'Banking', groupColor: 'finance' },
  { id: 'gs', positionIndex: 16, type: 'stock', label: 'Goldman Sachs', ticker: 'GS', sector: 'Investment Bank', groupColor: 'finance' },
  { id: 'v', positionIndex: 17, type: 'stock', label: 'Visa', ticker: 'V', sector: 'Payments', groupColor: 'finance' },
  { id: 'ma', positionIndex: 18, type: 'stock', label: 'Mastercard', ticker: 'MA', sector: 'Payments', groupColor: 'finance' },
  { id: 'fishing-3', positionIndex: 19, type: 'fishing', label: 'Dockside Reset' },
  { id: 'ubs', positionIndex: 20, type: 'stock', label: 'UBS', ticker: 'UBS', sector: 'Wealth Mgmt', groupColor: 'finance' },

  { id: 'xom', positionIndex: 21, type: 'stock', label: 'Exxon', ticker: 'XOM', sector: 'Energy', groupColor: 'other' },
  { id: 'cvx', positionIndex: 22, type: 'stock', label: 'Chevron', ticker: 'CVX', sector: 'Energy', groupColor: 'other' },
  { id: 'lmt', positionIndex: 23, type: 'stock', label: 'Lockheed', ticker: 'LMT', sector: 'Aerospace', groupColor: 'industrial' },
  { id: 'cat', positionIndex: 24, type: 'stock', label: 'Caterpillar', ticker: 'CAT', sector: 'Machinery', groupColor: 'industrial' },
  { id: 'adbe', positionIndex: 25, type: 'stock', label: 'Adobe', ticker: 'ADBE', sector: 'Creative Software', groupColor: 'tech' },
  { id: 'orcl', positionIndex: 26, type: 'stock', label: 'Oracle', ticker: 'ORCL', sector: 'Enterprise Databases', groupColor: 'tech' },
  { id: 't', positionIndex: 27, type: 'stock', label: 'AT&T', ticker: 'T', sector: 'Telecom', groupColor: 'other' }
];

export const groupColorClassMap = {
  tech: 'tile-color-tech',
  consumer: 'tile-color-consumer',
  finance: 'tile-color-finance',
  industrial: 'tile-color-industrial',
  other: 'tile-color-other'
};
