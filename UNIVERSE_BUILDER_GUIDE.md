# Universe Builder Feature - Implementation Guide

## Overview

The **Global Stock Universe Builder** is a systematic tool that catalogs stocks from every exchange worldwide using AI-powered analysis. This feature creates the foundational stock list that can then be analyzed by ValueBot and added to the investment universe.

## Architecture

### 1. Database Schema

Located in: `supabase/patches/020_stock_universe_builder.sql`

#### Tables

**stock_exchanges**
- Stores global stock exchange information with ISO 10383 MIC codes
- Tracks analysis progress (last letter analyzed, total stocks found)
- Supports priority flagging for user-preferred exchanges

**stocks_universe_builder**
- Growing catalog of all discovered stocks
- Includes ticker, company name, exchange, country, sector, industry
- Unique constraint on (ticker, exchange_mic) to prevent duplicates

**universe_build_progress**
- Singleton table tracking overall progress
- Stores current exchange being analyzed and current letter (A-Z)
- Tracks total exchanges completed and stocks cataloged

### 2. Seed Data

Located in: `supabase/patches/021_seed_stock_exchanges.sql`

Pre-loads 31 major global exchanges including:
- **Americas**: NYSE, NASDAQ, TSE, BMV
- **Europe**: LSE, Euronext Paris, Deutsche Börse, etc.
- **Asia-Pacific**: Tokyo, Hong Kong, Shanghai, NSE India, etc.
- **Middle East & Africa**: TASE, DFM, Tadawul, JSE

NYSE and NASDAQ are marked as priority exchanges by default.

### 3. API Endpoint

Located in: `api/universe-builder.js`

**Endpoint**: `POST /api/universe-builder`

**Actions**:

1. **status** - Returns current progress, exchange list, and statistics
   ```json
   {
     "action": "status"
   }
   ```

2. **analyze** - Runs next analysis step (one letter on one exchange)
   ```json
   {
     "action": "analyze"
   }
   ```
   - Finds next exchange to process (priority first)
   - Determines current letter (A-Z progression)
   - Calls OpenAI to fetch stocks for that exchange/letter combination
   - Upserts stocks into database
   - Updates progress

3. **set-priority** - Toggle priority flag for an exchange
   ```json
   {
     "action": "set-priority",
     "mic_code": "XNYS",
     "is_priority": true
   }
   ```

4. **get-stocks** - Paginated list of cataloged stocks
   ```json
   {
     "action": "get-stocks",
     "page": 1,
     "per_page": 50,
     "exchange": "XNAS" // optional filter
   }
   ```

### 4. Frontend Component

Located in: `workspace/src/features/universe-builder/UniverseBuilder.jsx`

**Features**:
- **Header**: Displays total exchanges, stocks cataloged, exchanges completed
- **Progress Panel**: Shows current exchange, letter, status, and A-Z progress bar
- **Analyse Button**: Large CTA to trigger next analysis step
- **Pipeline Indicator**: Visual flow showing Universe Builder → ValueBot → Investment Universe
- **Exchanges Table**: 
  - Sortable list of all exchanges
  - Priority checkbox toggles
  - Region filter
  - Progress tracking (letter completion)
- **Stocks Table**: 
  - Collapsible section
  - Paginated list of cataloged stocks
  - Shows ticker, company, exchange, country, sector, industry

## User Flow

1. User opens "Universe Builder" from Pro Tools navigation
2. System displays current progress and exchange list
3. User can optionally mark exchanges as "priority" (analyzed first)
4. User clicks "ANALYSE" button
5. System:
   - Finds next exchange/letter to process
   - Calls OpenAI API with prompt: "List stocks on [exchange] starting with letter [X]"
   - Parses AI response for stock data
   - Inserts/updates stocks in database
   - Updates progress tracker
6. User sees results: stocks found, stocks inserted, next step
7. User can view cataloged stocks in the stocks table
8. Process repeats letter-by-letter (A→Z) for each exchange
9. Cataloged stocks become available for ValueBot analysis

## AI Integration

### Prompt Pattern

```
List all publicly traded stocks on the {exchange_name} ({mic_code}) stock exchange 
in {country} where the company name starts with the letter "{letter}".

Return as JSON: { 
  "stocks": [
    { "ticker": "XXX", "companyName": "Full Name", "sector": "Technology", "industry": "Software" }
  ] 
}

Be comprehensive but only include real, currently listed companies.
```

### Response Handling

- Parses JSON from OpenAI response (handles markdown code blocks)
- Extracts stock array
- Maps to database schema
- Uses UPSERT to handle duplicates gracefully

## Environment Variables

Required (already exist in project):
- `OPENAI_API_KEY` - Server-side OpenAI API access
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase admin access
- `VITE_SUPABASE_URL` - Client-side Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Client-side Supabase anon key

## Styling

Located in: `workspace/src/styles/app.css`

**Key Classes**:
- `.universe-builder` - Main container
- `.universe-builder__stats` - Statistics grid
- `.universe-progress` - Progress tracking panel
- `.analyse-button` - Large gradient CTA button
- `.pipeline-indicator` - Visual pipeline flow
- `.exchanges-table` - Exchange list with priority highlighting
- `.stocks-table` - Cataloged stocks display

**Responsive**:
- Mobile-optimized layouts
- Collapsible sections
- Adaptive grid layouts

## Integration with Existing Systems

### Navigation

Added to `baseNavigation` in `App.jsx`:
```javascript
{ 
  id: 'universe-builder', 
  icon: '🌐', 
  title: 'Universe Builder', 
  caption: 'Build global stock catalog', 
  shortLabel: 'Universe' 
}
```

Added to `staticSections`:
```javascript
'universe-builder': {
  title: 'Global Stock Universe Builder',
  meta: 'Systematically catalog every stock from every exchange worldwide...',
  component: <UniverseBuilder />
}
```

### ValueBot Pipeline

The cataloged stocks in `stocks_universe_builder` table serve as input for:
1. **ValueBot Analysis**: Deep-dive analysis of fundamentals
2. **Investment Universe**: Curated list of stocks to track

Future integration points:
- Auto-trigger ValueBot analysis for new stocks
- Filter stocks by quality metrics before ValueBot
- Bulk import from universe builder to investment universe

## Testing

### Manual Testing Checklist

1. **Database Setup**
   - [ ] Run migration: `020_stock_universe_builder.sql`
   - [ ] Run seed data: `021_seed_stock_exchanges.sql`
   - [ ] Verify tables exist in Supabase
   - [ ] Check initial progress row exists

2. **API Testing**
   - [ ] Call `status` action - verify exchanges list
   - [ ] Call `analyze` action - verify stocks are added
   - [ ] Call `set-priority` action - verify priority toggle
   - [ ] Call `get-stocks` action - verify pagination

3. **UI Testing**
   - [ ] Navigate to Universe Builder from Pro Tools
   - [ ] Verify stats display correctly
   - [ ] Click "ANALYSE" button
   - [ ] Verify progress updates
   - [ ] Toggle exchange priority
   - [ ] Filter exchanges by region
   - [ ] View stocks table
   - [ ] Test pagination

4. **Integration Testing**
   - [ ] Verify OpenAI API key is configured
   - [ ] Test AI response parsing
   - [ ] Verify duplicate handling (UPSERT)
   - [ ] Test letter progression (A→Z)
   - [ ] Test exchange switching after Z

## Known Limitations

1. **AI Accuracy**: Stock listings depend on OpenAI's knowledge cutoff
2. **Rate Limits**: Manual button-click design prevents API abuse
3. **No Real-time Data**: Catalog is static snapshot, not live market data
4. **Exchange Coverage**: Limited to seeded exchanges (can be expanded)

## Future Enhancements

1. **Auto-run Mode**: Scheduled background jobs
2. **Data Validation**: Cross-reference with financial APIs
3. **Enhanced Filtering**: Sector, market cap, region filters
4. **Bulk Actions**: Analyze multiple letters/exchanges at once
5. **Export**: CSV/JSON export of cataloged stocks
6. **Integration**: Direct link to ValueBot analysis queue

## Troubleshooting

### Error: "Missing Supabase credentials"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check environment variables in Vercel/deployment platform

### Error: "Missing OPENAI_API_KEY"
- Add `OPENAI_API_KEY` to server environment
- Ensure it has sufficient credits/quota

### No stocks found for exchange/letter
- Check OpenAI API response logs
- Some letter/exchange combinations may have no listings
- Verify exchange MIC code is correct

### Progress not updating
- Check `universe_build_progress` table has exactly 1 row
- Verify database permissions for updates
- Check API response for error messages

## Development Notes

### Code Patterns

- **API**: Follows existing `stock-analysis.js` pattern
- **Frontend**: Uses Preact hooks (useState, useCallback, useMemo)
- **Styling**: Follows existing dark theme with rgba() colors
- **Data Service**: Compatible with existing `supabaseProvider.js`

### File Structure
```
alphastocks.ai/
├── api/
│   └── universe-builder.js          # Serverless API
├── supabase/patches/
│   ├── 020_stock_universe_builder.sql
│   └── 021_seed_stock_exchanges.sql
└── workspace/src/
    ├── App.jsx                      # Navigation integration
    ├── styles/app.css               # Styling
    └── features/universe-builder/
        └── UniverseBuilder.jsx      # Main component
```

## License & Credits

Part of the AlphaStocks.ai platform.
Uses OpenAI GPT models for stock discovery.
Exchange data based on ISO 10383 MIC codes.
