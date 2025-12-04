// Optional: set VALUEBOT_CRON_SECRET to require a matching ?secret=... query or x-valuebot-cron-secret header.
import { runQueueWorker, SECONDS_PER_JOB_ESTIMATE } from './lib/valuebot/runQueueWorker.js';
import { getAutoSettings, updateLastAutoRunAt } from './lib/valuebot/settings.js';
import { getSupabaseAdminClient } from './lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const sourceParam = url.searchParams.get('source');
  const source = sourceParam === 'ui' ? 'ui' : 'cron';
  const secretParam = url.searchParams.get('secret') || null;
  const cronSecret = process.env.VALUEBOT_CRON_SECRET || '';

  if (source === 'cron') {
    if (!cronSecret || secretParam !== cronSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized cron call' });
    }
  }

  const rawMax = process.env.VALUEBOT_CRON_MAX_JOBS;
  const parsedMax = Number(rawMax);
  const maxJobs = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 5;

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
        source,
        autoEnabled: false,
        processed: 0,
        failed: 0,
        remaining,
        reason: 'Auto queue runner disabled via settings',
        lastAutoRunAt: lastAutoRunAt ?? null,
        maxJobs,
        perJobMs: SECONDS_PER_JOB_ESTIMATE * 1000,
        estimatedCycleMs: 0
      });
    }

    const result = await runQueueWorker({
      supabase,
      maxJobs,
      runSource: source
    });

    const updatedLastRunAt = await updateLastAutoRunAt(supabase);

    return res.status(200).json({
      ok: true,
      source,
      autoEnabled: true,
      processed: result.processed,
      failed: result.failed,
      remaining: result.remaining,
      maxJobs: result.maxJobs,
      perJobMs: SECONDS_PER_JOB_ESTIMATE * 1000,
      estimatedCycleMs: (result.estimatedSecondsThisRun ?? 0) * 1000,
      secondsPerJobEstimate: result.secondsPerJobEstimate,
      estimatedSecondsThisRun: result.estimatedSecondsThisRun,
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
