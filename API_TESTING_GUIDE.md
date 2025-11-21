# AI Stock Analysis API - Testing Guide

This guide shows how to test the unified AI stock analysis API with each provider.

## Endpoint

`POST /api/stock-analysis`

## Request Format

```json
{
  "provider": "openai" | "gemini" | "openrouter",
  "model": "optional-model-override",
  "ticker": "AAPL",
  "question": "optional additional question",
  "timeframe": "optional timeframe (e.g., '1y' or '5y')"
}
```

## Response Format

```json
{
  "ticker": "AAPL",
  "timeframe": "1y",
  "provider": "openai",
  "modelUsed": "gpt-4o-mini",
  "summary": "Brief overview of the stock...",
  "opportunities": [
    "Key opportunity 1",
    "Key opportunity 2"
  ],
  "risks": [
    "Key risk 1",
    "Key risk 2"
  ],
  "sentiment": "bullish",
  "rawResponse": "Full AI response text..."
}
```

## Testing with cURL

### OpenAI

```bash
curl -X POST https://your-domain.vercel.app/api/stock-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "ticker": "AAPL",
    "timeframe": "1y",
    "question": "What are the key growth drivers?"
  }'
```

### Google Gemini

```bash
curl -X POST https://your-domain.vercel.app/api/stock-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "ticker": "TSLA",
    "timeframe": "5y"
  }'
```

### OpenRouter

```bash
curl -X POST https://your-domain.vercel.app/api/stock-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openrouter",
    "ticker": "NVDA",
    "question": "How does the AI boom affect this stock?"
  }'
```

### With Model Override

```bash
curl -X POST https://your-domain.vercel.app/api/stock-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "ticker": "MSFT"
  }'
```

## Local Testing with Vercel CLI

If you have the Vercel CLI installed and configured:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Navigate to your project directory
cd /path/to/alphastocks.ai

# Run locally
vercel dev

# Then test against localhost
curl -X POST http://localhost:3000/api/stock-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "ticker": "AAPL"
  }'
```

## Frontend Usage Examples

### Using the Hook in a Preact Component

```jsx
import { useStockAnalysis } from '../lib/useStockAnalysis';

function StockAnalyzer() {
  const { analyzeStock, loading, error, data } = useStockAnalysis();

  const handleAnalyze = async () => {
    try {
      await analyzeStock({
        provider: 'openai',
        ticker: 'AAPL',
        question: 'What are the growth prospects?',
        timeframe: '5y'
      });
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Stock'}
      </button>
      
      {error && <p>Error: {error}</p>}
      
      {data && (
        <div>
          <h3>{data.ticker} Analysis</h3>
          <p><strong>Sentiment:</strong> {data.sentiment}</p>
          <p>{data.summary}</p>
          
          <h4>Opportunities:</h4>
          <ul>
            {data.opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
          </ul>
          
          <h4>Risks:</h4>
          <ul>
            {data.risks.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Using the Standalone Function

```javascript
import { analyzeStockAPI } from '../lib/useStockAnalysis';

async function someAsyncFunction() {
  const { data, error } = await analyzeStockAPI({
    provider: 'gemini',
    ticker: 'GOOGL',
    timeframe: '3y'
  });

  if (error) {
    console.error('Analysis error:', error);
    return;
  }

  console.log('Analysis result:', data);
}
```

## Environment Variables

Ensure these are set in your Vercel project settings or local `.env` file:

```bash
OPENAI_API_KEY=sk-...your-key-here...
GEMINI_API_KEY=...your-key-here...
OPENROUTER_API_KEY=sk-or-...your-key-here...
```

**Important:** These API keys should NEVER be prefixed with `VITE_` as they must remain server-side only.

## Error Handling

The API returns different status codes for different error scenarios:

- `400`: Invalid request (missing ticker, invalid provider, etc.)
- `405`: Method not allowed (non-POST request)
- `500`: Server configuration error (missing API keys)
- `502`: Provider API error (the AI service returned an error)

All errors return JSON with an `error` field and a descriptive `message`.
