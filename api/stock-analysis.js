/**
 * Vercel Serverless Function: Stock Analysis API
 * 
 * Endpoint: POST /api/stock-analysis
 * 
 * This endpoint provides a unified interface to analyze stocks using
 * OpenAI, Google Gemini, or OpenRouter AI providers.
 * 
 * All API keys are kept server-side and never exposed to the client.
 */

import { analyzeStock } from '../workspace/src/server/ai/stockAnalysisService.js';

/**
 * Validates the request body
 * @param {object} body - Request body
 * @returns {object} - Validation result with errors array
 */
function validateRequest(body) {
  const errors = [];

  if (!body) {
    errors.push('Request body is required');
    return { valid: false, errors };
  }

  const hasTicker = body.ticker && typeof body.ticker === 'string' && body.ticker.trim().length > 0;
  const hasQuery = body.query && typeof body.query === 'string' && body.query.trim().length > 0;

  if (!hasTicker && !hasQuery) {
    errors.push('Either ticker or query is required and must be a non-empty string');
  }

  if (body.provider && !['openai', 'gemini', 'openrouter'].includes(body.provider.toLowerCase())) {
    errors.push('provider must be one of: openai, gemini, openrouter');
  }

  if (body.model && typeof body.model !== 'string') {
    errors.push('model must be a string if provided');
  }

  if (body.question && typeof body.question !== 'string') {
    errors.push('question must be a string if provided');
  }

  if (body.timeframe && typeof body.timeframe !== 'string') {
    errors.push('timeframe must be a string if provided');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Enriches error response with provider, ticker, query, and debug information
 * @param {object} errorResponse - Base error response object
 * @param {object} requestBody - Request body to extract provider, ticker and query from
 * @param {string} debugMessage - Debug message to include in non-production
 * @returns {object} - Enriched error response
 */
function enrichErrorResponse(errorResponse, requestBody, debugMessage) {
  if (requestBody?.provider) {
    errorResponse.provider = requestBody.provider;
  }
  if (requestBody?.ticker) {
    errorResponse.ticker = requestBody.ticker;
  }
  if (requestBody?.query) {
    errorResponse.query = requestBody.query;
  }
  if (debugMessage && process.env.NODE_ENV !== 'production') {
    errorResponse.debug = debugMessage;
  }
  return errorResponse;
}

/**
 * Calls OpenAI Chat Completions API as a fallback for free-text queries
 * @param {string} query - The company/query string
 * @param {string} question - Optional additional question
 * @param {string} timeframe - Optional timeframe
 * @returns {Promise<object>} - Normalized analysis result
 */
async function callOpenAIFallback(query, question, timeframe) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  const systemPrompt = 'You are a professional stock market analyst. Analyze the given company and provide insights in JSON format with fields: summary (string), sentiment (bullish/neutral/bearish), opportunities (array of strings), risks (array of strings).';
  
  let userPrompt = `Analyze the company: ${query}`;
  if (timeframe) {
    userPrompt += `\nTimeframe: ${timeframe}`;
  }
  if (question) {
    userPrompt += `\nAdditional question: ${question}`;
  }
  userPrompt += '\n\nProvide a short summary, sentiment assessment, key opportunities, and risks.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  // Try to parse JSON from the response
  let parsed = { summary: '', sentiment: 'neutral', opportunities: [], risks: [] };
  try {
    let jsonText = rawText.trim();
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    const jsonParsed = JSON.parse(jsonText);
    parsed.summary = jsonParsed.summary || rawText.substring(0, 500);
    parsed.sentiment = jsonParsed.sentiment || 'neutral';
    parsed.opportunities = Array.isArray(jsonParsed.opportunities) ? jsonParsed.opportunities : [];
    parsed.risks = Array.isArray(jsonParsed.risks) ? jsonParsed.risks : [];
  } catch {
    // If JSON parsing fails, use the raw text as summary
    parsed.summary = rawText.substring(0, 500);
  }

  return {
    ticker: null,
    provider: 'openai',
    modelUsed: 'gpt-3.5-turbo',
    sentiment: parsed.sentiment,
    summary: parsed.summary,
    opportunities: parsed.opportunities,
    risks: parsed.risks,
    rawResponse: rawText.length > 2000 ? rawText.substring(0, 2000) + '... (truncated)' : rawText
  };
}

/**
 * Main handler for the stock analysis API endpoint
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 */
export default async function handler(req, res) {
  // Set CORS headers - restrict in production
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Parse and validate the request body
    const body = req.body;
    const validation = validateRequest(body);

    if (!validation.valid) {
      const errorResponse = enrichErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          error: 'Invalid request',
          message: validation.errors[0] || 'Request validation failed'
        },
        body,
        validation.errors.join(', ')
      );
      
      return res.status(400).json(errorResponse);
    }

    // Extract parameters from the request
    const {
      provider,
      model,
      ticker,
      query,
      question,
      timeframe
    } = body;

    let result;

    if (ticker) {
      // Ticker mode: call analyzeStock as before
      result = await analyzeStock({
        provider,
        model,
        ticker,
        question,
        timeframe
      });
    } else if (query) {
      // Query mode: try analyzeStock with query, fall back to OpenAI if needed
      try {
        result = await analyzeStock({
          provider,
          model,
          query,
          question,
          timeframe
        });
      } catch (queryError) {
        // Check if the error indicates a ticker was expected
        if (queryError.message && (queryError.message.includes('Ticker') || queryError.message.includes('ticker'))) {
          // Attempt OpenAI fallback
          if (process.env.OPENAI_API_KEY) {
            result = await callOpenAIFallback(query, question, timeframe);
          } else {
            const errorResponse = enrichErrorResponse(
              {
                code: 'NO_PROVIDER_OR_RESOLUTION',
                error: 'No provider available',
                message: 'No provider could analyze a free-text company query and no OpenAI fallback is configured'
              },
              body,
              queryError.message
            );
            return res.status(501).json(errorResponse);
          }
        } else {
          // Re-throw non-ticker-related errors
          throw queryError;
        }
      }
    }

    // Return the successful result
    return res.status(200).json(result);

  } catch (error) {
    console.error('Stock analysis API error:', error);

    // Handle missing API key errors
    if (error.message.includes('Missing') && error.message.includes('API_KEY')) {
      const errorResponse = enrichErrorResponse(
        {
          code: 'CONFIG_MISSING_API_KEY',
          error: 'Configuration error',
          message: 'The requested AI provider is not configured on the server'
        },
        req.body,
        error.message
      );
      
      return res.status(500).json(errorResponse);
    }

    // Handle provider-specific API errors
    if (error.message.includes('API error')) {
      const errorResponse = enrichErrorResponse(
        {
          code: 'PROVIDER_ERROR',
          error: 'Provider error',
          message: 'The AI provider returned an error'
        },
        req.body,
        error.message
      );
      
      return res.status(502).json(errorResponse);
    }

    // Handle validation errors
    if (error.message.includes('Invalid provider') || error.message.includes('Ticker is required')) {
      const errorResponse = enrichErrorResponse(
        {
          code: 'VALIDATION_ERROR',
          error: 'Validation error',
          message: error.message
        },
        req.body,
        error.message
      );
      
      return res.status(400).json(errorResponse);
    }

    // Generic error handler
    const errorResponse = enrichErrorResponse(
      {
        code: 'INTERNAL_ERROR',
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request'
      },
      req.body,
      error.message
    );
    
    return res.status(500).json(errorResponse);
  }
}
