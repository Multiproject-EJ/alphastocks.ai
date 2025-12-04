import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';
import { getAutoSettings, updateLastAutoRunAt } from './lib/valuebot/settings.js';
import { getSupabaseAdminClient } from './lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
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
          console.error('[ValueBot Auto Run Once] Failed to count pending jobs', countError);
        }

        remaining = count ?? 0;
      } catch (countErr) {
        console.error('[ValueBot Auto Run Once] Failed to read queue state while disabled', countErr);
      }

      return res.status(200).json({
        ok: true,
        autoEnabled: false,
        autoQueueEnabled: false,
        processed: 0,
        failed: 0,
        remaining,
        reason: 'Auto queue runner disabled via settings',
        lastAutoRunAt: lastAutoRunAt ?? null
      });
    }

    const maxJobs = Number(process.env.VALUEBOT_CRON_MAX_JOBS) || 1;

    const result = await runQueueWorker({
      supabase,
      maxJobs,
      runSource: 'manual_auto'
    });

    const updatedLastRunAt = await updateLastAutoRunAt(supabase);

    return res.status(200).json({
      ok: true,
      autoEnabled: true,
      autoQueueEnabled: true,
      processed: result?.processed ?? 0,
      failed: result?.failed ?? 0,
      remaining: result?.remaining ?? 0,
      lastAutoRunAt: updatedLastRunAt
    });
  } catch (err) {
    console.error('[ValueBot Auto Run Once] Fatal error', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Auto run error'
    });
  }
}
