# DEV_PLAN.md — AlphaStocks / MarketTycoon

**System source of truth:** See `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` for the canonical MarketTycoon game systems, loop, and economy. If something here conflicts, update the master plan first.


## Purpose
This is the **single master dev plan** for the board game work. Every run updates this file and `CHANGELOG_DEV.md` (and `ENV_NOTES.md`/`MIGRATIONS_LOG.md` only when applicable).

## Key start prompt (short, reusable)
Use this exact prompt to kick off a run and keep the plan in scope:
> **“Follow `DEV_PLAN.md` (one slice, mobile-first, repo-first). Update `DEV_PLAN.md` + `CHANGELOG_DEV.md` every run.”**

**Alt prompt (documentation-only runs):**
> **“Work on the MD plan (casino + scratchcard docs). Update `DEV_PLAN.md` + `CHANGELOG_DEV.md`.”**

## Existing Master Plan Reference (do not duplicate)
There is a broader, long-form master plan already in the repo. Keep this file as the **run-by-run execution plan** and cross‑reference the long plan instead of rewriting it:
- `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` (core vision, loop, ethics, ring overview). Align slices here with that doc to avoid drift.
- Repo scan (2026-01-29) found only `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` as the canonical add-on plan; no other DEV_PLAN-style add-on MDs were present, so sync remains between this file and the master plan.

## Operating Rules (non‑negotiable)
0) **Mobile-first UI:** Design and implement for **mobile first**, then adapt for tablet/desktop. Do not port desktop patterns to mobile; scale mobile patterns upward instead.
1) **Repo-first:** Extend what exists; avoid rewrites. Always update the Repo Map below before changes.
2) **One slice per run:** Keep PRs small and reviewable.
3) **Doc updates required:**
   - `DEV_PLAN.md` (mark slice status + notes)
   - `CHANGELOG_DEV.md` (append entry)
   - `ENV_NOTES.md` (only if env/config changes)
   - `MIGRATIONS_LOG.md` (only if SQL changes)
4) **No breakage:** Prefer adapters, flags, and parallel surfaces.
5) **Data-driven tuning:** Economy constants live in config/DB, not scattered.
6) **Deterministic timers:** Windows/seasons persist across refresh (server time if available; otherwise seeded local time).
7) **Supabase fallback required:** App must run with fixtures if Supabase config is absent.
8) **ProTools art lock:** Do **not** refactor or regenerate ProTools art/cards.

---

## M0.1 — Repo Audit (Completed ✅)
**Outcome:** Repo map, current-vs-target, and do-not-touch list updated.

### Audit scope (what was actually scanned)
This was a **targeted** audit, not an exhaustive read of every file. Scanned areas and methods:
- Primary focus: `/apps/investing-board-game-v3` source, `supabase/patches`, root PWA assets, and top-level docs.
- Methods: `rg` file discovery + direct file reads for core systems (movement, shop, energy, Supabase, ProTools).
If a future slice depends on deeper subsystems, expand this audit before changing code.

### Full repo scan (completeness check)
To validate documentation coverage, a repo-wide scan of Markdown files was run to inventory existing plans, PRDs, and implementation notes. Key docs to keep aligned with this plan:
- `README.md` (root dev workflow + board game build/run notes)
- `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` (long-form master plan)
- `apps/investing-board-game-v3/PRD.md` (board game product requirements)
- `apps/investing-board-game-v3/RING3_IMPLEMENTATION.md` (ring mechanics)
- `apps/investing-board-game-v3/CHALLENGES_EVENTS_IMPLEMENTATION.md` (events/challenges)
- `apps/investing-board-game-v3/DAILY_DIVIDENDS_GUIDE.md` + `DAILY_DIVIDENDS_SUMMARY.md`
- `AI_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md`, `DEVLOG.md` (project-wide status/context)

### Repo Map (paths verified)
_Last reviewed: 2026-02-12 (stock modal pulse tone classes + freshness guardrails)_
#### Frontend
- **Legacy static pages entry:** `/index.html`, `/about.html`, `/faq.html`, `/monthly/`, `/weekly/`, `/superinvestor/`
- **Vite + Preact app:** `/apps/investing-board-game-v3` (built into `/public/board-game-v3` via `npm run build:board-game-v3`)
- **Routing system:** No router; UI mode/state machine in `apps/investing-board-game-v3/src/lib/uiModeStateMachine.ts` + context `src/context/UIModeContext.tsx`
- **State management/store:** Local React state in `src/App.tsx` plus contexts in `src/context/*` (Auth, Overlay, UI Mode); custom hooks in `src/hooks/*`
- **Game loop entry:** `src/App.tsx` (dice roll → `calculateMovement` in `src/lib/movementEngine.ts`), board data in `src/lib/mockData.ts`
- **UI components:** `src/components/*` (board, modals, overlays, portfolio readout panel), shop UI in `src/components/ShopModal.tsx` + `src/components/shop/*` (mobile shop shell, property vault album cards), roulette win flow in `src/components/RouletteVictoryModal.tsx`
- **Event tile choices:** `src/components/EventChoiceModal.tsx` + `src/lib/eventTiles.ts` (Tier 1 event tile decision copy + rewards)
- **Tier 2 event tile scope (plan-only):** `src/lib/eventTileTier2Scope.ts` (Market Event + Wildcard activation notes)
- **Corner tile activations:** Court of Capital config in `src/lib/courtOfCapital.ts` with rewards wired in `src/App.tsx`
- **Mini-games hub:** `src/pages/GamesHub.tsx` (grid of mini-games in overlay, schedule-aware availability via `useMiniGames`), `src/components/games/*` (cards, overlay shell, placeholder game surfaces), Wheel of Fortune demo uses `src/components/WheelOfFortuneModal.tsx`
- **Casino games:** `src/components/CasinoModal.tsx`, `src/components/HighRollerDiceGame.tsx`, `src/components/MarketBlackjackGame.tsx`, dice odds helper in `src/lib/highRollerDiceOdds.ts`
- **Leaderboards:** `src/components/LeaderboardModal.tsx` + `src/hooks/useLeaderboard.ts` (global/weekly/ring leaderboards)
- **Season Pass:** `src/hooks/useSeasonPass.ts` + `src/components/SeasonPassModal.tsx` (battle pass progression + reward claims)
- **Board renderer + tiles:** `src/App.tsx` (ring layout, tile positioning), `src/components/BoardViewport.tsx`, `src/components/Board3DViewport.tsx`, `src/components/Tile.tsx`
- **Micro-learning tiles:** `src/lib/learningTiles.ts` (taxonomy definitions) + `src/lib/learningQuestionBank.ts` (seed question bank) + `src/components/Tile.tsx` (renderer)
- **Stock category catalog:** `src/lib/stockCategories.ts` (labels, tiers, and palettes for core + expansion categories)
- **Stock price strategy:** `src/lib/stockPricing.ts` + `src/hooks/useUniverseStocks.ts` (market price override with deterministic fallback)
- **Stock tile modals:** `src/components/StockModal.tsx` via `src/lib/overlayRegistry.ts` and `src/hooks/useOverlayManager.ts`, triggered in `src/App.tsx` on category tile landings
- **Wheel of Fortune rewards + daily spin caps:** `src/App.tsx` + `src/components/WheelOfFortuneModal.tsx`
- **Shop 2.0 entry:** `src/components/Shop2Modal.tsx` (feature-flagged Shop 2.0 preview shell)
- **Shop 2.0 vault data:** `src/hooks/useShopVaultOverview.ts` + `src/lib/shopVaultFixtures.ts` (season/set overview + fallback fixtures)
- **Shop 2.0 purchases:** `src/hooks/useShopVaultPurchase.ts` (atomic vault buy + currency spend)
- **Shop 2.0 windows/discounts:** `src/components/Shop2Modal.tsx` + `src/hooks/useShopVaultPurchase.ts` (event window discount pricing + purchase spend)
- **Shop 2.0 unlock rules:** `src/hooks/useShopVaultOverview.ts` (set completion gating for the next set)
- **Event window helpers:** `src/lib/windowSchedule.ts` (shared schedule/availability helpers for events + mini-games)
- **Animation utilities:** `src/lib/animations.ts`, `src/hooks/useBoardCamera.ts`, `src/hooks/useCameraAnimation.ts`
- **Instrumentation hooks:** `src/lib/instrumentation.ts` (opt-in debug logging via local storage or env flag)

#### PWA
- **Service worker:** `/sw.js` (root static site), `/apps/investing-board-game-v3/public/sw.js` (game)
- **Manifest:** `/manifest.webmanifest` (root), `/apps/investing-board-game-v3/public/manifest.json` (game)
- **Offline caching:** Root SW precaches static routes; game SW caches core assets + runtime fetch.
- **Fixture loader:** `src/lib/mockData.ts` + `src/hooks/useUniverseStocks.ts` fallback to mock stocks when Supabase is unavailable.

#### Supabase
- **Supabase client:** `apps/investing-board-game-v3/src/lib/supabaseClient.ts`
- **Migrations/patches:** `/supabase/patches/*` (e.g., `022_board_game_profiles.sql`, `023_shop_inventory.sql`, `028_daily_dividends.sql`, `029_currency_economy.sql`)
- **Economy-related tables:** `board_game_profiles`, `shop_inventory`, `daily_dividends`, `leaderboard` (by patch naming)
- **Vault Shop 2.0 tables:** `shop_vault_seasons`, `shop_vault_sets`, `shop_vault_items`, `shop_vault_item_ownership`, `shop_vault_set_progress`, `shop_vault_season_progress` (added in `supabase/patches/032_shop_vault_schema.sql`)
- **Vault Shop 2.0 leveling table:** `shop_vault_profile_progress` (added in `supabase/patches/034_shop_vault_profile_progress.sql`)
- **Vault Shop 2.0 RPC:** `shop_vault_purchase` (atomic ownership + progress update in `supabase/patches/033_shop_vault_purchase.sql`)
- **RPCs / Edge Functions:** none found in repo
- **Auth usage:** `src/context/AuthContext.tsx` uses Supabase auth sessions (shared with ProTools)
- **Storage buckets:** not defined in repo (assume external configuration)

#### Build & Run (efficiency notes)
- **Root app dev:** `npm run dev` (Vite root; serves main site + assets)
- **Board game app:** `cd apps/investing-board-game-v3 && npm run dev`
- **Board game build into root public:** `npm run build:board-game-v3` (installs deps inside app, builds, then copies to `/public/board-game-v3`)
- **Full build:** `npm run build` (runs board-game build, then root Vite build)
- **Potential footguns:** `build:board-game-v3` runs `npm install` every time; keep app dependencies consistent to avoid drift.

#### Key Plan/PRD Docs (reference during slices)
- `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` (north star loop, rewards, ethics)
- `apps/investing-board-game-v3/PRD.md` (product requirements)
- `apps/investing-board-game-v3/RING3_IMPLEMENTATION.md` (existing ring behavior)
- `apps/investing-board-game-v3/CHALLENGES_EVENTS_IMPLEMENTATION.md` (events/challenges)

#### Economy (existing)
- **Free roll regen:** `src/lib/energy.ts` + usage in `src/App.tsx` and persistence in `src/hooks/useGameSave.ts`
- **Vault regen perk bonus:** `src/lib/energy.ts` (vault bonus helpers) + `src/App.tsx` (reset boost) + `src/components/OutOfRollsModal.tsx` (perk messaging)
- **Dice/energy caps:** `src/lib/constants.ts` and `src/lib/energy.ts`
- **Multipliers/leverage:** `src/lib/constants.ts` (`MULTIPLIERS`) + ring multipliers in `src/lib/rewardMultiplier.ts`
- **Portfolio reward buffs:** `src/lib/portfolioRewards.ts` (diversification-based multipliers for reward payouts)
- **Shop/estate logic:** `src/hooks/useShopInventory.ts` (stars-based purchases), `src/hooks/usePurchase.ts` (mobile cash purchases), `src/lib/shopItems.ts` (legacy + vault data), and city builder in `src/lib/cityBuilder.ts` + `src/hooks/useCityBuilder.ts`
- **Events/timers:** `src/lib/events.ts`, `src/hooks/useEvents.ts`, `src/lib/miniGameSchedule.ts`, `src/hooks/useDailyDividends.ts`
- **Soft throttle dampening:** `src/lib/economyThrottle.ts` + reward multiplier wiring in `src/App.tsx`

#### Config (new)
- **Economy config seed:** `/config/economy.json` (energy + vault regen defaults) + `apps/investing-board-game-v3/src/lib/economyConfig.ts` (normalization + exports)
- **Ring config seed:** `/config/rings.json` (ring rewards + portal defaults) + `apps/investing-board-game-v3/src/config/rings.ts` (normalization + exports)
- **Event tile config seed:** `/config/event_tiles.json` (Tier 1 + Market Event rewards) + `apps/investing-board-game-v3/src/config/eventTiles.ts` (normalization + exports)
- **Casino lobby config seed:** `/config/casino.json` (Casino lobby + game cards) + `apps/investing-board-game-v3/src/config/casino.ts` (normalization + exports)
- **Tile label config seed:** `/config/tile_labels.json` (quick reward + special tile labels) + `apps/investing-board-game-v3/src/config/tileLabels.ts` (normalization + exports)

#### ProTools (read-only)
- **Integration docs:** `apps/investing-board-game-v3/PRO_TOOLS_INTEGRATION.md`
- **Overlay UI:** `src/components/ProToolsOverlay.tsx`
- **Stock cards/modals:** `src/components/StockModal.tsx` using `Stock` data (from Supabase `investment_universe` or `mockData`)
- **Art assets:** Stock `image_url` comes from Supabase universe rows (`useUniverseStocks.ts`) or mock data; do not refactor rendering pipeline.

### Current vs Target (Audit Findings)
#### Existing systems found
- **Rings & portal rules:** `src/lib/movementEngine.ts` + `src/lib/mockData.ts` (PORTAL_CONFIG, RING_CONFIG)
- **Wildcard events:** `src/lib/wildcardEvents.ts` + `src/components/WildcardEventModal.tsx`
- **Shop system:** `src/components/ShopModal.tsx`, `src/hooks/useShopInventory.ts`, `src/lib/shopItems.ts`
- **Estate/City system:** `src/lib/cityBuilder.ts` + `src/hooks/useCityBuilder.ts`
- **Timers/windows:** recurring events in `src/lib/events.ts`, daily dividends in `src/hooks/useDailyDividends.ts`, minigame schedule in `src/lib/miniGameSchedule.ts`
- **Free regen:** `src/lib/energy.ts` (2-hour reset) + `src/App.tsx` + `src/hooks/useGameSave.ts`
- **ProTools cards:** `src/components/StockModal.tsx`, `src/hooks/useUniverseStocks.ts`

#### Gaps / issues (with file paths)
- **Start portal rules differ from target:** `PORTAL_CONFIG` currently ascends on both pass and land for Ring 1; Ring 2 pass descends (no “land-only” rule yet). (`src/lib/mockData.ts`, `src/lib/movementEngine.ts`)
- **Bull Market window & timeline windows:** no dedicated window engine; current events are recurring/flash but not economy windows. (`src/lib/events.ts`, `src/hooks/useEvents.ts`)
- **Middle-ring wildcard (fraud vs hidden gem):** no ring-2 specific 80/20 rule. (`src/lib/wildcardEvents.ts`)
- **Vault Album shop:** current shop is item list; no album/sets/grids. (`src/components/ShopModal.tsx`, `src/lib/shopItems.ts`)
- **Vault Leveling:** no XP/leveling tied to shop purchases. (`src/hooks/useShopInventory.ts`)
- **Leverage ladder gating + momentum meter:** not implemented beyond basic roll multipliers. (`src/lib/constants.ts`)
- **Micro-learning tiles:** partial learning exists (Case Study modal), but no Duolingo-style tile system. (`src/components/BiasSanctuaryModal.tsx`)

### Do‑Not‑Touch List
- **ProTools art/card rendering and assets:** Keep `StockModal` pipeline intact; only add guards or wiring.
- **Existing Supabase schema patches:** append-only changes only.
- **Core board movement engine:** adjust via config or targeted edits (no rewrite).

---

## Major Workstreams (One slice per run)
Each milestone is broken into slices. Implement **exactly one slice** per run.

### M0 — Audit & Baseline
- **M0.1** ✅ Repo audit (this run)
- **M0.2** ✅ Instrumentation hooks (optional logging, no behavior change)
- **M0.3** ✅ Wheel of Fortune daily spin cap + reward consistency
- **M0.4** ✅ Lazy-load Portfolio charts to prevent app boot errors
- **M0.5** ✅ Casino + scratchcard MD plan alignment (status snapshot + next-slice checklist)
- **M0.6** ✅ Docs alignment (ring progression, Wealth Run + roulette, Case Study rename)

### M1 — 3‑Ring Board Rules (Outer/Middle/Inner)
- **M1.1** ✅ Audit ring movement + portal behavior
- **M1.2** ✅ Start behavior: land-only ring transitions
- **M1.3** ✅ Bull Market window → ring 2 quick entry
- **M1.4** ✅ Middle-ring wildcard outcomes (fraud vs hidden gem)
- **M1.5** ✅ Stock tile ascend meter (auto ring lift)

### M2 — Timeline Economy Core (Leverage, Momentum, Windows)
- **M2.1** ✅ Canonical economy state shape + persistence
- **M2.2** ✅ Leverage ladder + UI gating
- **M2.3** ✅ Momentum meter (gain/decay)
- **M2.4** ✅ Windows engine (5–25 min)
- **M2.5** ✅ Trigger rules: “rich & hot”
- **M2.6** ✅ Soft throttle (post big-win dampening)
- **M2.7** ✅ Alpha Day scheduler (rare)

### M3 — Real Stock Tiles + Portfolio Rewards
- **M3.1** ✅ Audit stock tile modal system
- **M3.2** ✅ Portfolio readout panel
- **M3.3** ✅ Stock tile buy action (paper trading)
- **M3.4** ✅ Portfolio reward hooks (soft positive buffs)
- **M3.5** ✅ Price data strategy (with fallback)

### M4 — Micro‑Learning Tiles
- **M4.1** ✅ Tile taxonomy + renderer
- **M4.2** ✅ Question bank format + seed content
- **M4.3** ✅ Rewards + streak system
- **M4.4** ✅ Graphic templates + animations

### M5 — Vault Album Shop (Shop 2.0)
- **M5.0** ✅ Audit existing shop & decide flag vs in-place
- **M5.1** ✅ Shop2 feature flag + routes
- **M5.2** ✅ Supabase schema for seasons/sets/items/progress
- **M5.3** ✅ Vault overview UI
- **M5.4** ✅ Set detail UI (4×3)
- **M5.5** ✅ Atomic purchase function
- **M5.6** ✅ Set completion + unlock next set
- **M5.7** ✅ Album completion + mega reward
- **M5.8** ✅ Window integration (discounts, flash)

### M6 — Vault Leveling + Permanent Perks
- **M6.1** ✅ Audit free roll regen (current formula)
- **M6.2** ✅ Vault progress tables + UI meter
- **M6.3** ✅ Increment XP on purchase (atomic)
- **M6.4** ✅ Level-up detection + claim records
- **M6.5** ✅ Apply roll regen boost perk (based on existing regen)

### M7 — Tile Price Pop Labels
- **M7.1** ✅ Audit board renderer + tile overlays
- **M7.2** ✅ Implement tile label component
- **M7.3** ✅ Hook labels to tile data
- **M7.4** ✅ Expand labels for quick-reward + special tiles (config-first)
- **M7.5** ✅ Add tile label legend + config reference in HUD help (config-first)

### M8 — Telemetry & Tuning
- **M8.1** ✅ Economy telemetry sinks
- **M8.2** ✅ Telemetry review + tuning pass

### M9 — Celebrations & FX
- **M9.1** Ring 3 upgrade celebration (board spin + UI flash) ✅

### M10 — Event Tile Activations (Marketing Tiles)
- **M10.1** ✅ Audit event tile gaps + map titles to experiences
- **M10.2** ✅ Implement Tier 1 event tiles (Analyst Call, News Flash, Executive Event, Board Meeting)
- **M10.3** ✅ Court of Capital activation (corner tile experience)
- **M10.4** ✅ Event tile copy + reward tuning pass (marketing hooks)
- **M10.5** ✅ Tier 2 event tile activation scope (plan-only)
- **M10.6** ✅ Tier 2 event tile activation (Market Event + Wildcard)
- **M10.7** ✅ Tier 2 event tile polish (reward tuning + headline copy sweep)

### C1 — Config Strategy (Data-driven tuning)
- **C1.1** ✅ Economy config seed (energy + vault regen)
- **C1.2** ✅ Shop vault config seed (seasons, discounts, and level curve)
- **C1.3** ✅ Ring config seed (ring rewards + portals)
- **C1.4** ✅ Learning config seed (learning tiles + streak rewards)
- **C1.5** ✅ Event tile config seed (headlines + reward tuning)

### P1 — Mini-Games Hub
- **P1.1** ✅ Wheel of Fortune playable demo in Games Hub
- **P1.2** ✅ Portal animation polish
- **P1.3** ✅ Roulette victory sequence
- **P1.4** ✅ Happy Hour wheel scheduling in Games Hub
- **P1.5** ✅ Stock Rush timed mini-game surface
- **P1.6** ✅ Vault Heist timed mini-game surface

### P2 — Audio & Feedback
- **P2.1** ✅ Soothing sound system
- **P2.2** ✅ Ring-based leaderboards
- **P2.3** ✅ Advanced portfolio analytics
- **P2.4** ✅ Event system audit (limited-time windows)
- **P2.5** ✅ HUD button click sound feedback
- **P2.6** ✅ More case studies
- **P2.7** ✅ Bias Sanctuary visual story mode (scrollable webtoon + audio)
- **P2.8** ✅ Bias Sanctuary ambient audio cues
- **P2.9** ✅ Seasonal battle pass UI wiring

### P3 — Casino & Scratchcards
- **P3.1** ✅ Advanced casino games (audit CasinoModal + existing casino hooks and scope the first new game surface)
- **P3.2** ✅ Scratchcard 2.0 tier selection polish
- **P3.3** ✅ Scratchcard 2.0 next-level reveal polish
- **P3.4** ✅ Scratchcard 2.0 tactile feedback
- **P3.5** ✅ Scratchcard 2.0 win-line sparkles
- **P3.6** ✅ Scratchcard 2.0 odds peek CTA
- **P3.7** ✅ Scratchcard 2.0 odds helper reuse
- **P3.8** ✅ Scratchcard 2.0 odds helper coverage
- **P3.9** ✅ Scratchcard 2.0 odds modifiers (casino luck + happy hour)
- **P3.10** ✅ Scratchcard 2.0 event override config (odds + symbols)
- **P3.11** ✅ Scratchcard 2.0 ticket value chips
- **P3.12** ✅ Scratchcard 2.0 event ticket banners
- **P3.13** ✅ Scratchcard 2.0 in-ticket event banner (ticket view CTA)
- **P3.14** ✅ Casino lobby entry + High Roller Dice teaser card (config-first stub)
- **P3.15** ✅ High Roller Dice playable demo + Happy Hour guaranteed-win integration
- **P3.16** ✅ High Roller Dice reward tuning + audio/FX polish
- **P3.17** ✅ High Roller Dice odds + payout preview helper
- **P3.18** ✅ High Roller Dice streak recap + session stats
- **P3.19** ✅ High Roller Dice session reset + buy-in selector
- **P3.20** ✅ High Roller Dice buy-in spend + balance guardrails
- **P3.21** ✅ High Roller Dice bankroll guidance + balance recovery CTA

### P4 — Seasonal & Holiday Events
- **P4.1** ✅ Holiday event schedule fixtures
- **P4.2** ✅ Rare event calendar callouts
- **P4.3** ✅ Mega Jackpot boost (Jackpot Week payout bonus)

### P5 — Vault Heist Evolution
- **P5.1** ✅ Config-first pick limits + free pick rules
- **P5.2** ✅ Persist free-pick resets on the Vault Heist schedule window (config-first)
- **P5.3** ✅ Move Vault Heist schedule + reset rules into config (config-first)
- **P5.4** ✅ Add Vault Heist schedule copy to config-driven UI callouts (config-first)
- **P5.5** ✅ Replace Saturday-only gating with schedule-aware Vault Heist availability (config-first)
- **P5.6** ✅ Add schedule-aware Vault Heist availability messaging to the HUD/CTA (config-first)
- **P5.7** ✅ Add a Vault Heist CTA fallback that opens the Games Hub when the heist is upcoming (config-first)
- **P5.8** ✅ Add a Vault Heist Games Hub teaser panel + upcoming countdown copy (config-first)

### P6 — Long-Term Content (Master Plan P3)
- **P6.0** ✅ Plan next milestone slices from the master plan (doc-only, keep steps small + config-first)
- **P6.1** ✅ Choose the next advanced casino game + add a config-first stub entry (config-first + doc-first)
- **P6.2** ✅ Build the minimal playable loop for the new casino game (mobile-first surface)
- **P6.3** ✅ Add payout tuning + odds helper coverage for the new casino game (config-first)
- **P6.4** ✅ Add telemetry + session stats hooks for the new casino game (config-first)
- **P6.5** ✅ Scope the AI investment insights surface (doc-first + fixtures)
- **P6.6** ✅ Wire AI insights fixture panel into a dedicated modal entry point (mobile-first shell)
- **P6.7** ✅ Add config-first AI insights filter chips (horizon + confidence tiers) in the dedicated modal
- **P6.8** ✅ Add config-first empty-state + reset CTA copy for AI insights filters
- **P6.9** ✅ Add config-first AI insights freshness badge + stale-state callout
- **P6.10** ✅ Add config-first AI insights relative age copy (minutes-ago) on insight cards
- **P6.11** ✅ Add config-first AI insights auto-refresh helper copy + cooldown label
- **P6.12** ✅ Add config-first AI insights refresh-status tone tiers (on-track/due-now) for the cooldown label
- **P6.13** ✅ Add config-first AI insights refresh-status helper descriptions for on-track/due-now tiers
- **P6.14** ✅ Add config-first AI insights refresh-status icons for on-track/due-now tiers
- **P6.15** ✅ Add config-first AI insights refresh-status icon colors for on-track/due-now tiers
- **P6.16** ✅ Add config-first AI insights refresh-status chip background/border classes for on-track/due-now tiers
- **P6.17** ✅ Add config-first AI insights refresh-status helper copy spacing/tone polish for the cooldown chip row
- **P6.18** ✅ Add config-first AI insights refresh-status emphasis copy token for due-now countdown urgency
- **P6.19** ✅ Add config-first AI insights refresh-status due-now countdown separator token for urgency chip phrasing polish
- **P6.20** ✅ Add config-first AI insights refresh-status due-now countdown template token for urgency chip phrasing polish
- **P6.21** ✅ Add config-first AI insights refresh-status due-now countdown fallback template guardrails for placeholder-safe copy
- **P6.22** ✅ Add config-first AI insights refresh-status due-now emphasis/separator fallback guardrails for empty-token-safe chip copy
- **P6.23** ✅ Add config-first AI insights due-now cooldown phrase formatter helper to keep chip copy assembly centralized
- **P6.24** ✅ Add config-first AI insights on-track cooldown phrase formatter helper so both tone paths share centralized copy assembly
- **P6.25** ✅ Add config-first AI insights on-track cooldown template guardrails so formatter input remains placeholder-safe
- **P6.26** ✅ Add config-first AI insights cooldown countdown value guardrails so formatter output remains numeric-placeholder-safe
- **P6.27** ✅ Add config-first AI insights helper/cooldown minutes template guardrails so both strings stay `{minutes}` placeholder-safe
- **P6.28** ✅ Add config-first AI insights relative-age minutes template guardrails so age copy stays `{minutes}` placeholder-safe
- **P6.29** ✅ Add config-first AI insights relative-age phrase formatter helper so timestamp copy assembly stays centralized
- **P6.30** ✅ Add config-first AI insights relative-age fallback phrase token so non-minute timestamps stay centrally tunable
- **P6.31** ✅ Add config-first AI insights relative-age hour template token so long-age timestamps stay centrally tunable
- **P6.32** ✅ Add config-first AI insights relative-age day template token so extra-long timestamps stay centrally tunable
- **P6.33** ✅ Add config-first AI insights relative-age day template guardrails so `{days}` placeholder safety stays deterministic
- **P6.34** ✅ Add config-first AI insights relative-age hour/day fallback threshold guardrails so long-age copy switching stays deterministic
- **P6.35** ✅ Add config-first AI insights relative-age day-count divisor token so long-age labels stay tunable without changing threshold boundaries
- **P6.36** ✅ Add config-first AI insights relative-age hour-count divisor token so hour labels stay tunable independently from threshold boundaries
- **P6.37** ✅ Add config-first AI insights relative-age hour-count minimum token so hour labels remain human-friendly when divisor tuning is aggressive
- **P6.38** ✅ Add config-first AI insights relative-age day-count minimum token so day labels remain human-friendly when divisor tuning is aggressive
- **P6.39** ✅ Add config-first AI insights relative-age day-count minimum coverage in modal age rendering tests (small follow-up)
- **P6.40** ✅ Add config-first AI insights relative-age unavailable-label coverage in modal age rendering tests (small follow-up)
- **P6.41** ✅ Add config-first AI insights relative-age unavailable-label override coverage in config normalization tests (small follow-up)
- **P6.42** ✅ Add config-first AI insights relative-age fallback-template override coverage in config normalization tests (small follow-up)
- **P6.43** ✅ Add config-first AI insights fallback-template override coverage in modal relative-age rendering tests (small follow-up)
- **P6.44** ✅ Add config-first AI insights just-now-label override coverage in config normalization tests (small follow-up)
- **P6.45** ✅ Add config-first AI insights just-now-label override coverage in modal relative-age rendering tests (small follow-up)
- **P6.46** ✅ Wrap AI insights relative-age hardening track and queue the next non-test product slice (plan hygiene follow-up)
- **P6.47** ✅ Add config-first AI insights sort controls (freshness/confidence) in the dedicated modal (non-test product slice)
- **P6.48** ✅ Add config-first AI insights sort helper copy so active ordering intent is explicit in the modal
- **P6.49** ✅ Add config-first AI insights sort helper tone classes so ordering guidance remains readable across states
- **P6.50** ✅ Add config-first AI insights sort helper container classes so helper callouts keep consistent spacing across tone states
- **P6.51** ✅ Add config-first AI insights sort helper text-size token so helper readability can be tuned per surface
- **P6.52** ✅ Add config-first AI insights sort helper text-wrap token so long helper copy remains readable on narrow mobile widths
- **P6.53** ✅ Add config-first AI insights entrypoint copy token in Hub Insights tab so players immediately know where to open the full module
- **P6.54** ✅ Add config-first AI insights entrypoint CTA label token in Hub Insights tab so launch copy is tunable without modal edits
- **P6.55** ✅ Add config-first stock modal ValueBot metadata strip (labels + freshness + pulse callout) so cards reflect existing analysis without changing ValueBot processing
- **P6.56** ✅ Add config-first stock modal pulse tone classes + freshness guardrails so pulse callouts stay readable and resilient across ring themes
- **P6.57** ⏳ Add config-first stock modal analysis-chip tone classes so metadata strip color tuning stays centralized and easy to tweak

---

## Config Strategy
Create/extend central config files so gameplay logic reads config, not hardcoded constants:
- `config/economy.json`
- `config/shop_vault.json`
- `config/rings.json`
- `config/learning.json`

---

## SQL / Migration Discipline
All SQL changes must be logged in `MIGRATIONS_LOG.md` with purpose, dependencies, verification queries, and rerun notes. Use existing Supabase patch naming conventions.

---

## Suggested Run Order (After Audit)
1) M5.0 Shop audit
2) M5.1–M5.5 Vault Shop skeleton + atomic purchase
3) M6.1 Free regen audit + M6.2 Vault level UI
4) M1.2 Start land-only + M1.3 Bull Market window
5) M2.2 Leverage gating + M2.4 Windows engine
6) M7 price labels overlay
7) M3 portfolio buy tiles (paper trading)
8) M4 micro-learning tiles
9) M10 event tile activations (marketing tiles)

---

## Next Slice
**Recommended next slice:** **P6.57 — Add config-first stock modal analysis-chip tone classes so metadata strip color tuning stays centralized and easy to tweak.**

## Progress Log (rolling)
- **Done (latest):** P6.56 Add config-first stock modal pulse tone classes + freshness guardrails so pulse callouts stay readable and resilient across ring themes.
- **Next step:** P6.57 Add config-first stock modal analysis-chip tone classes so metadata strip color tuning stays centralized and easy to tweak.



## P6.56 Slice Notes (Stock modal pulse tone classes + freshness guardrails)
- Added config-first pulse tone-class tokens (`pulseFreshToneClass`, `pulseStaleToneClass`) under AI insights stock-card config so pulse callout readability can be tuned without component rewrites.
- Updated `StockModal` to apply pulse tone classes based on existing freshness thresholds, giving players clearer visual differentiation between fresher and staler pulse headlines.
- Added stock-modal freshness/config fallback guardrails in the UI layer so missing/partial stock-card config values degrade safely instead of risking startup/runtime regressions.


## P6.55 Slice Notes (Stock modal ValueBot metadata strip)
- Added config-first stock-card copy tokens under AI insights surface config (`analysisLabel`, stale badge, pulse labels, model prefix, stale-after-days) so card metadata copy can be tuned without touching ValueBot pipeline code.
- Updated `StockModal` to render existing ValueBot-backed metadata already present on stock payloads (risk/quality/timing labels, analyzed-age line, stale-analysis badge, model line).
- Added a latest market-pulse callout on stock cards by reusing existing AI Insights fixtures keyed by ticker, keeping this slice display-only and leaving ValueBot generation/queue processes unchanged.


## P6.54 Slice Notes (AI insights Hub entrypoint CTA label token)
- Added config-first `hubEntrypointCtaLabel` under the AI insights surface config so Hub launch-button text is tunable without touching component markup.
- Updated the Hub Insights tab launch button to render the config token, keeping mobile-first entrypoint copy centralized with existing helper text tokens.
- Expanded AI insights config normalization tests with CTA-label fallback coverage and queued P6.55 for helper-text tone token polish.


## P6.53 Slice Notes (AI insights Hub entrypoint copy token)
- Added config-first `hubEntrypointCopy` to the AI insights surface config so Hub tab guidance can be tuned without touching component markup.
- Wired the Hub Insights tab entrypoint helper line to render from config beneath the launch button, improving module discoverability on mobile.
- Added config normalization coverage for blank entrypoint-copy overrides and queued P6.54 for CTA-label token follow-up polish.


## P6.52 Slice Notes (AI insights sort helper text-wrap token)
- Added config-first `sortHelperTextWrapClass` under AI insights filters so long sort-helper guidance can wrap cleanly on narrow mobile layouts without modal rewrites.
- Updated the AI Insights modal helper callout to apply the wrap token alongside existing text-size/tone/container tokens for consistent readability.
- Expanded config + modal helper tests for wrap-token defaults/fallbacks and queued P6.53 to improve module entrypoint copy in the Hub Insights tab.


## P6.51 Slice Notes (AI insights sort helper text-size token)
- Added config-first `sortHelperTextClass` under AI insights filters so helper text sizing can be tuned per surface without editing modal markup.
- Updated the AI Insights modal sort-helper callout to use the shared text class token while keeping per-sort tone classes intact.
- Expanded config + modal helper tests for token defaults/normalization and queued P6.52 for a text-wrap follow-up on narrow mobile widths.


## P6.50 Slice Notes (AI insights sort helper container classes)
- Added config-first sort-helper container tokens (`sortHelperContainerClass` + `sortHelperContainerFallbackToneClass`) so helper callout spacing/base chrome stays centralized outside modal markup.
- Added per-sort `helperContainerToneClass` tokens and applied them in the dedicated modal so freshness/confidence helper callouts keep consistent spacing while switching tone treatments.
- Expanded config + modal helper coverage for helper-container class normalization and per-sort container tone resolution, and queued P6.51 for small text-size token follow-up polish.


## P6.49 Slice Notes (AI insights sort helper tone classes)
- Added config-first `helperToneClass` tokens to AI insight sort options so helper copy styling can shift with freshness/confidence context without modal rewrites.
- Updated AI Insights modal sort-helper rendering to apply the active sort option tone class while preserving a muted fallback for unknown sort IDs.
- Expanded config + modal helper test coverage for tone-class normalization and active sort tone resolution, and queued P6.50 for lightweight helper-container class follow-up polish.


## P6.48 Slice Notes (AI insights sort helper copy)
- Added config-first sort helper metadata (`sortHelperTemplate` + per-sort `description`) so ordering guidance text can be tuned without editing modal logic.
- Wired dedicated modal helper copy beneath sort chips so players can always see whether freshness or confidence is currently prioritized.
- Expanded config + modal helper coverage for sort-helper template guardrails and formatted helper-copy output, and queued P6.49 for small tone-class polish.


## P6.47 Slice Notes (AI insights sort controls)
- Added config-first sort control metadata (`sortLabel`, `defaultSortId`, and `sortOptions`) so freshness/confidence ordering can be tuned without touching modal logic.
- Wired dedicated modal sort chips that switch between freshness-first and confidence-first ordering while preserving deterministic tie-breakers.
- Added focused config + modal helper tests for sort normalization guardrails and ordering behavior; queued P6.48 to add concise helper copy that surfaces the active sort intent to players.


## P6.46 Slice Notes (AI insights relative-age hardening track wrap-up)
- Closed the long P6.18–P6.45 AI insights relative-age hardening thread as complete after both config normalization and modal rendering guardrails were landed for every fallback token path.
- Queued the first non-test product follow-up as P6.47 to rebalance this milestone toward player-facing progress while keeping the same config-first workflow.
- Tightened the next-slice pointer language so future runs avoid extending this guardrail-only chain unless a regression appears.


## P6.45 Slice Notes (AI insights relative-age just-now-label modal rendering coverage)
- Added focused modal helper coverage asserting config-first `justNowLabel` overrides are applied when rendering zero-minute insight ages.
- Used a custom fallback template in the modal test to verify the override is exercised through the same centralized fallback phrase path as production rendering.
- Advanced the next slice pointer to a plan-hygiene wrap-up so this long AI insights guardrail sequence can close and hand off to the next non-test product slice.


## P6.44 Slice Notes (AI insights relative-age just-now-label config normalization coverage)
- Added focused AI insights config normalization coverage asserting valid `justNowLabel` overrides are retained.
- Added fallback coverage asserting blank `justNowLabel` overrides deterministically collapse to the default `Just now` copy.
- Advanced the next slice pointer to modal-level just-now-label rendering coverage so config and UI assertions stay incrementally aligned.


## P6.43 Slice Notes (AI insights relative-age fallback-template modal rendering coverage)
- Extended modal-level relative-age formatter tests to cover config-first `fallbackTemplate` overrides for both just-now and unavailable label paths.
- Added deterministic fixture reset coverage for fallback template + just-now labels in test teardown so mutable config overrides stay isolated across runs.
- Advanced the next slice pointer to config normalization coverage for just-now label overrides to keep follow-up guardrails incremental.


## P6.42 Slice Notes (AI insights relative-age fallback-template config normalization coverage)
- Exported a typed AI insights config normalizer helper so config-level fallback-template behavior can be unit-tested without relying on module-load side effects.
- Added focused config normalization tests that confirm valid fallback-template overrides are retained while token-missing overrides deterministically fall back to `{label}`.
- Advanced the next slice pointer to modal-level fallback-template override coverage so guardrails are validated from config through rendering.


## P6.41 Slice Notes (AI insights relative-age unavailable-label config normalization coverage)
- Added a dedicated relative-age unavailable-label normalizer helper so fallback behavior is centralized in the AI insights config module.
- Added config normalization tests that confirm valid unavailable-label overrides are accepted while blank or missing values deterministically fall back.
- Advanced the next slice pointer to fallback-template override normalization coverage to keep guardrail tests incremental and focused.


## P6.40 Slice Notes (AI insights relative-age unavailable-label modal test coverage)
- Added focused modal helper coverage asserting invalid insight timestamps render the config-driven `unavailableLabel` fallback text.
- Reset the mutable `unavailableLabel` fixture override in modal test teardown so relative-age tests stay deterministic across runs.
- Advanced the next slice pointer to config normalization coverage for unavailable-label overrides.


## P6.39 Slice Notes (AI insights relative-age day-count minimum modal test coverage)
- Exported the AI insights relative-age formatter helper from the modal module so rendering-specific age copy can be validated without mounting the full dialog tree.
- Added focused modal helper coverage asserting config-first `dayCountMinimum` clamp behavior when day divisor math would otherwise render a lower value.
- Added a companion modal helper case confirming computed day labels remain unchanged when they already exceed the configured `dayCountMinimum` floor.


## P6.38 Slice Notes (AI insights relative-age day-count minimum token)
- Added config-first `dayCountMinimum` under AI insights relative-age settings so day labels keep a human-friendly floor even when divisor tuning is aggressive.
- Extended AI insights config normalization with a dedicated day-minimum guardrail helper that keeps values finite and at least one.
- Updated AI Insights day-label rendering to clamp computed day counts against the config minimum and expanded tests for new guardrails + surface coverage.


## P6.37 Slice Notes (AI insights relative-age hour-count minimum token)
- Added config-first `hourCountMinimum` under AI insights relative-age settings so hour labels keep a human-friendly floor even when divisor tuning is aggressive.
- Extended AI insights config normalization with a dedicated hour-minimum guardrail helper that keeps values finite and at least one.
- Updated AI Insights hour-label rendering to clamp computed hours against the config minimum and expanded tests for new guardrails + surface coverage.


## P6.36 Slice Notes (AI insights relative-age hour-count divisor token)
- Added config-first `hourCountDivisorMinutes` for AI insights relative-age copy so hour-label math can be tuned independently from hour/day threshold switching boundaries.
- Added a dedicated hour divisor normalization guardrail helper that keeps divisor values finite and at least one minute, with deterministic fallback behavior.
- Updated AI Insights modal hour-label math to use the divisor token and expanded config tests for hour divisor guardrails + surface coverage.


## P6.35 Slice Notes (AI insights relative-age day-count divisor token)
- Added config-first `dayCountDivisorMinutes` for AI insights relative-age copy so day-label math can be tuned separately from threshold switching boundaries.
- Added a dedicated divisor normalization guardrail helper that keeps divisor values finite and at least one minute, with deterministic fallback behavior.
- Updated AI Insights modal day-label math to use the divisor token and expanded config tests for divisor guardrails + surface coverage.

## P6.34 Slice Notes (AI insights relative-age hour/day threshold guardrails)
- Added config-first `hoursThresholdMinutes` and `daysThresholdMinutes` knobs for AI insights relative-age copy switching so long-age thresholds are no longer hardcoded in the modal.
- Added a normalization guardrail helper that keeps thresholds finite/non-negative and guarantees day-threshold minutes always remain above the hour threshold for deterministic copy tier switching.
- Updated AI insights config tests to cover threshold fallback and ordering behavior, and updated progress log entries to queue a small divisor-token follow-up slice.

## P6.33 Slice Notes (AI insights relative-age day template guardrails)
- Extended the relative-age day template guardrail helper to deterministically fall back to a canonical `{days}` template when override and fallback inputs both omit the placeholder token.
- Added focused unit coverage for invalid day-template fallback input so normalization always returns placeholder-safe copy.
- Updated the run-by-run progress log to mark P6.33 complete and queue a threshold-guardrail follow-up slice for long-age copy switching.


## P6.32 Slice Notes (AI insights relative-age day template token)
- Added a config-first relative-age `daysAgoTemplate` token so extra-long insight timestamps remain tunable without modal code edits.
- Extended AI insights config normalization to load the new day-level token and keep defaults deterministic when config values are absent.
- Updated AI Insights relative-age rendering to switch to day-based copy for 24h+ ages and added formatter/unit coverage for the new helper path.

## P6.31 Slice Notes (AI insights relative-age hour template token)
- Added a config-first relative-age `hoursAgoTemplate` token so long-age insight timestamps stay tunable without modal code edits.
- Extended AI insights config normalization with `{hours}` placeholder guardrails so invalid hour-template overrides deterministically fall back to defaults.
- Updated the AI Insights modal to switch to hour-based relative-age copy at 60+ minutes and added formatter/unit coverage for the new helper path.

## P6.30 Slice Notes (AI insights relative-age fallback phrase token)
- Added a config-first relative-age `fallbackTemplate` token so non-minute timestamp labels (for example, just-now and unavailable states) stay centrally tunable.
- Extended AI insights config normalization with fallback-template guardrails that require a `{label}` placeholder before accepting overrides.
- Updated the AI Insights modal to render non-minute timestamp labels via a shared fallback phrase formatter helper and added unit coverage for guardrails + formatter output.

## P6.29 Slice Notes (AI insights relative-age phrase formatter helper)
- Added a shared `formatRelativeAgePhrase` helper in the AI insights config module so `{minutes}` timestamp copy assembly is centralized in one formatter path.
- Updated the AI Insights modal relative-age renderer to use the shared formatter instead of inline template replacement.
- Added unit coverage for integer, decimal, and invalid relative-age minute inputs so formatter output stays deterministic.

## P6.28 Slice Notes (AI insights relative-age minutes template guardrails)
- Applied the shared `{minutes}` template guardrail to AI insights relative-age `minutesAgoTemplate` config normalization.
- Ensured malformed relative-age template overrides deterministically fall back to the default placeholder-safe copy.
- Added unit coverage for valid and fallback relative-age minute template variants to keep config-driven age labels stable.

## P6.27 Slice Notes (AI insights helper/cooldown minutes template guardrails)
- Added a shared minutes-template guardrail helper that requires the `{minutes}` token before template overrides are accepted.
- Updated AI insights config normalization to run both auto-refresh helper + cooldown templates through the shared guardrail for placeholder-safe copy.
- Added unit coverage for helper/cooldown minutes templates so valid overrides pass and missing-token variants deterministically fall back.

## P6.26 Slice Notes (AI insights cooldown countdown value guardrails)
- Added a shared countdown value guardrail helper that normalizes cooldown minutes to finite, non-negative whole numbers before formatting copy.
- Updated AI Insights modal countdown rendering to pass through guardrailed countdown values so helper/cooldown text never interpolates non-numeric placeholders.
- Added unit coverage for NaN/infinite/negative countdown inputs plus formatter fallback behavior to keep cooldown chip output deterministic.

## P6.25 Slice Notes (AI insights on-track cooldown template guardrails)
- Added a typed AI insights config guardrail helper for on-track cooldown templates so overrides must include the `{minutes}` placeholder before being accepted.
- Updated AI insights config normalization to run on-track cooldown template values through the new guardrail helper and fall back to defaults when placeholder coverage is missing.
- Added unit coverage for valid and invalid on-track templates so fallback behavior stays deterministic and placeholder-safe.

## P6.24 Slice Notes (AI insights on-track cooldown phrase formatter helper)
- Added a shared AI insights config helper that formats on-track cooldown phrases from the config template + countdown value so on-track copy assembly is centralized.
- Updated the AI Insights modal on-track cooldown chip path to use the shared formatter helper rather than inline template substitution.
- Added unit coverage for default and reordered on-track template formats so both cooldown tone paths now share helper-backed phrase composition.


## P6.23 Slice Notes (AI insights due-now cooldown phrase formatter helper)
- Added a shared AI insights config helper that formats due-now cooldown phrases from template + token inputs so copy assembly is centralized.
- Updated the AI Insights modal due-now cooldown chip path to use the shared formatter instead of inline string replacement chaining.
- Added unit coverage for default and reordered template formats to verify centralized due-now phrase composition remains config-driven.


## P6.22 Slice Notes (AI insights due-now emphasis/separator guardrails)
- Added typed due-now token guardrails so emphasis and separator config values now fall back when empty or when they reuse template placeholders.
- Updated AI insights config normalization to apply the token guardrail helper to due-now emphasis + separator before modal rendering uses them.
- Added unit coverage for valid, empty, and placeholder-reuse token values so due-now chip copy remains empty-token-safe.



## P6.21 Slice Notes (AI insights due-now countdown template guardrails)
- Added a typed template normalizer guardrail that requires all due-now countdown placeholders (`{emphasis}`, `{separator}`, `{countdown}`) before accepting config overrides.
- Updated AI insights config normalization to fall back to the default template whenever placeholder coverage is incomplete, keeping chip copy placeholder-safe.
- Added unit coverage for valid templates plus invalid/missing-token variants so fallback behavior remains deterministic.


## P6.20 Slice Notes (AI insights due-now countdown template token)
- Extended AI insights auto-refresh status config with a `dueNowCountdownTemplate` token so due-now chip phrasing order stays config-tunable without hardcoded component formatting.
- Updated config normalization defaults/tests to guarantee the due-now countdown template always includes countdown placeholder support.
- Updated the AI Insights modal due-now cooldown copy to compose emphasis, separator, and countdown using the new template token while preserving on-track copy behavior.

## P6.19 Slice Notes (AI insights due-now countdown separator token)
- Extended AI insights auto-refresh status config with a `dueNowCountdownSeparator` token so due-now chip phrasing stays config-tunable without hardcoded punctuation in the modal.
- Updated config normalization defaults/tests to guarantee the due-now separator token is always present when config values are missing.
- Updated the AI Insights modal due-now cooldown copy to compose urgency emphasis and countdown text using the new separator token.

## P6.18 Slice Notes (AI insights due-now countdown urgency emphasis token)
- Extended AI insights auto-refresh status config with a `dueNowCountdownEmphasis` token so urgency phrasing remains content-tunable without component edits.
- Updated config normalization defaults/tests to guarantee due-now urgency emphasis copy is always available even when config entries are incomplete.
- Updated the AI Insights modal cooldown chip copy to prepend the configured urgency emphasis only when refresh status is due-now.

## P6.16 Slice Notes (AI insights refresh-status chip classes)
- Added config-driven chip container classes for on-track and due-now auto-refresh tiers so border/background styling is tuneable without component edits.
- Extended AI insights config typing and normalization to enforce chip class fallbacks for both cooldown status tiers.
- Updated the AI Insights modal cooldown row to render a compact status chip that applies the configured tone text + chip container classes.

## P6.15 Slice Notes (AI insights refresh-status icon colors)
- Extended AI insights auto-refresh status-tone config with `onTrackColorClass` and `dueNowColorClass` so status color treatment is content-tunable.
- Updated config normalization defaults/tests to guarantee both cooldown tiers always expose non-empty color classes.
- Rewired the AI insights cooldown status row to consume config-driven color classes instead of hardcoded due-now/on-track text color branches.

## P6.14 Slice Notes (AI insights refresh-status icons)
- Added config-driven refresh-status icons (`onTrackIcon`, `dueNowIcon`) so cooldown state visuals can be tuned without component edits.
- Extended AI insights config normalization + tests to require non-empty icon tokens for both status tiers.
- Updated the AI Insights modal cooldown row to prepend the configured icon alongside the existing tone label/copy.

## P6.13 Slice Notes (AI insights refresh-status helper descriptions)
- Extended AI insights auto-refresh status config with helper descriptions (`onTrackDescription`, `dueNowDescription`) so explanatory copy is content-tunable.
- Updated the AI Insights modal cooldown block to render a tier-aware helper description under the status label, reusing the same due-now vs on-track tone logic.
- Added config coverage assertions for the new status helper description fields.

## P6.12 Slice Notes (AI insights refresh-status tone tiers)
- Extended AI insights auto-refresh config with `statusTones` labels (`onTrackLabel`, `dueNowLabel`) so cooldown status language stays content-tunable.
- Updated the AI Insights modal cooldown row to derive an on-track vs due-now status tier from computed refresh timing and prepend the matching config label.
- Applied tier-aware text treatment in the cooldown label so due-now states are visually elevated while on-track states retain the default accent tone.

## P6.11 Slice Notes (AI insights auto-refresh helper copy + cooldown label)
- Added config-driven auto-refresh copy templates (`helperTemplate`, `cooldownTemplate`) so timing guidance remains content-tunable without component edits.
- Added a mobile-friendly auto-refresh helper block in the AI Insights modal that explains refresh cadence and shows a derived “next refresh” cooldown label.
- Computed the cooldown label from fixture recency + configured refresh window to keep the copy deterministic while provider wiring remains deferred.

## P6.10 Slice Notes (AI insights relative age copy)
- Extended the AI insights freshness config with relative-age copy tokens (`updatedLabel`, `justNowLabel`, `minutesAgoTemplate`, `unavailableLabel`) so card timestamp language stays config-first.
- Added a reusable relative-age formatter in the AI Insights modal that renders fixture update ages as config-driven minutes-ago strings.
- Replaced the raw locale timestamp on each insight card with config-driven relative age copy to keep the mobile card metadata compact.

## P6.9 Slice Notes (AI insights freshness badge + stale-state callout)
- Extended AI insights config with a freshness block (labels, stale threshold minutes, and stale callout copy) so status tuning stays config-first.
- Added freshness badges to each insight card that mark entries as Fresh/Stale based on config-driven stale thresholds and card timestamps.
- Added a stale-state callout banner that appears when any visible insight exceeds the stale threshold, nudging players to request refreshed insights.

## P6.8 Slice Notes (AI insights empty-state + reset CTA copy)
- Extended AI insights config with reset CTA and empty-state copy fields so filter UX copy can be tuned without code edits.
- Added a shared reset-filters CTA in the modal filter header that appears when horizon/confidence filters are active.
- Rendered a dedicated empty-state card when filters produce zero matches, including a config-driven reset action that restores all fixtures in one tap.

## P6.7 Slice Notes (AI insights filter chips)
- Extended the AI insights config schema with filter metadata so horizon/confidence chips are config-driven rather than hardcoded in the modal.
- Added mobile-first filter chip groups in the dedicated AI insights modal for horizon and confidence tiers, including an always-available "all" reset path per group.
- Wired filtered fixture rendering and count feedback so users can quickly narrow insight cards without changing provider wiring.

## P6.6 Slice Notes (AI insights dedicated modal entry point)
- Added a dedicated `AIInsightsModal` overlay that renders the fixture feed in a standalone mobile-first shell so the surface can evolve independently from Hub tabs.
- Wired Hub's Insights tab CTA to close the Hub and open the new dedicated modal entry point instead of a disabled placeholder button.
- Kept provider wiring deferred while surfacing fixture metadata (confidence + last-updated timestamp) to make the modal more actionable for testing.

## P6.5 Slice Notes (AI investment insights scope + fixtures)
- Added a config-first AI insights seed (`config/ai_insights.json`) with mobile-friendly surface copy plus fixture insight cards (symbol, horizon, confidence, and signal metadata).
- Added a typed config loader + normalizer (`src/config/aiInsights.ts`) so future provider wiring can swap fixture data without refactoring consuming UI.
- Added a lightweight fixture export layer and surfaced the first insights list inside Hub as a new mobile-first “Insights” tab to validate copy hierarchy before wiring live model calls.

## P6.4 Slice Notes (Market Blackjack telemetry + session stats hooks)
- Added config-driven telemetry controls for Market Blackjack (`blackjack.telemetry.enabled` + `eventPrefix`) so event naming and rollout stay data-driven.
- Wired hand lifecycle telemetry hooks (deal, settle, manual reset) behind config-gated tracking.
- Added lightweight in-table session stats (hands, win rate, blackjacks, pushes, best payout, net cash) with a reusable helper and unit coverage.

## P2.7 Scope Notes (Bias Sanctuary visual story mode)
### Story structure & content
- Add a visual story mode to each case study with a scrollable, panel-based “webtoon” layout that pairs text, imagery, and emotional beats.
- Define a per-story structure: hook → tension → decision → consequence → reflection, with short captions that reinforce the bias.
- Include “decision moment” callouts in-panel to connect the story beat to the quiz prompt.
- Keep the narrative copy mobile-first: 1–2 short sentences per panel and no long paragraphs.

### Media & assets
- Support optional background media per story (video clip or illustrated panels), with graceful fallbacks when assets are unavailable.
- Allow per-panel imagery, color treatment, or illustration frames for emotional contrast (e.g., warm vs cool palettes).
- Add a minimal asset manifest format (per story) so designers can swap panel imagery without touching component logic.

### Audio & accessibility
- Include lightweight ambient audio cues (per-story or per-panel) with mute controls aligned to existing audio settings.
- Provide captions or transcript snippets for any audio narration or music.
- Ensure media auto-play is opt-in on mobile and respects mute/autoplay policies.

### UX & progression
- Keep the story mode mobile-first, with swipe-friendly navigation and clear progression indicators.
- Allow “skip story” and “resume story” paths so players can return to the quiz without friction.
- Add a completion badge or short takeaway card before the quiz begins to reinforce learning.

### Technical + data integration
- Extend the bias case study data model to include story panel metadata (text, image/video refs, optional audio cues).
- Provide a fixture fallback for story panels when Supabase is unavailable, mirroring existing mock data patterns.
- Wire the story mode into the Bias Sanctuary modal without disrupting existing quiz flow or celebrations.

## Right Now Calendar Polish Slice Notes (Completed ✅)
- Expanded the Right Now calendar to surface upcoming mini-game windows alongside event scheduling.
- Added active mini-game window callouts with remaining time so players can see live windows at a glance.
- Kept the calendar mobile-first while adding a dedicated mini-game roster section for upcoming windows.

## Unified Window UI Pass Slice Notes (Completed ✅)
- Added a shared economy window status pill so HUD and phone dice controls display the same countdown + bonus info.
- Surfaced active economy windows in overlay mode with a fixed banner, keeping window bonuses visible while modals are open.
- Centralized economy window timer formatting to keep countdowns consistent across HUD and overlay surfaces.

## M7.4 Slice Notes (Expand labels for quick-reward + special tiles)
- Added a config-driven tile label catalog for quick rewards and special actions so labels can be tuned without code edits.
- Wired quick reward tiles to pull label + sublabel copy from the new config to keep the reward callouts consistent.
- Expanded special-action labels (fall portal, chance, big fish portal, roulette) using the shared config helper.

## M7.5 Slice Notes (Tile label legend + HUD help reference)
- Added a HUD help legend in Settings that lists tile label callouts from the shared tile label config.
- Included a config reference in the HUD help copy so label tuning stays data-driven.
- Logged the next Vault Heist evolution step to keep the plan actionable.

## Config Strategy Kickoff Slice Notes (Completed ✅)
- Moved ring configuration, Ring 3 settings, and portal configuration into a dedicated config module to kick off the central config strategy.
- Kept existing imports stable by re-exporting the ring config from `mockData` while the broader config migration remains phased.

## Config Strategy Follow-up Slice Notes (Completed ✅)
- Centralized economy tuning knobs (roll limits, regen, multipliers, and baseline rewards) into a shared config module.
- Preserved existing imports by re-exporting economy constants from the legacy constants module while the config migration continues.

## Config Strategy Follow-up Slice Notes (Shop vault config exports) (Completed ✅)
- Moved Shop 2.0 fixture data and XP tuning constants into a shared shop vault config module.
- Re-exported the shop vault fixture types/data from the legacy helper to keep existing imports stable.
- Centralized shop vault XP tuning constants so purchase/level math reads from config.

## Config Strategy Follow-up Slice Notes (Learning config exports) (Completed ✅)
- Centralized learning tile metadata, category styles, and question bank content in a shared learning config module.
- Re-exported learning config types and constants through the legacy learning helper modules to keep imports stable.
- Kept learning tile and question lookups unchanged while shifting the source of truth to config.

## C1.4 Slice Notes (Learning config seed)
- Seeded `config/learning.json` with learning tile definitions, category styling, question bank fixtures, and reward tuning.
- Normalized the in-app learning config loader to read from the JSON seed with deterministic fallbacks.
- Preserved existing exports so learning tiles, question bank, and reward helpers remain unchanged.

## C1.5 Slice Notes (Event tile config seed)
- Seeded `config/event_tiles.json` with Tier 1 and Market Event choice rewards for event tiles.
- Added a config loader that normalizes event tile definitions and market event options with fallbacks.
- Rewired event tile lookups to read from the shared config seed while keeping the public exports stable.

## Event Window Unification Slice Notes (Completed ✅)
- Added a shared window-scheduling helper so recurring events and mini-games use the same timing logic.
- Centralized daily/weekly/monthly and monthly-random window calculations with seeded randomness to keep schedule determinism consistent.
- Updated mini-game scheduling to rely on the unified window helpers for active, upcoming, and countdown state.

## Fall Portals + Chance Lift Slice Notes (Completed ✅)
- Expanded Ring 2 fall portal outcomes with safety-net and executive-evac rewards, plus celebratory feedback tied to portal drops.
- Broadened Chance card outcomes to include executive lifts and market boosts, while keeping the Ring 3 jackpot lift as the headline outcome.
- Standardized weighted outcome picking for Ring 2 portal tiles to keep the risk/reward variety deterministic and easy to tune.

## P2 Slice Notes (Mega Jackpot monthly event window)
- Added monthly recurrence support for first-weekday scheduling so events can target slots like “first Saturday.”
- Introduced the Mega Jackpot recurring event with a first-Saturday monthly window, plus boosted stars/XP multipliers.
- Wired Mega Jackpot into the existing event pipeline with its own currency progression targets and custom-effect marker.
- Applied economy multipliers to event currency star rewards so Mega Jackpot boosts amplify event prize payouts.

## P3 Slice Notes (Expansion category art/FX + reward callouts)
- Added expansion-tier tile styling overlays so expansion categories stand out with their palette glow + shimmer FX on the board.
- Updated expansion category tile labels to call out bonus rewards alongside the ring multiplier for quicker reward recognition.

## P3 Slice Notes (Expansion category landing FX polish + sound stingers)
- Added a landing-only expansion pulse glow to make expansion-category stops pop with a quick highlight.
- Triggered a dedicated expansion landing stinger so expansion tiles have a brighter audio cue on touchdown.

## M0.2 Slice Notes (Instrumentation hooks)
- Added a dedicated instrumentation helper that enables opt-in debug logging via local storage or env flags without changing gameplay behavior.
- Centralized debug logging to route through the instrumentation hook so it can be extended with additional sinks later.
- Fixed the Tile component prop wiring so tile label overlays no longer reference an undefined variable during render.

## M4.1 Slice Notes (Tile taxonomy + renderer)
- Added a shared micro-learning tile taxonomy with categories, labels, and descriptions to keep quiz surfaces consistent.
- Updated board tile data to tag quiz tiles with learning IDs so the renderer can display category-specific styling.
- Added a learning tile renderer treatment (icon + label) alongside existing tile visuals with a landing fallback toast.

## M4.2 Slice Notes (Question bank format + seed content)
- Added a structured question bank for learning modules with difficulty, tags, and explanations to seed future quiz flows.
- Connected learning tiles to the seed bank by surfacing question counts in the learning toast for quick context.

## M4.3 Slice Notes (Rewards + streak system)
- Centralized learning reward tuning values (base payout and streak bonuses) into the shared learning config.
- Added a learning reward helper that calculates streak bonuses and totals for micro-learning tiles.
- Reused the shared daily streak helper for learning and quiz streak tracking so daily logic stays consistent.

## M4.4 Slice Notes (Graphic templates + animations)
- Added learning tile graphic templates (Aurora, Prism, Comet) with frame, shimmer, sparkle, and orbit layers to diversify quiz visuals per category.
- Wired learning tile definitions to pick a template so quiz tiles render a consistent look/feel tied to their subject matter.
- Extended the learning tile animation stack with shimmer and orbit pulses while preserving the existing mobile-first layout.

---

## M2.5 Slice Notes (Trigger rules: “rich & hot”)
- Tightened window start gating so meeting minimum leverage + momentum is no longer sufficient on its own; the economy must now be both “rich” (leverage level 2+) and “hot.”
- Defined “hot” using the existing canonical economy signals: momentum must clear a higher band, be meaningfully above the recorded floor, and remain close to the current peak to reward active streaks instead of stale highs.
- Kept the change repo-first by implementing it entirely within `economyWindows.ts` without reshaping upstream state, UI wiring, or persistence.

## M2.6 Slice Notes (Soft throttle: post big-win dampening)
- Added a soft throttle helper that flags big net-worth spikes and applies a temporary reward dampener for stars/XP multipliers.
- Persisted throttle metadata alongside the canonical economy state and ensured throttle windows expire deterministically on the minute tick.
- Wired the throttle multiplier into existing economy multiplier aggregation without altering other reward pipelines.

## M2.7 Slice Notes (Alpha Day scheduler)
- Added a deterministic quarterly “Alpha Day” special event so the event system can surface a rare 24-hour multiplier surge.
- Scheduled Alpha Day using a predictable first-Monday rule for each quarter month, ensuring the next occurrence is always discoverable in upcoming events.
- Wired the Alpha Day event into the global events list without altering existing recurring or rotation events.
- Aligned event aggregation helpers to accept a shared reference time so Alpha Day scheduling stays deterministic when polling or testing with a custom “now.”

## M2.4 Slice Notes (Windows engine + mobile-first HUD banner)
- Added a dedicated `economyWindows` engine that deterministically starts 5–25 minute windows based on leverage + momentum thresholds, with cooldown handling and persisted timestamps.
- Extended the canonical economy state shape to include active window metadata and last window start/end markers so windows survive refreshes safely.
- Combined event multipliers with active window multipliers for roll rewards and star calculations, and surfaced the active window as a mobile-first banner on the phone dice button plus the expanded Dice HUD.

---

## M2.3 Slice Notes (Momentum meter + decay)
- Added a dedicated momentum helper module that decays momentum based on elapsed minutes and applies gain from positive net-worth deltas.
- Wired momentum updates into `App.tsx` using net-worth change tracking plus a minute-based decay interval so momentum persists deterministically across refreshes.
- Surfaced a mobile-first momentum meter on both the phone dice button and the expanded Dice HUD to preview the new economy signal without disrupting existing flows.

---

## M2.2 Slice Notes (Leverage ladder + UI gating)
- Added a leverage ladder helper that clamps leverage level and unlocks multipliers progressively from 1x through 100x.
- Gated multiplier selection on both desktop (`DiceHUD`) and phone (`DiceButton`) so locked multipliers are visibly disabled.
- Clamped mobile multiplier selection to the unlocked ladder and cycled only within unlocked multipliers to avoid invalid leverage states.

---

## M2.1 Slice Notes (Canonical economy state shape + persistence)
- Added a canonical `EconomyState` type and normalization helpers to make upcoming leverage/momentum work deterministic.
- Hydrated economy state from local storage when Supabase is unavailable and persisted it on change to survive refreshes.
- Normalized economy state when loading saved games so older saves receive the new defaults safely.

## M3.1 Slice Notes (Audit stock tile modal system)
- Stock modal renders as an overlay (`StockModal`) with mobile-first layout, ring multiplier badge, and buy/pass actions; it uses on-demand hooks, haptics, and optional ProTools deep dive entry without altering ProTools art flow.
- The modal is launched from `App.tsx` after category tile landings with a short preview spin, uses the overlay manager/registry system for lifecycle handling, and closes by resetting stock state + phase.
- Stock data arrives through `useUniverseStocks`, which maps Supabase universe rows into `Stock` records (with category derivation, scores, and price normalization) and falls back to mock data when Supabase is absent.

## M3.2 Slice Notes (Portfolio readout panel)
- Added a mobile-first portfolio readout panel to summarize net worth, cash vs portfolio value, top holdings, and category mix at a glance.
- Placed the new readout panel into the center carousel so it is always available without leaving the board flow.

## M3.3 Slice Notes (Stock tile buy action — paper trading)
- Updated the stock modal buy flow to purchase a ring-scaled bundle of shares with accurate affordability checks and total cost messaging.
- Merged new stock purchases into existing holdings to keep the portfolio list tidy while retaining total cost basis for average pricing.
- Incremented stock purchase stats (total and unique) so achievements can track paper trades reliably.

## M3.4 Slice Notes (Portfolio reward hooks — soft positive buffs)
- Added a portfolio reward buff helper that grants a small multiplier when holdings span multiple categories.
- Hooked the portfolio buff into star multipliers and quick-reward payouts for cash, stars, coins, and XP.
- Surfaced the portfolio bonus in quick-reward toasts to keep the feedback loop clear.

## M3.5 Slice Notes (Price data strategy — with fallback)
- Added a deterministic stock price resolver that anchors pricing to composite scores with seeded jitter and a stable fallback range.
- Wired Supabase universe mapping to the new price resolver so live cards get consistent, mobile-friendly price bands without mutating schema.
- Updated demo/mock stock selection to reuse the shared price resolver and provide a safe placeholder when category lists are empty.

---

## M5.0 Audit Notes (Shop 2.0 decision)
**Current shop surfaces:**
- **Desktop/tablet:** `ShopModal` uses stars-based inventory with categories (powerups/upgrades/cosmetics/currency) and confirmation flow.
- **Mobile:** `MobileShop` swaps to cash-based purchases with a two-tab layout: utilities items + a **Property Vault** album grid.
- **Data sources:** `shopItems.ts` holds both legacy stars items and a separate vault data set; mobile uses `usePurchase` (no inventory persistence yet).

**Decision:** Implement Shop 2.0 as a **feature-flagged, parallel flow** that can reuse the existing Property Vault UI patterns while keeping the legacy stars shop intact. This avoids regressions and preserves the dual-currency split until Shop 2.0 is fully wired.

## M5.2 Slice Notes (Supabase Shop 2.0 schema)
- Added vault catalog tables for seasons, sets, and items, plus ownership and progress tracking tables for players.
- Enabled RLS with public read access for catalog tables and per-user access for progress/ownership rows.
- Added updated_at triggers for season/set/progress records to keep UI sync-friendly.

## M5.3 Slice Notes (Vault overview UI)
- Wired the Shop 2.0 modal to show seasons, sets, and collection progress using live Supabase data with fixture fallback.
- Added season/set progress cards that stay mobile-first and preview-ready when Supabase isn’t configured.

## M5.4 Slice Notes (Set detail UI)
- Added a set detail panel with a 4×3 item grid to preview collectible tiles, ownership status, rarity, and pricing.
- Updated Shop 2.0 selection flow to highlight the active set and keep a default selection when data loads.

## M5.5 Slice Notes (Atomic purchase function)
- Added an atomic vault purchase RPC to insert ownership records and update set/season progress in a single transaction.
- Wired Shop 2.0 set detail cards with purchase buttons that spend currency and mark items as owned.

## M5.6 Slice Notes (Set completion + unlock next set)
- Added sequential unlock logic so each Vault set opens after the prior set completes.
- Updated the Shop 2.0 UI to surface locked sets, default to the next available set, and block purchases on locked collections.

## M5.7 Slice Notes (Album completion + mega reward)
- Added season-level album completion status to the Shop 2.0 overview data.
- Surfaced a mega reward callout per season that unlocks once all sets are complete.

## M5.8 Slice Notes (Window integration — discounts, flash)
- Wired active event shop discounts into Shop 2.0 pricing so vault items respect flash window savings.
- Added a mobile-first Shop 2.0 flash window banner that highlights live discounts.

## M6.1 Slice Notes (Audit free roll regen)
- Energy regen uses a 2-hour reset that sets rolls to 30 (capped at 50) via `getResetRollsAmount` and `ENERGY_CONFIG` in `energy.ts`, with checks running every minute in `App.tsx`.
- Daily rolls remain separate: `DAILY_ROLL_LIMIT` (10) resets at midnight using `rolls_reset_at` in `useGameSave`, while `energy_rolls` persists the per-session regen count.
- Noted config mismatch: `ENERGY_REGEN_MINUTES` in `constants.ts` is 30 but not used by the regen logic (which is 120 minutes), so future regen perks should standardize on one config source.

## M6.2 Slice Notes (Vault progress tables + UI meter)
- Added a Shop 2.0 vault profile progress table to store per-player vault XP/level data with RLS and updated_at triggers.
- Wired the Shop 2.0 overview hook to fetch vault progress (with fixture fallback) and surfaced a mobile-first vault level meter in the Shop 2.0 UI.

## M6.3 Slice Notes (Increment XP on purchase)
- Updated the Shop 2.0 vault purchase RPC to add XP gains per purchase using a price-based formula.
- Added a shared vault XP helper and wired Shop 2.0 preview purchases to increment local XP alongside ownership.

## M6.4 Slice Notes (Level-up detection + claim records)
- Added vault level-up claim tracking and updated the purchase RPC to handle level progression.
- Updated Shop 2.0 vault progress calculations to surface pending level rewards in the UI.
- Fixed a Shop 2.0 discount callback ordering issue that caused a "shopWindow" initialization error in the app.

## M6.5 Slice Notes (Apply roll regen boost perk)
- Added vault-level regen bonus helpers and hooked the bonus into the 2-hour dice reset amount.
- Surfaced the vault perk bonus in the out-of-rolls modal so players can see their boosted reset amount.

## C1.1 Slice Notes (Economy config seed)
- Seeded a central economy config JSON file for energy and vault regen defaults.
- Added a normalization helper to export energy configs from the JSON file and keep fallbacks safe.
- Updated the run-by-run plan to track the new config strategy slice.
- Re-exported energy config constants from `energy.ts` to keep existing imports working.

## C1.2 Slice Notes (Shop vault config seed)
- Added a shop vault config JSON seeded with seasons, sets, fixtures, and XP curve defaults.
- Normalized the shop vault config so fixtures, level curve, and discount values can be tuned in one place.
- Routed Savings Surge event discounts through the shared shop vault discount setting.

## C1.3 Slice Notes (Ring config seed)
- Seeded a central ring config JSON with ring rewards and portal defaults for tuning outside the app bundle.
- Added a normalization helper to export ring configs with safe fallbacks that mirror current behavior.
- Logged the slice completion and refreshed the repo map pointer for ring config ownership.

## M7.1 Slice Notes (Audit board renderer + tile overlays)
- Confirmed board layout rendering lives in `App.tsx` using ring-based `calculateTilePositions` helpers and per-ring scale factors, with `BoardViewport` (classic zoom) + `Board3DViewport` (camera transform) handling layout constraints.
- Verified tile overlay treatments in `Tile.tsx` including type badges, ownership marker, portal/teleport highlights, and ring state classes (revealing/locked) to inform the upcoming label component.
- Noted that ring layers and tile overlays are gated by ring visibility/opacity helpers, so new label overlays should follow the same pointer-events and ring-reveal rules.
- Centralized tile label decision logic in a dedicated helper so overlay auditing and tuning live alongside the board renderer without expanding `App.tsx`.

## M7.2 Slice Notes (Implement tile label component)
- Added a reusable `TileLabel` component with tone variants, icon/sublabel support, and mobile-first styling for future price pops.
- Extended the `Tile` renderer to accept an optional label config and render the overlay when ring content is visible.
- Tuned the label sizing to support compact Ring 3 layouts while keeping Ring 1/2 labels readable.

## M7.3 Slice Notes (Hook labels to tile data)
- Added ring-aware tile label configuration so category, event, and learning tiles surface compact labels without new layout wrappers.
- Surfaced elite ring win rewards with a compact currency label so Ring 3 prize tiles read as high-value targets at a glance.
- Applied ring multiplier sublabels on stock tiles to reinforce reward scaling on Rings 2 and 3.

## P1.1 Slice Notes (Wheel of Fortune playable demo in Games Hub)
- Marked Wheel of Fortune as playable in the mini-games hub and gated game opening to playable entries only.
- Reused the existing Wheel of Fortune modal inside the hub with demo balances, spins remaining, and sound feedback.
- Added a lightweight demo ledger (cash, stars, rolls, XP) so wheel rewards remain visible during hub play.

## P1.2 Slice Notes (Portal animation polish)
- Added portal beam and ripple layers to give ring transitions a more dimensional, mobile-first visual treatment.
- Tuned portal timing and overlay opacity so the transitions feel smoother without washing out the board.
- Routed portal particle travel using the tracked viewport height for consistent effects across screen sizes.

## Ring Transition Animations Slice Notes
- Added direction-aware ring transition pulses so ascend/descend moments brighten or cool the board container without disrupting mobile transforms.
- Wired portal-driven ring transitions to trigger the new up/down focus animation while clearing prior ring transition timers safely.

## P1.3 Slice Notes (Roulette victory sequence)
- Added a dedicated roulette victory modal with tier-based styling and celebration effects to headline roulette wins.
- Wired roulette spins to open the victory sequence and reset it cleanly between spins or mode resets.
- Surfaced reward recap messaging in the modal to reinforce roulette payouts on mobile.

## P1.4 Slice Notes (Happy Hour wheel scheduling in Games Hub)
- Wired the mini-games hub to use the mini-game schedule hook so Wheel of Fortune opens only during Happy Hour windows.
- Added availability messaging on the Wheel of Fortune card to show live Happy Hour countdowns or the next scheduled start time.
- Kept the rest of the hub unchanged so non-scheduled games remain visible without new gating.
- Tightened mobile UX by disabling focus/interaction on closed cards and sizing the availability label for smaller screens.

## P1.5 Slice Notes (Stock Rush timed mini-game surface)
- Built a mobile-first Stock Rush timed-event surface with discount, bonus-star, and limited-supply callouts aligned to the master plan.
- Added rush pick cards with discounted pricing, claimed progress, and quick-buy CTAs to communicate urgency.
- Wired the mini-games hub to show Stock Rush schedule availability so the card opens only during live rush windows.

## P1.6 Slice Notes (Vault Heist timed mini-game surface)
- Built a mobile-first Vault Heist event surface with lane selection, crew boost messaging, and alarm risk callouts.
- Wired the mini-games hub Vault Heist card to show schedule availability and open only during live heist windows.
- Added live status messaging with countdown-friendly labels to keep the Saturday heist cadence clear.
- Logged the ongoing Vault Heist evolution plan in `apps/investing-board-game-v3/VAULT_HEIST_EVOLUTION.md`.

## P2 Slice Notes (Market Mayhem timed mini-game surface)
- Built a mobile-first Market Mayhem trading-floor surface with flash signal cards, rapid decision buttons, and leaderboard framing.
- Added monthly-random schedule support to surface Market Mayhem availability in the mini-game schedule pipeline.
- Wired the Games Hub to gate Market Mayhem access with live/upcoming schedule messaging for the timed surge windows.

## P3 Slice Notes (Portfolio Poker timed mini-game surface)
- Built a mobile-first Portfolio Poker timed-event surface with hand-combo bonuses, opponent lineup callouts, and round flow framing.
- Added schedule metadata for Portfolio Poker so the mini-game availability system can surface pending or live window labels.
- Wired the Games Hub card to show Portfolio Poker availability and lock access until the event window is live.

## P3 Slice Notes (Dividend Derby timed mini-game surface)
- Built a mobile-first Dividend Derby event surface with lane bonuses, lineup cards, and photo-finish messaging for the monthly showcase.
- Added monthly schedule metadata for Dividend Derby so the mini-game availability system can surface upcoming windows.
- Wired the Games Hub card to show Dividend Derby availability labels and gate access until the derby is live.

## P3 Slice Notes (Bull Run timed mini-game surface)
- Built a mobile-first Bull Run timed-event surface with momentum lane selections, surge picks, and streak-based callouts to match the rally loop.
- Added daily schedule metadata for Bull Run so the mini-game availability system can surface live/upcoming windows.
- Wired the Games Hub card to show Bull Run availability labels and gate access until the rally window is live.

## P3 Slice Notes (Bear Trap timed mini-game surface)
- Built a mobile-first Bear Trap timed-event surface with defense pod selections, alert stream callouts, and rebound bonus framing to match the bear-market loop.
- Added a nightly Bear Trap schedule slot so the mini-game availability system can surface live/upcoming drop windows.
- Wired the Games Hub card to show Bear Trap availability labels and gate access until the drop window is live.

## P3.1 Slice Notes (Advanced casino games audit)
- Confirmed the Casino modal is a thin wrapper over the Scratchcard mini-game, with no lobby or game selection surface yet.
- Noted the Scratchcard game uses a fixed 30% base win chance (plus the casino luck boost item) and fixed $5,000 payout with no ties to event-based guaranteed wins.
- Verified the Casino Happy Hour event exposes a guaranteed-win flag via `useEvents`, but the casino flow currently does not consume it; this should be the first integration target.
- Scoped the first new casino surface as a small lobby with one additional game card (proposed: High Roller Dice) that reuses existing reward toasts and respects event-based win guarantees.

## P3.2 Slice Notes (Scratchcard 2.0 tier selection polish)
- Enhanced the Casino modal tier selection cards with odds, grid size, and top-prize callouts for faster ticket comparison.
- Added winning-line badge overlays on scratchcard tiles, keeping line color accents aligned with the win summary list.
- Updated the scratchcard evolution doc to log the new visual progress and define the next UI slice.

## P3.3 Slice Notes (Scratchcard 2.0 next-level reveal polish)
- Added an SVG noise scratch-mask texture to the scratch overlay for a more tactile ticket feel.
- Introduced scratch progress messaging plus a fast-reveal CTA that unlocks after a few scratches.
- Logged the new scratch polish step and queued sound/haptic feedback as the next slice.

## P3.4 Slice Notes (Scratchcard 2.0 tactile feedback)
- Added scratch sound + haptic cues on tile reveals, fast reveal, and win outcomes to make ticket play feel more tactile.
- Routed win feedback through reward-based sound selection while keeping miss feedback subtle.
- Updated the scratchcard evolution doc with the new completion and next UI polish step.

## P3.5 Slice Notes (Scratchcard 2.0 win-line sparkles)
- Added pulsing win-line highlight animation so winning tiles feel more celebratory after reveal.
- Introduced big-win sparkle overlays on winning tiles to emphasize jackpot-caliber outcomes.
- Updated the scratchcard evolution doc with the next UI polish step.

## P3.6 Slice Notes (Scratchcard 2.0 odds peek CTA)
- Added a lightweight “See odds + EV” CTA in the scratchcard header to surface win chances and prize tables.
- Included estimated EV ranges and per-currency payout summaries so odds feel transparent without leaving the ticket.
- Updated the scratchcard evolution doc with the next reuse-focused step.

## P3.7 Slice Notes (Scratchcard 2.0 odds helper reuse)
- Extracted scratchcard EV math into a shared helper so odds calculations stay consistent across surfaces.
- Reused the odds helper in the Casino modal tier preview to show estimated EV ranges alongside prize tables.
- Updated the scratchcard evolution doc with the next validation step for the shared helper.

## P3.8 Slice Notes (Scratchcard 2.0 odds helper coverage)
- Added lightweight Vitest coverage for the shared scratchcard odds helper to lock in EV math expectations.
- Validated EV ranges and per-currency summaries stay in sync with tier odds + prize tables.
- Updated the scratchcard evolution doc with the next odds-modifier step.

## P3.9 Slice Notes (Scratchcard 2.0 odds modifiers)
- Added event-aware odds modifiers (casino luck + happy hour) to the scratchcard odds helper and preview surfaces.
- Wired guaranteed-win Happy Hour boosts into scratchcard grid generation so outcomes align with the previewed odds.
- Updated the scratchcard evolution doc with the next event-override step.

## P3.10 Slice Notes (Scratchcard 2.0 event override config)
- Added a scratchcard event override config to boost odds and swap themed symbols during limited-time promos.
- Wired active event overrides into the Casino modal tier previews and scratchcard game tier selection.
- Updated the scratchcard evolution doc with the next UI banner/styling step.

## P3.11 Slice Notes (Scratchcard 2.0 ticket value chips)
- Added compact cost vs. EV chips to each scratchcard ticket option so value comparisons are easier at a glance.
- Kept the chips aligned with the existing tier odds preview and event-aware odds calculations.
- Updated the scratchcard evolution log with the next event banner styling step.

## P3.12 Slice Notes (Scratchcard 2.0 event ticket banners)
- Added limited-time event banners to each scratchcard ticket option to spotlight promo odds boosts.
- Included boosted-odds callouts inside the selected ticket preview so the event benefits stay visible during selection.
- Updated the scratchcard evolution log with the next in-ticket banner step.

## P3.13 Slice Notes (Scratchcard 2.0 in-ticket event banner)
- Added an in-ticket event bonus banner on the scratchcard surface with a direct CTA to view boosted odds.
- Mirrored event boost copy in the ticket view so players see the promo context while scratching.
- Marked the scratchcard event CTA work complete and queued the casino lobby teaser card as the next slice.

## P3.14 Slice Notes (Casino lobby entry + High Roller Dice teaser card)
- Added a config-first Casino lobby entry with game cards so players land on a selection screen before scratchcards.
- Introduced a High Roller Dice teaser card with a coming-soon CTA alongside the live Scratchcard Vault entry.
- Seeded a casino lobby config file so future game cards can be tuned without touching component logic.

## P3.15 Slice Notes (High Roller Dice playable demo + Happy Hour guaranteed-win integration)
- Promoted High Roller Dice from teaser to live with a config-first table, risk tiers, and streak boosts.
- Built a mobile-first dice surface inside the casino modal with roll outcomes, streak tracking, and payout callouts.
- Applied Casino Happy Hour guaranteed wins (plus Casino Luck boosts) to the dice roll flow so event effects match scratchcards.

## P3.16 Slice Notes (High Roller Dice reward tuning + audio/FX polish)
- Tuned the High Roller Dice config for higher stakes, a longer streak cap, and sharper payout pacing per table.
- Added roll feedback audio + haptics for dice rolls, landings, wins, and misses to match other casino surfaces.
- Polished the dice outcome panel with rolling-state feedback, win glow styling, and max streak payout callouts.

## P3.17 Slice Notes (High Roller Dice odds + payout preview helper)
- Added a shared High Roller Dice odds helper that calculates win chance, streak multipliers, and payout expectations.
- Surfaced win chance and EV preview copy on each dice table option to help players pick a risk tier.
- Expanded the dice table summary to show base vs boosted win odds, EV per roll, and max streak payout.

## P3 Slice Notes (IPO Frenzy timed mini-game surface)
- Built a mobile-first IPO Frenzy timed-event surface with allocation playbooks, pop signals, and roadshow framing for IPO launches.
- Added a weekly IPO Frenzy schedule slot so the mini-game availability system can surface live/upcoming IPO windows.
- Wired the Games Hub card to show IPO Frenzy availability labels and gate access until the window is live.

## P3 Slice Notes (Merger Mania timed mini-game surface)
- Built a mobile-first Merger Mania timed-event surface with deal targets, negotiation levers, and integration tracks for the M&A sprint.
- Added a weekly Merger Mania schedule slot so the mini-game availability system can surface live/upcoming deal windows.
- Wired the Games Hub card to show Merger Mania availability labels and gate access until the deal window is live.

## Master Plan Mini-Game Status Sync Slice Notes (Completed ✅)
- Updated the master plan mini-game status table to mark implemented mini-games as complete and list their source files.
- Added newer timed-event mini-games to the master plan status table so planned vs shipped remains accurate.

## P4.1 Slice Notes (Holiday event schedule fixtures)
- Added seasonal special-event fixtures to the events catalog so the calendar can surface holiday reward windows.
- Tuned reward multipliers and currency rules for seasonal moments like Founders Day, Summer Festival, and Holiday Rally.

## P4.2 Slice Notes (Rare event calendar callouts)
- Added a rare-event badge to highlight Alpha Day, Mega Jackpot, and Jackpot Week in the event calendar.
- Kept the calendar layout mobile-first while adding lightweight rarity cues in the selected-date and upcoming lists.

## P4.3 Slice Notes (Mega Jackpot boost)
- Applied a Mega Jackpot event boost so Jackpot Week payouts get a bonus multiplier when the monthly Mega Jackpot window is live.
- Updated Jackpot Week win messaging to acknowledge the Mega Jackpot boost when active.

## M3.5 Slice Notes (Price data strategy with fallback)
- Added a stock price resolver that prefers live market prices when available, with deterministic seed-based fallback pricing.
- Updated universe stock mapping to pick up optional price fields without breaking Supabase fetches.
- Logged the slice completion and refreshed the repo map pointer for price strategy ownership.

## P3 Slice Notes (Stock category audit + config hooks)
- Added a shared stock category catalog with tiering and palette metadata to prep for expansion categories like international equities.
- Wired portfolio visuals to read labels/colors from the shared catalog so future category rollouts stay consistent across charts and badges.
- Updated universe stock bucketing to use the shared category lists while keeping the core category order intact.

## P3 Slice Notes (Expansion category tiles + mock data coverage)
- Added expansion category stock tiles to the Ring 1 + Ring 2 mock board data so IPO, meme, crypto, penny, leverage, options, and international lanes appear in board flow.
- Expanded mock stock coverage with sample listings for every expansion category so fallback stock pulls remain deterministic when Supabase data is absent.
- Rebalanced the Ring 2 stock tile mix toward expansion categories while keeping the ring tile count intact.

## P3 Slice Notes (Expansion category tuning + tile copy pass)
- Tuned expansion category metadata so international stocks sit alongside the other expansion themes in the shared catalog.
- Refreshed expansion tile titles on Rings 1 and 2 to better match the category fantasy.
- Updated expansion stock blurbs with sharper, mobile-friendly copy for the mock universe.

## P2.1 Slice Notes (Soothing sound system)
- Added a soft low-pass filter and warmer triangle waveform defaults to the Web Audio synth nodes to reduce harshness.
- Tuned reward, portal, and UI tones to use filtered voices with smoother envelopes for more pleasant feedback.

## P2.2 Slice Notes (Ring-based leaderboards)
- Expanded the ring leaderboards to show Ring 1, Ring 2, and Ring 3 rankings so progression cohorts have their own leaderboard views.
- Updated the ring leaderboard fetch to pull top entries per ring and keep the Hall of Fame view powered by throne counts.
- Ensured the leaderboard footer highlights the current user within the active ring tab for clear ranking context.

## P2.3 Slice Notes (Advanced portfolio analytics)
- Added portfolio insight blocks to highlight invested capital, unrealized gains, diversification, and top performer at a glance.
- Surfaced per-holding value and P/L metrics so portfolio performance is easier to scan in the modal.

## P2 Slice Notes (Ring history tracking)
- Added ring history tracking fields (counts, last visit, and recent transitions) to player stats for long-term progression analytics.
- Wired ring transitions (movement hops, portal jumps, manual jumps, and throne resets) to log ring visit history consistently.

## P2.4 Slice Notes (Event system audit — limited-time windows)
- Audited the event engine scheduling (recurring, special, monthly rotation, Alpha Day, Jackpot Week) and confirmed it is driven off client-local time with minute-based polling for start/end transitions.
- Reviewed mini-game window scheduling (daily/weekly/monthly-random) and confirmed deterministic monthly-random slots via seeded RNG plus minute-based refresh for availability.
- Noted the current split between event windows and mini-game windows, with no shared window engine or server-time sync, as the primary limitation to address in a future window unification pass.

## P2.5 Slice Notes (Sound effects pass — HUD button feedback)
- Added soft button-click audio feedback for Compact HUD controls (background toggle, settings, stocks, expand/collapse).
- Ensured the mute toggle plays a click when unmuting without firing audio when muting.

## P2.6 Slice Notes (More case studies)
- Expanded the bias case study catalog with new scenarios on loss aversion, herding, and overconfidence.
- Added quiz prompts to reinforce the new case studies inside the Bias Sanctuary flow.
- Kept case study content mobile-friendly with concise scenarios and focused explanations.

## P2.7 Slice Notes (Bias Sanctuary visual story mode)
- Added scrollable story mode panels to Bias Sanctuary case studies with hook → tension → decision → consequence → reflection beats.
- Included per-panel mood treatments, decision callouts, and audio cue metadata with a mute toggle tied to existing sound settings.
- Added a takeaway badge step and resume/skip controls before the quiz so players can move between story and quiz smoothly.

## P2.8 Slice Notes (Bias Sanctuary ambient audio cues)
- Added story-level ambient audio cues that play once when entering story mode and reset between sessions.
- Surfaced ambient audio captions in the story header so players know the background tone they’re hearing.
- Applied ambient audio metadata to the bias story fixtures for consistent fallback behavior.

## P2.9 Slice Notes (Seasonal battle pass UI wiring)
- Wired the Season Pass overlay to the HUD so players can open the seasonal tier track on mobile.
- Hooked season point rewards from challenges into the Season Pass progression helper.
- Added overlay registry support for the Season Pass modal to keep overlay rendering consistent.

## P1 Elite Stock Special Behaviors Slice Notes
- Added an elite stock purchase bonus that awards extra stars and XP based on composite score with live economy multipliers.
- Updated elite stock buys to track bonus stars in stats and surface a dedicated bonus toast on purchase.

## P0 Multi-ring UI Rendering Slice Notes
- Synced the phone 3D board ring tile counts with the canonical ring configuration so inner rings render at the correct scale and position.
- Normalized mobile ring position math to use the configured tile counts, keeping multi-ring UI rendering consistent with ring data.

## Wealth Run Roulette Loop Slice Notes
- Expanded the roulette reward table with long-tail rewards (rolls, XP) and richer mid-tier prizes to smooth the payout curve.
- Added a mobile-first roulette status panel that highlights live mode, latest reward, and the long-tail reward mix.
- Reset roulette session stats on activation and track completed roulette spins for clearer loop feedback.

## M8.1 Slice Notes (Economy telemetry sinks)
- Added a telemetry helper with opt-in consent, console logging in dev, and local storage buffering for lightweight economy event sinks.
- Wired economy window start/end events, roll rewards, tile landings, and quick reward grants into the telemetry pipeline for future tuning passes.

## M8.2 Slice Notes (Telemetry review + tuning pass)
- Added shared telemetry context metadata (app + session identifiers) so events are easier to group during tuning.
- Seeded telemetry context with the runtime mode at app boot for clearer filtering between dev and prod sessions.

## M10.1 Slice Notes (Event tile activation audit)
- Inventory every event + corner tile title and document which ones are placeholder vs wired.
- Map each “marketing” tile title to a concrete experience concept (choice, mini-game, reward flow).
- Define Tier 1 vs Tier 2 activation priorities with small, shippable scopes.

## M10.2 Slice Notes (Tier 1 event tile activations)
- Added Tier 1 event tile definitions for Analyst Call, News Flash, Executive Event, and Board Meeting with choice-driven rewards.
- Built a reusable event choice modal for the new event tiles with mobile-first option cards.
- Wired event tile landings to trigger the new decision flow, apply ring-aware rewards, and log telemetry.

## M10.3 Slice Notes (Court of Capital activation)
- Added a Court of Capital corner tile reward briefing with two strategy options and mobile-first copy.
- Wired the corner tile to reuse the event choice modal and reward handler so ring multipliers and telemetry stay consistent.
- Updated the repo map and next slice pointer to reflect the new corner tile activation.

## M10.4 Slice Notes (Event tile copy + reward tuning pass)
- Refreshed Tier 1 event tile copy with sharper marketing hooks so each choice reads like a headline moment.
- Tuned Tier 1 reward ranges for a slightly stronger mid-game pulse while keeping reward types unchanged.
- Updated Court of Capital copy + reward previews to align with the refreshed headline tone.

## M10.5 Slice Notes (Tier 2 event tile activation scope)
- Scoped Tier 2 event tiles to focus on Market Event + Wildcard activation as the next shippable slice.
- Drafted a plan-only Tier 2 tile scope list (intent, reward types, experience notes) to keep upcoming activation work config-first.
- Documented how Market Event should evolve into a choice-based macro pulse while Wildcard routes into the existing ring-aware wildcard flow.

## M10.6 Slice Notes (Tier 2 event tile activation)
- Routed Wildcard tiles into the existing ring-aware wildcard flow (including the Ring 2 Hidden Gem vs Fraud split).
- Replaced the Market Event headline modal with a choice-based macro pulse that offers risk-on, safe-harbor, and XP momentum options.
- Kept Market Event currency earn + Market Shield protection intact while upgrading the player-facing choice UI.

## M10.7 Slice Notes (Tier 2 event tile polish)
- Tuned Market Event reward ranges so the Tier 2 choice options feel like a meaningful mid-game pulse.
- Refreshed Market Event headline strings to read like sharper market tape alerts.
- Updated Market Event option callouts to match the new reward tuning.

## Fall Portals + Chance Lift Slice Notes
- Added Ring 2 fall portal safety-net rewards so some drops grant a bonus roll, stars, or coins before returning to Street Level.
- Expanded Chance Card outcomes with randomized executive perks alongside the jackpot lift to the Wealth Run for richer mid-ring stakes.
- Updated Chance Card copy to reflect the broader outcome mix and chance-lift narrative.

## M5 Slice Notes (Property Vault unlock feedback)
- Added clear error messaging when Property Vault unlocks fail due to insufficient cash.
- Ensured mobile Vault unlocks only mark ownership after the cash spend succeeds so the UI reflects real purchases.

## Master Plan Status Sync Slice Notes (Completed ✅)
- Synced the master plan status table with completed systems so the master doc reflects recent slices.
- Cleared stale in-progress/planned entries that are now tracked in `DEV_PLAN.md`.
- Kept the master plan focused on system status while leaving slice sequencing to the run-by-run plan.

## Master Plan Event Schedule Status Sync Slice Notes (Completed ✅)
- Updated the master plan event schedule table to mark Happy Hour Wheel and Stock Rush as shipped.
- Marked special-event entries (Vault Heist, Mega Jackpot, Market Mayhem, Holiday Events) as implemented in the master plan.
- Reframed the old upcoming PR list as completed work so the master plan no longer advertises shipped features as planned.

## M0.4 Slice Notes (Lazy-load Portfolio charts)
- Lazy-loaded the Portfolio modal so chart dependencies no longer block initial app startup.

## M1.2 Slice Notes (Start behavior: land-only ring transitions)
- Updated start tile portal behavior so passing the portal no longer triggers ring transitions; only exact landings move between rings or reach the throne.

## M1.3 Slice Notes (Bull Market window → ring 2 quick entry)
- Added a Bull Run Rally event effect that opens a Bull Market window.
- During the window, passing the Ring 1 start portal ascends directly to Ring 2 for quick entry.

## M1.4 Slice Notes (Middle-ring wildcard outcomes)
- Added a Ring 2 wildcard outcome split so "Hidden Gem" (20%) vs "Fraud Alert" (80%) fires on the middle ring.
- Kept the existing wildcard pool for Rings 1 and 3.

## M1.5 Slice Notes (Stock tile ascend meter)
- Added an ascend meter that fills by landing on stock tiles, granting 1–3 points per landing.
- Triggered an automatic portal lift to the next ring when the meter reaches 100, resetting the counter.
- Added a mobile HUD meter so players can track progress toward the next ring.
- Fixed portal animation hook ordering to prevent React 310 errors on ring transitions.

## M1.1 Slice Notes (Audit ring movement + portal behavior)
- Verified portal rules in `movementEngine` and `App.tsx` match the master plan: Ring 1 ascends only on exact landings, and Ring 2/3 start tiles remain stable anchors on both pass and land.
- Confirmed portal behavior is driven by `PORTAL_CONFIG` with optional overrides for event-driven exceptions (e.g., Bull Market window), keeping transitions deterministic and configurable.
- Documented the ring/portal flow so future portal adjustments can stay repo-first and avoid movement engine rewrites.

## P3.18 Slice Notes (High Roller Dice streak recap + session stats)
- Added session stats for High Roller Dice to track rolls, win rate, total payout, and best streak during a casino visit.
- Added a streak recap line when a streak ends so players can see the length and payout of their latest run.
- Updated the next slice pointer to focus on a follow-up session reset + buy-in selector pass.

## P3.19 Slice Notes (High Roller Dice session reset + buy-in selector)
- Added a config-first buy-in selector with tiered entries and payout multipliers for High Roller Dice.
- Scaled table payouts/EV previews based on the selected buy-in and surfaced the boost alongside streak stats.
- Added a session reset control to clear streak + session stats when swapping buy-ins or restarting a run.

## P3.20 Slice Notes (High Roller Dice buy-in spend + balance guardrails)
- Deducted the selected buy-in entry cost on each High Roller Dice roll so payouts sit on real bankroll spend.
- Added cash-balance guardrails that block unaffordable buy-ins and disable rolls until players can cover the entry.
- Surfaced balance + shortfall messaging in the dice table UI to keep buy-in requirements clear on mobile.

## P3.21 Slice Notes (High Roller Dice bankroll guidance + balance recovery CTA)
- Added a config-first bankroll guidance panel with buffer targets and recommended buy-in messaging.
- Surfaced a balance recovery CTA that routes players to Scratchcard Vault when cash is too low.
- Kept bankroll messaging aligned with buy-in buffer math so the table guidance stays actionable.

## P5.2 Slice Notes (Vault Heist free-pick window reset persistence)
- Added config-driven Vault Heist free-pick reset rules with window-aware persistence.
- Stored remaining free picks per Vault Heist window so reloads keep the same allowance during the live event.
- Reset the free-pick counter automatically when a new Vault Heist window starts.

## P5.3 Slice Notes (Vault Heist schedule + reset rules config)
- Moved the Vault Heist schedule definition into config so window timing is data-driven.
- Centralized Vault Heist schedule defaults in the config loader with validation fallbacks.
- Updated mini-game scheduling to read the Vault Heist window from config.

## P5.4 Slice Notes (Vault Heist schedule copy callouts)
- Added config-driven schedule copy for the Vault Heist surface so timing messaging can be tuned without code edits.
- Wired the Vault Heist UI callouts to read overview, window detail, and signal copy from the Vault Heist config.
- Made the heist window duration label derive from the schedule config to keep UI aligned with timing rules.

## P5.5 Slice Notes (Vault Heist schedule-aware availability)
- Replaced Saturday-only Vault Heist gating with schedule-aware availability derived from the mini-game schedule engine.
- Updated HUD entry availability to follow the live Vault Heist window instead of a hardcoded weekday check.

## P5.6 Slice Notes (Vault Heist HUD/CTA availability messaging)
- Added config-driven CTA messaging for Vault Heist live/upcoming status so HUD buttons show time-aware availability callouts.
- Displayed Vault Heist status badges on desktop + phone floating buttons, including countdowns during live windows.
- Kept the CTA styling mobile-first while disabling the vault button when the heist is upcoming.

## P5.7 Slice Notes (Vault Heist CTA fallback to Games Hub)
- Added a config-driven action flag to route upcoming Vault Heist CTAs into the Games Hub instead of hard-disabling the button.
- Enabled the desktop + phone Vault Heist floating buttons to open the Games Hub when the heist is upcoming.
- Kept live windows routed directly into the Vault Heist modal while preserving the status pill copy.

## P5.8 Slice Notes (Vault Heist Games Hub teaser + countdown copy)
- Added a Vault Heist teaser panel to the Games Hub so upcoming windows get a dedicated callout ahead of the grid.
- Introduced config-driven teaser copy (headline, description, CTA labels) to keep the panel tuned without code edits.
- Swapped the upcoming heist label to use a config-driven countdown string for more urgent availability messaging.

## P6.1 Slice Notes (Advanced casino game selection + config stub)
- Chose Market Blackjack as the next advanced casino game, framed around volatility hands and earnings-season side bets.
- Added a config-first stub for the Market Blackjack lobby card, table limits, and side bet hooks to keep the next slice implementation-ready.
- Logged the slice completion and advanced the next step to the minimal playable loop build.

## P6.2 Slice Notes (Market Blackjack minimal playable loop)
- Built a mobile-first Market Blackjack table with bet controls, side bet toggles, and a playable hit/stand loop.
- Added configurable payout and side bet tuning inputs (dealer stand rule, side bet cost rate, payout multipliers).
- Wired Market Blackjack into the casino lobby as a live table with round recaps and cash balance guardrails.

## P6.3 Slice Notes (Market Blackjack payout tuning + odds helper coverage)
- Added config-first blackjack odds assumptions (main hand + side-bet hit chances) so payout tuning remains data-driven.
- Added a Market Blackjack odds helper module that computes expected payouts and side-bet EV from config and current wager.
- Surfaced an in-table odds helper panel and added vitest coverage for bounded probabilities, luck-boost effects, and side-bet math.

## P6.17 Slice Notes (AI insights cooldown row spacing/tone polish)
- Added config-driven spacing and tone tokens for the AI insights auto-refresh cooldown row to keep layout polish tunable without modal rewrites.
- Updated the AI Insights modal helper and description copy to use due-now vs on-track tone classes from config, improving urgency signaling in stale states.
- Kept chip row spacing config-first with a dedicated cooldown row class token so future UI tweaks stay data-driven.
