import { useCallback, useEffect, useState, useMemo } from 'preact/hooks';
import WorldMap from './WorldMap.jsx';

const API_ENDPOINT = '/api/universe-builder';

const UniverseBuilder = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [stocksPage, setStocksPage] = useState(1);
  const [stocksPagination, setStocksPagination] = useState(null);
  const [showStocks, setShowStocks] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run analysis
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setLastAnalysisResult(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run analysis');
      }

      setLastAnalysisResult(data);
      
      // Refresh status after analysis
      await fetchStatus();
    } catch (err) {
      console.error('Error running analysis:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [fetchStatus]);

  // Toggle priority
  const togglePriority = useCallback(async (micCode, currentPriority) => {
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'set-priority',
          mic_code: micCode,
          is_priority: !currentPriority
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to toggle priority');
      }

      // Refresh status to show updated priority
      await fetchStatus();
    } catch (err) {
      console.error('Error toggling priority:', err);
      setError(err.message);
    }
  }, [fetchStatus]);

  // Fetch stocks
  const fetchStocks = useCallback(async (page = 1) => {
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get-stocks',
          page,
          per_page: 50
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch stocks');
      }

      setStocks(data.stocks || []);
      setStocksPagination(data.pagination);
      setStocksPage(page);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Load stocks when showing
  useEffect(() => {
    if (showStocks && stocks.length === 0) {
      fetchStocks(1);
    }
  }, [showStocks, stocks.length, fetchStocks]);

  // Filter exchanges by region
  const filteredExchanges = useMemo(() => {
    if (!status?.exchanges) return [];
    if (selectedRegion === 'all') return status.exchanges;
    return status.exchanges.filter(e => e.region === selectedRegion);
  }, [status, selectedRegion]);

  // Get unique regions
  const regions = useMemo(() => {
    if (!status?.exchanges) return [];
    const uniqueRegions = [...new Set(status.exchanges.map(e => e.region))];
    return uniqueRegions.filter(Boolean).sort();
  }, [status]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get progress percentage for letter
  const getLetterProgress = (letter) => {
    if (!letter) return 0;
    const index = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
    return Math.round(((index + 1) / 26) * 100);
  };

  if (isLoading && !status) {
    return (
      <div className="universe-builder">
        <p>Loading Universe Builder...</p>
      </div>
    );
  }

  return (
    <div className="universe-builder">
      {/* Header */}
      <header className="universe-builder__header">
        <div>
          <h2>🌐 Global Stock Universe Builder</h2>
          <p className="detail-meta">Systematically catalog every stock from every exchange worldwide</p>
        </div>
        
        {/* Stats Row */}
        {status && (
          <div className="universe-builder__stats">
            <div className="stat">
              <span className="stat__label">Total Exchanges</span>
              <span className="stat__value">{status.stats?.totalExchanges || 0}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Stocks Cataloged</span>
              <span className="stat__value">{status.totalStocks || 0}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Exchanges Completed</span>
              <span className="stat__value">{status.stats?.completedExchanges || 0}</span>
            </div>
          </div>
        )}
      </header>

      {/* Error Display */}
      {error && (
        <div className="universe-builder__error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Last Analysis Result */}
      {lastAnalysisResult && !lastAnalysisResult.completed && (
        <div className="universe-builder__result">
          <strong>Analysis Complete!</strong>
          <p>
            Found {lastAnalysisResult.stocksFound} stocks (inserted {lastAnalysisResult.stocksInserted} new) 
            for {lastAnalysisResult.exchange?.name} ({lastAnalysisResult.exchange?.country}) - Letter {lastAnalysisResult.letter}
          </p>
          <p className="detail-meta">Next: {lastAnalysisResult.nextStep}</p>
        </div>
      )}

      {lastAnalysisResult && lastAnalysisResult.completed && (
        <div className="universe-builder__result">
          <strong>All Done!</strong>
          <p>{lastAnalysisResult.message}</p>
        </div>
      )}

      {/* Progress Panel */}
      {status?.progress && (
        <div className="universe-progress">
          <h3>Progress Tracker</h3>
          <div className="universe-progress__details">
            <div className="progress-item">
              <span className="progress-item__label">Current Exchange</span>
              <span className="progress-item__value">
                {status.progress.current_exchange_mic || 'Ready to start'}
              </span>
            </div>
            <div className="progress-item">
              <span className="progress-item__label">Current Letter</span>
              <span className="progress-item__value">
                {status.progress.current_letter || 'A'}
              </span>
            </div>
            <div className="progress-item">
              <span className="progress-item__label">Status</span>
              <span className={`tag tag-${status.progress.status === 'running' ? 'blue' : 'green'}`}>
                {status.progress.status || 'idle'}
              </span>
            </div>
            <div className="progress-item">
              <span className="progress-item__label">Last Run</span>
              <span className="progress-item__value">
                {formatDate(status.progress.last_run_at)}
              </span>
            </div>
          </div>

          {/* Letter Progress Bar */}
          {status.progress.current_letter && (
            <div className="letter-progress">
              <div className="letter-progress__bar">
                <div 
                  className="letter-progress__fill" 
                  style={{ width: `${getLetterProgress(status.progress.current_letter)}%` }}
                />
              </div>
              <span className="letter-progress__label">
                {status.progress.current_letter} / Z ({getLetterProgress(status.progress.current_letter)}%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Analyse Button */}
      <div className="universe-builder__action">
        <button
          type="button"
          className="btn-primary analyse-button"
          onClick={runAnalysis}
          disabled={isAnalyzing || status?.progress?.status === 'running' || status?.progress?.status === 'completed'}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Analyzing...
            </>
          ) : (
            '🔄 ANALYSE'
          )}
        </button>
        {status?.progress?.status === 'completed' && (
          <p className="detail-meta">✅ All exchanges have been analyzed! The global stock catalog is complete.</p>
        )}
      </div>

      {/* Pipeline Status */}
      <div className="pipeline-indicator">
        <div className="pipeline-step">
          <div className="pipeline-step__icon">🌐</div>
          <div className="pipeline-step__label">Universe Builder</div>
          <div className="pipeline-step__count">{status?.totalStocks || 0}</div>
        </div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-step">
          <div className="pipeline-step__icon">🤖</div>
          <div className="pipeline-step__label">ValueBot Analysis</div>
          <div className="pipeline-step__count">—</div>
        </div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-step">
          <div className="pipeline-step__icon">🎯</div>
          <div className="pipeline-step__label">Investment Universe</div>
          <div className="pipeline-step__count">—</div>
        </div>
      </div>

      {/* World Map Visualization */}
      {status?.exchanges && (
        <WorldMap 
          exchanges={status.exchanges} 
          progress={status.progress || {}}
        />
      )}

      {/* Exchanges Table */}
      <div className="universe-builder__section">
        <div className="section-header">
          <h3>Stock Exchanges</h3>
          <div className="section-controls">
            <label>
              <span>Filter by region:</span>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={fetchStatus}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="exchanges-table">
          <table className="table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Exchange Name</th>
                <th>Country</th>
                <th>Region</th>
                <th>Progress</th>
                <th>Stocks Found</th>
                <th>Last Analyzed</th>
              </tr>
            </thead>
            <tbody>
              {filteredExchanges.map(exchange => (
                <tr key={exchange.id} className={exchange.is_priority ? 'priority-row' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={exchange.is_priority}
                      onChange={() => togglePriority(exchange.mic_code, exchange.is_priority)}
                      aria-label={`Toggle priority for ${exchange.name}`}
                    />
                  </td>
                  <td>
                    <strong>{exchange.name}</strong>
                    <br />
                    <code className="detail-meta">{exchange.mic_code}</code>
                  </td>
                  <td>{exchange.country}</td>
                  <td>{exchange.region}</td>
                  <td>
                    {exchange.last_analyzed_letter || 'Not started'}
                    {exchange.last_analyzed_letter === 'Z' && (
                      <span className="tag tag-green" style={{ marginLeft: '8px' }}>Complete</span>
                    )}
                  </td>
                  <td>{exchange.total_stocks_found || 0}</td>
                  <td>{formatDate(exchange.last_analyzed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stocks Table (Collapsible) */}
      <div className="universe-builder__section">
        <div className="section-header">
          <h3>Cataloged Stocks</h3>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowStocks(!showStocks)}
          >
            {showStocks ? 'Hide Stocks' : 'View Stocks'}
          </button>
        </div>

        {showStocks && (
          <div className="stocks-table">
            <table className="table subtle">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Company</th>
                  <th>Exchange</th>
                  <th>Country</th>
                  <th>Sector</th>
                  <th>Industry</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No stocks cataloged yet. Click "ANALYSE" to start building the universe.
                    </td>
                  </tr>
                ) : (
                  stocks.map(stock => (
                    <tr key={stock.id}>
                      <td><code>{stock.ticker}</code></td>
                      <td>{stock.company_name}</td>
                      <td>{stock.exchange_mic}</td>
                      <td>{stock.country}</td>
                      <td>{stock.sector || '—'}</td>
                      <td>{stock.industry || '—'}</td>
                      <td>{formatDate(stock.added_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {stocksPagination && stocksPagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fetchStocks(stocksPage - 1)}
                  disabled={stocksPage <= 1}
                >
                  Previous
                </button>
                <span className="pagination__info">
                  Page {stocksPage} of {stocksPagination.totalPages} ({stocksPagination.total} total)
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fetchStocks(stocksPage + 1)}
                  disabled={stocksPage >= stocksPagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniverseBuilder;
