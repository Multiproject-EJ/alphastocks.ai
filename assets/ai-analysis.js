/**
 * AI Analysis Module
 * 
 * Encapsulates AI stock analysis functionality including:
 * - Form validation and submission
 * - Provider config fetching and dynamic population
 * - Loading states and skeleton UI
 * - Result rendering and persistence
 * - Accessibility enhancements
 */

/**
 * Lenient ticker detection regex - accepts common ticker formats including
 * letters, numbers, dots, and hyphens up to 12 characters. Inputs that do
 * not match are treated as free-text queries without rejection.
 */
const TICKER_REGEX = /^[A-Za-z0-9.\-]{1,12}$/;
const STORAGE_KEY = 'AI_ANALYSIS_LAST_RESULT';

/**
 * Provider configuration state
 */
let providerConfig = {
  openai: true,
  gemini: true,
  openrouter: true
};

/**
 * Validates and classifies user input as ticker or query
 * @param {string} input - Raw user input
 * @returns {{ valid: boolean, message: string, type?: 'ticker' | 'query', value?: string }}
 */
function validateTicker(input) {
  if (!input || input.trim().length === 0) {
    return { valid: false, message: 'Please enter a ticker symbol or company name.' };
  }

  const normalizedInput = input.trim();

  if (TICKER_REGEX.test(normalizedInput)) {
    return { valid: true, message: '', type: 'ticker', value: normalizedInput.toUpperCase() };
  }

  return { valid: true, message: '', type: 'query', value: normalizedInput };
}

/**
 * Fetches provider configuration from the server
 * @returns {Promise<object>} Provider availability object
 */
async function fetchProviderConfig() {
  try {
    const response = await fetch('/api/valuebot?action=provider-config');
    if (response.ok) {
      const config = await response.json();
      return config;
    }
  } catch (error) {
    console.debug('Unable to fetch provider config, using defaults:', error);
  }
  // Return default config if fetch fails (all providers assumed available)
  return { openai: true, gemini: true, openrouter: true };
}

/**
 * Populates the provider select with available options
 * @param {HTMLSelectElement} selectElement - The provider select element
 * @param {object} config - Provider availability config
 */
function populateProviderSelect(selectElement, config) {
  if (!selectElement) return;
  
  const providers = [
    { value: 'openai', label: 'OpenAI', available: config.openai },
    { value: 'gemini', label: 'Google Gemini', available: config.gemini },
    { value: 'openrouter', label: 'OpenRouter', available: config.openrouter }
  ];
  
  // Clear existing options
  selectElement.innerHTML = '';
  
  // Add available providers
  const availableProviders = providers.filter(p => p.available);
  
  if (availableProviders.length === 0) {
    // No providers available - add a disabled placeholder
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No providers available';
    option.disabled = true;
    selectElement.appendChild(option);
    selectElement.disabled = true;
  } else {
    availableProviders.forEach(provider => {
      const option = document.createElement('option');
      option.value = provider.value;
      option.textContent = provider.label;
      selectElement.appendChild(option);
    });
    selectElement.disabled = false;
  }
}

/**
 * Shows the loading skeleton
 * @param {HTMLElement} resultsContainer - The results container element
 * @param {HTMLElement} skeletonElement - The skeleton element
 */
function showLoadingSkeleton(resultsContainer, skeletonElement) {
  if (resultsContainer) {
    resultsContainer.style.display = 'block';
  }
  if (skeletonElement) {
    skeletonElement.style.display = 'block';
    skeletonElement.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Hides the loading skeleton
 * @param {HTMLElement} skeletonElement - The skeleton element
 */
function hideLoadingSkeleton(skeletonElement) {
  if (skeletonElement) {
    skeletonElement.style.display = 'none';
    skeletonElement.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Saves the last successful analysis to sessionStorage
 * @param {object} data - The analysis result data
 */
function persistResult(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.debug('Unable to persist analysis result:', error);
  }
}

/**
 * Loads the last successful analysis from sessionStorage
 * @returns {object|null} The stored result or null
 */
function loadPersistedResult() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.debug('Unable to load persisted result:', error);
    return null;
  }
}

/**
 * Checks if debug information should be shown
 * @returns {boolean}
 */
function shouldShowDebug() {
  // Check window.__ENV__ for environment
  const env = window.__ENV__ || {};
  return env.NODE_ENV !== 'production';
}

/**
 * Displays the analysis results
 * @param {object} data - The analysis result data
 * @param {object} elements - DOM elements for rendering
 */
function displayResults(data, elements) {
  const {
    resultTicker,
    resultProvider,
    resultSentiment,
    resultSummary,
    resultOpportunities,
    resultRisks,
    resultRawResponse,
    opportunitiesCard,
    risksCard,
    rawResponseCard,
    aiResults,
    aiResultsContent
  } = elements;

  if (resultTicker) {
    resultTicker.textContent = data.ticker || 'N/A';
  }

  if (resultProvider) {
    resultProvider.textContent = data.provider || data.modelUsed || 'N/A';
  }

  if (resultSentiment) {
    const sentiment = (data.sentiment || 'neutral').toLowerCase();
    resultSentiment.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    resultSentiment.className = 'ai-sentiment';
    resultSentiment.setAttribute('role', 'status');
    
    if (sentiment.includes('positive') || sentiment.includes('bullish')) {
      resultSentiment.classList.add('positive');
    } else if (sentiment.includes('negative') || sentiment.includes('bearish')) {
      resultSentiment.classList.add('negative');
    } else {
      resultSentiment.classList.add('neutral');
    }
  }

  if (resultSummary) {
    resultSummary.textContent = data.summary || 'No summary available.';
  }

  if (resultOpportunities && opportunitiesCard) {
    if (data.opportunities && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
      resultOpportunities.innerHTML = '';
      data.opportunities.forEach(opp => {
        const li = document.createElement('li');
        li.textContent = opp;
        resultOpportunities.appendChild(li);
      });
      opportunitiesCard.style.display = 'block';
    } else {
      opportunitiesCard.style.display = 'none';
    }
  }

  if (resultRisks && risksCard) {
    if (data.risks && Array.isArray(data.risks) && data.risks.length > 0) {
      resultRisks.innerHTML = '';
      data.risks.forEach(risk => {
        const li = document.createElement('li');
        li.textContent = risk;
        resultRisks.appendChild(li);
      });
      risksCard.style.display = 'block';
    } else {
      risksCard.style.display = 'none';
    }
  }

  if (resultRawResponse && rawResponseCard) {
    if (data.rawResponse && data.rawResponse.trim().length > 0) {
      resultRawResponse.textContent = data.rawResponse;
      rawResponseCard.style.display = 'block';
    } else {
      rawResponseCard.style.display = 'none';
    }
  }

  // Show the content area and hide skeleton
  if (aiResultsContent) {
    aiResultsContent.style.display = 'block';
  }
  
  if (aiResults) {
    aiResults.style.display = 'block';
  }

  // Smooth scroll to results
  setTimeout(() => {
    if (aiResults) {
      aiResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
}

/**
 * Initializes the AI Analysis feature
 * Called after DOMContentLoaded
 */
export async function initAIAnalysis() {
  // DOM Elements
  const aiAnalysisForm = document.getElementById('aiAnalysisForm');
  const aiProviderSelect = document.getElementById('aiProvider');
  const aiTickerInput = document.getElementById('aiTicker');
  const aiTimeframeInput = document.getElementById('aiTimeframe');
  const aiQuestionInput = document.getElementById('aiQuestion');
  const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
  const aiStatus = document.getElementById('aiStatus');
  const aiError = document.getElementById('aiError');
  const aiResults = document.getElementById('aiResults');
  const aiLoadingSkeleton = document.getElementById('aiLoadingSkeleton');
  const aiResultsContent = document.getElementById('aiResultsContent');
  const tickerError = document.getElementById('tickerError');

  // Result display elements
  const elements = {
    resultTicker: document.getElementById('resultTicker'),
    resultProvider: document.getElementById('resultProvider'),
    resultSentiment: document.getElementById('resultSentiment'),
    resultSummary: document.getElementById('resultSummary'),
    resultOpportunities: document.getElementById('resultOpportunities'),
    resultRisks: document.getElementById('resultRisks'),
    resultRawResponse: document.getElementById('resultRawResponse'),
    opportunitiesCard: document.getElementById('opportunitiesCard'),
    risksCard: document.getElementById('risksCard'),
    rawResponseCard: document.getElementById('rawResponseCard'),
    aiResults,
    aiResultsContent
  };

  // Fetch and apply provider configuration
  providerConfig = await fetchProviderConfig();
  populateProviderSelect(aiProviderSelect, providerConfig);

  // Load persisted result if available
  const persistedResult = loadPersistedResult();
  if (persistedResult && aiResults) {
    displayResults(persistedResult, elements);
    if (aiStatus) {
      aiStatus.textContent = 'Showing last analysis result.';
    }
  }

  // Ticker input validation on blur
  if (aiTickerInput && tickerError) {
    aiTickerInput.addEventListener('blur', () => {
      const validation = validateTicker(aiTickerInput.value);
      if (!validation.valid) {
        tickerError.textContent = validation.message;
        aiTickerInput.setAttribute('aria-invalid', 'true');
      } else {
        tickerError.textContent = '';
        aiTickerInput.setAttribute('aria-invalid', 'false');
      }
    });

    // Clear error on input
    aiTickerInput.addEventListener('input', () => {
      if (tickerError.textContent) {
        tickerError.textContent = '';
        aiTickerInput.setAttribute('aria-invalid', 'false');
      }
    });
  }

  // Form submission handler
  if (aiAnalysisForm) {
    aiAnalysisForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const rawInput = aiTickerInput?.value || '';
      const provider = aiProviderSelect?.value || 'openai';
      const timeframe = aiTimeframeInput?.value.trim();
      const question = aiQuestionInput?.value.trim();

      // Client-side validation and classification (ticker vs query)
      const validation = validateTicker(rawInput);
      if (!validation.valid || !validation.value) {
        if (tickerError) {
          tickerError.textContent = validation.message;
        }
        if (aiTickerInput) {
          aiTickerInput.setAttribute('aria-invalid', 'true');
          aiTickerInput.focus();
        }
        return;
      }

      // Clear previous errors
      if (aiError) {
        aiError.textContent = '';
      }
      if (tickerError) {
        tickerError.textContent = '';
      }

      // Update status
      if (aiStatus) {
        aiStatus.textContent = 'Analyzing...';
      }

      // Disable button during request
      if (aiAnalyzeBtn) {
        aiAnalyzeBtn.disabled = true;
        aiAnalyzeBtn.textContent = 'Analyzing...';
        aiAnalyzeBtn.setAttribute('aria-busy', 'true');
      }

      // Show loading skeleton, hide results content
      if (aiResultsContent) {
        aiResultsContent.style.display = 'none';
      }
      showLoadingSkeleton(aiResults, aiLoadingSkeleton);

      try {
        const requestBody = { provider };

        if (validation.type === 'ticker') {
          requestBody.ticker = validation.value;
        } else {
          requestBody.query = validation.value;
        }

        if (timeframe) {
          requestBody.timeframe = timeframe;
        }

        if (question) {
          requestBody.question = question;
        }

        const response = await fetch('/api/stock-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Build rich error message
          let errorMessage = errorData.message || `Request failed with status ${response.status}`;
          
          // Add error code in parentheses if available
          if (errorData.code) {
            errorMessage += ` (${errorData.code})`;
          }
          
          // Append debug information only in non-production
          // Note: errorMessage is assigned to textContent (not innerHTML),
          // so there is no XSS risk from debug content
          if (errorData.debug && shouldShowDebug()) {
            errorMessage += `\n\nDetails: ${errorData.debug}`;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Hide skeleton
        hideLoadingSkeleton(aiLoadingSkeleton);

        if (aiStatus) {
          aiStatus.textContent = 'Analysis complete!';
        }

        // Display and persist results
        displayResults(data, elements);
        persistResult(data);

      } catch (error) {
        console.error('AI Analysis error:', error);
        
        // Hide skeleton
        hideLoadingSkeleton(aiLoadingSkeleton);
        
        if (aiResultsContent) {
          aiResultsContent.style.display = 'none';
        }
        if (aiResults) {
          aiResults.style.display = 'none';
        }
        
        if (aiError) {
          aiError.textContent = error.message || 'An error occurred while analyzing the stock. Please try again.';
        }
        if (aiStatus) {
          aiStatus.textContent = '';
        }
      } finally {
        // Re-enable button
        if (aiAnalyzeBtn) {
          aiAnalyzeBtn.disabled = false;
          aiAnalyzeBtn.textContent = 'Analyze';
          aiAnalyzeBtn.setAttribute('aria-busy', 'false');
        }
      }
    });
  }
}

// Export for external use
export { validateTicker, fetchProviderConfig, loadPersistedResult };
