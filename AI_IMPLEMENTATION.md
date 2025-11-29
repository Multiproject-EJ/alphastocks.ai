# AI Stock Analysis Implementation

This document provides a complete overview of the unified AI backend implementation for stock analysis.

## Overview

The AI stock analysis feature provides a single server-side interface to analyze stocks using multiple AI providers:
- **OpenAI** (using GPT models)
- **Google Gemini** (using Gemini models)
- **OpenRouter** (using various models through OpenRouter's unified API)

All API keys remain server-side only and are never exposed to the browser.

## Architecture

```
┌─────────────────────┐
│  Preact Frontend    │
│  (Browser)          │
└──────────┬──────────┘
           │
           │ POST /api/stock-analysis
           │
┌──────────▼──────────────────────┐
│  Vercel Serverless Function     │
│  api/stock-analysis.js          │
│  - Request validation           │
│  - Error handling               │
│  - CORS handling                │
└──────────┬──────────────────────┘
           │
           │ calls
           │
┌──────────▼────────────────────────────┐
│  Stock Analysis Service                │
│  workspace/src/server/ai/              │
│  stockAnalysisService.js               │
│  - Provider routing                    │
│  - API integration (OpenAI/Gemini/OR)  │
│  - Response parsing                    │
└──────────┬────────────────────────────┘
           │
           │ HTTP requests
           │
┌──────────▼────────────────────┐
│  AI Provider APIs              │
│  - api.openai.com              │
│  - generativelanguage.google.  │
│    googleapis.com              │
│  - openrouter.ai               │
└────────────────────────────────┘
```

## File Structure

```
alphastocks.ai/
├── api/
│   └── stock-analysis.js           # Vercel serverless endpoint
├── workspace/
│   └── src/
│       ├── server/
│       │   └── ai/
│       │       └── stockAnalysisService.js  # Core AI service
│       └── lib/
│           └── useStockAnalysis.js          # Frontend helper/hook
├── vercel.json                     # Vercel configuration
├── API_TESTING_GUIDE.md           # Testing documentation
└── workspace/.env.example         # Environment variable template
```

## Components

### 1. Stock Analysis Service (`stockAnalysisService.js`)

**Purpose:** Core server-side module that handles AI provider integration.

**Key Functions:**
- `analyzeStock(params)` - Main entry point for stock analysis
- `validateProvider(provider)` - Validates and normalizes provider selection
- `validateInput(ticker, query)` - Validates that either ticker or query is provided
- `buildPrompt(ticker, query, timeframe, question)` - Constructs AI prompts
- `parseResponse(rawResponse)` - Parses AI responses into structured format
- `callOpenAI(apiKey, model, prompt)` - OpenAI integration
- `callGemini(apiKey, model, prompt)` - Google Gemini integration
- `callOpenRouter(apiKey, model, prompt)` - OpenRouter integration

**Provider Defaults:**
- OpenAI: `gpt-4o-mini`
- Gemini: `gemini-1.5-flash`
- OpenRouter: `openai/gpt-3.5-turbo`

**Error Handling:**
- Missing API keys: Throws clear error messages
- API errors: Propagates with context
- Invalid inputs: Validation errors with details

### 2. API Endpoint (`api/stock-analysis.js`)

**Purpose:** Vercel serverless function providing the HTTP interface.

**Method:** POST only

**Request Body:**
```json
{
  "provider": "openai" | "gemini" | "openrouter",  // Optional, defaults to "openai"
  "model": "string",           // Optional, provider-specific model name
  "ticker": "AAPL",            // Stock ticker symbol (use this OR query, not both)
  "query": "Apple Inc.",       // Free-text company name (use this OR ticker, not both)
  "question": "string",        // Optional
  "timeframe": "1y"            // Optional
}
```

**Note:** Either `ticker` or `query` must be provided (not both). Use `ticker` for stock symbols (1-8 letters) or `query` for company names and free-text searches.

**Response (Success - 200):**
```json
{
  "ticker": "AAPL",
  "timeframe": "1y",
  "provider": "openai",
  "modelUsed": "gpt-4o-mini",
  "summary": "Brief 2-3 sentence overview",
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "risks": ["Risk 1", "Risk 2"],
  "sentiment": "bullish" | "neutral" | "bearish",
  "rawResponse": "Full AI response text"
}
```

**Error Responses:**

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | Validation error | Missing/invalid input or provider |
| 405 | Method not allowed | Non-POST request |
| 500 | Configuration error | Missing API key for selected provider |
| 502 | Provider error | AI provider API returned an error |

**CORS:** Enabled for all origins (`*`) to support frontend requests.

### 3. Frontend Helper (`useStockAnalysis.js`)

**Purpose:** Preact hook and standalone function for frontend integration.

**Hook Usage:**
```jsx
import { useStockAnalysis } from '../lib/useStockAnalysis';

function MyComponent() {
  const { analyzeStock, loading, error, data } = useStockAnalysis();

  const handleClick = async () => {
    await analyzeStock({
      provider: 'openai',
      ticker: 'AAPL',
      timeframe: '1y'
    });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        Analyze
      </button>
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

**Standalone Function Usage:**
```javascript
import { analyzeStockAPI } from '../lib/useStockAnalysis';

const { data, error } = await analyzeStockAPI({
  provider: 'gemini',
  ticker: 'GOOGL'
});
```

## Environment Configuration

### Required Environment Variables

Add these to your Vercel project settings or local `.env` file:

```bash
# Server-side only (DO NOT prefix with VITE_)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

**Important:** These must NOT have the `VITE_` prefix, as they should only be available server-side in the Vercel serverless functions.

### Getting API Keys

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to environment as `OPENAI_API_KEY`

**Google Gemini:**
1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add to environment as `GEMINI_API_KEY`

**OpenRouter:**
1. Visit https://openrouter.ai/keys
2. Create a new API key
3. Add to environment as `OPENROUTER_API_KEY`

## Deployment

### Vercel Deployment

1. **Connect Repository:**
   - Link your GitHub repository to Vercel
   - Vercel will auto-detect the Vite framework

2. **Configure Environment Variables:**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all three API keys (or just the ones you plan to use)

3. **Deploy:**
   - Push to your main branch or trigger manual deployment
   - Vercel will build and deploy automatically

4. **Verify API Endpoint:**
   - Your API will be available at: `https://your-domain.vercel.app/api/stock-analysis`

### Local Testing with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# API will be available at http://localhost:3000/api/stock-analysis
```

## Usage Examples

See `API_TESTING_GUIDE.md` for comprehensive testing examples including:
- cURL commands for each provider
- Frontend integration examples
- Error handling patterns

## Security Considerations

1. **API Keys:** Never expose API keys in frontend code
   - All keys are stored server-side only
   - No `VITE_` prefix ensures keys stay server-side
   - Vercel serverless functions have access via `process.env`

2. **CORS:** Currently set to allow all origins (`*`)
   - Consider restricting to your domain in production
   - Update CORS headers in `api/stock-analysis.js`

3. **Rate Limiting:** Not currently implemented
   - Consider adding rate limiting per user/IP
   - Use Vercel Edge Config or external service

4. **Input Validation:** All inputs are validated
   - Ticker is required and sanitized
   - Provider is whitelisted
   - Prevents injection attacks

## Extensibility

### Adding a New Provider

1. **Add provider to validation:**
   ```javascript
   const validProviders = ['openai', 'gemini', 'openrouter', 'newprovider'];
   ```

2. **Create provider function:**
   ```javascript
   async function callNewProvider(apiKey, model, prompt) {
     // Implementation
   }
   ```

3. **Add case to switch statement:**
   ```javascript
   case 'newprovider':
     apiKey = process.env.NEWPROVIDER_API_KEY;
     if (!apiKey) {
       throw new Error('Missing NEWPROVIDER_API_KEY environment variable');
     }
     response = await callNewProvider(apiKey, model, prompt);
     break;
   ```

4. **Update documentation and types**

### Customizing Response Format

Modify the `parseResponse` function in `stockAnalysisService.js` to extract different fields or structure the data differently.

### Adding Caching

Consider caching responses to reduce API costs:
```javascript
// Example with Vercel KV
import { kv } from '@vercel/kv';

const cacheKey = `stock:${ticker}:${provider}:${Date.now()}`;
const cached = await kv.get(cacheKey);
if (cached) return cached;

// ... make API call ...

await kv.set(cacheKey, result, { ex: 3600 }); // 1 hour
```

## Troubleshooting

### "Missing API_KEY" errors
- Ensure environment variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

### CORS errors
- Check that API endpoint allows your domain
- Verify fetch request includes correct headers
- Check browser console for specific CORS error

### API provider errors (502)
- Check API key is valid and not expired
- Verify you have credits/quota remaining
- Check provider's status page for outages

### Invalid model errors
- Verify model name is correct for the provider
- Check provider's documentation for available models
- Try using default models (remove model parameter)

## Future Enhancements

Potential improvements for Phase 3 and beyond:

1. **Real-time Stock Data Integration:** Combine AI analysis with live stock data
2. **Caching Layer:** Reduce API costs by caching recent analyses
3. **Rate Limiting:** Protect against abuse
4. **Webhook Support:** Allow async processing for complex analyses
5. **Model Selection UI:** Let users choose specific models
6. **Cost Tracking:** Monitor API usage and costs per provider
7. **Batch Analysis:** Analyze multiple stocks in one request
8. **Historical Analysis:** Store and compare past analyses

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Preact Hooks Documentation](https://preactjs.com/guide/v10/hooks/)

## Support

For issues or questions:
1. Check the API_TESTING_GUIDE.md for testing examples
2. Review error messages in Vercel function logs
3. Verify environment variables are correctly set
4. Check provider API status pages
