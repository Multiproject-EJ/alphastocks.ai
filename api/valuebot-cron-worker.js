// Optional: set VALUEBOT_CRON_SECRET to require a matching ?secret=... query or x-cron-secret header.
import { runValuebotBatchOnce } from './valuebot-batch-worker.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cronSecret = process.env.VALUEBOT_CRON_SECRET;
  if (cronSecret) {
    const providedSecret = req.query?.secret || req.headers['x-cron-secret'];
    if (providedSecret !== cronSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  try {
    const result = await runValuebotBatchOnce({
      maxJobs: 1,
      trigger: 'cron'
    });

    return res.status(200).json({
      ok: true,
      source: 'cron',
      processed: result?.processed ?? 0,
      failed: result?.failed ?? 0,
      remaining: result?.remaining ?? 0,
      jobs: result?.jobs ?? []
    });
  } catch (err) {
    console.error('[ValueBot Cron Worker] Fatal error', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Cron worker error'
    });
  }
}
