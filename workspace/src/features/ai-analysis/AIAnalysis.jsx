/**
 * AI Analysis Component
 *
 * Provides stock analysis using AI providers (OpenAI, Gemini, OpenRouter).
 * Ported from the static HTML version in /assets/ai-analysis.js
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { useRunStockAnalysis } from './useRunStockAnalysis.ts';

/**
 * Validates the stock/company identifier input
 * @param {string} ticker - The ticker or company name to validate
 * @returns {{ valid: boolean, message: string }}
 */
function validateTicker(ticker) {
  if (!ticker || ticker.trim().length === 0) {
    return { valid: false, message: 'Please enter a company name or ticker.' };
  }

  return { valid: true, message: '' };
}

/**
 * Fetch provider configuration from server
 */
async function fetchProviderConfig() {
  try {
    const response = await fetch('/api/valuebot?action=provider-config');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.debug('Unable to fetch provider config, using defaults:', error);
  }
  return { openai: true, gemini: true, openrouter: true };
}

export function AIAnalysis() {
  const { runAnalysis, loading, error, data } = useRunStockAnalysis();

  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('');
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

  const modelOptions = {
    openai: [
      { value: '', label: 'Use default (gpt-4o-mini)' },
      { value: 'gpt-4o', label: 'gpt-4o (quality)' },
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini (fast & cost effective)' },
      { value: 'gpt-4.1', label: 'gpt-4.1 (premium)' }
    ],
    gemini: [
      { value: '', label: 'Use default (gemini-1.5-flash)' },
      { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (quality)' },
      { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (fast)' }
    ],
    openrouter: [
      { value: '', label: 'Use default (openai/gpt-3.5-turbo)' },
      { value: 'openai/gpt-4o', label: 'openai/gpt-4o (quality)' },
      { value: 'openai/gpt-3.5-turbo', label: 'openai/gpt-3.5-turbo (fast & low cost)' },
      { value: 'mistralai/mistral-large', label: 'mistralai/mistral-large (balanced)' }
    ]
  };

  useEffect(() => {
    const availableValues = availableProviders.map((p) => p.value);
    if (availableValues.length > 0 && !availableValues.includes(provider)) {
      const nextProvider = availableValues[0];
      setProvider(nextProvider);
    }
  }, [availableProviders, provider]);

  useEffect(() => {
    setModel('');
  }, [provider]);

  const handleTickerBlur = useCallback(() => {
    if (ticker.trim()) {
      const validation = validateTicker(ticker);
      if (!validation.valid) {
        setTickerError(validation.message);
      }
    }
  }, [ticker]);

  const handleTickerChange = useCallback((e) => {
    const value = e.target.value;
    setTicker(value);
    if (tickerError) {
      setTickerError('');
    }
  }, [tickerError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedTicker = ticker.trim();
    const validation = validateTicker(normalizedTicker);

    if (!validation.valid) {
      setTickerError(validation.message);
      return;
    }

    setTickerError('');
    setShowResults(true);

    try {
      await runAnalysis({
        provider,
        model: model || undefined,
        ticker: normalizedTicker,
        timeframe: timeframe.trim() || undefined,
        customQuestion: question.trim() || undefined
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
              onChange={(e) => {
                setProvider(e.target.value);
              }}
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
            <label htmlFor="aiModel">Model (optional)</label>
            <select
              id="aiModel"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
              }}
              disabled={!modelOptions[provider] || modelOptions[provider].length === 0}
            >
              {(modelOptions[provider] || []).map((option) => (
                <option key={`${provider}-${option.value || 'default'}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Keep the default for the recommended model, or choose a premium or lower-cost option.
            </span>
          </div>

          <div className="field">
            <label htmlFor="aiTicker">
              Company or Ticker <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="aiTicker"
              placeholder="e.g., Apple, AAPL, GOOGL"
              required
              aria-required="true"
              aria-invalid={!!tickerError}
              value={ticker}
              onInput={handleTickerChange}
              onBlur={handleTickerBlur}
              autoComplete="off"
            />
            <span className="field-hint">
              Enter a company name or ticker in any format.
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
              onInput={(e) => {
                setTimeframe(e.target.value);
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="aiQuestion">Custom Question (optional)</label>
            <textarea
              id="aiQuestion"
              rows={3}
              placeholder="Ask a specific question about the stock..."
              value={question}
              onInput={(e) => {
                setQuestion(e.target.value);
              }}
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
