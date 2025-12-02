import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './valuebot-run-deep-dive.js';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function requireEnv(name) {
  return Boolean(process.env[name]);
}

function resolveMaxJobs(queryValue) {
  const parsed = Number(queryValue);
  if (Number.isNaN(parsed) || parsed <= 0) return 3;
  return Math.min(parsed, 10);
}

async function processBatchJobs(supabase, maxJobs, userId) {
  const limit = resolveMaxJobs(maxJobs);

  let query = supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: jobs, error: fetchError } = await query;

  if (fetchError) {
    throw new Error(fetchError.message || 'Unable to fetch pending jobs');
  }

  console.log('[ValueBot Worker] Fetched pending jobs', {
    pendingCount: jobs?.length || 0,
    userId: userId || 'all'
  });

  if (!jobs || jobs.length === 0) {
    const { count: remainingCount } = await supabase
      .from('valuebot_analysis_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    return { processed: 0, remaining: remainingCount ?? 0, failed: 0, errors: [] };
  }

  let processedCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const job of jobs) {
    const startedAt = new Date().toISOString();
    const attempts = (job.attempts ?? 0) + 1;
    const startUpdate = await supabase
      .from('valuebot_analysis_queue')
      .update({
        status: 'running',
        started_at: startedAt,
        last_run_at: startedAt,
        last_error: null,
        attempts
      })
      .eq('id', job.id);

    if (startUpdate.error) {
      console.error('[valuebot-batch-worker] Failed to mark job running', {
        jobId: job.id,
        error: startUpdate.error
      });
      continue;
    }

    try {
      const rawTicker = job.ticker;
      const ticker = typeof rawTicker === 'string' ? rawTicker.trim() : '';
      const hasTicker = Boolean(ticker);
      const hasCompanyName = typeof job.company_name === 'string' && job.company_name.trim().length > 0;

      if (!hasTicker) {
        const failureReason = hasCompanyName
          ? 'Ticker is required for automated deep dive. Please add a ticker in the queue and requeue this job.'
          : 'Missing ticker and company_name for deep dive job.';

        console.warn('[ValueBot Worker] Skipping job with missing ticker:', {
          id: job.id,
          company_name: job.company_name
        });

        const failureUpdate = await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            attempts,
            last_error: failureReason.slice(0, 500),
            completed_at: null,
            last_run_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (failureUpdate.error) {
          console.error('[valuebot-batch-worker] Failed to mark job failed for missing ticker', {
            jobId: job.id,
            error: failureUpdate.error
          });
        }

        errors.push({ id: job.id, message: failureReason.slice(0, 256) });
        failedCount += 1;
        processedCount += 1;
        continue;
      }

      const config = {
        ticker,
        company_name: hasCompanyName ? job.company_name.trim() : null,
        timeframe: job.timeframe || null,
        custom_question: job.custom_question || null,
        provider: job.provider || 'openai',
        model: job.model || undefined,
        market: job.market || null,
        profileId: job.user_id,
        model_id: job.model_id || null,
        customQuestion: job.custom_question || null
      };

      try {
        const result = await runDeepDiveForConfigServer({
          config,
          userId: job.user_id || null,
          supabaseClient: supabase
        });

        const finishedAt = new Date().toISOString();

        if (result.ok) {
          const successUpdate = await supabase
            .from('valuebot_analysis_queue')
            .update({
              status: 'succeeded',
              attempts,
              completed_at: finishedAt,
              last_error: null,
              deep_dive_id: result.deepDiveId || job.deep_dive_id || null,
              last_run_at: finishedAt
            })
            .eq('id', job.id);

          if (successUpdate.error) {
            console.error('[valuebot-batch-worker] Failed to mark job succeeded', {
              jobId: job.id,
              error: successUpdate.error
            });
          }

          console.log('[ValueBot Worker] Job completed', {
            jobId: job.id,
            ticker: job.ticker,
            company_name: job.company_name
          });
        } else {
          const errorMessage = result.error || 'Deep dive failed';
          const failureUpdate = await supabase
            .from('valuebot_analysis_queue')
            .update({
              status: 'failed',
              attempts,
              last_error: errorMessage.slice(0, 500),
              completed_at: null,
              last_run_at: finishedAt
            })
            .eq('id', job.id);

          if (failureUpdate.error) {
            console.error('[valuebot-batch-worker] Failed to mark job failed', {
              jobId: job.id,
              error: failureUpdate.error
            });
          }

          const message = errorMessage.slice(0, 256);
          console.error('[ValueBot Worker] Job failed', {
            jobId: job.id,
            ticker: job.ticker,
            company_name: job.company_name,
            error: message
          });

          errors.push({ id: job.id, message });
          failedCount += 1;
        }
      } catch (err) {
        console.error('[ValueBot Worker] Deep dive failed for job', job.id, err);

        const failureUpdate = await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            attempts,
            last_error: (err?.message || 'Unexpected worker error').slice(0, 500),
            completed_at: null,
            last_run_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (failureUpdate.error) {
          console.error('[valuebot-batch-worker] Failed to mark job failed after exception', {
            jobId: job.id,
            error: failureUpdate.error
          });
        }

        const message = (err?.message || 'Unexpected worker error').slice(0, 256);
        errors.push({ id: job.id, message });
        failedCount += 1;
      }
    } catch (err) {
      console.error('[valuebot-batch-worker] Unexpected error while processing job', job.id, err);

      const failureUpdate = await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'failed',
          attempts,
          last_error: (err?.message || 'Unexpected worker error').slice(0, 500),
          completed_at: null,
          last_run_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (failureUpdate.error) {
        console.error('[valuebot-batch-worker] Failed to mark job failed after unexpected error', {
          jobId: job.id,
          error: failureUpdate.error
        });
      }

      const message = (err?.message || 'Unexpected worker error').slice(0, 256);
      errors.push({ id: job.id, message });
      failedCount += 1;
    }

    processedCount += 1;
  }

  let remainingQuery = supabase
    .from('valuebot_analysis_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (userId) {
    remainingQuery = remainingQuery.eq('user_id', userId);
  }

  const { count: remainingCount } = await remainingQuery;

  return { processed: processedCount, remaining: remainingCount ?? 0, failed: failedCount, errors };
}

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return jsonResponse(405, {
        ok: false,
        error: `Method not allowed: expected POST, received ${req.method}`
      });
    }

    if (!requireEnv('SUPABASE_URL') || !requireEnv('SUPABASE_SERVICE_ROLE_KEY')) {
      return jsonResponse(500, {
        ok: false,
        error: 'Missing Supabase credentials'
      });
    }

    const hasProviderKey =
      requireEnv('OPENAI_API_KEY') || requireEnv('GEMINI_API_KEY') || requireEnv('OPENROUTER_API_KEY');

    if (!hasProviderKey) {
      return jsonResponse(500, {
        ok: false,
        error: 'Missing AI provider credentials (OpenAI, Gemini, or OpenRouter)'
      });
    }

    let body = {};
    try {
      if (typeof req.json === 'function') {
        body = await req.json();
      } else {
        body = req.body || {};
      }
    } catch (parseErr) {
      console.error('[ValueBot Worker] Failed to parse request body', parseErr);
      body = req.body || {};
    }

    const userId =
      req.headers?.get?.('x-user-id') || req.headers?.['x-user-id'] || body?.userId || body?.user_id || null;
    const maxJobs = body?.maxJobs ?? body?.limit ?? req.query?.maxJobs;

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const result = await processBatchJobs(supabase, maxJobs, userId);

    return jsonResponse(200, {
      ok: true,
      ...result
    });
  } catch (err) {
    console.error('[ValueBot Worker] Unhandled worker error', err);
    return jsonResponse(500, { ok: false, error: 'Worker failed: ' + (err?.message || 'Unknown error') });
  }
}
