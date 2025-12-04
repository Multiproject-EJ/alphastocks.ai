import { createClient } from '@supabase/supabase-js';
import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';

const DEFAULT_MAX_JOBS = 1;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, source: 'cron', error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ ok: false, source: 'cron', error: 'Missing Supabase credentials' });
  }

  const cronSecret = process.env.VALUEBOT_CRON_SECRET;
  if (cronSecret) {
    const providedSecret = req.query?.secret || req.body?.secret;
    if (providedSecret !== cronSecret) {
      return res.status(401).json({ ok: false, source: 'cron', error: 'Unauthorized' });
    }
  }

  const maxJobs = Number(process.env.VALUEBOT_CRON_MAX_JOBS) || DEFAULT_MAX_JOBS;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });

  try {
    const result = await runQueueWorker({
      supabase,
      maxJobs,
      runSource: 'cron'
    });

    return res.status(200).json({
      ok: true,
      source: 'cron',
      ...result
    });
  } catch (error) {
    console.error('[ValueBot Worker] Cron worker error', error);
    return res.status(500).json({
      ok: false,
      source: 'cron',
      error: error?.message || 'Cron worker error'
    });
  }
}
