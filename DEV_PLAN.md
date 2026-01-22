# DEV_PLAN.md — AlphaStocks / MarketTycoon

## Purpose
This is the **single master dev plan** for the board game work. Every run updates this file and `CHANGELOG_DEV.md` (and `ENV_NOTES.md`/`MIGRATIONS_LOG.md` only when applicable).

## Key start prompt (short, reusable)
Use this exact prompt to kick off a run and keep the plan in scope:
> **“Follow `DEV_PLAN.md` (one slice, mobile-first, repo-first). Update `DEV_PLAN.md` + `CHANGELOG_DEV.md` every run.”**

## Existing Master Plan Reference (do not duplicate)
There is a broader, long-form master plan already in the repo. Keep this file as the **run-by-run execution plan** and cross‑reference the long plan instead of rewriting it:
- `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` (core vision, loop, ethics, ring overview). Align slices here with that doc to avoid drift.

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
#### Frontend
- **Legacy static pages entry:** `/index.html`, `/about.html`, `/faq.html`, `/monthly/`, `/weekly/`, `/superinvestor/`
- **Vite + Preact app:** `/apps/investing-board-game-v3` (built into `/public/board-game-v3` via `npm run build:board-game-v3`)
- **Routing system:** No router; UI mode/state machine in `apps/investing-board-game-v3/src/lib/uiModeStateMachine.ts` + context `src/context/UIModeContext.tsx`
- **State management/store:** Local React state in `src/App.tsx` plus contexts in `src/context/*` (Auth, Overlay, UI Mode); custom hooks in `src/hooks/*`
- **Game loop entry:** `src/App.tsx` (dice roll → `calculateMovement` in `src/lib/movementEngine.ts`), board data in `src/lib/mockData.ts`
- **UI components:** `src/components/*` (board, modals, overlays), shop UI in `src/components/ShopModal.tsx` + `src/components/shop/*` (mobile shop shell, property vault album cards)
- **Wheel of Fortune rewards + daily spin caps:** `src/App.tsx` + `src/components/WheelOfFortuneModal.tsx`
- **Shop 2.0 entry:** `src/components/Shop2Modal.tsx` (feature-flagged Shop 2.0 preview shell)
- **Shop 2.0 vault data:** `src/hooks/useShopVaultOverview.ts` + `src/lib/shopVaultFixtures.ts` (season/set overview + fallback fixtures)
- **Shop 2.0 purchases:** `src/hooks/useShopVaultPurchase.ts` (atomic vault buy + currency spend)
- **Shop 2.0 windows/discounts:** `src/components/Shop2Modal.tsx` + `src/hooks/useShopVaultPurchase.ts` (event window discount pricing + purchase spend)
- **Shop 2.0 unlock rules:** `src/hooks/useShopVaultOverview.ts` (set completion gating for the next set)
- **Animation utilities:** `src/lib/animations.ts`, `src/hooks/useBoardCamera.ts`, `src/hooks/useCameraAnimation.ts`

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
- **Dice/energy caps:** `src/lib/constants.ts` and `src/lib/energy.ts`
- **Multipliers/leverage:** `src/lib/constants.ts` (`MULTIPLIERS`) + ring multipliers in `src/lib/rewardMultiplier.ts`
- **Shop/estate logic:** `src/hooks/useShopInventory.ts` (stars-based purchases), `src/hooks/usePurchase.ts` (mobile cash purchases), `src/lib/shopItems.ts` (legacy + vault data), and city builder in `src/lib/cityBuilder.ts` + `src/hooks/useCityBuilder.ts`
- **Events/timers:** `src/lib/events.ts`, `src/hooks/useEvents.ts`, `src/lib/miniGameSchedule.ts`, `src/hooks/useDailyDividends.ts`

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
- **Micro-learning tiles:** partial learning exists (Bias Sanctuary), but no Duolingo-style tile system. (`src/components/BiasSanctuaryModal.tsx`)

### Do‑Not‑Touch List
- **ProTools art/card rendering and assets:** Keep `StockModal` pipeline intact; only add guards or wiring.
- **Existing Supabase schema patches:** append-only changes only.
- **Core board movement engine:** adjust via config or targeted edits (no rewrite).

---

## Major Workstreams (One slice per run)
Each milestone is broken into slices. Implement **exactly one slice** per run.

### M0 — Audit & Baseline
- **M0.1** ✅ Repo audit (this run)
- **M0.2** Instrumentation hooks (optional logging, no behavior change)
- **M0.3** ✅ Wheel of Fortune daily spin cap + reward consistency
- **M0.4** ✅ Lazy-load Portfolio charts to prevent app boot errors

### M1 — 3‑Ring Board Rules (Outer/Middle/Inner)
- **M1.1** Audit ring movement + portal behavior
- **M1.2** Start behavior: land-only ring transitions
- **M1.3** Bull Market window → ring 2 quick entry
- **M1.4** Middle-ring wildcard outcomes (fraud vs hidden gem)

### M2 — Timeline Economy Core (Leverage, Momentum, Windows)
- **M2.1** Canonical economy state shape + persistence
- **M2.2** Leverage ladder + UI gating
- **M2.3** Momentum meter (gain/decay)
- **M2.4** Windows engine (5–25 min)
- **M2.5** Trigger rules: “rich & hot”
- **M2.6** Soft throttle (post big-win dampening)
- **M2.7** Alpha Day scheduler (rare)

### M3 — Real Stock Tiles + Portfolio Rewards
- **M3.1** Audit stock tile modal system
- **M3.2** Portfolio readout panel
- **M3.3** Stock tile buy action (paper trading)
- **M3.4** Portfolio reward hooks (soft positive buffs)
- **M3.5** Price data strategy (with fallback)

### M4 — Micro‑Learning Tiles
- **M4.1** Tile taxonomy + renderer
- **M4.2** Question bank format + seed content
- **M4.3** Rewards + streak system
- **M4.4** Graphic templates + animations

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
- **M6.5** Apply roll regen boost perk (based on existing regen)

### M7 — Tile Price Pop Labels
- **M7.1** Audit board renderer + tile overlays
- **M7.2** Implement tile label component
- **M7.3** Hook labels to tile data

### M8 — Telemetry & Tuning
- **M8.1** Economy telemetry sinks

### M9 — Celebrations & FX
- **M9.1** Ring 3 upgrade celebration (board spin + UI flash) ✅

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

---

## Next Slice
**Recommended next slice:** **M6.5 — Apply roll regen boost perk (based on existing regen)**.

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

## M0.4 Slice Notes (Lazy-load Portfolio charts)
- Lazy-loaded the Portfolio modal so chart dependencies no longer block initial app startup.
