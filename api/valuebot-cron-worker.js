// Optional: set VALUEBOT_CRON_SECRET to require a matching ?secret=... query or x-valuebot-cron-secret header.
import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cronSecret = process.env.VALUEBOT_CRON_SECRET;
  if (cronSecret) {
    const providedSecret = req.query?.secret || req.headers['x-valuebot-cron-secret'];
    if (providedSecret !== cronSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  try {
    const result = await runQueueWorker({
      maxJobs: 1,
      runSource: 'cron'
    });

    return res.status(200).json({
      ok: true,
      processed: result?.processed ?? 0,
      failed: result?.failed ?? 0,
      remaining: result?.remaining ?? 0
    });
  } catch (err) {
    console.error('[ValueBot Cron Worker] Fatal error', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Cron worker error'
    });
  }
}
