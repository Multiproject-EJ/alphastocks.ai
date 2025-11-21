/**
 * Unified AI Stock Analysis Service
 * Supports OpenAI, Google Gemini, and OpenRouter providers
 * 
 * This module is intended for server-side use only (Vercel serverless functions)
 * to keep API keys secure and never expose them to the browser.
 */

/**
 * Validates the provider parameter
 * @param {string} provider - The AI provider to use
 * @returns {string} - Normalized provider name
 * @throws {Error} - If provider is invalid
 */
function validateProvider(provider) {
  const normalizedProvider = (provider || 'openai').toLowerCase();
  const validProviders = ['openai', 'gemini', 'openrouter'];
  
  if (!validProviders.includes(normalizedProvider)) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${validProviders.join(', ')}`);
  }
  
  return normalizedProvider;
}

/**
 * Validates the ticker parameter
 * @param {string} ticker - Stock ticker symbol
 * @throws {Error} - If ticker is invalid
 */
function validateTicker(ticker) {
  if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
    throw new Error('Ticker is required and must be a non-empty string');
  }
}

/**
 * Builds the analysis prompt for the AI model
 * @param {string} ticker - Stock ticker symbol
 * @param {string} timeframe - Optional timeframe (e.g., '1y', '5y')
 * @param {string} question - Optional additional question
 * @returns {string} - The formatted prompt
 */
function buildPrompt(ticker, timeframe, question) {
  const base = `You are an AI analyst for Alphastocks.ai – AI-powered superinvestor insights & weekly newsletter.

Please provide a comprehensive stock analysis for ${ticker.toUpperCase()}.`;

  const timeframePart = timeframe ? `\nTimeframe: ${timeframe}` : '';
  const questionPart = question ? `\n\nAdditional context/question: ${question}` : '';

  const instructions = `

Please structure your response as a JSON object with the following fields:
- summary: A brief 2-3 sentence overview of the stock
- opportunities: An array of 2-4 key opportunities or bullish factors
- risks: An array of 2-4 key risks or bearish factors
- sentiment: Overall sentiment as one of: "bullish", "neutral", or "bearish"

Provide actionable insights that would be valuable for investors.`;

  return base + timeframePart + questionPart + instructions;
}

/**
 * Parses the AI response into a structured format
 * @param {string} rawResponse - The raw text response from the AI
 * @returns {object} - Parsed analysis object
 */
function parseResponse(rawResponse) {
  try {
    // Try to extract JSON from the response
    // Some models might wrap JSON in markdown code blocks
    let jsonText = rawResponse.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonText);
    
    return {
      summary: parsed.summary || 'No summary available',
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      sentiment: parsed.sentiment || 'neutral'
    };
  } catch (error) {
    // If JSON parsing fails, try to extract information from plain text
    return {
      summary: rawResponse.substring(0, 500) + (rawResponse.length > 500 ? '...' : ''),
      opportunities: ['Analysis provided in raw response'],
      risks: ['See raw response for details'],
      sentiment: 'neutral'
    };
  }
}

/**
 * Call OpenAI API
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callOpenAI(apiKey, model, prompt) {
  const defaultModel = model || 'gpt-4o-mini';
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional stock market analyst. Provide analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    modelUsed: data.model || defaultModel,
    content: data.choices[0]?.message?.content || ''
  };
}

/**
 * Call Google Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callGemini(apiKey, model, prompt) {
  const defaultModel = model || 'gemini-1.5-flash';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${defaultModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    modelUsed: defaultModel,
    content
  };
}

/**
 * Call OpenRouter API
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Model name
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<object>} - API response
 */
async function callOpenRouter(apiKey, model, prompt) {
  const defaultModel = model || 'openai/gpt-3.5-turbo';
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://alphastocks.ai',
      'X-Title': 'Alphastocks.ai'
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional stock market analyst. Provide analysis in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    modelUsed: data.model || defaultModel,
    content: data.choices[0]?.message?.content || ''
  };
}

/**
 * Main function to analyze a stock using the specified AI provider
 * 
 * @param {object} params - Analysis parameters
 * @param {string} params.provider - AI provider: 'openai' | 'gemini' | 'openrouter'
 * @param {string} params.model - Optional model override
 * @param {string} params.ticker - Stock ticker symbol (required)
 * @param {string} params.question - Optional additional question
 * @param {string} params.timeframe - Optional timeframe (e.g., '1y', '5y')
 * @returns {Promise<object>} - Structured analysis result
 */
export async function analyzeStock({ provider, model, ticker, question, timeframe }) {
  // Validate inputs
  const normalizedProvider = validateProvider(provider);
  validateTicker(ticker);

  // Build the prompt
  const prompt = buildPrompt(ticker, timeframe, question);

  let apiKey;
  let response;

  try {
    // Get the appropriate API key and call the provider
    switch (normalizedProvider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('Missing OPENAI_API_KEY environment variable');
        }
        response = await callOpenAI(apiKey, model, prompt);
        break;

      case 'gemini':
        apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('Missing GEMINI_API_KEY environment variable');
        }
        response = await callGemini(apiKey, model, prompt);
        break;

      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          throw new Error('Missing OPENROUTER_API_KEY environment variable');
        }
        response = await callOpenRouter(apiKey, model, prompt);
        break;

      default:
        throw new Error(`Unsupported provider: ${normalizedProvider}`);
    }

    // Parse the response
    const parsed = parseResponse(response.content);

    // Return structured result
    return {
      ticker: ticker.toUpperCase(),
      timeframe: timeframe || null,
      provider: normalizedProvider,
      modelUsed: response.modelUsed,
      summary: parsed.summary,
      opportunities: parsed.opportunities,
      risks: parsed.risks,
      sentiment: parsed.sentiment,
      rawResponse: response.content
    };

  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    console.error('Stock analysis error:', error);
    
    // Re-throw with context
    throw new Error(`Failed to analyze ${ticker} with ${normalizedProvider}: ${error.message}`);
  }
}
