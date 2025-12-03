import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './lib/valuebot/runDeepDiveForConfig.js';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function runBatchWorker() {
  const startedAt = Date.now();
  let processed = 0;
  let remaining = 0;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error('Supabase credentials missing');
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });

  const MAX_JOBS_PER_RUN = parseInt(process.env.VALUEBOT_WORKER_MAX_JOBS ?? '1', 10);
  const batchLimit = Math.min(MAX_JOBS_PER_RUN, 3);

  const { data: jobs, error: fetchError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('attempts', 5)
    .order('created_at', { ascending: true })
    .limit(batchLimit);

  if (fetchError) {
    console.error('[ValueBot Worker] Fetch error', fetchError);
    throw new Error('Failed to load queue jobs');
  }

  let timeBudgetHit = false;

  for (const job of jobs ?? []) {
    const elapsedSec = (Date.now() - startedAt) / 1000;
    if (elapsedSec > 240) {
      timeBudgetHit = true;
      console.warn('[ValueBot Worker] Time budget hit, stopping early', { elapsedSec });
      break;
    }

    const attempts = (job?.attempts ?? 0) + 1;
    await supabase
      .from('valuebot_analysis_queue')
      .update({
        status: 'running',
        attempts,
        last_run_at: new Date().toISOString(),
        last_error: null
      })
      .eq('id', job.id);

    try {
      await runDeepDiveForConfigServer({ supabase, job });

      await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'completed',
          last_error: null
        })
        .eq('id', job.id);

      processed += 1;

      console.log('[ValueBot Worker] Job completed', {
        id: job.id,
        ticker: job.ticker,
        company: job.company_name
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const snippet = msg.slice(0, 250);

      console.error('[ValueBot Worker] Job failed', {
        id: job.id,
        ticker: job.ticker,
        company: job.company_name,
        error: msg
      });

      await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'failed',
          last_error: snippet
        })
        .eq('id', job.id);
    }

    processed += 1;
  }

  const { count: remainingCount } = await supabase
    .from('valuebot_analysis_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  remaining = remainingCount ?? 0;
  const elapsedSec = (Date.now() - startedAt) / 1000;

  return {
    processed,
    remaining,
    elapsedSec,
    timeBudgetHit: timeBudgetHit || elapsedSec > 240
  };
}

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return jsonResponse(405, { ok: false, error: 'Method not allowed' });
    }

    const result = await runBatchWorker();
    return jsonResponse(200, { ok: true, ...result });
  } catch (err) {
    console.error('[ValueBot Worker fatal error]', err);
    return jsonResponse(500, { ok: false, error: String(err?.message || err) });
  }
}
