import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfigServer } from './runDeepDiveForConfig.js';

const DEFAULT_BATCH_SIZE = 1;
export const DEFAULT_CRON_MAX_JOBS = 5;
export const SECONDS_PER_JOB_ESTIMATE = 70;
const MAX_WORKER_MS = 250_000;

export const QUEUE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export function getConfiguredMaxJobs(maxJobsInput) {
  const envMax = Number.parseInt(process.env.VALUEBOT_CRON_MAX_JOBS || '', 10);
  const envConfiguredMax = Number.isFinite(envMax) && envMax > 0 ? envMax : DEFAULT_CRON_MAX_JOBS;

  if (maxJobsInput === undefined || maxJobsInput === null) return envConfiguredMax;

  const provided = Number(maxJobsInput);
  return Number.isFinite(provided) && provided > 0 ? provided : envConfiguredMax;
}

function ensureSupabaseClient(supabase) {
  if (supabase) return supabase;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });
}

function normalizeJobIdentifiers(job) {
  const ticker = (job.ticker || '').trim() || null;
  const companyName = (job.company_name || '').trim() || null;

  return { ticker, companyName };
}

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
    await updateJobStatus(supabaseAdmin, job.id, {
      status,
      started_at: now,
      last_run: now,
      last_run_at: now,
      attempts
    });
    return { attempts, status };
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
  return { status, error: updates.error || null };
}

export async function runQueueWorker({ supabase: providedSupabase, maxJobs, runSource = 'manual' }) {
  const supabase = ensureSupabaseClient(providedSupabase);
  const resolvedMaxJobs = getConfiguredMaxJobs(maxJobs);
  const batchSize = Math.max(1, Number(resolvedMaxJobs) || DEFAULT_BATCH_SIZE);
  const start = Date.now();
  let processedCount = 0;
  let failedCount = 0;
  const jobErrors = [];
  const jobSummaries = [];

  const { data: jobs, error: fetchError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*')
    .or(['status.is.null', `status.eq.${QUEUE_STATUS.PENDING}`].join(','))
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    console.error('[ValueBot Worker fetch] Failed to fetch pending jobs', fetchError);
    throw new Error(fetchError.message || 'Failed to fetch pending jobs');
  }

  const jobsToProcess = jobs || [];

  // Immediately claim these jobs atomically to prevent race conditions
  if (jobsToProcess.length > 0) {
    const jobIds = jobsToProcess.map(j => j.id);
    const now = new Date().toISOString();
    
    const { error: claimError } = await supabase
      .from('valuebot_analysis_queue')
      .update({ 
        status: QUEUE_STATUS.RUNNING,
        started_at: now,
        updated_at: now
      })
      .in('id', jobIds)
      .or(['status.is.null', `status.eq.${QUEUE_STATUS.PENDING}`].join(','));
    
    if (claimError) {
      console.error('[ValueBot Worker] Failed to claim jobs atomically', claimError);
    }
  }

  for (const job of jobsToProcess) {
    const { ticker, companyName } = normalizeJobIdentifiers(job);
    const jobSummary = {
      id: job.id,
      ticker,
      company_name: companyName,
      status: job.status || QUEUE_STATUS.PENDING,
      attempts: job.attempts || 0,
      last_run: job.last_run ?? job.last_run_at ?? null,
      error: job.error ?? job.last_error ?? null
    };

    const MAX_ATTEMPTS = 3;

    // Skip if too many attempts
    if ((job.attempts || 0) >= MAX_ATTEMPTS) {
      const errorMessage = `Max attempts (${MAX_ATTEMPTS}) exceeded`;
      console.error('[ValueBot Worker] Job failed - max attempts exceeded', { id: job.id, attempts: job.attempts });
      await markJobStatus(supabase, job, QUEUE_STATUS.FAILED, { errorSnippet: errorMessage });
      jobErrors.push({ id: job.id, error: errorMessage });
      failedCount++;
      jobSummary.status = QUEUE_STATUS.FAILED;
      jobSummary.error = errorMessage;
      jobSummaries.push(jobSummary);
      continue;
    }

    if (!ticker && !companyName) {
      const errorMessage = 'Missing ticker and company name';
      console.error('[ValueBot Worker] Job failed - missing identifiers', { id: job.id });
      await markJobStatus(supabase, job, QUEUE_STATUS.FAILED, { errorSnippet: errorMessage });
      jobErrors.push({ id: job.id, error: errorMessage });
      failedCount++;
      jobSummary.status = QUEUE_STATUS.FAILED;
      jobSummary.error = errorMessage;
      jobSummaries.push(jobSummary);
      continue;
    }

    const runningState = await markJobStatus(supabase, job, QUEUE_STATUS.RUNNING);
    jobSummary.status = runningState.status;
    jobSummary.attempts = runningState.attempts ?? jobSummary.attempts;
    jobSummary.last_run = new Date().toISOString();

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
      console.info('[ValueBot Worker] Job completed', { id: job.id, ticker, company: companyName, runSource });
      processedCount++;
      jobSummary.status = QUEUE_STATUS.COMPLETED;
      jobSummary.error = null;
      jobSummary.last_run = new Date().toISOString();
    } catch (err) {
      const message = typeof err?.message === 'string' ? err.message : String(err);
      console.error('[ValueBot Worker] Job failed', {
        id: job.id,
        ticker,
        company: companyName,
        runSource,
        error: message
      });

      await markJobStatus(supabase, job, QUEUE_STATUS.FAILED, {
        errorSnippet: message.slice(0, 600)
      });
      jobErrors.push({ id: job.id, error: message.slice(0, 600) });
      failedCount++;
      jobSummary.status = QUEUE_STATUS.FAILED;
      jobSummary.error = message.slice(0, 600);
      jobSummary.last_run = new Date().toISOString();
    }

    jobSummaries.push(jobSummary);

    if (Date.now() - start > MAX_WORKER_MS) {
      break;
    }
  }

  const { count: remainingPending, error: remainingError } = await supabase
    .from('valuebot_analysis_queue')
    .select('*', { count: 'exact', head: true })
    .or(['status.is.null', `status.eq.${QUEUE_STATUS.PENDING}`].join(','));

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

  const jobsConsidered = Math.min(remainingCount + processedCount, resolvedMaxJobs);
  const estimatedSecondsThisRun = jobsConsidered * SECONDS_PER_JOB_ESTIMATE;

  return {
    processed: processedCount,
    failed: failedCount,
    remaining: remainingCount,
    completed,
    errors: jobErrors,
    jobs: jobSummaries,
    runSource,
    maxJobs: resolvedMaxJobs,
    secondsPerJobEstimate: SECONDS_PER_JOB_ESTIMATE,
    estimatedSecondsThisRun
  };
}
