/**
 * AI Analysis Component
 *
 * Provides stock analysis using AI providers (OpenAI, Gemini, OpenRouter).
 * Ported from the static HTML version in /assets/ai-analysis.js
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { useStockAnalysis } from '../../lib/useStockAnalysis.js';

const TICKER_REGEX = /^[A-Z]{1,8}$/;

/**
 * Validates a stock ticker symbol
 * @param {string} ticker - The ticker to validate
 * @returns {{ valid: boolean, message: string }}
 */
function validateTicker(ticker) {
  if (!ticker || ticker.trim().length === 0) {
    return { valid: false, message: 'Please enter a stock ticker.' };
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  if (!TICKER_REGEX.test(normalizedTicker)) {
    return { valid: false, message: 'Ticker must be 1-8 letters only (e.g., AAPL, MSFT).' };
  }

  return { valid: true, message: '' };
}

/**
 * Fetch provider configuration from server
 */
async function fetchProviderConfig() {
  try {
    const response = await fetch('/api/provider-config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Unable to fetch provider config, using defaults:', error);
  }
  return { openai: true, gemini: true, openrouter: true };
}

export function AIAnalysis() {
  const { analyzeStock, loading, error, data } = useStockAnalysis();

  const [provider, setProvider] = useState('openai');
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [question, setQuestion] = useState('');
  const [tickerError, setTickerError] = useState('');
  const [providerConfig, setProviderConfig] = useState({
    openai: true,
    gemini: true,
    openrouter: true
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchProviderConfig().then(setProviderConfig);
  }, []);

  const availableProviders = Object.entries(providerConfig)
    .filter(([, available]) => available)
    .map(([key]) => ({
      value: key,
      label:
        key === 'openai'
          ? 'OpenAI'
          : key === 'gemini'
            ? 'Google Gemini'
            : 'OpenRouter'
    }));

  const handleTickerBlur = useCallback(() => {
    if (ticker.trim()) {
      const validation = validateTicker(ticker);
      if (!validation.valid) {
        setTickerError(validation.message);
      }
    }
  }, [ticker]);

  const handleTickerChange = useCallback((e) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    if (tickerError) {
      setTickerError('');
    }
  }, [tickerError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedTicker = ticker.trim().toUpperCase();
    const validation = validateTicker(normalizedTicker);

    if (!validation.valid) {
      setTickerError(validation.message);
      return;
    }

    setTickerError('');
    setShowResults(true);

    try {
      await analyzeStock({
        provider,
        ticker: normalizedTicker,
        timeframe: timeframe.trim() || undefined,
        question: question.trim() || undefined
      });
    } catch (err) {
      // Error is already handled by the hook
      console.error('Analysis failed:', err);
    }
  };

  const getSentimentClass = (sentiment) => {
    if (!sentiment) return 'neutral';
    const lower = sentiment.toLowerCase();
    if (lower.includes('positive') || lower.includes('bullish')) return 'positive';
    if (lower.includes('negative') || lower.includes('bearish')) return 'negative';
    return 'neutral';
  };

  return (
    <>
      <div className="detail-card">
        <h3>Configure Analysis</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="aiProvider">AI Provider</label>
            <select
              id="aiProvider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={availableProviders.length === 0}
            >
              {availableProviders.length === 0 ? (
                <option value="" disabled>
                  No providers available
                </option>
              ) : (
                availableProviders.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))
              )}
            </select>
            <span className="field-hint">
              Available providers are shown based on server configuration.
            </span>
          </div>

          <div className="field">
            <label htmlFor="aiTicker">
              Stock Ticker <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="aiTicker"
              placeholder="e.g., AAPL"
              required
              aria-required="true"
              aria-invalid={!!tickerError}
              value={ticker}
              onInput={handleTickerChange}
              onBlur={handleTickerBlur}
              autoComplete="off"
              pattern="[A-Za-z]{1,8}"
              style={{ textTransform: 'uppercase' }}
            />
            <span className="field-hint">
              Enter 1-8 letters (e.g., AAPL, MSFT, GOOGL).
            </span>
            {tickerError && (
              <span className="field-error" role="alert">
                {tickerError}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="aiTimeframe">Timeframe (optional)</label>
            <input
              type="text"
              id="aiTimeframe"
              placeholder="e.g., 1y, 5y, ytd"
              value={timeframe}
              onInput={(e) => setTimeframe(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="aiQuestion">Custom Question (optional)</label>
            <textarea
              id="aiQuestion"
              rows={3}
              placeholder="Ask a specific question about the stock..."
              value={question}
              onInput={(e) => setQuestion(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || availableProviders.length === 0}
            aria-busy={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>

          {loading && (
            <div className="ai-status" role="status">
              Analyzing...
            </div>
          )}

          {error && !loading && (
            <div className="ai-error" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>

      {showResults && !loading && !error && data && (
        <div className="ai-results">
          <div className="detail-card">
            <h3>Analysis Summary</h3>
            <div className="ai-result-header">
              <div className="field inline">
                <span>Ticker:</span>
                <strong>{data.ticker || 'N/A'}</strong>
              </div>
              <div className="field inline">
                <span>Provider:</span>
                <span>{data.provider || data.modelUsed || 'N/A'}</span>
              </div>
              <div className="field inline">
                <span>Sentiment:</span>
                <span
                  className={`ai-sentiment ${getSentimentClass(data.sentiment)}`}
                  role="status"
                >
                  {data.sentiment
                    ? data.sentiment.charAt(0).toUpperCase() +
                      data.sentiment.slice(1).toLowerCase()
                    : 'Neutral'}
                </span>
              </div>
            </div>
            <div className="ai-summary">
              {data.summary || 'No summary available.'}
            </div>
          </div>

          <div className="detail-grid">
            {data.opportunities?.length > 0 && (
              <div className="detail-card">
                <h3>Opportunities</h3>
                <ul className="ai-list">
                  {data.opportunities.map((opp, i) => (
                    <li key={`opp-${i}-${opp.slice(0, 20)}`}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.risks?.length > 0 && (
              <div className="detail-card">
                <h3>Risks</h3>
                <ul className="ai-list">
                  {data.risks.map((risk, i) => (
                    <li key={`risk-${i}-${risk.slice(0, 20)}`}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.rawResponse && (
            <div className="detail-card">
              <h3>Additional Commentary</h3>
              <div className="ai-raw-response">{data.rawResponse}</div>
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton shown during analysis */}
      {loading && showResults && (
        <div className="ai-results">
          <div className="ai-loading-skeleton">
            <div className="detail-card skeleton-card">
              <div className="skeleton skeleton-title shimmer" />
              <div className="skeleton skeleton-header shimmer" />
              <div className="skeleton skeleton-text shimmer" />
              <div className="skeleton skeleton-text shimmer" />
              <div className="skeleton skeleton-text-short shimmer" />
            </div>
            <div className="detail-grid">
              <div className="detail-card skeleton-card">
                <div className="skeleton skeleton-title shimmer" />
                <div className="skeleton skeleton-text shimmer" />
                <div className="skeleton skeleton-text shimmer" />
              </div>
              <div className="detail-card skeleton-card">
                <div className="skeleton skeleton-title shimmer" />
                <div className="skeleton skeleton-text shimmer" />
                <div className="skeleton skeleton-text shimmer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAnalysis;
