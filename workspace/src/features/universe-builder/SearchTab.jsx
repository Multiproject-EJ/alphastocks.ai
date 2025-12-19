import { useCallback, useEffect, useState, useRef } from 'preact/hooks';

const API_ENDPOINT = '/api/universe-builder';

const SearchTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const isInitialMount = useRef(true);

  // Fetch stocks with search functionality
  const fetchStocks = useCallback(async (pageNum = 1, search = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        action: 'get-stocks',
        page: pageNum,
        per_page: 50
      };

      if (search && search.trim()) {
        requestBody.search = search.trim();
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch stocks');
      }

      setStocks(data.stocks || []);
      setPagination(data.pagination);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStocks(1, '');
  }, [fetchStocks]);

  // Debounce search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch when debounced search term changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchStocks(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchStocks]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="search-tab">
      {/* Search Input */}
      <div className="search-tab__header">
        <div className="search-tab__input-wrapper">
          <input
            type="text"
            className="search-tab__input"
            placeholder="Search by ticker or company name..."
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.target.value)}
            aria-label="Search stocks"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-tab__clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {pagination && (
          <div className="search-tab__count">
            {pagination.total.toLocaleString()} stocks found
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="search-tab__error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && stocks.length === 0 && (
        <div className="search-tab__loading">
          Loading stocks...
        </div>
      )}

      {/* Stocks Table */}
      <div className="search-tab__table-wrapper">
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
            {stocks.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  {searchTerm 
                    ? `No stocks found matching "${searchTerm}"`
                    : 'No stocks cataloged yet. Use the Global Ticker Database tab to build the universe.'}
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
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
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="search-tab__pagination">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fetchStocks(page - 1, searchTerm)}
            disabled={page <= 1 || isLoading}
          >
            Previous
          </button>
          <span className="search-tab__page-info">
            Page {page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total)
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fetchStocks(page + 1, searchTerm)}
            disabled={page >= pagination.totalPages || isLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
