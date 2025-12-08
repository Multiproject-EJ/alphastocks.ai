/**
 * Vercel Serverless Function: Provider Configuration API
 *
 * Endpoints:
 * - GET /api/provider-config: returns AI provider availability
 * - POST /api/provider-config (action=createWealthSkinCheckout): creates Stripe checkout session
 *
 * The provider config path now doubles as a small multi-action utility to stay within
 * Vercel's hobby tier serverless function limits while supporting the investing board
 * game's checkout flow.
 */

import Stripe from 'stripe';
import { WEALTH_SKINS } from '../workspace/src/features/investing-board-game/skins.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' }) : null;

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
    const { action } = req.body || {};

    if (action === 'createWealthSkinCheckout') {
      return handleCreateWealthSkinCheckout(req, res);
    }

    return res.status(400).json({
      code: 'BAD_REQUEST',
      error: 'Unsupported action',
      message: 'Use action=createWealthSkinCheckout for checkout session creation'
    });
  }

  return res.status(405).json({
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
}

async function handleCreateWealthSkinCheckout(req, res) {
  try {
    const { skinId } = req.body || {};
    const parsedId = Number(skinId);
    if (!Number.isFinite(parsedId) || parsedId < 1 || parsedId > 10) {
      res.status(400).json({ error: 'Invalid skinId' });
      return;
    }

    const matchingSkin = WEALTH_SKINS.find((skin) => skin.id === parsedId);
    const stripePriceId = matchingSkin?.stripePriceId;

    if (!stripe || !stripePriceId) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${origin}/?skinUnlocked=${parsedId}`,
      cancel_url: `${origin}/?skinPurchaseCanceled=1`,
      metadata: { skinId: String(parsedId) }
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error creating wealth skin checkout', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
