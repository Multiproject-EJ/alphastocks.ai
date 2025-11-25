/**
 * Vercel Serverless Function: Provider Configuration API
 * 
 * Endpoint: GET /api/provider-config
 * 
 * Returns the availability of AI providers based on whether
 * their respective API keys are configured on the server.
 * 
 * This endpoint does NOT expose the actual API keys, only
 * whether they are present and available for use.
 */

/**
 * Main handler for the provider configuration API endpoint
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 */
export default function handler(req, res) {
  // Set CORS headers - identical to stock-analysis endpoint
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  // Check for the presence of API keys (not their values)
  const config = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY)
  };

  // Return the provider availability configuration
  return res.status(200).json(config);
}
