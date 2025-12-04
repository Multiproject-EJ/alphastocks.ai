import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './lib/valuebot/runDeepDiveForConfig.js';

const BATCH_SIZE = 1;
const MAX_WORKER_MS = 250_000;

const QUEUE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

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
  let processedCount = 0;
  let failedCount = 0;
  const jobErrors = [];

  try {
    const { data: jobs, error: fetchError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*')
      .or(
        ['status.is.null', `status.eq.${QUEUE_STATUS.PENDING}`, `status.eq.${QUEUE_STATUS.RUNNING}`].join(',')
      )
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

    async function updateJobStatus(supabaseAdmin, jobId, patch) {
      const nowIso = new Date().toISOString();
      const updatePayload = {
        ...patch,
        updated_at: nowIso
      };

      const { error } = await supabaseAdmin
        .from('valuebot_analysis_queue')
        .update(updatePayload)
        .eq('id', jobId);

      if (error) {
        console.error('[ValueBot Worker] Failed to update job status', { id: jobId, ...patch, error });
      }
    }

    async function markJobStatus(supabaseAdmin, job, status, extra = {}) {
      const now = new Date().toISOString();
      if (status === QUEUE_STATUS.RUNNING) {
        const attempts = (job.attempts || 0) + 1;
        return updateJobStatus(supabaseAdmin, job.id, {
          status,
          started_at: now,
          last_run: now,
          last_run_at: now,
          attempts
        });
      }

      const updates = {
        status,
        last_run: now,
        last_run_at: now
      };

      if (status === QUEUE_STATUS.COMPLETED) {
        updates.error = null;
        updates.last_error = null;
      } else if (status === QUEUE_STATUS.FAILED) {
        const snippet = extra.errorSnippet || null;
        updates.error = snippet;
        updates.last_error = snippet;
      }

      await updateJobStatus(supabaseAdmin, job.id, updates);
    }

    for (const job of jobsToProcess) {
      const ticker = (job.ticker || '').trim() || null;
      const companyName = (job.company_name || '').trim() || null;

      if (!ticker && !companyName) {
        const errorMessage = 'Missing ticker and company name';
        console.error('[ValueBot Worker] Job failed - missing identifiers', { id: job.id });
        await markJobStatus(supabase, job, QUEUE_STATUS.FAILED, { errorSnippet: errorMessage });
        jobErrors.push({ id: job.id, error: errorMessage });
        failedCount++;
        continue;
      }

      await markJobStatus(supabase, job, QUEUE_STATUS.RUNNING);

      try {
        const result = await runDeepDiveForConfigServer({
          supabase,
          job: {
            ...job,
            provider: job.provider || 'openai',
            model: job.model || 'default',
            ticker,
            company_name: companyName,
            identifier: job.identifier || ticker || companyName || null
          }
        });

        if (!result || !result.ok) {
          throw new Error(result?.error || 'Unknown deep-dive error');
        }

        await markJobStatus(supabase, job, QUEUE_STATUS.COMPLETED);
        console.info('[ValueBot Worker] Job completed', { id: job.id, ticker, company: companyName });
        processedCount++;
      } catch (err) {
        const message = typeof err?.message === 'string' ? err.message : String(err);
        console.error('[ValueBot Worker] Job failed', {
          id: job.id,
          ticker,
          company: companyName,
          error: message
        });

        await markJobStatus(supabase, job, QUEUE_STATUS.FAILED, {
          errorSnippet: message.slice(0, 600)
        });
        jobErrors.push({ id: job.id, error: message.slice(0, 600) });
        failedCount++;
      }

      if (Date.now() - start > MAX_WORKER_MS) {
        break;
      }
    }

    const { count: remainingPending, error: remainingError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .or(
        ['status.is.null', `status.eq.${QUEUE_STATUS.PENDING}`, `status.eq.${QUEUE_STATUS.RUNNING}`].join(',')
      );

    const { count: completedCount, error: completedError } = await supabase
      .from('valuebot_analysis_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', QUEUE_STATUS.COMPLETED);

    const remainingCount = remainingError ? 0 : remainingPending ?? 0;
    const completed = completedError ? 0 : completedCount ?? 0;
    if (remainingError) {
      console.error('[ValueBot Worker] Failed to count remaining jobs', remainingError);
    }
    if (completedError) {
      console.error('[ValueBot Worker] Failed to count completed jobs', completedError);
    }

    const response = jsonResponse(200, {
      ok: true,
      processed: processedCount,
      failed: failedCount,
      remaining: remainingCount,
      completed,
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
