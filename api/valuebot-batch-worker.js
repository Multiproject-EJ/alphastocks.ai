import { createClient } from '@supabase/supabase-js';
import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    const response = jsonResponse(405, { ok: false, error: 'Method not allowed' });
    res.status(response.status).setHeader('Content-Type', 'application/json');
    return res.end(await response.text());
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
