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

  // Either ticker or query must be provided
  const hasTicker = body.ticker && typeof body.ticker === 'string' && body.ticker.trim().length > 0;
  const hasQuery = body.query && typeof body.query === 'string' && body.query.trim().length > 0;
  
  if (!hasTicker && !hasQuery) {
    errors.push('Either ticker or query is required');
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
 * Enriches error response with provider, ticker/query, and debug information
 * @param {object} errorResponse - Base error response object
 * @param {object} requestBody - Request body to extract provider and ticker/query from
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

    // Call the stock analysis service
    const result = await analyzeStock({
      provider,
      model,
      ticker,
      query,
      question,
      timeframe
    });

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
