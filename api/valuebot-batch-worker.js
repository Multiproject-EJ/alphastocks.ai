import { createClient } from '@supabase/supabase-js';
import { runQueueWorker } from './lib/valuebot/runQueueWorker.js';

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

  const maxJobs = Number(req.body?.maxJobs) || 1;

  try {
    const result = await runQueueWorker({
      supabase,
      maxJobs,
      runSource: 'manual'
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
      error: 'Worker fatal error',
      details: err?.message || String(err)
    });
  }
}
