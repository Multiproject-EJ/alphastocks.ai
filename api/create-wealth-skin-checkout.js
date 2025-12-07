import Stripe from 'stripe';
import { WEALTH_SKINS } from '../workspace/src/features/investing-board-game/skins.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' }) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

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
