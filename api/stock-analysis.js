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

  if (!body.ticker || typeof body.ticker !== 'string' || body.ticker.trim().length === 0) {
    errors.push('ticker is required and must be a non-empty string');
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
 * Main handler for the stock analysis API endpoint
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 */
export default async function handler(req, res) {
  // Set CORS headers to allow requests from the frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
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
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Parse and validate the request body
    const body = req.body;
    const validation = validateRequest(body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request validation failed',
        details: validation.errors
      });
    }

    // Extract parameters from the request
    const {
      provider,
      model,
      ticker,
      question,
      timeframe
    } = body;

    // Call the stock analysis service
    const result = await analyzeStock({
      provider,
      model,
      ticker,
      question,
      timeframe
    });

    // Return the successful result
    return res.status(200).json(result);

  } catch (error) {
    console.error('Stock analysis API error:', error);

    // Handle missing API key errors
    if (error.message.includes('Missing') && error.message.includes('API_KEY')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'The requested AI provider is not configured on the server',
        provider: req.body?.provider || 'unknown'
      });
    }

    // Handle provider-specific API errors
    if (error.message.includes('API error')) {
      return res.status(502).json({
        error: 'Provider error',
        message: 'The AI provider returned an error',
        details: error.message
      });
    }

    // Handle validation errors
    if (error.message.includes('Invalid provider') || error.message.includes('Ticker is required')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }

    // Generic error handler
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}
