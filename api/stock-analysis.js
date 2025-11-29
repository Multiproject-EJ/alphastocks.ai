/**
 * Vercel Serverless Function: Stock Analysis API (accepts ticker OR query)
 *
 * Endpoint: POST /api/stock-analysis
 *
 * Provides a unified interface to analyze stocks using OpenAI, Google Gemini,
 * or OpenRouter AI providers. Accepts either a ticker symbol or a free-text
 * company query and will attempt to resolve analysis accordingly.
 */

import { analyzeStock } from '../workspace/src/server/ai/stockAnalysisService.js';

const FALLBACK_MAX_RAW_RESPONSE_LENGTH = 2000;
const FALLBACK_SUMMARY_LENGTH = 500;

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

  const hasTicker = typeof body.ticker === 'string' && body.ticker.trim().length > 0;
  const hasQuery = typeof body.query === 'string' && body.query.trim().length > 0;

  if (!hasTicker && !hasQuery) {
    errors.push('ticker or query is required and must be a non-empty string');
  }

  if (body.ticker && (typeof body.ticker !== 'string' || body.ticker.trim().length === 0)) {
    errors.push('ticker must be a non-empty string when provided');
  }

  if (body.query && (typeof body.query !== 'string' || body.query.trim().length === 0)) {
    errors.push('query must be a non-empty string when provided');
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

function parseFallbackResponse(rawResponse) {
  try {
    let jsonText = (rawResponse || '').trim();
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
    return {
      summary: rawResponse
        ? rawResponse.substring(0, FALLBACK_SUMMARY_LENGTH) + (rawResponse.length > FALLBACK_SUMMARY_LENGTH ? '...' : '')
        : 'No summary available',
      opportunities: ['Analysis provided in raw response'],
      risks: ['See raw response for details'],
      sentiment: 'neutral'
    };
  }
}

async function runOpenAIFallback(query, { model, question, timeframe }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error('NO_PROVIDER_OR_RESOLUTION');
    error.code = 'NO_PROVIDER_OR_RESOLUTION';
    throw error;
  }

  const defaultModel = model || 'gpt-4o-mini';
  const prompt = `You are an AI analyst for Alphastocks.ai. Provide a comprehensive stock or company analysis for "${query}".

Timeframe: ${timeframe || 'not specified'}
Additional context/question: ${question || 'None provided'}

Structure the response as a JSON object with fields: summary (2-3 sentences), opportunities (array of 2-4 items), risks (array of 2-4 items), sentiment (bullish | neutral | bearish).`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        { role: 'system', content: 'You are a professional stock market analyst. Provide analysis in JSON format.' },
        { role: 'user', content: prompt }
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
  const content = data.choices?.[0]?.message?.content?.trim() || '';
  const parsed = parseFallbackResponse(content);
  const rawResponse = content.length > FALLBACK_MAX_RAW_RESPONSE_LENGTH
    ? content.substring(0, FALLBACK_MAX_RAW_RESPONSE_LENGTH) + '... (truncated)'
    : content;

  return {
    ticker: query,
    timeframe: timeframe || null,
    provider: 'openai',
    modelUsed: data.model || defaultModel,
    summary: parsed.summary,
    opportunities: parsed.opportunities,
    risks: parsed.risks,
    sentiment: parsed.sentiment,
    rawResponse
  };
}

/**
 * Enriches error response with provider, ticker, query, and debug information
 * @param {object} errorResponse - Base error response object
 * @param {object} requestBody - Request body to extract provider and ticker from
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

    let result;

    if (ticker) {
      result = await analyzeStock({
        provider,
        model,
        ticker,
        question,
        timeframe
      });
    } else {
      try {
        // Attempt to call analyzeStock in case it supports query directly
        result = await analyzeStock({
          provider,
          model,
          query,
          question,
          timeframe
        });
      } catch (analysisError) {
        // Fallback to OpenAI if analyzeStock rejects queries
        result = await runOpenAIFallback(query, { model, question, timeframe });
      }
    }

    // Return the successful result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Stock analysis API error:', error);

    if (error.code === 'NO_PROVIDER_OR_RESOLUTION' || error.message === 'NO_PROVIDER_OR_RESOLUTION') {
      const errorResponse = enrichErrorResponse(
        {
          code: 'NO_PROVIDER_OR_RESOLUTION',
          error: 'No provider available',
          message: 'Unable to analyze query because no AI provider is configured to handle free-text queries.'
        },
        req.body,
        error.message
      );

      return res.status(501).json(errorResponse);
    }

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
    if (error.message.includes('Invalid provider') || 
        error.message.includes('Ticker is required') || 
        error.message.includes('Either ticker or company name is required')) {
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
