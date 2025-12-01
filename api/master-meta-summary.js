/**
 * Vercel Serverless Function: MASTER meta summary (JSON-only)
 *
 * Endpoint: POST /api/master-meta-summary
 *
 * Given the Module 6 MASTER markdown, returns a compact JSON summary with
 * risk/quality/timing labels and a composite score. Defaults to OpenAI with
 * response_format set to json_object for deterministic parsing.
 */

const DEFAULT_MODEL = 'gpt-4o-mini';

function buildPrompt({ ticker, companyName, module6Markdown }) {
  const companyLabel = companyName?.trim() || ticker || 'the company';
  const tickerLabel = ticker?.trim() || 'N/A';

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

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
