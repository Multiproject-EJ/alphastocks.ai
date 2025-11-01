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
  - 2025-11-01: Added `workspace/scripts/generateSupabaseSeed.js` to convert demo fixtures into `supabase/seed.sql` with optional CLI flags for alternate destinations or stdout. Mirrors Supabase's [seeding guide](https://supabase.com/docs/guides/database/seeding) and aligns with the CLI's [`supabase db seed`](https://supabase.com/docs/reference/cli/supabase-db-seed) workflow.

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

_Last updated: 2025-11-01T03:45Z_
