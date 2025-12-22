# alphastocks.ai

AlphaStocks.ai currently ships as a static HTML/CSS/JS prototype that previews the intended workspace UI. The goal is to evolve this codebase into a smooth Progressive Web App (PWA) that stays close to the existing structure while layering in real data, offline support, and AI-assisted workflows.

## Development Workflow
1. **Select a task** from the roadmap below (top-most unchecked item unless the product owner reprioritises).
2. **Research the best approach** for the task. Capture the key resources or conclusions in the task's "Notes" bullet so the next contributor understands the decision.
3. **Implement the task** within the repo, respecting the current architecture (vanilla HTML/CSS/JS with room to modularise into components or a lightweight framework if needed).
4. **Update this README**:
   - Mark the task status (checked when done, add dated sub-bullets for in-flight work if partial).
   - Document any new commands, environment variables, or data files that future developers must know about.

> ✅ Every merged iteration should leave this README as the single source of truth for project status and developer onboarding.

## Current Codebase Snapshot
- `index.html` renders the workspace shell with navigation for Dashboard, Check-In, Stock Alpha, Portfolio, and Settings screens. UI interactivity lives in `assets/main.js` and styling in `assets/styles.css`.
- Additional marketing/SEO pages (`about.html`, `faq.html`, `monthly/`, `weekly/`, `superinvestor/`) are static and can remain separate from the core PWA build.
- There is no build tooling yet—everything runs from static assets. Introducing a bundler or framework is optional but should be justified in the research notes for the relevant task.

## Data Strategy
- **Primary backend**: Supabase (Postgres + auth + storage). We will model key domain entities—users, portfolios, transactions, watchlists, journal entries, analytics outputs.
- **Developer fallback**: When Supabase credentials are absent, load demo data from version-controlled JSON files under `workspace/src/data/demo/`. Mirror the Supabase schema so switching between demo and live data is a matter of swapping the data provider.
  - Example layout:
    - `workspace/src/data/demo/demo.profiles.json`
    - `workspace/src/data/demo/demo.portfolios.json`
    - `workspace/src/data/demo/demo.portfolio_positions.json`
    - `workspace/src/data/demo/demo.portfolio_snapshots.json`
    - `workspace/src/data/demo/demo.watchlist_items.json`
    - `workspace/src/data/demo/demo.events.json`
    - `workspace/src/data/demo/demo.journal_entries.json`
    - `workspace/src/data/demo/demo.stock_analyses.json`
    - `workspace/src/data/demo/demo.transactions.json`
    - `workspace/src/data/demo/demo.analysis_tasks.json`
    - `workspace/src/data/demo/demo.settings.json`
  - Each file exports an object with `table`, `rows`, and optional metadata. The runtime data layer should expose a uniform interface (`getTable("portfolios")`) regardless of source.
  - `workspace/src/data/dataService.js` selects the Supabase or demo provider at runtime so UI modules can stay agnostic about the data source.
- **Configuration detection**: A small helper in `assets/main.js` (or future data service module) should check for Supabase environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`). If unavailable, auto-switch to demo data and show a non-blocking banner indicating "Demo data mode".

## Supabase Schema Draft
| Table | Purpose | Key Columns |
| --- | --- | --- |
| `profiles` | Workspace users | `id` (UUID), `email`, `display_name`, `timezone`, `role` |
| `portfolios` | Portfolio metadata | `id`, `profile_id`, `name`, `strategy`, `benchmark`, `visibility` |
| `portfolio_snapshots` | Time-series performance | `id`, `portfolio_id`, `as_of`, `nav`, `cash`, `alpha`, `beta` |
| `portfolio_positions` | Holdings ledger | `id`, `portfolio_id`, `symbol`, `qty`, `avg_price`, `sector`, `status` |
| `transactions` | Buys/sells/dividends | `id`, `portfolio_id`, `symbol`, `type`, `qty`, `price`, `fees`, `notes` |
| `watchlist_items` | Watchlist entries | `id`, `profile_id`, `symbol`, `thesis`, `conviction`, `alerts` |
| `events` | Calendar + notable events | `id`, `profile_id`, `date`, `title`, `category`, `source`, `link` |
| `journal_entries` | Check-in reflections | `id`, `profile_id`, `mood`, `confidence`, `bias_notes`, `plan`, `created_at` |
| `stock_analyses` | Stock Alpha outputs | `id`, `symbol`, `profile_id`, `valuation`, `porter_forces`, `stress_tests`, `label`, `summary` |
| `analysis_tasks` | Background AI task queue | `id`, `stock_analysis_id`, `task_type`, `status`, `payload`, `completed_at` |
| `settings` | User preferences | `profile_id`, `currency`, `number_format`, `alert_channels`, `ai_api_key_placeholder` |

> Use these shapes for both Supabase migrations and demo JSON payloads to minimise switching friction.

`valuebot_settings` now tracks `last_auto_run_at` (timestamptz) for the ValueBot auto queue runner.

## Decision Log
- [ADR 0001: Frontend Framework & Tooling Direction](docs/adr/0001-framework-choice.md)

## Roadmap & Task Board
Legend: ☐ not started • 🕒 in progress • ☑ done

### Foundation & Tooling
- ☑ Evaluate whether to stay on vanilla JS or migrate to a lightweight framework (e.g. Svelte, Preact). **Notes:** [ADR 0001](docs/adr/0001-framework-choice.md) recommends progressively migrating the workspace to a Vite-powered Preact app (Node 20+) while leaving marketing pages static; enables component reuse, PWA tooling, and incremental adoption.
- ☑ Set up build tooling (Vite or similar) if framework adoption is chosen; otherwise, structure ES module bundles for maintainability.
  - 2025-10-31: Added a Vite-powered Preact workspace scaffold under `workspace/` with shared styles imported from the legacy prototype. Run `npm install` (requires outbound registry access) followed by `npm run dev` or `npm run build`.
- ☑ Implement PWA baseline: manifest, service worker (offline shell + caching strategy), install prompts.
  - 2025-10-31: Added web manifest (`public/manifest.webmanifest`), installable icons, and a versioned service worker (`public/sw.js`) using MDN guidance on [service worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) and Vite's [manual registration pattern](https://vitejs.dev/guide/assets.html#the-public-directory). Registers in `workspace/src/main.jsx` with offline-first caching for shell assets and runtime caching for other requests.
  - 2025-11-01: Replaced binary PNG icons with accessible SVG variants so the repo stays text-only for environments that block binary attachments. Updated manifest, service worker precache, and workspace head links accordingly.
- ☑ Create environment configuration loader that reads Supabase keys from `.env` and falls back to demo data.
  - 2025-10-31: Added `workspace/src/config/runtimeConfig.js` to expose `getRuntimeConfig()` with Supabase detection and demo-mode flag. Includes `.env.example` template for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Based on Vite's [environment variables guide](https://vitejs.dev/guide/env-and-mode.html) to align with build-time injection.

### Data Layer & Demo Mode
- ☑ Implement data provider abstraction (`dataService`) with Supabase + demo adapters.
  - 2025-10-31: Added `workspace/src/data/dataService.js` with Supabase + demo providers. Demo provider preloads JSON fixtures via `import.meta.glob`; Supabase provider uses `@supabase/supabase-js` query builder with match/order helpers. References: Supabase JS [query docs](https://supabase.com/docs/reference/javascript/select) and Vite [glob imports](https://vitejs.dev/guide/features.html#glob-import). Future tasks can extend `listTables()` once live metadata endpoint is available.
- ☑ Populate `assets/data/` with 10 demo portfolios, watchlists, events, journal entries, analytics summaries matching schema.
  - 2025-10-31: Added cross-linked fixtures under `workspace/src/data/demo/` covering profiles, 10 portfolios, holdings, transactions, events, journals, AI analyses, and settings. Dashboard widgets now hydrate from the demo data service to mirror Supabase queries.
- ☑ Provide fixtures/utilities to seed Supabase from demo JSON (for quick migration once backend is ready).
- 2025-11-01: Added `workspace/scripts/generateSupabaseSeed.js` to convert demo fixtures into SQL with optional CLI flags for alternate destinations or stdout. Mirrors Supabase's [seeding guide](https://supabase.com/docs/guides/database/seeding) and aligns with the CLI's [`supabase db seed`](https://supabase.com/docs/reference/cli/supabase-db-seed) workflow. Current live patch: `supabase/patches/001_create_investment_universe.sql` creates the lightweight `investment_universe` table without bulk demo rows.
- 2025-11-05: Added `supabase/patches/002_valuebot_deep_dives.sql` documenting the `valuebot_deep_dives` table that stores full ValueBot deep-dive outputs (Modules 0–6) for each ticker.
- 2025-11-08: Added `supabase/patches/003_investment_universe_deep_dive_metadata.sql` to capture the latest ValueBot deep-dive metadata (risk, quality, timing, composite score, and timestamp) on each `investment_universe` row.
- 2025-11-09: Added `supabase/patches/004_investment_universe_last_model.sql` to capture the AI model string used for the latest MASTER deep dive on each `investment_universe` row.
- 2025-11-10: Added `supabase/patches/004_valuebot_analysis_queue.sql` to manage queued ValueBot deep dives processed by the `/api/valuebot` (batch action) cron endpoint. The queue holds ticker, provider/model, optional timeframe/question, status/attempt metadata, and scheduling fields for the background worker.
- 2025-11-14: Added `supabase/patches/011_valuebot_auto_settings_last_run.sql` so `valuebot_settings.last_auto_run_at` records when the auto queue runner last executed.

### ValueBot batch worker (background deep dives)
- The `valuebot_analysis_queue` table stores pending deep-dive requests (ticker, provider/model, timeframe/question, status, attempts, and errors).
  - `ticker` (text, nullable) – optional primary lookup; jobs may be created with ticker, company_name, or both.
- `/api/valuebot?action=batch` processes pending rows in small batches (default 3; override with `maxJobs` in POST body, capped at 10) by running the full ValueBot deep-dive pipeline and saving outputs to `valuebot_deep_dives` while refreshing `investment_universe` metadata.
- Intended for scheduled triggers (e.g., external schedulers hitting `/api/valuebot?action=cron` every few minutes) or manual HTTP debugging; the front-end Batch Queue UI enqueues jobs and monitors progress.
- The cron worker updates `valuebot_settings.last_auto_run_at` after each attempt, and the Batch Queue UI surfaces the last auto run plus an approximate “next run” countdown based on a 5-minute interval.
- While auto-queue is ON and jobs remain pending/running, the Batch Queue view auto-refreshes queue + settings to keep status current.
- The auto runner caps each cycle using `VALUEBOT_CRON_MAX_JOBS` (default 5). Each full deep dive can take ~70 seconds, so limiting auto runs to roughly 3–4 jobs keeps execution under GitHub Actions’ ~300-second window. The Batch Queue UI displays the current max-jobs setting and a rough time estimate per auto run.

#### Vercel AI protection / worker fetches

The ValueBot batch worker calls the `/api/stock-analysis` route from the server.
Vercel’s AI protection may block these server-side calls and return an HTML 401
page unless we send a Protection Bypass Token.

Set the following env var in Vercel:

- `VERCEL_PROTECTION_BYPASS` – the protection bypass token from your project’s
  Protection settings (Vercel dashboard).

The worker will automatically include this token via the
`x-vercel-protection-bypass` header on internal API calls (stock analysis, score
summary, etc.), ensuring JSON responses instead of HTML.

### Feature: Today Dashboard
- ☑ Design layout for dashboard cards (notable events, financial calendar, watchlist movers, headlines, market stats) using current UI patterns.
  - 2025-11-01: Introduced a responsive 12-column dashboard grid with hero, spotlight, and tertiary cards drawing on Atlassian's [layout guidance](https://atlassian.design/foundations/layout/grid) and Material's [adaptive design](https://m3.material.io/foundations/adaptive-design/large-screens/overview) patterns. Cards surface events, portfolio metrics, reflections, AI queue, and ledger activity.
- ☑ Implement data-driven rendering for dashboard cards (hooked into dataService).
  - 2025-11-01: Introduced a `useDashboardData` hook plus dashboard utilities to hydrate cards with watchlists, events, journals, and AI queue metrics directly from the runtime data service, following Preact's [composing hooks guidance](https://preactjs.com/guide/v10/hooks/#composing-hooks).
- ☑ Add filtering for “My portfolios” vs. “Global market” events.
  - 2025-11-01: Added dashboard scope toggles that switch between profile-specific and global catalysts, backed by demo fixtures where `profile_id` is `null` for shared events. Mirrors Supabase optional foreign-key guidance in [row-level security docs](https://supabase.com/docs/guides/auth/row-level-security#working-with-nullable-columns).
- ☐ Integrate headline sources (placeholder API research + implementation plan).

### Feature: Check-In (Journaling & Assessment)
- ☐ Design check-in form states (mood slider, bias checklist, accuracy review, action items).
- ☐ Persist check-in entries to Supabase / demo JSON and surface historical trends.
- ☐ Add reminders & alerts integration (ties into Settings -> Alerts preferences).

### Feature: Stock Alpha (Analysis Robot)
- ☐ Model analysis workflow (DCF, Porter’s Five Forces, scenario tests) and required input data.
- ☐ Build UI for analysis steps, including progress indicators and AI-generated insights.
- ☐ Integrate AI orchestration (OpenAI or custom) with rate limiting and caching.
- ☐ Produce final strategy labels (Investable vs. Uninvestable) with rationale stored in `stock_analyses`.

### Feature: Portfolio Workspace
- ☐ Implement combined view (all portfolios aggregated into single chart + KPI summary).
- ☐ Build per-portfolio tabs (10 demo portfolios) with performance, allocation, transactions.
- ☐ Add filters for strategy, time range, benchmarks.
- ☐ Enable export/share actions (PDF, CSV) and audit log integration.

### Feature: Settings & Preferences
- ☐ Create settings UI with sections for Alerts, AI Integrations (API keys), Localization (currency, number formats, timezone).
- ☐ Wire settings persistence via dataService.
- ☐ Implement alert rule builder and notification preferences (email, push, SMS placeholder).

### Quality & Ops
- ☐ Testing strategy: choose framework (Vitest/Jest + Playwright) and set up smoke tests for critical flows.
- ☐ Accessibility review (WCAG AA) and implement fixes.
- ☐ Analytics & telemetry plan (user opt-in, privacy-first).
- ☐ Deployment pipeline (static hosting with edge functions for Supabase interaction, or Supabase Functions).

## Working Agreements
- Keep commits scoped to a single task and include brief research summary in the message body when relevant.
- Maintain consistent design language with existing styles; document new utility classes or components in `assets/styles.css` comments.
- When adding new files/directories, update this README and include path references in the relevant task notes.

### Tooling Setup
- Install Node.js 20+.
- From the repo root, run `npm install` to pull Preact + Vite dependencies (generate `node_modules/` and `package-lock.json`). If installation fails in restricted environments, configure npm for an allowed registry and regenerate the lockfile before committing.
- Development server: `npm run dev` (serves the new workspace app from `workspace/`).
- Production build: `npm run build` outputs to `dist/`. Preview with `npm run preview`.
- Copy `workspace/.env.example` to `workspace/.env` and populate Supabase keys to enable live mode; otherwise the workspace boots in demo data mode automatically.

### Investment Board Game (Standalone Vite App)
The Investment Board Game is a standalone Vite application located at `apps/investing-board-game-v3/`. This is the only visible board game in the application.

#### Building and Deploying the Investment Board Game
- **Build**: Run `npm run build:board-game-v3` from the repository root. This will:
  - Install dependencies in `apps/investing-board-game-v3/`
  - Build the Vite app with base path `/board-game-v3/`
  - Copy the built files to `public/board-game-v3/`
- **Access**: Once built and deployed, the app is accessible at `/board-game-v3/` on your hosting platform.
- **Development**: To develop the board game in isolation:
  - Navigate to `apps/investing-board-game-v3/`
  - Run `npm install` (if not already installed)
  - Run `npm run dev` to start the development server
- **Navigation**: The AlphaStocks workspace includes a navigation item labeled "Investment Board Game" that redirects to `/board-game-v3/`.
- **Verify locally**: Run `npm run build` followed by `npm run preview`, then load `http://localhost:4173/board-game-v3/` to confirm `dist/board-game-v3/index.html` and assets are served.
- **Vercel deploy check**: In deployment logs, confirm `npm run build:board-game-v3` runs before `vite build` and that the copy step to `public/board-game-v3/` completes without errors.

#### Version History
- **V1** (MarketTycoon): Hidden from UI but remains in codebase at `workspace/src/features/boardgame/`. Not user-accessible.
- **V2**: Fully removed from codebase.
- **V3**: Default and only visible board game. Accessible via navigation and Pro Tools.

_Last updated: 2025-12-14T00:16Z_
