/**
 * Vercel Serverless Function: Universe Builder API
 *
 * Endpoint: POST /api/universe-builder
 *
 * Actions:
 * - status: Returns current progress, exchanges list, and stats
 * - analyze: Runs next analysis step (one letter on one exchange)
 * - set-priority: Toggle priority flag for an exchange
 * - get-stocks: Paginated list of cataloged stocks
 */

import { createClient } from '@supabase/supabase-js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Create JSON response
 */
function jsonResponse(status, payload) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false }
  });
}

/**
 * Get current status - progress, exchanges, and stats
 */
async function getStatus(supabase) {
  // Get progress tracker
  const { data: progress, error: progressError } = await supabase
    .from('universe_build_progress')
    .select('*')
    .single();

  if (progressError) {
    throw new Error(`Failed to fetch progress: ${progressError.message}`);
  }

  // Get all exchanges
  const { data: exchanges, error: exchangesError } = await supabase
    .from('stock_exchanges')
    .select('*')
    .order('is_priority', { ascending: false })
    .order('country', { ascending: true });

  if (exchangesError) {
    throw new Error(`Failed to fetch exchanges: ${exchangesError.message}`);
  }

  // Get total stocks count
  const { count: totalStocks, error: countError } = await supabase
    .from('stocks_universe_builder')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to count stocks: ${countError.message}`);
  }

  // Get investment universe count (analysed stocks)
  const { count: investmentUniverseCount, error: universeCountError } = await supabase
    .from('investment_universe')
    .select('*', { count: 'exact', head: true });

  if (universeCountError) {
    console.warn('Failed to count investment universe:', universeCountError.message);
  }

  return {
    progress: progress || {},
    exchanges: exchanges || [],
    totalStocks: totalStocks || 0,
    investmentUniverseCount: investmentUniverseCount || 0,
    stats: {
      totalExchanges: exchanges?.length || 0,
      priorityExchanges: exchanges?.filter(e => e.is_priority).length || 0,
      completedExchanges: exchanges?.filter(e => e.last_analyzed_letter === 'Z').length || 0
    }
  };
}

/**
 * Call OpenAI to fetch stocks for a given exchange and letter
 */
async function fetchStocksWithAI(exchangeName, micCode, country, letter) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const prompt = `List all publicly traded stocks on the ${exchangeName} (${micCode}) stock exchange in ${country} where the company name starts with the letter "${letter}".

Return as JSON: { 
  "stocks": [
    { "ticker": "XXX", "companyName": "Full Name", "sector": "Technology", "industry": "Software" }
  ] 
}

Be comprehensive but only include real, currently listed companies. If you don't have data, return an empty stocks array.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a financial data assistant. Provide accurate stock listings in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim() || '{"stocks":[]}';

  // Parse JSON response
  try {
    let jsonText = content;
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    const parsed = JSON.parse(jsonText);
    return parsed.stocks || [];
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return [];
  }
}

/**
 * Analyze next exchange/letter combination
 */
async function runAnalysis(supabase) {
  // Get current progress
  const { data: progress, error: progressError } = await supabase
    .from('universe_build_progress')
    .select('*')
    .single();

  if (progressError) {
    throw new Error(`Failed to fetch progress: ${progressError.message}`);
  }

  // Find next exchange to process (priority first, then by last_analyzed_at)
  const { data: exchanges, error: exchangesError } = await supabase
    .from('stock_exchanges')
    .select('*')
    .eq('is_active', true)
    .order('is_priority', { ascending: false })
    .order('last_analyzed_at', { ascending: true, nullsFirst: true });

  if (exchangesError || !exchanges || exchanges.length === 0) {
    throw new Error('No active exchanges found');
  }

  // Find the first exchange that hasn't completed all letters
  let targetExchange = null;
  for (const exchange of exchanges) {
    if (!exchange.last_analyzed_letter || exchange.last_analyzed_letter !== 'Z') {
      targetExchange = exchange;
      break;
    }
  }

  if (!targetExchange) {
    // All exchanges completed
    await supabase
      .from('universe_build_progress')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', progress.id);

    return {
      completed: true,
      message: 'All exchanges have been analyzed'
    };
  }

  // Determine current letter
  const currentLetterIndex = targetExchange.last_analyzed_letter 
    ? LETTERS.indexOf(targetExchange.last_analyzed_letter) + 1 
    : 0;

  if (currentLetterIndex >= LETTERS.length) {
    throw new Error('Invalid letter index');
  }

  const currentLetter = LETTERS[currentLetterIndex];

  // Set status to running
  await supabase
    .from('universe_build_progress')
    .update({ 
      status: 'running',
      current_exchange_mic: targetExchange.mic_code,
      current_letter: currentLetter,
      updated_at: new Date().toISOString()
    })
    .eq('id', progress.id);

  // Call AI to fetch stocks
  const stocks = await fetchStocksWithAI(
    targetExchange.name,
    targetExchange.mic_code,
    targetExchange.country,
    currentLetter
  );

  // Insert stocks into database
  let insertedCount = 0;
  if (stocks.length > 0) {
    const stocksToInsert = stocks.map(stock => ({
      ticker: stock.ticker || '',
      company_name: stock.companyName || '',
      exchange_mic: targetExchange.mic_code,
      country: targetExchange.country,
      sector: stock.sector || null,
      industry: stock.industry || null,
      added_at: new Date().toISOString()
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('stocks_universe_builder')
      .upsert(stocksToInsert, { onConflict: 'ticker,exchange_mic', ignoreDuplicates: true })
      .select();

    if (!insertError) {
      insertedCount = inserted?.length || 0;
    }
  }

  // Update exchange progress
  const newTotalStocks = (targetExchange.total_stocks_found || 0) + insertedCount;
  await supabase
    .from('stock_exchanges')
    .update({
      last_analyzed_letter: currentLetter,
      last_analyzed_at: new Date().toISOString(),
      total_stocks_found: newTotalStocks,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetExchange.id);

  // Update progress tracker
  const isExchangeComplete = currentLetter === 'Z';
  const totalExchangesCompleted = isExchangeComplete 
    ? (progress.total_exchanges_completed || 0) + 1 
    : progress.total_exchanges_completed || 0;

  await supabase
    .from('universe_build_progress')
    .update({
      status: 'idle',
      total_exchanges_completed: totalExchangesCompleted,
      total_stocks_cataloged: (progress.total_stocks_cataloged || 0) + insertedCount,
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', progress.id);

  const nextLetter = currentLetterIndex + 1 < LETTERS.length ? LETTERS[currentLetterIndex + 1] : null;

  return {
    completed: false,
    exchange: {
      name: targetExchange.name,
      mic_code: targetExchange.mic_code,
      country: targetExchange.country
    },
    letter: currentLetter,
    stocksFound: stocks.length,
    stocksInserted: insertedCount,
    nextStep: isExchangeComplete 
      ? 'Move to next exchange' 
      : `Continue with letter ${nextLetter}`,
    progress: {
      exchangeComplete: isExchangeComplete,
      currentLetter: currentLetter,
      nextLetter: nextLetter
    }
  };
}

/**
 * Toggle priority flag for an exchange
 */
async function setPriority(supabase, micCode, isPriority) {
  if (!micCode) {
    throw new Error('mic_code is required');
  }

  const { data, error } = await supabase
    .from('stock_exchanges')
    .update({ 
      is_priority: Boolean(isPriority),
      updated_at: new Date().toISOString()
    })
    .eq('mic_code', micCode)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update priority: ${error.message}`);
  }

  return {
    success: true,
    exchange: data
  };
}

/**
 * Escape special characters for Supabase ilike queries
 * Escapes %, _, and \ which have special meaning in LIKE patterns
 */
function escapeSearchTerm(term) {
  if (!term) return '';
  // Escape backslash first, then % and _
  return term
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Get paginated list of stocks
 */
async function getStocks(supabase, page = 1, perPage = 50, exchange = null, search = null) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('stocks_universe_builder')
    .select('*', { count: 'exact' })
    .order('added_at', { ascending: false })
    .range(from, to);

  if (exchange) {
    query = query.eq('exchange_mic', exchange);
  }

  // Add search filter if provided
  if (search && search.trim()) {
    // Escape special LIKE characters to prevent SQL injection
    const escapedSearch = escapeSearchTerm(search.trim().toLowerCase());
    // Use ilike for case-insensitive search on ticker and company_name
    query = query.or(`ticker.ilike.%${escapedSearch}%,company_name.ilike.%${escapedSearch}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch stocks: ${error.message}`);
  }

  return {
    stocks: data || [],
    pagination: {
      page,
      perPage,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / perPage)
    }
  };
}

/**
 * Get stocks from universe that are not already in the batch queue
 * Returns up to `limit` stocks that haven't been queued yet
 */
async function getUnqueuedStocks(supabase, limit = 3, userId = null) {
  // Get tickers already in the queue (pending or running)
  const { data: queuedTickers, error: queueError } = await supabase
    .from('valuebot_analysis_queue')
    .select('ticker')
    .in('status', ['pending', 'running']);

  if (queueError) {
    throw new Error(`Failed to fetch queue: ${queueError.message}`);
  }

  // Get tickers already in the investment universe (already analysed)
  const { data: analyzedTickers, error: analyzeError } = await supabase
    .from('investment_universe')
    .select('symbol');

  if (analyzeError) {
    throw new Error(`Failed to fetch investment universe: ${analyzeError.message}`);
  }

  // Combine both sets of tickers to exclude (normalized to uppercase)
  const queuedSet = new Set((queuedTickers || []).map(t => t.ticker?.toUpperCase()).filter(Boolean));
  const analyzedSet = new Set((analyzedTickers || []).map(t => t.symbol?.toUpperCase()).filter(Boolean));
  const excludedTickers = [...new Set([...queuedSet, ...analyzedSet])];

  // Get stocks from universe that are not in either list
  // Use server-side filtering with NOT IN when we have excluded tickers
  let query = supabase
    .from('stocks_universe_builder')
    .select('ticker, company_name, exchange_mic, country, sector, industry')
    .order('added_at', { ascending: true });

  // Apply NOT IN filter if we have tickers to exclude
  if (excludedTickers.length > 0) {
    // Supabase .not() with 'in' for efficient server-side filtering
    query = query.not('ticker', 'in', `(${excludedTickers.join(',')})`);
  }

  query = query.limit(limit);

  const { data: availableStocks, error: stocksError } = await query;

  if (stocksError) {
    throw new Error(`Failed to fetch stocks: ${stocksError.message}`);
  }

  return {
    stocks: availableStocks || [],
    totalAvailable: (availableStocks || []).length,
    queuedCount: queuedSet.size,
    analyzedCount: analyzedSet.size
  };
}

/**
 * Add stocks to the batch queue
 */
async function addStocksToQueue(supabase, stocks, userId = null, provider = 'openai', model = null) {
  if (!stocks || stocks.length === 0) {
    return { added: 0, skipped: 0, stocks: [] };
  }

  const tickers = stocks.map(s => s.ticker?.toUpperCase()).filter(Boolean);

  // Check which tickers are already in queue
  const { data: existingQueue } = await supabase
    .from('valuebot_analysis_queue')
    .select('ticker')
    .in('ticker', tickers)
    .in('status', ['pending', 'running']);

  // Check which tickers are already in investment universe
  const { data: existingUniverse } = await supabase
    .from('investment_universe')
    .select('symbol')
    .in('symbol', tickers);

  const alreadyQueuedSet = new Set((existingQueue || []).map(t => t.ticker?.toUpperCase()));
  const alreadyAnalyzedSet = new Set((existingUniverse || []).map(t => t.symbol?.toUpperCase()));

  const stocksToAdd = stocks.filter(s => {
    const ticker = s.ticker?.toUpperCase();
    return !alreadyQueuedSet.has(ticker) && !alreadyAnalyzedSet.has(ticker);
  });

  const skippedInQueue = stocks.filter(s => alreadyQueuedSet.has(s.ticker?.toUpperCase()));
  const skippedInUniverse = stocks.filter(s => alreadyAnalyzedSet.has(s.ticker?.toUpperCase()));

  if (stocksToAdd.length === 0) {
    return {
      added: 0,
      skipped: stocks.length,
      skippedInQueue: skippedInQueue.map(s => s.ticker),
      skippedInUniverse: skippedInUniverse.map(s => s.ticker),
      stocks: []
    };
  }

  const queueEntries = stocksToAdd.map(stock => ({
    ticker: (stock.ticker || '').toUpperCase(),
    company_name: stock.company_name || stock.companyName || null,
    provider: provider,
    model: model || null,
    status: 'pending',
    user_id: userId || null,
    source: 'universe_builder'
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('valuebot_analysis_queue')
    .insert(queueEntries)
    .select();

  if (insertError) {
    throw new Error(`Failed to add stocks to queue: ${insertError.message}`);
  }

  return {
    added: inserted?.length || 0,
    skipped: skippedInQueue.length + skippedInUniverse.length,
    skippedInQueue: skippedInQueue.map(s => s.ticker),
    skippedInUniverse: skippedInUniverse.map(s => s.ticker),
    stocks: inserted || []
  };
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }

  try {
    const supabase = getSupabaseClient();
    const { action, mic_code, is_priority, page, per_page, exchange, search } = req.body || {};

    switch (action) {
      case 'status': {
        const status = await getStatus(supabase);
        return res.status(200).json({
          ok: true,
          ...status
        });
      }

      case 'analyze': {
        const result = await runAnalysis(supabase);
        return res.status(200).json({
          ok: true,
          ...result
        });
      }

      case 'set-priority': {
        const result = await setPriority(supabase, mic_code, is_priority);
        return res.status(200).json({
          ok: true,
          ...result
        });
      }

      case 'get-stocks': {
        const result = await getStocks(supabase, page, per_page, exchange, search);
        return res.status(200).json({
          ok: true,
          ...result
        });
      }

      case 'get-unqueued-stocks': {
        const { limit, user_id } = req.body || {};
        const result = await getUnqueuedStocks(supabase, limit || 3, user_id);
        return res.status(200).json({
          ok: true,
          ...result
        });
      }

      case 'add-to-queue': {
        const { stocks, user_id, provider, model } = req.body || {};
        const result = await addStocksToQueue(supabase, stocks, user_id, provider, model);
        return res.status(200).json({
          ok: true,
          ...result
        });
      }

      default:
        return res.status(400).json({
          ok: false,
          error: 'Invalid action. Supported actions: status, analyze, set-priority, get-stocks, get-unqueued-stocks, add-to-queue'
        });
    }
  } catch (error) {
    console.error('Universe Builder API error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
}
