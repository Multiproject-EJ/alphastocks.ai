import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './lib/valuebot/runDeepDiveForConfig.js';

const BATCH_SIZE = 1;
const MAX_WORKER_MS = 250_000;

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

  const start = Date.now();
  let processed = 0;
  const jobErrors = [];

  try {
    const { data: jobs, error: fetchError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      const response = jsonResponse(500, {
        ok: false,
        error: 'Failed to fetch pending jobs',
        details: fetchError.message || String(fetchError)
      });
      res.status(response.status).setHeader('Content-Type', 'application/json');
      return res.end(await response.text());
    }

    const jobsToProcess = jobs || [];

    for (const job of jobsToProcess) {
      const ticker = (job.ticker || '').trim() || null;
      const companyName = (job.company_name || '').trim() || null;
      const baseAttempts = (job.attempts || 0) + 1;

      if (!ticker && !companyName) {
        const errorMessage = 'Missing ticker and company name';
        console.error('[ValueBot Worker] Job failed - missing identifiers', { id: job.id });
        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            attempts: baseAttempts,
            error: errorMessage,
            last_run: new Date().toISOString()
          })
          .eq('id', job.id);
        jobErrors.push({ id: job.id, error: errorMessage });
        continue;
      }

      await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'running',
          attempts: baseAttempts,
          last_run: new Date().toISOString(),
          error: null
        })
        .eq('id', job.id);

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
            attempts: baseAttempts,
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
            attempts: baseAttempts,
            error: message.slice(0, 300),
            last_run: new Date().toISOString()
          })
          .eq('id', job.id);

        jobErrors.push({ id: job.id, error: message.slice(0, 300) });
      }

      if (Date.now() - start > MAX_WORKER_MS) {
        break;
      }
    }

    const { count: remainingPending, error: remainingError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const remaining = remainingError ? 0 : remainingPending ?? 0;
    if (remainingError) {
      console.error('[ValueBot Worker] Failed to count remaining jobs', remainingError);
    }

    const response = jsonResponse(200, {
      ok: true,
      processed,
      remaining,
      errors: jobErrors
    });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  } catch (err) {
    console.error('[ValueBot Worker] Fatal error', err);
    const response = jsonResponse(500, {
      ok: false,
      error: 'Worker fatal error',
      details: err?.message || String(err)
    });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
  }
}
