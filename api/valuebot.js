/**
 * Vercel Serverless Function: Consolidated ValueBot API
 *
 * Endpoint: /api/valuebot
 *
 * Actions (via query param or body):
 * - provider-config: Returns AI provider availability
 * - meta-summary: Generate MASTER meta summary (JSON-only)
 * - settings: Get/set auto queue settings
 * - batch: Process batch queue jobs
 * - cron: Cron worker for scheduled runs
 * - run-deep-dive: Execute deep dive for a configuration
 *
 * Consolidates:
 * - provider-config.js
 * - master-meta-summary.js
 * - valuebot-auto-settings.js
 * - valuebot-batch-worker.js
 * - valuebot-cron-worker.js
 * - valuebot-run-deep-dive.js
 */

import { createClient } from '@supabase/supabase-js';
import { getAutoSettings, setAutoQueueEnabled } from '../api-lib/valuebot/settings.js';
import { getConfiguredMaxJobs, SECONDS_PER_JOB_ESTIMATE, runQueueWorker } from '../api-lib/valuebot/runQueueWorker.js';
import { updateLastAutoRunAt } from '../api-lib/valuebot/settings.js';
import { getSupabaseAdminClient } from '../api-lib/supabaseAdmin.js';
import { runDeepDiveForConfig } from '../api-lib/valuebot/runDeepDiveForConfig.js';

// ============================================================================
// Action: provider-config
// ============================================================================

async function handleProviderConfig(req, res) {
  if (req.method === 'GET') {
    // Check for the presence of API keys (not their values)
    const config = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY)
    };

    // Return the provider availability configuration
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      error: 'Unsupported action',
      message: 'No provider-config actions are available at this time.'
    });
  }

  return res.status(405).json({
    code: 'METHOD_NOT_ALLOWED',
    error: 'Method not allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
}

// ============================================================================
// Action: meta-summary
// ============================================================================

const DEFAULT_MODEL = 'gpt-4o-mini';

function buildPrompt({ ticker, companyName, module6Markdown }) {
  const companyLabel = (companyName || '').trim() || (ticker || '').trim() || 'the company';
  const tickerLabel = (ticker || '').trim() || 'N/A';

  return `You are a summarizer for ValueBot.ai. Given the following final MASTER report (markdown) for ${tickerLabel} / ${companyLabel}, output only valid JSON with this exact shape:

{ "risk_label": "Low|Medium|High", "quality_label": "World Class|Excellent|Very Strong|Strong|Good|Average|Weak|Poor|Very Poor|Horrific", "timing_label": "Buy|Hold|Wait|Avoid", "composite_score": 7.8 }

Do not include any other text.

MASTER markdown:
${module6Markdown}`;
}

async function callOpenAI({ prompt, model }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const error = new Error('OpenAI is not configured');
    error.code = 'NO_OPENAI_KEY';
    throw error;
  }

  const resolvedModel = model || DEFAULT_MODEL;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: resolvedModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a concise investment metadata summarizer. Always respond with strict JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || response.statusText || 'OpenAI request failed';
    throw new Error(message);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = JSON.parse(content);

  return {
    meta: parsed,
    modelUsed: data?.model || resolvedModel,
    providerUsed: 'openai'
  };
}

async function handleMetaSummary(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { provider, model, ticker, companyName, module6Markdown } = req.body || {};

    if (!module6Markdown || typeof module6Markdown !== 'string' || !module6Markdown.trim()) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        error: 'Invalid request',
        message: 'module6Markdown is required and must be a non-empty string'
      });
    }

    const prompt = buildPrompt({ ticker, companyName, module6Markdown });

    // OpenAI-first; other providers fall back to OpenAI JSON mode when available.
    if (provider && provider.toLowerCase() !== 'openai') {
      console.info('[ValueBot] Non-OpenAI provider requested for master meta summary; falling back to OpenAI JSON mode.');
    }

    const { meta, modelUsed, providerUsed } = await callOpenAI({ prompt, model });

    return res.status(200).json({
      meta,
      modelUsed,
      providerUsed
    });
  } catch (error) {
    console.error('[ValueBot] MASTER meta summary failed:', error);
    return res.status(500).json({
      code: 'META_SUMMARY_ERROR',
      error: 'Unable to generate score summary',
      message: error?.message || 'Unexpected error while generating the score summary'
    });
  }
}

// ============================================================================
// Action: settings
// ============================================================================

async function handleSettings(req, res) {
  if (req.method === 'GET') {
    const { autoQueueEnabled, lastAutoRunAt } = await getAutoSettings();
    const maxJobs = getConfiguredMaxJobs();
    return res.status(200).json({
      autoQueueEnabled,
      lastAutoRunAt,
      maxJobs,
      secondsPerJobEstimate: SECONDS_PER_JOB_ESTIMATE
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const { autoQueueEnabled } = body;

      if (typeof autoQueueEnabled !== 'boolean') {
        return res.status(400).json({ error: 'autoQueueEnabled must be boolean' });
      }

      await setAutoQueueEnabled(autoQueueEnabled);
      const { lastAutoRunAt } = await getAutoSettings();
      const maxJobs = getConfiguredMaxJobs();
      return res.status(200).json({
        autoQueueEnabled,
        lastAutoRunAt,
        maxJobs,
        secondsPerJobEstimate: SECONDS_PER_JOB_ESTIMATE
      });
    } catch (err) {
      console.error('[ValueBot auto-settings] POST failed', err);
      return res.status(500).json({ error: 'Failed to update autoQueueEnabled' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}

// ============================================================================
// Action: batch
// ============================================================================

export async function runValuebotBatchOnce({ maxJobs = 1, trigger = 'manual', supabase: providedSupabase } = {}) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!providedSupabase && (!SUPABASE_URL || !SERVICE_ROLE)) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase =
    providedSupabase ||
    createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false }
    });

  const result = await runQueueWorker({
    supabase,
    maxJobs,
    runSource: trigger || 'manual'
  });

  return {
    processed: result?.processed ?? 0,
    failed: result?.failed ?? 0,
    remaining: result?.remaining ?? 0,
    jobs: result?.jobs ?? [],
    completed: result?.completed ?? 0,
    errors: result?.errors ?? [],
    runSource: result?.runSource || trigger || 'manual'
  };
}

async function handleBatch(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const urlAction = url.searchParams.get('action');
  const bodyAction = req.body?.action;
  const action = bodyAction || urlAction || null;

  if (action === 'clear_completed') {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return res.status(500).json({
        ok: false,
        action: 'clear_completed',
        error: 'Missing Supabase credentials'
      });
    }

    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false }
      });

      const { data, error } = await supabase
        .from('valuebot_analysis_queue')
        .delete()
        .eq('status', 'completed');

      if (error) {
        console.error('[ValueBot Worker] Failed to clear completed jobs', error);
        return res.status(500).json({
          ok: false,
          action: 'clear_completed',
          error: error.message || 'Failed to clear completed jobs'
        });
      }

      return res.status(200).json({
        ok: true,
        action: 'clear_completed',
        deleted: data?.length || 0
      });
    } catch (err) {
      console.error('[ValueBot Worker] Fatal clear_completed error', err);
      return res.status(500).json({
        ok: false,
        action: 'clear_completed',
        error: err?.message || 'Failed to clear completed jobs'
      });
    }
  }

  const maxJobs = Number(req.body?.maxJobs) || 1;

  try {
    const result = await runValuebotBatchOnce({
      maxJobs,
      trigger: 'manual'
    });

    return res.status(200).json({
      ok: true,
      source: 'manual',
      ...result
    });
  } catch (err) {
    console.error('[ValueBot Worker] Fatal error', err);
    return res.status(500).json({
      ok: false,
      source: 'manual',
      error: err?.message || 'Worker fatal error',
      details: err?.message || String(err)
    });
  }
}

// ============================================================================
// Action: cron
// ============================================================================

async function handleCron(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(200).json({ ok: false, message: 'Method not allowed' });
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const sourceParam = url.searchParams.get('source');
  const source = sourceParam === 'ui' ? 'ui' : 'cron';
  const secretParam = url.searchParams.get('secret') || null;
  const cronSecret = process.env.VALUEBOT_CRON_SECRET || '';

  if (source === 'cron') {
    if (!cronSecret || secretParam !== cronSecret) {
      return res.status(200).json({ ok: false, message: 'Unauthorized cron call', errorCode: 'unauthorized' });
    }
  }

  const rawMax = process.env.VALUEBOT_CRON_MAX_JOBS;
  const parsedMax = Number(rawMax);
  const maxJobs = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 5;

  try {
    const supabase = getSupabaseAdminClient();
    const { autoQueueEnabled, lastAutoRunAt } = await getAutoSettings();

    if (!autoQueueEnabled) {
      let remaining = 0;
      try {
        const { count, error: countError } = await supabase
          .from('valuebot_analysis_queue')
          .select('*', { count: 'exact', head: true })
          .or(['status.is.null', 'status.eq.pending'].join(','));

        if (countError) {
          console.error('[ValueBot Cron Worker] Failed to count pending jobs', countError);
        }

        remaining = count ?? 0;
      } catch (countErr) {
        console.error('[ValueBot Cron Worker] Failed to read queue state while disabled', countErr);
      }

      return res.status(200).json({
        ok: true,
        source,
        autoEnabled: false,
        processed: 0,
        failed: 0,
        remaining,
        message: `Auto queue runner disabled via settings. ${remaining} remaining in queue.`,
        reason: 'Auto queue runner disabled via settings',
        lastAutoRunAt: lastAutoRunAt ?? null,
        maxJobs,
        perJobMs: SECONDS_PER_JOB_ESTIMATE * 1000,
        estimatedCycleMs: 0
      });
    }

    const result = await runQueueWorker({
      supabase,
      maxJobs,
      runSource: source
    });

    const updatedLastRunAt = await updateLastAutoRunAt(supabase);

    const processed = result.processed ?? 0;
    const failed = result.failed ?? 0;
    const remaining = result.remaining ?? 0;
    const message = `Auto run processed ${processed} jobs (${failed} failed). ${remaining} remaining in queue.`;

    return res.status(200).json({
      ok: true,
      source,
      autoEnabled: true,
      processed,
      failed,
      remaining,
      message,
      maxJobs: result.maxJobs,
      perJobMs: SECONDS_PER_JOB_ESTIMATE * 1000,
      estimatedCycleMs: (result.estimatedSecondsThisRun ?? 0) * 1000,
      secondsPerJobEstimate: result.secondsPerJobEstimate,
      estimatedSecondsThisRun: result.estimatedSecondsThisRun,
      lastAutoRunAt: updatedLastRunAt
    });
  } catch (err) {
    console.error('[ValueBot Cron Worker] Fatal error', err);
    const detail = (err?.message || 'Cron worker error').slice(0, 200);
    return res.status(200).json({
      ok: false,
      message: 'Auto run failed. Please try again shortly.',
      errorDetail: detail
    });
  }
}

// ============================================================================
// Action: run-deep-dive
// ============================================================================

export async function runDeepDiveForConfigServer(options = {}) {
  const supabaseClient = options.supabaseClient;
  const userId = options.userId ?? null;
  const rawConfig = options.config || {};

  const ticker = rawConfig.ticker?.trim?.() || '';
  const companyName = rawConfig.companyName?.trim?.() || rawConfig.company_name?.trim?.() || '';

  if (!ticker && !companyName) {
    return { ok: false, error: 'Provide at least a ticker or a company name.' };
  }

  console.log('[ValueBot Worker] Starting deep dive', { ticker, companyName });

  try {
    const result = await runDeepDiveForConfig({
      supabaseClient,
      userId,
      config: {
        provider: rawConfig.provider || 'openai',
        model: rawConfig.model || rawConfig.model_id || '',
        ticker: rawConfig.ticker || '',
        companyName,
        timeframe: rawConfig.timeframe || rawConfig.time_horizon || '',
        customQuestion: rawConfig.custom_question || rawConfig.customQuestion || '',
        profileId: rawConfig.profileId || rawConfig.user_id || null,
        market: rawConfig.market || ''
      }
    });

    if (result?.success) {
      console.log('[ValueBot Worker] Deep dive completed', { ticker, companyName });
    } else {
      console.error('[ValueBot Worker] Deep dive failed', {
        ticker,
        companyName,
        error: result?.error || 'Unknown error'
      });
    }

    return {
      ok: !!result?.success,
      error: result?.error,
      deepDiveId: result?.deepDiveId,
      module0Markdown: result?.module0Markdown,
      module1Markdown: result?.module1Markdown,
      module2Markdown: result?.module2Markdown,
      module3Markdown: result?.module3Markdown,
      module4Markdown: result?.module4Markdown,
      module5Markdown: result?.module5Markdown,
      module6Markdown: result?.module6Markdown,
      masterMeta: result?.masterMeta || result?.meta || null
    };
  } catch (err) {
    console.error('[ValueBot Worker] Deep dive exception', { ticker, error: err });
    return { ok: false, error: err?.message || 'Deep dive failed unexpectedly' };
  }
}

async function handleDeepDive(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: `Method not allowed: ${req.method}` });
    }

    let body = {};
    try {
      if (typeof req.json === 'function') {
        body = await req.json();
      } else {
        body = req.body || {};
      }
    } catch (err) {
      console.error('[ValueBot Debug] Failed to parse request body', err);
      body = req.body || {};
    }

    const supabaseClient =
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

    const pipeline = await runDeepDiveForConfigServer({
      config: body,
      supabaseClient,
      userId: body?.userId || body?.user_id || null
    });

    return res.status(200).json({ ok: true, pipeline });
  } catch (err) {
    console.error('[ValueBot Debug] Deep dive handler failed', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Deep dive failed' });
  }
}

// ============================================================================
// Main Handler
// ============================================================================

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Support action from query string OR body
  const action = req.query.action || req.body?.action;

  switch (action) {
    case 'provider-config':
      return handleProviderConfig(req, res);
    case 'meta-summary':
      return handleMetaSummary(req, res);
    case 'settings':
      return handleSettings(req, res);
    case 'batch':
      return handleBatch(req, res);
    case 'cron':
      return handleCron(req, res);
    case 'run-deep-dive':
      return handleDeepDive(req, res);
    default:
      return res.status(400).json({
        error: 'Unknown action',
        availableActions: ['provider-config', 'meta-summary', 'settings', 'batch', 'cron', 'run-deep-dive']
      });
  }
}
