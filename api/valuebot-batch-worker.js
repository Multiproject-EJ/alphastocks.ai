import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './lib/valuebot/runDeepDiveForConfig.js';

const MAX_JOBS_PER_RUN = 3;

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    const response = jsonResponse(405, { ok: false, error: 'Method not allowed' });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    const response = jsonResponse(500, { ok: false, error: 'Missing Supabase credentials' });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });

  try {
    const { data: jobs, count: pendingCount, error: fetchError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(MAX_JOBS_PER_RUN);

    if (fetchError) {
      const response = jsonResponse(500, { ok: false, error: 'Failed to fetch pending jobs' });
      res.status(response.status).setHeader('Content-Type', 'application/json');
      return res.end(await response.text());
    }

    if (!jobs || jobs.length === 0) {
      const response = jsonResponse(200, {
        ok: true,
        processed: 0,
        remaining: pendingCount || 0
      });
      res.status(response.status).setHeader('Content-Type', 'application/json');
      return res.end(await response.text());
    }

    const now = new Date().toISOString();
    const claimedJobs = jobs.map((job) => ({
      id: job.id,
      status: 'running',
      attempts: (job.attempts || 0) + 1,
      last_run: now,
      error: null
    }));

    const { data: claimed, error: claimError } = await supabase
      .from('valuebot_analysis_queue')
      .upsert(claimedJobs, { onConflict: 'id' })
      .select();

    if (claimError) {
      const response = jsonResponse(500, { ok: false, error: 'Failed to claim jobs' });
      res.status(response.status).setHeader('Content-Type', 'application/json');
      return res.end(await response.text());
    }

    let processed = 0;
    const jobsToProcess = claimed?.length ? claimed : jobs;

    for (const job of jobsToProcess) {
      const ticker = (job.ticker || '').trim() || null;
      const companyName = (job.company_name || '').trim() || null;

      if (!ticker && !companyName) {
        console.error('[ValueBot Worker] Job failed - missing identifiers', { id: job.id });
        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            error: 'Missing ticker and company name',
            last_run: new Date().toISOString()
          })
          .eq('id', job.id);
        continue;
      }

      const deepDiveConfig = {
        provider: (job.provider || 'openai').trim(),
        model: (job.model || '').trim() || null,
        ticker,
        companyName,
        timeframe: (job.timeframe || '').trim() || null,
        customQuestion: (job.custom_question || '').trim() || null
      };

      try {
        await runDeepDiveForConfigServer({
          supabase,
          job: { ...job, ...deepDiveConfig, company_name: companyName }
        });

        processed += 1;
        console.log('[ValueBot Worker] Job completed', { id: job.id, ticker, companyName });

        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'completed',
            error: null,
            last_run: new Date().toISOString()
          })
          .eq('id', job.id);
      } catch (err) {
        const message = typeof err?.message === 'string' ? err.message : String(err);
        console.error('[ValueBot Worker] Job failed', { id: job.id, ticker, companyName, error: message });

        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            error: message.slice(0, 500),
            last_run: new Date().toISOString()
          })
          .eq('id', job.id);
      }
    }

    const { count: remainingPending, error: remainingError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (remainingError) {
      const response = jsonResponse(500, { ok: false, error: 'Failed to count remaining jobs' });
      res.status(response.status).setHeader('Content-Type', 'application/json');
      return res.end(await response.text());
    }

    const response = jsonResponse(200, {
      ok: true,
      processed,
      remaining: remainingPending ?? 0
    });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  } catch (err) {
    const response = jsonResponse(500, {
      ok: false,
      error: 'Worker failed: ' + (err?.message || String(err))
    });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  }
}
