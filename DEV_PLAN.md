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
_Last reviewed: 2026-02-02 (P3 Bear Trap timed mini-game surface)_
#### Frontend
- **Legacy static pages entry:** `/index.html`, `/about.html`, `/faq.html`, `/monthly/`, `/weekly/`, `/superinvestor/`
- **Vite + Preact app:** `/apps/investing-board-game-v3` (built into `/public/board-game-v3` via `npm run build:board-game-v3`)
- **Routing system:** No router; UI mode/state machine in `apps/investing-board-game-v3/src/lib/uiModeStateMachine.ts` + context `src/context/UIModeContext.tsx`
- **State management/store:** Local React state in `src/App.tsx` plus contexts in `src/context/*` (Auth, Overlay, UI Mode); custom hooks in `src/hooks/*`
- **Game loop entry:** `src/App.tsx` (dice roll → `calculateMovement` in `src/lib/movementEngine.ts`), board data in `src/lib/mockData.ts`
- **UI components:** `src/components/*` (board, modals, overlays, portfolio readout panel), shop UI in `src/components/ShopModal.tsx` + `src/components/shop/*` (mobile shop shell, property vault album cards), roulette win flow in `src/components/RouletteVictoryModal.tsx`
- **Mini-games hub:** `src/pages/GamesHub.tsx` (grid of mini-games in overlay, schedule-aware availability via `useMiniGames`), `src/components/games/*` (cards, overlay shell, placeholder game surfaces), Wheel of Fortune demo uses `src/components/WheelOfFortuneModal.tsx`
- **Board renderer + tiles:** `src/App.tsx` (ring layout, tile positioning), `src/components/BoardViewport.tsx`, `src/components/Board3DViewport.tsx`, `src/components/Tile.tsx`
- **Micro-learning tiles:** `src/lib/learningTiles.ts` (taxonomy definitions) + `src/lib/learningQuestionBank.ts` (seed question bank) + `src/components/Tile.tsx` (renderer)
- **Stock tile modals:** `src/components/StockModal.tsx` via `src/lib/overlayRegistry.ts` and `src/hooks/useOverlayManager.ts`, triggered in `src/App.tsx` on category tile landings
- **Wheel of Fortune rewards + daily spin caps:** `src/App.tsx` + `src/components/WheelOfFortuneModal.tsx`
- **Shop 2.0 entry:** `src/components/Shop2Modal.tsx` (feature-flagged Shop 2.0 preview shell)
- **Shop 2.0 vault data:** `src/hooks/useShopVaultOverview.ts` + `src/lib/shopVaultFixtures.ts` (season/set overview + fallback fixtures)
- **Shop 2.0 purchases:** `src/hooks/useShopVaultPurchase.ts` (atomic vault buy + currency spend)
- **Shop 2.0 windows/discounts:** `src/components/Shop2Modal.tsx` + `src/hooks/useShopVaultPurchase.ts` (event window discount pricing + purchase spend)
- **Shop 2.0 unlock rules:** `src/hooks/useShopVaultOverview.ts` (set completion gating for the next set)
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
- **M3.5** Price data strategy (with fallback)

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

### M8 — Telemetry & Tuning
- **M8.1** ✅ Economy telemetry sinks

### M9 — Celebrations & FX
- **M9.1** Ring 3 upgrade celebration (board spin + UI flash) ✅

### P1 — Mini-Games Hub
- **P1.1** ✅ Wheel of Fortune playable demo in Games Hub
- **P1.2** ✅ Portal animation polish
- **P1.3** ✅ Roulette victory sequence
- **P1.4** ✅ Happy Hour wheel scheduling in Games Hub
- **P1.5** ✅ Stock Rush timed mini-game surface
- **P1.6** ✅ Vault Heist timed mini-game surface

### P2 — Audio & Feedback
- **P2.1** ✅ Soothing sound system

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
**Recommended next slice:** **IPO Frenzy timed mini-game surface (P3 planned in `docs/DEV_PLAN_MARKETTYCOON_MASTER.md`).**

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
- Added learning tile rewards (stars + XP) with streak bonuses and ring/star multipliers for mobile-first feedback.
- Tracked daily learning streaks and persisted last-learning dates in the game stats for deterministic streak continuity.
- Updated Case Study quiz completion to increment quiz stats and daily quiz streak metadata for future achievement hooks.

## M4.4 Slice Notes (Graphic templates + animations)
- Added category-specific learning tile templates with gradients, pattern overlays, and badge styling for clearer quiz identity cues.
- Introduced a subtle icon float animation and glow layering to give learning tiles a livelier, mobile-first feel without changing layout.

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

## M7.1 Slice Notes (Audit board renderer + tile overlays)
- Confirmed board layout rendering lives in `App.tsx` using ring-based `calculateTilePositions` helpers and per-ring scale factors, with `BoardViewport` (classic zoom) + `Board3DViewport` (camera transform) handling layout constraints.
- Verified tile overlay treatments in `Tile.tsx` including type badges, ownership marker, portal/teleport highlights, and ring state classes (revealing/locked) to inform the upcoming label component.
- Noted that ring layers and tile overlays are gated by ring visibility/opacity helpers, so new label overlays should follow the same pointer-events and ring-reveal rules.

## M7.2 Slice Notes (Implement tile label component)
- Added a reusable `TileLabel` component with tone variants, icon/sublabel support, and mobile-first styling for future price pops.
- Extended the `Tile` renderer to accept an optional label config and render the overlay when ring content is visible.

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

## P2.1 Slice Notes (Soothing sound system)
- Added a soft low-pass filter and warmer triangle waveform defaults to the Web Audio synth nodes to reduce harshness.
- Tuned reward, portal, and UI tones to use filtered voices with smoother envelopes for more pleasant feedback.

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

## Fall Portals + Chance Lift Slice Notes
- Added Ring 2 fall portal safety-net rewards so some drops grant a bonus roll, stars, or coins before returning to Street Level.
- Expanded Chance Card outcomes with randomized executive perks alongside the jackpot lift to the Wealth Run for richer mid-ring stakes.
- Updated Chance Card copy to reflect the broader outcome mix and chance-lift narrative.

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

## M1.1 Slice Notes (Audit ring movement + portal behavior)
- Verified portal rules in `movementEngine` and `App.tsx` match the master plan: Ring 1 ascends only on exact landings, and Ring 2/3 start tiles remain stable anchors on both pass and land.
- Confirmed portal behavior is driven by `PORTAL_CONFIG` with optional overrides for event-driven exceptions (e.g., Bull Market window), keeping transitions deterministic and configurable.
- Documented the ring/portal flow so future portal adjustments can stay repo-first and avoid movement engine rewrites.
