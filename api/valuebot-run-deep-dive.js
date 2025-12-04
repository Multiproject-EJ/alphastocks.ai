import { createClient } from '@supabase/supabase-js';
import { runDeepDiveForConfig } from './lib/valuebot/runDeepDiveForConfig.js';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

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

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return jsonResponse(405, { ok: false, error: `Method not allowed: ${req.method}` });
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

    return jsonResponse(200, { ok: true, pipeline });
  } catch (err) {
    console.error('[ValueBot Debug] Deep dive handler failed', err);
    return jsonResponse(500, { ok: false, error: err?.message || 'Deep dive failed' });
  }
}
