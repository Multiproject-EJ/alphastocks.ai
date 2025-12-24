/**
 * Board Game Portfolio Sync Service
 * 
 * Transforms board game holdings into ProTools-compatible portfolio format
 * Provides functions to get portfolio summary, positions, and snapshots
 */

/**
 * Calculate category allocation from holdings
 * @param {Array} holdings - Array of board game holdings
 * @param {number} portfolioValue - Total portfolio value
 * @returns {Object} Category allocation percentages
 */
const calculateCategoryAllocation = (holdings = [], portfolioValue = 0) => {
  if (!Array.isArray(holdings) || holdings.length === 0 || portfolioValue === 0) {
    return {};
  }

  const categoryTotals = {};
  
  holdings.forEach((holding) => {
    const category = holding?.stock?.category;
    const currentValue = (holding?.shares || 0) * (holding?.stock?.price || 0);
    
    if (category) {
      categoryTotals[category] = (categoryTotals[category] || 0) + currentValue;
    }
  });

  const allocation = {};
  Object.entries(categoryTotals).forEach(([category, value]) => {
    allocation[category] = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
  });

  return allocation;
};

/**
 * Transform board game profile into portfolio summary
 * @param {Object} boardGameProfile - Board game profile data
 * @returns {Object} Portfolio summary in ProTools format
 */
export const transformBoardGamePortfolioSummary = (boardGameProfile) => {
  if (!boardGameProfile) {
    return null;
  }

  const { 
    cash = 0, 
    portfolio_value = 0, 
    net_worth = 0, 
    holdings = [] 
  } = boardGameProfile;

  const holdingsArray = Array.isArray(holdings) ? holdings : [];
  const totalCostBasis = holdingsArray.reduce(
    (sum, holding) => sum + (holding?.totalCost || 0),
    0
  );
  const unrealizedGainLoss = portfolio_value - totalCostBasis;
  const unrealizedGainLossPct = totalCostBasis > 0 
    ? (unrealizedGainLoss / totalCostBasis) * 100 
    : 0;

  const categoryAllocation = calculateCategoryAllocation(holdingsArray, portfolio_value);

  return {
    source: 'board_game',
    totals: {
      nav: net_worth,
      cash: cash,
      portfolioValue: portfolio_value,
      cashRatio: net_worth > 0 ? cash / net_worth : 0,
      holdingsCount: holdingsArray.length,
      costBasis: totalCostBasis,
      unrealizedGainLoss,
      unrealizedGainLossPct
    },
    categoryAllocation,
    meta: `Board Game Portfolio • Net Worth $${(net_worth / 1000).toFixed(1)}k • ${holdingsArray.length} holdings`,
    bullets: [
      `Total portfolio value: $${(portfolio_value / 1000).toFixed(1)}k (${holdingsArray.length} holdings)`,
      `Cash balance: $${(cash / 1000).toFixed(1)}k (${net_worth > 0 ? ((cash / net_worth) * 100).toFixed(1) : '0.0'}% of net worth)`,
      `Unrealized gain/loss: ${unrealizedGainLoss >= 0 ? '+' : ''}$${(unrealizedGainLoss / 1000).toFixed(1)}k (${unrealizedGainLossPct >= 0 ? '+' : ''}${unrealizedGainLossPct.toFixed(1)}%)`
    ]
  };
};

/**
 * Transform board game holdings into portfolio positions
 * @param {Array} holdings - Board game holdings array
 * @returns {Array} Portfolio positions in ProTools format
 */
export const transformBoardGamePositions = (holdings = []) => {
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return [];
  }

  return holdings.map((holding) => {
    const { stock, shares = 0, totalCost = 0 } = holding || {};
    const { ticker, name, category, price = 0 } = stock || {};
    
    const currentValue = shares * price;
    const avgPrice = shares > 0 ? totalCost / shares : 0;
    const unrealizedGainLoss = currentValue - totalCost;
    const unrealizedGainLossPct = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

    return {
      symbol: ticker || 'N/A',
      name: name || 'Unknown',
      category: category || 'other',
      shares,
      avgPrice,
      currentPrice: price,
      totalCost,
      currentValue,
      unrealizedGainLoss,
      unrealizedGainLossPct
    };
  }).sort((a, b) => b.currentValue - a.currentValue);
};

/**
 * Get board game portfolio data from data service
 * @param {Object} dataService - Data service instance
 * @param {string} profileId - User profile ID
 * @returns {Promise<Object|null>} Board game portfolio data or null
 */
export const getBoardGamePortfolio = async (dataService, profileId) => {
  try {
    if (!dataService || !profileId) {
      return null;
    }

    const options = dataService.mode === 'supabase' 
      ? { match: { profile_id: profileId } }
      : undefined;

    const result = await dataService.getTable('board_game_profiles', options);
    
    if (!result || !result.rows || result.rows.length === 0) {
      return null;
    }

    // Return the first (and should be only) board game profile for this user
    return result.rows[0];
  } catch (error) {
    console.error('Failed to fetch board game portfolio:', error);
    return null;
  }
};

/**
 * Check if user has a board game portfolio
 * @param {Object} dataService - Data service instance
 * @param {string} profileId - User profile ID
 * @returns {Promise<boolean>} True if user has board game portfolio
 */
export const hasBoardGamePortfolio = async (dataService, profileId) => {
  const portfolio = await getBoardGamePortfolio(dataService, profileId);
  return portfolio !== null && Array.isArray(portfolio.holdings) && portfolio.holdings.length > 0;
};
