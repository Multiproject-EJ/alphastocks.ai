import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './lib/valuebot/runDeepDiveForConfig.js';

const MAX_JOBS_PER_RUN = Number.parseInt(process.env.VALUEBOT_WORKER_MAX_JOBS || '1', 10);

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return sendJson(res, 500, { ok: false, error: 'Missing Supabase credentials' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });

  try {
    const { count: pendingCount, error: pendingCountError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingCountError) {
      return sendJson(res, 500, { ok: false, error: 'Failed to count pending jobs' });
    }

    const { data: jobs, error: fetchError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(MAX_JOBS_PER_RUN);

    if (fetchError) {
      return sendJson(res, 500, { ok: false, error: 'Failed to fetch pending jobs' });
    }

    if (!jobs || jobs.length === 0) {
      return sendJson(res, 200, {
        ok: true,
        processed: 0,
        failures: 0,
        remaining: pendingCount || 0,
        jobs: []
      });
    }

    let processed = 0;
    let failures = 0;
    const jobResults = [];

    for (const job of jobs) {
      const ticker = (job.ticker || '').trim() || null;
      const companyName = (job.company_name || '').trim() || null;
      const attempts = (job.attempts || 0) + 1;

      if (!ticker && !companyName) {
        failures += 1;
        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            attempts,
            last_error: 'Missing ticker and company name',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        jobResults.push({
          id: job.id,
          ticker,
          companyName,
          status: 'failed',
          error: 'Missing ticker and company name'
        });
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

        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'completed',
            attempts,
            last_error: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        jobResults.push({
          id: job.id,
          ticker,
          companyName,
          status: 'completed'
        });
      } catch (err) {
        failures += 1;
        const message = typeof err?.message === 'string' ? err.message : String(err);

        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            attempts,
            last_error: message.slice(0, 500),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        jobResults.push({
          id: job.id,
          ticker,
          companyName,
          status: 'failed',
          error: message
        });
      }
    }

    const { count: remainingCount, error: remainingError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (remainingError) {
      return sendJson(res, 500, { ok: false, error: 'Failed to count remaining jobs' });
    }

    return sendJson(res, 200, {
      ok: true,
      processed,
      failures,
      remaining: remainingCount ?? Math.max((pendingCount || 0) - processed, 0),
      jobs: jobResults
    });
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: 'Worker failed: ' + (err?.message || String(err))
    });
  }
}
