import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfig } from '../workspace/src/features/valuebot/runDeepDiveForConfig.ts';

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function resolveMaxJobs(queryValue) {
  const parsed = Number(queryValue);
  if (Number.isNaN(parsed) || parsed <= 0) return 3;
  return Math.min(parsed, 10);
}

async function processJobs(supabase, maxJobs) {
  const { data: jobs, error: fetchError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })
    .limit(maxJobs);

  if (fetchError) {
    throw new Error(fetchError.message || 'Unable to fetch pending jobs');
  }

  if (!jobs || jobs.length === 0) {
    const { count: remainingCount } = await supabase
      .from('valuebot_analysis_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    return { processed: 0, remaining: remainingCount ?? 0 };
  }

  let processedCount = 0;

  for (const job of jobs) {
    const startedAt = new Date().toISOString();
    const startUpdate = await supabase
      .from('valuebot_analysis_queue')
      .update({
        status: 'running',
        attempts: (job.attempts ?? 0) + 1,
        started_at: startedAt,
        last_run_at: startedAt,
        last_error: null
      })
      .eq('id', job.id);

    if (startUpdate.error) {
      console.error('[valuebot-batch-worker] Failed to mark job running', { jobId: job.id, error: startUpdate.error });
      continue;
    }

    try {
      const config = {
        profileId: job.user_id,
        ticker: job.ticker || '',
        companyName: job.company_name || null,
        provider: job.provider || 'openai',
        model: job.model || null,
        timeframe: job.timeframe || null,
        customQuestion: job.custom_question || null
      };

      const result = await runDeepDiveForConfig({
        config,
        userId: job.user_id,
        supabaseClient: supabase
      });

      const finishedAt = new Date().toISOString();

      if (result.success) {
        const successUpdate = await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'succeeded',
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
      } else {
        const errorMessage = result.error || 'Deep dive failed';
        const failureUpdate = await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
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
      }
    } catch (err) {
      const failureUpdate = await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'failed',
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
    }

    processedCount += 1;
  }

  const { count: remainingCount } = await supabase
    .from('valuebot_analysis_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  return { processed: processedCount, remaining: remainingCount ?? 0 };
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    console.error('[valuebot-batch-worker] Supabase service credentials not configured.');
    return res.status(500).json({ error: 'Supabase service credentials not configured.' });
  }

  const maxJobs = resolveMaxJobs(req.query?.maxJobs);

  try {
    const { processed, remaining } = await processJobs(supabase, maxJobs);
    return res.status(200).json({ ok: true, processed, remaining });
  } catch (err) {
    console.error('[valuebot-batch-worker] Failed to run worker', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Failed to run worker' });
  }
}
