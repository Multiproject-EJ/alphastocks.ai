/**
 * Frontend Hook/Helper for Stock Analysis
 * 
 * Provides a simple interface to call the /api/stock-analysis endpoint
 * from Preact components with loading and error state management.
 */

import { useState } from 'preact/hooks';

/**
 * Custom hook for stock analysis
 * 
 * Usage example:
 * ```jsx
 * const { analyzeStock, loading, error, data } = useStockAnalysis();
 * 
 * const handleAnalyze = async () => {
 *   await analyzeStock({
 *     provider: 'openai',
 *     ticker: 'AAPL',
 *     question: 'What are the growth prospects?',
 *     timeframe: '5y'
 *   });
 * };
 * ```
 * 
 * @returns {object} - Hook interface with analyzeStock function and state
 */
export function useStockAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Calls the stock analysis API
   * @param {object} params - Analysis parameters
   * @param {string} params.provider - AI provider: 'openai' | 'gemini' | 'openrouter'
   * @param {string} params.model - Optional model override
   * @param {string} params.ticker - Stock ticker symbol (required)
   * @param {string} params.question - Optional additional question
   * @param {string} params.timeframe - Optional timeframe (e.g., '1y', '5y')
   * @returns {Promise<object>} - Analysis result
   */
  const analyzeStock = async ({ provider, model, ticker, question, timeframe }) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/stock-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider || 'openai',
          model,
          ticker,
          question,
          timeframe
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error ${response.status}`);
      }

      setData(responseData);
      return responseData;

    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeStock,
    loading,
    error,
    data
  };
}

/**
 * Standalone function to call stock analysis API
 * (Alternative to the hook for non-component contexts)
 * 
 * @param {object} params - Analysis parameters
 * @param {string} params.provider - AI provider: 'openai' | 'gemini' | 'openrouter'
 * @param {string} params.model - Optional model override
 * @param {string} params.ticker - Stock ticker symbol (required)
 * @param {string} params.question - Optional additional question
 * @param {string} params.timeframe - Optional timeframe (e.g., '1y', '5y')
 * @returns {Promise<object>} - Analysis result with { data, error }
 */
export async function analyzeStockAPI({ provider, model, ticker, question, timeframe }) {
  try {
    const response = await fetch('/api/stock-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: provider || 'openai',
        model,
        ticker,
        question,
        timeframe
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || `HTTP error ${response.status}`
      };
    }

    return {
      data,
      error: null
    };

  } catch (err) {
    return {
      data: null,
      error: err.message || 'Failed to analyze stock'
    };
  }
}
