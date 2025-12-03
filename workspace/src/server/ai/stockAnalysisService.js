/**
 * Unified AI Stock Analysis Service
 * Supports OpenAI, Google Gemini, and OpenRouter providers
 * 
 * This module is intended for server-side use only (Vercel serverless functions)
 * to keep API keys secure and never expose them to the browser.
 */

// Configuration constants
const MAX_TOKENS = 1000; // Maximum tokens for AI responses
const MAX_RAW_RESPONSE_LENGTH = 2000; // Maximum length of raw response to return
const PLAIN_TEXT_SUMMARY_LENGTH = 500; // Length of summary when JSON parsing fails
const API_TIMEOUT_MS = 30000; // API request timeout in milliseconds (30 seconds)

/**
 * Normalizes the model selection for a provider
 * @param {string} provider - AI provider name
 * @param {string | undefined | null} model - Requested model identifier
 * @returns {string} - Resolved model identifier
 */
export function normalizeModel(provider, model) {
  const trimmed = typeof model === 'string' ? model.trim() : model;

  if (!trimmed || trimmed === 'default') {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_STOCK_MODEL || 'gpt-4o-mini-2024-07-18';

      case 'gemini':
        return process.env.GEMINI_STOCK_MODEL || 'models/gemini-1.5-pro-latest';

      case 'openrouter':
        return process.env.OPENROUTER_STOCK_MODEL || 'openai/gpt-3.5-turbo';

      default:
        return trimmed || 'gpt-4o-mini-2024-07-18';
    }
  }

  return trimmed;
}

/**
 * Validates the provider parameter
 * @param {string} provider - The AI provider to use
 * @returns {string} - Normalized provider name
 * @throws {Error} - If provider is invalid
 */
function validateProvider(provider) {
  const normalizedProvider = (provider || 'openai').toLowerCase();
  const validProviders = ['openai', 'gemini', 'openrouter'];
  
  if (!validProviders.includes(normalizedProvider)) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
  }
  
  return normalizedProvider;
}

/**
 * Validates the ticker parameter
 * @param {string} ticker - Stock ticker symbol
 * @throws {Error} - If ticker is invalid
 */
function validateTicker(ticker) {
  if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
    throw new Error('Ticker is required and must be a non-empty string');
  }
}

/**
 * Safely parses JSON error response from API
 * @param {Response} response - Fetch response object
 * @returns {Promise<object>} - Parsed error data or empty object
 */
async function parseErrorResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Creates a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithTimeout(url, options, timeout = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Builds the analysis prompt for the AI model
 * @param {string} ticker - Stock ticker symbol
 * @param {string} timeframe - Optional timeframe (e.g., '1y', '5y')
 * @param {string} question - Optional additional question
 * @returns {string} - The formatted prompt
 */
function buildPrompt(ticker, timeframe, question) {
  const base = `You are an AI analyst for Alphastocks.ai – AI-powered superinvestor insights & weekly newsletter.

Please provide a comprehensive stock analysis for ${ticker.toUpperCase()}.`;

  const timeframePart = timeframe ? `\nTimeframe: ${timeframe}` : '';
  const questionPart = question ? `\n\nAdditional context/question: ${question}` : '';

  const instructions = `

Please structure your response as a JSON object with the following fields:
- summary: A brief 2-3 sentence overview of the stock
- opportunities: An array of 2-4 key opportunities or bullish factors
- risks: An array of 2-4 key risks or bearish factors
- sentiment: Overall sentiment as one of: "bullish", "neutral", or "bearish"

Provide actionable insights that would be valuable for investors.`;

  return base + timeframePart + questionPart + instructions;
}

/**
 * Parses the AI response into a structured format
 * @param {string} rawResponse - The raw text response from the AI
 * @returns {object} - Parsed analysis object
 */
function parseResponse(rawResponse) {
  try {
    // Try to extract JSON from the response
    // Some models might wrap JSON in markdown code blocks
    let jsonText = rawResponse.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      summary: parsed.summary || 'No summary available',
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      sentiment: parsed.sentiment || 'neutral'
    };
  } catch (error) {
    // If JSON parsing fails, try to extract information from plain text
    return {
      summary: rawResponse.substring(0, PLAIN_TEXT_SUMMARY_LENGTH) + (rawResponse.length > PLAIN_TEXT_SUMMARY_LENGTH ? '...' : ''),
      opportunities: ['Analysis provided in raw response'],
      risks: ['See raw response for details'],
      sentiment: 'neutral'
    };
  }
}

/**
 * Call OpenAI API
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callOpenAI(apiKey, model, prompt) {
  const resolvedModel = model || 'gpt-4o-mini-2024-07-18';

  const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional stock market analyst. Provide analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: MAX_TOKENS
    })
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    modelUsed: data.model || resolvedModel,
    content: data.choices[0]?.message?.content || ''
  };
}

/**
 * Call Google Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callGemini(apiKey, model, prompt) {
  const resolvedModel = model || 'models/gemini-1.5-pro-latest';

  const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: MAX_TOKENS
      }
    })
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    modelUsed: resolvedModel,
    content
  };
}

/**
 * Call OpenRouter API
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callOpenRouter(apiKey, model, prompt) {
  const defaultModel = model || 'openai/gpt-3.5-turbo';
  
  const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alphastocks.ai',
      'X-Title': 'Alphastocks.ai'
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional stock market analyst. Provide analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: MAX_TOKENS
    })
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    modelUsed: data.model || defaultModel,
    content: data.choices[0]?.message?.content || ''
  };
}

/**
 * Main function to analyze a stock using the specified AI provider
 * 
 * @param {object} params - Analysis parameters
 * @param {string} params.provider - AI provider: 'openai' | 'gemini' | 'openrouter'
 * @param {string} params.model - Optional model override
 * @param {string} params.ticker - Stock ticker symbol (required)
 * @param {string} params.question - Optional additional question
 * @param {string} params.timeframe - Optional timeframe (e.g., '1y', '5y')
 * @returns {Promise<object>} - Structured analysis result
 */
export async function analyzeStock({ provider, model, ticker, question, timeframe }) {
  // Validate inputs
  const normalizedProvider = validateProvider(provider);
  validateTicker(ticker);

  const resolvedModel = normalizeModel(normalizedProvider, model);

  // Build the prompt
  const prompt = buildPrompt(ticker, timeframe, question);

  let apiKey;
  let response;

  try {
    // Get the appropriate API key and call the provider
    switch (normalizedProvider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('Missing OPENAI_API_KEY environment variable');
        }
        response = await callOpenAI(apiKey, resolvedModel, prompt);
        break;

      case 'gemini':
        apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Missing GEMINI_API_KEY environment variable');
        }
        response = await callGemini(apiKey, resolvedModel, prompt);
        break;

      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          throw new Error('Missing OPENROUTER_API_KEY environment variable');
        }
        response = await callOpenRouter(apiKey, resolvedModel, prompt);
        break;

      default:
        throw new Error(`Unsupported provider: ${normalizedProvider}`);
    }

    // Parse the response
    const parsed = parseResponse(response.content);

    // Limit raw response size to prevent exposing too much data
    const rawResponse = response.content.length > MAX_RAW_RESPONSE_LENGTH
      ? response.content.substring(0, MAX_RAW_RESPONSE_LENGTH) + '... (truncated)'
      : response.content;

    // Return structured result
    return {
      ticker: ticker.toUpperCase(),
      timeframe: timeframe || null,
      provider: normalizedProvider,
      modelUsed: response.modelUsed,
      summary: parsed.summary,
      opportunities: parsed.opportunities,
      risks: parsed.risks,
      sentiment: parsed.sentiment,
      rawResponse
    };

  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    console.error('Stock analysis error:', error);
    
    // Re-throw with context
    throw new Error(`Failed to analyze ${ticker} with ${normalizedProvider}: ${error.message}`);
  }
}
