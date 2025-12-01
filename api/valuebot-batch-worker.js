/**
 * Vercel Serverless Function: ValueBot batch worker
 * Processes pending rows from valuebot_analysis_queue and runs full deep dives.
 */

import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfig } from '../workspace/src/features/valuebot/runDeepDiveForConfig.ts';

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role credentials are required.');
  }

  return createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function resolveMaxJobs(queryValue) {
  const parsed = Number(queryValue);
  if (Number.isNaN(parsed) || parsed <= 0) return 3;
  return Math.min(parsed, 10);
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[ValueBot worker] Supabase init failed', error);
    return res.status(500).json({ message: error?.message || 'Supabase not configured' });
  }

  const maxJobs = resolveMaxJobs(req.query?.maxJobs);

  const { data: jobs, error: fetchError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(maxJobs);

  if (fetchError) {
    console.error('[ValueBot worker] Failed to fetch jobs', fetchError);
    return res.status(500).json({ message: 'Unable to fetch pending jobs' });
  }

  if (!jobs || jobs.length === 0) {
    return res.status(200).json({ processed: 0, message: 'No pending jobs' });
  }

  let completedCount = 0;
  let failedCount = 0;

  for (const job of jobs) {
    try {
      const { error: updateError } = await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'processing',
          attempt_count: (job.attempt_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error('[ValueBot worker] Failed to mark processing', { jobId: job.id, error: updateError });
        failedCount += 1;
        continue;
      }

      const config = {
        profileId: job.profile_id,
        ticker: job.ticker,
        companyName: job.company_name,
        currency: job.currency,
        provider: job.provider || 'openai',
        model: job.model || undefined,
        timeframe: job.timeframe || undefined,
        customQuestion: job.custom_question || undefined
      };

      console.log('[ValueBot worker] Running deep dive', { jobId: job.id, ticker: job.ticker });
      const result = await runDeepDiveForConfig({ config, userId: job.profile_id, supabaseClient: supabase });

      if (result.success) {
        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'completed',
            last_error: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
        completedCount += 1;
        console.log('[ValueBot worker] Completed job', { jobId: job.id, ticker: job.ticker });
      } else {
        await supabase
          .from('valuebot_analysis_queue')
          .update({
            status: 'failed',
            last_error: result.error || 'Deep dive failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
        failedCount += 1;
        console.error('[ValueBot worker] Deep dive failed', { jobId: job.id, ticker: job.ticker, error: result.error });
      }
    } catch (error) {
      await supabase
        .from('valuebot_analysis_queue')
        .update({
          status: 'failed',
          last_error: error?.message || 'Unexpected worker error',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      failedCount += 1;
      console.error('[ValueBot worker] Unexpected error', { jobId: job.id, ticker: job.ticker, error });
    }
  }

  return res.status(200).json({
    processed: jobs.length,
    completed: completedCount,
    failed: failedCount,
    jobIds: jobs.map((j) => j.id)
  });
}
