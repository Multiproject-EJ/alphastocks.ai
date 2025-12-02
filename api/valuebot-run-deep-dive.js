import { runDeepDiveForConfig } from './lib/valuebot/runDeepDiveForConfig.js';

export async function runDeepDiveForConfigServer(options = {}) {
  const supabaseClient = options.supabaseClient;
  const userId = options.userId ?? null;
  const rawConfig = options.config || {};

  const ticker = rawConfig.ticker?.trim?.() || rawConfig.company_name || '[unknown]';
  const companyName = rawConfig.company_name?.trim?.() || '';

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
