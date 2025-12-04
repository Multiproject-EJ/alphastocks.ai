// Optional: set VALUEBOT_CRON_SECRET to require a matching ?secret=... query or x-valuebot-cron-secret header.
import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';
import { getAutoSettings, updateLastAutoRunAt } from './lib/valuebot/settings.js';
import { getSupabaseAdminClient } from './lib/supabaseAdmin.js';

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
    const supabase = getSupabaseAdminClient();
    const { autoQueueEnabled, lastAutoRunAt } = await getAutoSettings();

    if (!autoQueueEnabled) {
      let remaining = 0;
      try {
        const { count, error: countError } = await supabase
          .from('valuebot_analysis_queue')
          .select('*', { count: 'exact', head: true })
          .or(['status.is.null', 'status.eq.pending', 'status.eq.running'].join(','));

        if (countError) {
          console.error('[ValueBot Cron Worker] Failed to count pending jobs', countError);
        }

        remaining = count ?? 0;
      } catch (countErr) {
        console.error('[ValueBot Cron Worker] Failed to read queue state while disabled', countErr);
      }

      return res.status(200).json({
        ok: true,
        autoEnabled: false,
        processed: 0,
        failed: 0,
        remaining,
        reason: 'Auto queue runner disabled via settings',
        lastAutoRunAt: lastAutoRunAt ?? null
      });
    }

    const result = await runQueueWorker({
      supabase,
      maxJobs: 1,
      runSource: 'cron'
    });

    const updatedLastRunAt = await updateLastAutoRunAt(supabase);

    return res.status(200).json({
      ok: true,
      autoEnabled: true,
      processed: result?.processed ?? 0,
      failed: result?.failed ?? 0,
      remaining: result?.remaining ?? 0,
      lastAutoRunAt: updatedLastRunAt
    });
  } catch (err) {
    console.error('[ValueBot Cron Worker] Fatal error', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Cron worker error'
    });
  }
}
