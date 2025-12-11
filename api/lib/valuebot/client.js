const AUTOMATION_BYPASS_SECRET =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET || process.env.VERCEL_PROTECTION_BYPASS;
const VALUEBOT_API_BASE_URL = process.env.VALUEBOT_API_BASE_URL || '';

function resolveApiBaseUrl() {
  if (VALUEBOT_API_BASE_URL) {
    return VALUEBOT_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    return '';
  }

  const envUrl =
    process.env.SITE_URL ||
    process.env.VERCEL_URL ||
    process.env.DEPLOYMENT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PUBLIC_URL;

  if (envUrl) {
    const normalized = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
    return normalized.replace(/\/$/, '');
  }

  return '';
}

export function buildApiUrl(path) {
  const base = resolveApiBaseUrl();
  if (!base) return path;
  return `${base}${path}`;
}

export async function safeJsonFetch(stageLabel = 'unknown_stage', url, init = {}) {
  const headers = new Headers(init.headers || {});

  headers.set('Content-Type', 'application/json');

  if (AUTOMATION_BYPASS_SECRET) {
    headers.set('x-vercel-protection-bypass', AUTOMATION_BYPASS_SECRET);
    console.log('[ValueBot Worker fetch] Using protection-bypass header for', stageLabel);
  }

  const finalInit = { ...init, headers };

  const res = await fetch(url, finalInit);
  const text = await res.text();
  const contentType = res.headers?.get?.('content-type') || '';
  const snippet = text.slice(0, 300);

  console.error('[ValueBot Worker fetch]', {
    stageLabel,
    url,
    status: res.status,
    contentType,
    snippet
  });

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`[stage=${stageLabel}] Non-JSON response from ${url} (status ${res.status})`);
  }

  try {
    const json = JSON.parse(text);
    return { json, status: res.status, ok: res.ok };
  } catch (err) {
    throw new Error(
      `[stage=${stageLabel}] JSON parse failed from ${url} (status ${res.status}): ${String(err)}`
    );
  }
}

export async function analyzeStockAPI({
  provider,
  model,
  ticker,
  companyName,
  question,
  timeframe,
  stageLabel
}) {
  const stockAnalysisUrl = buildApiUrl('/api/stock-analysis');

  try {
    const { json, ok } = await safeJsonFetch(stageLabel || 'module_0_data_loader', stockAnalysisUrl, {
      method: 'POST',
      body: JSON.stringify({
        provider: provider || 'openai',
        model,
        ticker,
        companyName,
        question,
        timeframe
      })
    });

    if (!ok) {
      return {
        data: null,
        error: json?.message || 'HTTP error'
      };
    }

    return {
      data: json,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: err?.message || 'Failed to analyze stock'
    };
  }
}
