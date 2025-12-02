function resolveMaxJobs(queryValue) {
  const parsed = Number(queryValue);
  if (Number.isNaN(parsed) || parsed <= 0) return 3;
  return Math.min(parsed, 10);
}

async function processBatchJobs(supabase, runDeepDiveForConfig, maxJobs) {
  const limit = resolveMaxJobs(maxJobs);

  const { data: jobs, error: fetchError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fetchError) {
    throw new Error(fetchError.message || 'Unable to fetch pending jobs');
  }

  if (!jobs || jobs.length === 0) {
    const { count: remainingCount } = await supabase
      .from('valuebot_analysis_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    return { processed: 0, remaining: remainingCount ?? 0, failed: 0 };
  }

  let processedCount = 0;
  let failedCount = 0;

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

        failedCount += 1;
        processedCount += 1;
        continue;
      }

      const config = {
        profileId: job.user_id,
        provider: job.provider || 'openai',
        model: job.model || undefined,
        ticker,
        companyName: hasCompanyName ? job.company_name.trim() : null,
        timeframe: job.timeframe || null,
        customQuestion: job.custom_question || null
      };

      try {
        const result = await runDeepDiveForConfig({
          config,
          userId: job.user_id || null,
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

          failedCount += 1;
        }
      } catch (err) {
        console.error('[ValueBot Worker] Deep dive failed for job', job.id, err);

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

        failedCount += 1;
      }
    } catch (err) {
      console.error('[valuebot-batch-worker] Unexpected error while processing job', job.id, err);

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
        console.error('[valuebot-batch-worker] Failed to mark job failed after unexpected error', {
          jobId: job.id,
          error: failureUpdate.error
        });
      }

      failedCount += 1;
    }

    processedCount += 1;
  }

  const { count: remainingCount } = await supabase
    .from('valuebot_analysis_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  return { processed: processedCount, remaining: remainingCount ?? 0, failed: failedCount };
}

export default async function handler(req, res) {
  try {
    // --- Valid POST only ---
    if (req.method !== 'POST') {
      return res.status(405).json({
        ok: false,
        error: 'Method not allowed',
        detail: `Received ${req.method}, expected POST`
      });
    }

    // --- Validate env vars early ---
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error: 'Missing Supabase credentials',
        detail: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
    }

    // --- Load Supabase + worker safely ---
    let createClient;
    let runDeepDiveForConfig;

    try {
      const supabasePkg = await import('@supabase/supabase-js');
      createClient = supabasePkg.createClient;

      runDeepDiveForConfig = (await import('../../workspace/src/features/valuebot/runDeepDiveForConfig.js')).runDeepDiveForConfig;
    } catch (importErr) {
      return res.status(500).json({
        ok: false,
        error: 'Import failure',
        detail: String(importErr)
      });
    }

    // --- Normal worker logic continues here ---
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const result = await processBatchJobs(supabase, runDeepDiveForConfig, req.query?.maxJobs);

    return res.status(200).json({
      ok: true,
      ...result
    });

  } catch (err) {
    // Failsafe: never return HTML
    return res.status(500).json({
      ok: false,
      error: 'Unhandled worker error',
      detail: String(err)
    });
  }
}
