/**
 * Vercel Serverless Function: Provider Configuration API
 *
 * Endpoints:
 * - GET /api/provider-config: returns AI provider availability
 *
 * Previously this endpoint also supported an Investing Board Game checkout flow, which has been removed.
*/

/**
 * Main handler for the provider configuration API endpoint
 * @param {object} req - Vercel request object
 * @param {object} res - Vercel response object
 */
export default async function handler(req, res) {
  // Set CORS headers - identical to stock-analysis endpoint
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Check for the presence of API keys (not their values)
    const config = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY)
    };

    // Return the provider availability configuration
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      error: 'Unsupported action',
      message: 'No provider-config actions are available at this time.'
    });
  }

  return res.status(405).json({
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
}
