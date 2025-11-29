# AI Analysis Developer Guide

This document describes the architecture, endpoints, persistence, and extension points for the AI Analysis feature in AlphaStocks.ai.

## Overview

The AI Analysis feature provides AI-powered stock analysis using multiple AI providers (OpenAI, Google Gemini, OpenRouter). The feature is modularized for maintainability and follows a client-server architecture with serverless backend functions.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│  index.html                                                      │
│  ├── AI Analysis Form (with ARIA labels, validation)            │
│  ├── Loading Skeleton (shimmer animation)                        │
│  └── Results Display (sentiment badges, opportunities, risks)   │
├─────────────────────────────────────────────────────────────────┤
│  assets/ai-analysis.js                                           │
│  ├── initAIAnalysis() - Entry point, called on DOMContentLoaded │
│  ├── validateTicker() - Client-side ticker validation           │
│  ├── fetchProviderConfig() - Gets available providers           │
│  ├── displayResults() - Renders analysis results                │
│  └── persistResult() / loadPersistedResult() - SessionStorage   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (Vercel Serverless)              │
├─────────────────────────────────────────────────────────────────┤
│  api/provider-config.js                                          │
│  └── GET /api/provider-config                                    │
│      Returns: { openai: bool, gemini: bool, openrouter: bool }  │
├─────────────────────────────────────────────────────────────────┤
│  api/stock-analysis.js                                           │
│  └── POST /api/stock-analysis                                    │
│      Body: { provider, ticker, timeframe?, question? }          │
│      Returns: { ticker, sentiment, summary, opportunities,      │
│                 risks, provider, modelUsed, rawResponse }       │
├─────────────────────────────────────────────────────────────────┤
│  workspace/src/server/ai/stockAnalysisService.js                 │
│  ├── analyzeStock() - Main analysis function                    │
│  ├── callOpenAI() / callGemini() / callOpenRouter()             │
│  ├── buildPrompt() - Generates AI prompt                        │
│  └── parseResponse() - Parses JSON from AI response             │
└─────────────────────────────────────────────────────────────────┘
```

## Endpoints

### GET /api/provider-config

Returns the availability of AI providers based on configured environment variables.

**Response:**
```json
{
  "openai": true,
  "gemini": false,
  "openrouter": true
}
```

**Usage:**
- Called on page load to dynamically populate the provider select dropdown
- Providers without configured API keys are hidden from the UI

### POST /api/stock-analysis

Performs AI-powered stock analysis.

**Request Body:**
```json
{
  "provider": "openai",      // Required: "openai" | "gemini" | "openrouter"
  "ticker": "AAPL",          // Required (or query): 1-8 letter stock ticker
  "query": "Apple Inc.",     // Required (or ticker): Free-text company name
  "timeframe": "1y",         // Optional: e.g., "1y", "5y", "ytd"
  "question": "What about..." // Optional: Custom question
}
```

**Note:** Either `ticker` or `query` must be provided. If `ticker` is provided (1-8 letters), it will be used directly. Otherwise, `query` can be a company name or any free-text search that the AI will analyze.

**Success Response (200):**
```json
{
  "ticker": "AAPL",
  "timeframe": "1y",
  "provider": "openai",
  "modelUsed": "gpt-4o-mini",
  "summary": "Apple Inc. continues to show strong...",
  "opportunities": [
    "Strong iPhone sales momentum",
    "Services revenue growth"
  ],
  "risks": [
    "Supply chain dependencies",
    "Regulatory pressure"
  ],
  "sentiment": "bullish",
  "rawResponse": "..."
}
```

**Error Response:**
```json
{
  "code": "VALIDATION_ERROR",
  "error": "Invalid request",
  "message": "ticker or query is required and must be a non-empty string",
  "provider": "openai",
  "ticker": "",
  "debug": "..." // Only in non-production environments
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OpenAI | OpenAI API key |
| `GEMINI_API_KEY` | For Gemini | Google Gemini API key |
| `OPENROUTER_API_KEY` | For OpenRouter | OpenRouter API key |
| `ALLOWED_ORIGIN` | Optional | CORS origin restriction (default: `*`) |
| `NODE_ENV` | Optional | Environment mode (`production` / `development`) |
| `SHOW_CONSTRUCTION_GATE` | Optional | Show construction gate overlay |

## Persistence

### Session Storage

The last successful analysis result is persisted in `sessionStorage` under the key `AI_ANALYSIS_LAST_RESULT`. This allows:

- Displaying the last result when navigating back to the AI Analysis section
- Maintaining state across page refreshes within the same session

**Storage Format:**
```javascript
sessionStorage.setItem('AI_ANALYSIS_LAST_RESULT', JSON.stringify({
  ticker: 'AAPL',
  sentiment: 'bullish',
  summary: '...',
  opportunities: [...],
  risks: [...],
  provider: 'openai',
  modelUsed: 'gpt-4o-mini',
  rawResponse: '...'
}));
```

## Client-Side Validation

### Input Validation (Ticker or Company Name)

User input is validated and classified on the client side before submission:

- **Ticker Pattern:** `^[A-Za-z]{1,8}$`
- **Ticker Requirements:** 1-8 letters only (case-insensitive), automatically uppercased
- **Query Fallback:** Any other non-empty input is treated as a free-text company name query

```javascript
const TICKER_REGEX = /^[A-Za-z]{1,8}$/;

function validateTicker(input) {
  if (!input || input.trim().length === 0) {
    return { valid: false, message: 'Please enter a ticker symbol or company name.' };
  }
  
  const normalizedInput = input.trim();
  
  // If it matches ticker pattern, treat as ticker
  if (TICKER_REGEX.test(normalizedInput)) {
    return { valid: true, message: '', type: 'ticker', value: normalizedInput.toUpperCase() };
  }
  
  // Otherwise, treat as free-text query (company name)
  return { valid: true, message: '', type: 'query', value: normalizedInput };
}
```

## Extending Prompts

To modify the AI analysis prompt, edit `workspace/src/server/ai/stockAnalysisService.js`:

```javascript
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
```

### Adding New Response Fields

1. Update the prompt instructions to request the new field
2. Update `parseResponse()` to extract the new field
3. Update the return object in `analyzeStock()`
4. Update the frontend `displayResults()` function
5. Add corresponding HTML elements and styling

## Error Handling

### Error Model

Errors follow a structured format:

```typescript
interface ErrorResponse {
  code: string;          // Machine-readable error code
  error: string;         // Short error category
  message: string;       // Human-readable message
  provider?: string;     // Provider that was requested
  ticker?: string;       // Ticker that was requested
  debug?: string;        // Debug info (non-production only)
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method used |
| `CONFIG_MISSING_API_KEY` | 500 | Provider API key not configured |
| `PROVIDER_ERROR` | 502 | AI provider returned an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Debug Information

Debug information is only included in non-production environments:

```javascript
// Frontend check
function shouldShowDebug() {
  const env = window.__ENV__ || {};
  return env.NODE_ENV !== 'production';
}

// Backend check
if (debugMessage && process.env.NODE_ENV !== 'production') {
  errorResponse.debug = debugMessage;
}
```

## Accessibility

The AI Analysis feature includes the following accessibility enhancements:

- **Labels:** All form fields have associated `<label>` elements with `for` attributes
- **ARIA:** 
  - `aria-describedby` for field hints and errors
  - `aria-invalid` for validation states
  - `aria-live="polite"` for status messages
  - `aria-live="assertive"` for error messages
  - `role="status"` for sentiment badges
  - `aria-busy` for loading states
- **Keyboard:** All interactive elements are keyboard accessible
- **Color Contrast:** Sentiment badges meet WCAG 2.1 AA contrast requirements

## Testing

### Manual Testing Checklist

- [ ] Open AI Analysis tab
- [ ] Verify provider select shows only configured providers
- [ ] Enter invalid ticker (numbers, special chars) → client error
- [ ] Enter valid ticker → analysis runs
- [ ] Check loading skeleton appears during request
- [ ] Verify results display correctly
- [ ] Refresh page → last result should persist
- [ ] Light/dark theme toggle works
- [ ] Keyboard navigation works
- [ ] Screen reader announces status changes

### Testing Provider Gating

1. Remove an API key from environment (e.g., unset `GEMINI_API_KEY`)
2. Reload the page
3. Verify the provider is not shown in the dropdown
4. Add the API key back
5. Reload and verify provider appears

## File Structure

```
alphastocks.ai/
├── index.html                                  # Main HTML with AI Analysis form
├── assets/
│   ├── ai-analysis.js                          # AI Analysis module
│   ├── main.js                                 # Core app logic
│   └── styles.css                              # Styles including skeleton
├── api/
│   ├── provider-config.js                      # Provider availability endpoint
│   └── stock-analysis.js                       # Stock analysis endpoint
├── workspace/src/server/ai/
│   └── stockAnalysisService.js                 # AI service logic
└── DEV_GUIDE_AI_ANALYSIS.md                    # This documentation
```

## Future Enhancements

- [ ] Analysis history (database persistence)
- [ ] Comparison mode (analyze multiple tickers)
- [ ] Streaming responses for faster perceived performance
- [ ] Custom model selection per provider
- [ ] Rate limiting and usage tracking
- [ ] Export analysis to PDF/Markdown
