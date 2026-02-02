# CHANGELOG_DEV.md

**System source of truth:** See `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` for the canonical MarketTycoon game systems, loop, and economy. If something here conflicts, update the master plan first.


## Unreleased

**Date:** 2026-02-03  
**Slice:** Fall Portals + Chance Lift  
**Summary:**  
- Added safety-net rewards to Ring 2 fall portals so some drops grant a quick bonus before returning to Street Level.  
- Expanded Chance Card outcomes with randomized executive perks while keeping the jackpot lift to the Wealth Run.  
- Updated Chance Card modal copy to reflect the broader outcome mix.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/ChanceCardModal.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) On Ring 2, land on a Fall Portal multiple times to confirm some drops grant a bonus reward before the portal animation.  
- (manual) Land on the Chance tile, draw multiple times, and verify non-jackpot outcomes award randomized perks while jackpots still lift to Ring 3.  

**Date:** 2026-02-02  
**Slice:** P2.1 (soothing sound system)  
**Summary:**  
- Added low-pass filtered tone nodes to soften Web Audio synth output and reduce harsh peaks.  
- Switched key reward, portal, and UI tones to warmer triangle waves for smoother feedback.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/sounds.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger dice rolls, rewards, portal transitions, and UI clicks to confirm the new softer tones play without distortion.  

**Date:** 2026-02-02  
**Slice:** M7.1 (audit board renderer + tile overlays)  
**Summary:**  
- Audited the board renderer and tile overlay stack to confirm where ring layout, overlays, and visibility gates live.  
- Documented the audit in the master plan so follow-on label overlays can respect ring reveal and pointer-event rules.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (not run; documentation-only slice)  

**Date:** 2026-02-01  
**Slice:** P1.2 (Portal animation polish)  
**Summary:**  
- Added portal beam + ripple layers and updated timing so ring transitions feel smoother and more dimensional.  
- Tuned overlay brightness and particle travel behavior to keep portal animations readable across screen sizes.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/PortalAnimation.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (not run; not requested)  

**Date:** 2026-01-30  
**Slice:** P1.1 (Wheel of Fortune playable demo in Games Hub)  
**Summary:**  
- Marked Wheel of Fortune as playable in the mini-games hub and gated hub entry on playable status.  
- Reused the Wheel of Fortune modal in the hub with demo spin limits, balances, and sound feedback.  
- Added a compact demo ledger line in the wheel modal to keep cash, stars, rolls, and XP visible during hub spins.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/WheelOfFortuneModal.tsx  
- apps/investing-board-game-v3/src/lib/gamesConfig.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (not run; not requested)  

**Date:** 2026-01-29  
**Slice:** M1.1 (audit ring movement + portal behavior)  
**Summary:**  
- Audited ring movement and portal behavior against the master plan, confirming land-only ascension on Ring 1 and stable anchors for Ring 2/3 start tiles.  
- Verified portal transitions route through `PORTAL_CONFIG` and movement overrides for event windows, keeping portal behavior deterministic and configurable.  
- Captured findings in the dev plan to guide future portal tweaks without engine rewrites.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none — documentation-only slice)  

**Date:** 2026-01-29  
**Slice:** M0.2 (instrumentation hooks follow-up)  
**Summary:**  
- Fixed the Tile component to pass through tile label props so label overlays render without reference errors.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and confirm tile label overlays render without a console error about `tileLabel`.  

**Date:** 2026-01-29  
**Slice:** M0.2 (instrumentation hooks)  
**Summary:**  
- Added an opt-in instrumentation helper for debug logging with a dev console sink.  
- Routed game debug logging through the new instrumentation hook to keep logging centralized.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/instrumentation.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Set `localStorage.DEBUG_GAME = "true"` and trigger any in-game action (e.g., dice roll); confirm instrumentation logs in the console.  

**Date:** 2026-01-28  
**Slice:** M8.1 (economy telemetry sinks)  
**Summary:**  
- Added an opt-in telemetry helper with console + local storage sinks for lightweight economy event capture.  
- Wired economy window, roll reward, tile landing, and quick reward events into the telemetry pipeline.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/telemetry.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Set `localStorage.alphastocks.telemetry.opt_in = "true"`, roll the dice or hit a quick-reward tile, and confirm events persist under `localStorage.alphastocks.telemetry.events`.  

**Date:** 2026-01-28  
**Slice:** M7.3 (hook labels to tile data)  
**Summary:**  
- Added ring-aware tile label configs so category, event, and learning tiles surface compact overlays.  
- Highlighted Ring 3 win tiles with compact reward labels and added ring multiplier sublabels on stock tiles.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and confirm tile labels render on category/event/learning tiles, with Ring 2/3 stock tiles showing multiplier sublabels and Ring 3 win tiles showing compact reward labels.  

**Date:** 2026-01-29  
**Slice:** M7.2 (implement tile label component)  
**Summary:**  
- Added a reusable tile label overlay component with tone variants, icon support, and mobile-first styling.  
- Extended the tile renderer to accept optional label metadata so upcoming price pops can plug in without layout changes.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/TileLabel.tsx  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Inspect a tile in the dev tools and confirm the optional label overlay renders when provided.  

**Date:** 2026-01-28  
**Slice:** M7.1 (audit board renderer + tile overlays)  
**Summary:**  
- Audited board rendering and ring layout flow in `App.tsx`, `BoardViewport`, and `Board3DViewport` to map the tile positioning path.  
- Reviewed tile overlay treatments (type badges, ownership markers, portal/teleport highlights, ring reveal states) to scope the upcoming label component.  
- Documented ring visibility gating/pointer-events considerations for overlay additions.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-01-25  
**Slice:** M4.4 (graphic templates + animations)  
**Summary:**  
- Added category-specific learning tile templates with gradients, pattern overlays, and badge styling.  
- Animated learning tile icons with subtle float/rotate motion and glow layering for a more dynamic quiz feel.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- apps/investing-board-game-v3/src/lib/learningTiles.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board, locate learning tiles, and confirm category badges/gradients render with subtle icon motion.  

**Date:** 2026-01-25  
**Slice:** M4.3 (rewards + streak system)  
**Summary:**  
- Added learning tile rewards that grant stars and XP with streak bonuses tied to daily learning progress.  
- Persisted learning streak metadata in game stats and surfaced streak feedback in learning tile toasts.  
- Updated Case Study quiz completion to increment quiz stats and daily quiz streak tracking.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/hooks/useGameSave.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a learning tile twice in one day and confirm stars/XP award plus streak messaging stays stable.  
- (manual) Complete a Case Study quiz on consecutive days and confirm the streak count increments in the toast.  

**Date:** 2026-01-24  
**Slice:** M4.2 (question bank format + seed content)  
**Summary:**  
- Added a structured learning question bank with difficulty, tags, and explanations for seed quizzes.  
- Wired learning tile toasts to display the seed question count for quick context.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/learningQuestionBank.ts  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a Quiz or Insider Quiz tile and confirm the toast shows the question count.  

**Date:** 2026-01-24  
**Slice:** M4.1 (tile taxonomy + renderer)  
**Summary:**  
- Added a micro-learning tile taxonomy with categories, icons, and descriptions for quiz tiles.  
- Updated quiz tiles to use the learning type and display a dedicated renderer treatment on the board.  
- Added a landing fallback toast for learning tiles to keep the loop moving.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/learningTiles.ts  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a Quiz or Insider Quiz tile and confirm the learning renderer and toast appear.  

**Date:** 2026-01-24  
**Slice:** M0.5 (casino + scratchcard MD plan alignment)  
**Summary:**  
- Added documentation-only kickoff prompt guidance for MD plan work.  
- Captured status snapshots and next-slice checklists for Casino Mode and Scratchcard evolution docs.  

**Files changed:**  
- DEV_PLAN.md  
- apps/investing-board-game-v3/CASINO_MODE.md  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-01-24  
**Slice:** M3.4 (portfolio reward hooks — soft positive buffs)  
**Summary:**  
- Added a portfolio reward buff helper that grants small multipliers based on category diversification.  
- Applied portfolio buffs to star multipliers and quick-reward payouts (cash, stars, coins, XP), with bonus callouts in toasts.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/portfolioRewards.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board, buy stocks across 2+ categories, and land on a quick-reward tile to confirm the portfolio bonus toast and increased payout.  

**Date:** 2026-01-24  
**Slice:** M2.7 (Alpha Day scheduler)  
**Summary:**  
- Added a deterministic quarterly Alpha Day special event so the event system can surface a rare 24-hour multiplier surge.  
- Scheduled Alpha Day using a first-Monday rule per quarter month to keep upcoming event previews predictable.  
- Wired Alpha Day into the global events list without disrupting existing recurring or rotation events.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/events.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Temporarily set the system date to `2026-04-06T12:00:00` (first Monday of April) and refresh; verify the Events panel shows “Alpha Day” active.  
4) Set the date to `2026-06-30T12:00:00` and confirm the upcoming events list includes the next Alpha Day on the first Monday of July.  

**Date:** 2026-01-25  
**Slice:** M2.6 (Soft throttle: post big-win dampening)  
**Summary:**  
- Added a soft throttle helper that detects big net-worth spikes and applies a temporary reward dampener to stars/XP multipliers.  
- Persisted throttle metadata in the canonical economy state and expired it deterministically on minute ticks.  
- Wired throttle into the existing economy multiplier aggregation without rewriting other reward flows.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/economyThrottle.ts  
- apps/investing-board-game-v3/src/lib/economyState.ts  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) In React devtools, bump `gameState.netWorth` by ~15%+ and confirm `gameState.economy.throttleUntil` is set with a `throttleMultiplier` below 1.  
4) Roll the dice and confirm the reward toast shows reduced stars/XP compared to the same roll with `throttleUntil` cleared.  

**Date:** 2026-01-24  
**Slice:** M2.3 (Momentum meter + gain/decay)  
**Summary:**  
- Added a momentum helper module that decays momentum based on elapsed minutes and applies gain from positive net-worth deltas.  
- Tracked net-worth deltas in `App.tsx` to update momentum deterministically and added a minute interval to apply passive decay.  
- Added a mobile-first momentum meter to the phone dice button and the expanded Dice HUD so players can see the new signal without leaving the roll surface.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/momentum.ts  
- apps/investing-board-game-v3/src/lib/economyState.ts  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/DiceHUD.tsx  
- apps/investing-board-game-v3/src/components/phone/DiceButton.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneBottomNav.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneLayout.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev -- --host --port 5000`  
3) Land on a cash-positive tile (or trigger a reward) and confirm the momentum bar increases, then wait a minute and confirm it decays.  

**Date:** 2026-01-24  
**Slice:** M2.1 (Canonical economy state shape + persistence)  
**Summary:**  
- Added a canonical economy state shape with normalization helpers to stabilize upcoming leverage and momentum features.  
- Hydrated and persisted economy state via local storage so refreshes work when Supabase is not configured.  
- Normalized economy state during saved-game load to backfill defaults safely.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/economyState.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Play a few turns, refresh the page, and confirm the app boots without errors and retains the economy state in local storage even without Supabase configured.  

**Date:** 2026-01-23  
**Slice:** M1.4 (Middle-ring wildcard outcomes)  
**Summary:**  
- Added a Ring 2-only wildcard outcome split with 80% Fraud Alert vs 20% Hidden Gem.  
- Left the existing wildcard pool in place for Rings 1 and 3.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/wildcardEvents.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Trigger a wildcard event on Ring 2 and confirm it produces only Fraud Alert or Hidden Gem outcomes (roughly 80/20 over multiple trials).  

**Date:** 2026-01-22  
**Slice:** M6.4 (Level-up detection + claim records)  
**Summary:**  
- Fixed the Shop 2.0 vault purchase handler to avoid referencing `shopWindow` before initialization.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open Shop 2.0 and confirm the app loads without the initialization error.  

**Date:** 2026-01-22  
**Slice:** M6.4 (Level-up detection + claim records)  
**Summary:**  
- Added vault level-up claim tracking and extended the Shop 2.0 purchase RPC to handle level progression.  
- Updated Shop 2.0 vault XP handling to surface pending level rewards in the UI.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- apps/investing-board-game-v3/src/lib/shopVaultFixtures.ts  
- apps/investing-board-game-v3/src/lib/shopVaultXp.ts  
- supabase/patches/036_shop_vault_level_claims.sql  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- MIGRATIONS_LOG.md  

**SQL migrations:**  
- supabase/patches/036_shop_vault_level_claims.sql  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open Shop 2.0, purchase a vault item, and confirm the vault XP meter levels up and shows a pending reward when you cross a threshold.  

**Date:** 2026-01-22  
**Slice:** M0.3 (Wheel of Fortune daily spin cap + reward consistency)  
**Summary:**  
- Added a 3–5 spin daily cap for the Wheel of Fortune, with per-day persistence and UI feedback on remaining spins.  
- Ensured wheel rewards always apply to game currencies (rolls, XP, cash, stars, coins) and mystery spins resolve into a concrete reward.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/WheelOfFortuneModal.tsx  

**SQL migrations:**  
- (none)

**How to test:**  
1) Not run (not requested).  

**Date:** 2026-01-21  
**Slice:** M5.2 (Shop 2.0 Supabase schema)  
**Summary:**  
- Added Shop 2.0 vault schema tables for seasons, sets, items, and player progress/ownership.  
- Documented the new schema in DEV_PLAN and logged the migration details.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- MIGRATIONS_LOG.md  
- supabase/patches/032_shop_vault_schema.sql  

**SQL migrations:**  
- supabase/patches/032_shop_vault_schema.sql  

**How to test:**  
1) Not run (schema-only change).  

**Date:** 2026-01-21  
**Slice:** M5.1 (Shop2 feature flag + routes)  
**Summary:**  
- Added a Shop 2.0 feature flag and wired shop overlays to route to the new Shop2 modal when enabled.  
- Introduced the Shop 2.0 preview modal shell and registered it in the overlay registry.  
- Updated the DEV_PLAN repo map and next-slice guidance for Shop 2.0 follow-up work.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/components/UIModeOverlayBridge.tsx  
- apps/investing-board-game-v3/src/lib/featureFlags.ts  
- apps/investing-board-game-v3/src/lib/overlayRegistry.ts

**SQL migrations:**  
- (none)

**How to test:**  
1) Not run (not requested).

**Date:** 2026-01-21  
**Slice:** M0.1  
**Summary:**  
- Completed repo audit and captured a master DEV_PLAN with repo map, current-vs-target, and next-slice guidance.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- ENV_NOTES.md  
- MIGRATIONS_LOG.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M0.1 (follow-up)  
**Summary:**  
- Added build/run efficiency notes and cross-referenced existing master plan/PRD docs to reduce duplication.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M0.1 (audit scope note)  
**Summary:**  
- Documented the audit scope and methods to clarify which areas were reviewed.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M0.1 (full repo scan)  
**Summary:**  
- Documented the repo-wide doc scan and added key references for plan completeness.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M9.1  
**Summary:**  
- Added Ring 3 upgrade celebration visuals (counter-rotating rings, UI flashes, light beams).

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/index.css  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) Trigger Ring 3 reveal and observe board spin + UI flashes.

**Date:** 2026-01-21  
**Slice:** M0.1 (mobile-first rule)  
**Summary:**  
- Documented the mobile-first UI rule as a non-negotiable operating principle.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M0.1 (key start prompt)  
**Summary:**  
- Added a short, reusable key start prompt to keep runs aligned to the master plan.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M5.0 (shop audit)  
**Summary:**  
- Audited the existing shop experience (desktop stars vs mobile cash + Property Vault) and documented the decision to ship Shop 2.0 as a feature-flagged parallel flow.

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md

**SQL migrations:**  
- (none)

**How to test:**  
1) No runtime changes (docs only).

**Date:** 2026-01-21  
**Slice:** M5.3 (vault overview UI)  
**Summary:**  
- Implemented the Shop 2.0 vault overview with season/set progress cards and mobile-first layout.  
- Added Supabase-backed vault catalog loading with fixture fallback data for preview mode.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- apps/investing-board-game-v3/src/lib/shopVaultFixtures.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open the Shop overlay and verify the Vault Overview card renders seasons and sets.

**Date:** 2026-01-22  
**Slice:** M5.4 (set detail UI)  
**Summary:**  
- Added a Shop 2.0 set detail panel with a 4×3 item grid, ownership status, rarity, and pricing callouts.  
- Updated the Shop 2.0 preview flow to highlight and persist the selected set once data loads.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open the Shop overlay and select a set; confirm the 4×3 grid appears with owned vs missing states.

**Date:** 2026-01-23  
**Slice:** M5.5 (atomic purchase function)  
**Summary:**  
- Added an atomic Shop 2.0 purchase RPC that records vault ownership and updates set/season progress in one transaction.  
- Wired the Shop 2.0 set detail grid with buy buttons, preview-mode purchases, and local ownership updates.  
- Introduced a Shop 2.0 purchase hook to deduct currency and call the vault purchase RPC.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- apps/investing-board-game-v3/src/hooks/useShopVaultPurchase.ts  
- supabase/patches/033_shop_vault_purchase.sql  
- MIGRATIONS_LOG.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- supabase/patches/033_shop_vault_purchase.sql  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open the Shop overlay, tap a missing vault item, and confirm the purchase button completes and marks the item as owned.

**Date:** 2026-01-22  
**Slice:** M5.6 (set completion + unlock next set)  
**Summary:**  
- Added sequential unlock logic so Vault sets open only after completing the prior set in the season.  
- Updated the Shop 2.0 overview and detail panels to show locked sets, steer selection to unlocked sets, and block purchases until unlocked.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open the Shop 2.0 preview, confirm only the first set is selectable, then purchase items until completion to unlock the next set.

**Date:** 2026-01-23  
**Slice:** M5.7 (album completion + mega reward)  
**Summary:**  
- Added season-level album completion tracking for Shop 2.0 Vault data.  
- Added a mega reward callout to the Shop 2.0 overview that unlocks when all sets are complete.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open the Shop 2.0 preview and verify the mega reward callout switches to unlocked when all sets show as complete.

**Date:** 2026-01-24  
**Slice:** M5.8 (window integration — discounts, flash)  
**Summary:**  
- Applied event-based shop window discounts to Shop 2.0 vault pricing and purchase spend logic.  
- Added a flash window callout in the Shop 2.0 UI to surface live discount events.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultPurchase.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Trigger a shop discount event (or temporarily set `shopEventDiscount` to a non-zero value) and confirm Shop 2.0 shows the flash window banner and discounted prices.

**Date:** 2026-01-25  
**Slice:** M6.1 (audit free roll regen)  
**Summary:**  
- Audited the current free roll regeneration system, including 2-hour energy resets and daily midnight roll resets.  
- Captured config mismatches and data flow notes to inform the upcoming regen perk work.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) No runtime changes (documentation-only slice).

**Date:** 2026-01-26  
**Slice:** M6.2 (vault progress tables + UI meter)  
**Summary:**  
- Added a Shop 2.0 vault profile progress table for per-player XP and level tracking.  
- Updated the vault overview hook and fixtures to load vault XP/level progress with Supabase fallback.  
- Added a mobile-first vault level meter to the Shop 2.0 preview UI.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- apps/investing-board-game-v3/src/lib/shopVaultFixtures.ts  
- supabase/patches/034_shop_vault_profile_progress.sql  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- MIGRATIONS_LOG.md  

**SQL migrations:**  
- supabase/patches/034_shop_vault_profile_progress.sql  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open Shop 2.0 and confirm the Vault Level meter displays XP progress and level text.

**Date:** 2026-01-27  
**Slice:** M6.3 (increment XP on purchase)  
**Summary:**  
- Added XP gain handling to the Shop 2.0 vault purchase RPC so purchases grant vault XP atomically.  
- Added a shared vault XP helper and wired Shop 2.0 preview purchases to update local XP.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Shop2Modal.tsx  
- apps/investing-board-game-v3/src/hooks/useShopVaultOverview.ts  
- apps/investing-board-game-v3/src/lib/shopVaultXp.ts  
- supabase/patches/035_shop_vault_purchase_xp.sql  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  
- MIGRATIONS_LOG.md  

**SQL migrations:**  
- supabase/patches/035_shop_vault_purchase_xp.sql  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `VITE_SHOP2=1 npm run dev`  
3) Open Shop 2.0, purchase a vault item, and confirm XP increases.

**Date:** 2026-01-28  
**Slice:** M0.4 (lazy-load Portfolio charts)  
**Summary:**  
- Lazy-loaded the Portfolio modal in overlay registry and app entry to avoid chart dependencies blocking initial load.  
- Kept overlay rendering behavior the same while deferring chart bundle loading until the modal is opened.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/overlayRegistry.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Load the app to confirm it opens without the initialization error, then open Portfolio to verify charts render.

**Date:** 2026-01-29  
**Slice:** M6.5 (roll regen boost perk)  
**Summary:**  
- Added vault-level regen bonus helpers and applied the bonus to the 2-hour dice reset amount.  
- Updated the out-of-rolls modal messaging to reflect the boosted reset perk.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/OutOfRollsModal.tsx  
- apps/investing-board-game-v3/src/lib/energy.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Use a vault level high enough to see the bonus, run down dice, and confirm the out-of-rolls modal shows the boosted reset amount.

**Date:** 2026-01-30  
**Slice:** M1.2 (start behavior: land-only ring transitions)  
**Summary:**  
- Updated portal start tiles so ring transitions only trigger on exact landings, not on pass-through.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Roll past a portal start tile to confirm no ring transition, then land exactly on it to confirm the transition triggers.

**Date:** 2026-01-23  
**Slice:** M1.3 (Bull Market window → ring 2 quick entry)  
**Summary:**  
- Added a Bull Run Rally event effect that triggers a Bull Market window for quick ring entry.  
- Allowed passing Ring 1 start to ascend into Ring 2 when the Bull Market window is active.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/events.ts  
- apps/investing-board-game-v3/src/lib/movementEngine.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) Ensure the Bull Run Rally event is active, roll to pass Start on Ring 1, and confirm you ascend to Ring 2 without landing exactly on the portal.

**Date:** 2026-01-24  
**Slice:** M2.2 (leverage ladder + UI gating)  
**Summary:**  
- Added a leverage ladder helper that unlocks roll multipliers progressively by leverage level.  
- Gated multiplier selection in both the desktop Dice HUD and phone dice button, with clear locked states.  
- Clamped mobile multiplier cycling to unlocked multipliers so leverage gating remains deterministic.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/leverage.ts  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/DiceHUD.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneLayout.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneBottomNav.tsx  
- apps/investing-board-game-v3/src/components/phone/DiceButton.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `npm run build:board-game-v3`  
2) `cd apps/investing-board-game-v3`  
3) `npm run dev`  
4) With leverage level 0, verify only 1x is selectable and higher multipliers show as locked.  
5) Increase `gameState.economy.leverageLevel` in local state (devtools) and confirm new multipliers unlock progressively and the cycle button only rotates through unlocked values.

**Date:** 2026-01-24  
**Slice:** M2.4 (windows engine + mobile-first HUD banner)  
**Summary:**  
- Added a deterministic economy windows engine that opens 5–25 minute buff windows based on momentum and leverage thresholds with cooldown handling.  
- Expanded the canonical economy state to persist active window metadata and last window start/end timestamps so windows survive refreshes safely.  
- Combined economy window multipliers with active event multipliers for roll rewards and star calculations, and surfaced the active window as a banner on both the phone dice button and desktop Dice HUD.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/economyWindows.ts  
- apps/investing-board-game-v3/src/lib/economyState.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/DiceHUD.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneLayout.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneBottomNav.tsx  
- apps/investing-board-game-v3/src/components/phone/DiceButton.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) In devtools, raise `gameState.economy.momentum` to at least 35 and `gameState.economy.leverageLevel` to at least 1.  
4) Wait for the next minute tick (or trigger a net worth increase) and confirm an economy window banner appears above the dice button/HUD with a countdown and bonus percentages.  
5) Roll the dice during the window and confirm the roll toast shows larger star/XP gains versus the same roll without a window.

**Date:** 2026-01-24  
**Slice:** M2.5 (trigger rules: rich & hot)  
**Summary:**  
- Tightened economy window start gating so the minimum thresholds alone no longer start a window.  
- Implemented “rich” as leverage level 2+ and “hot” as momentum clearing a higher band while staying meaningfully above the recorded floor and close to the current peak.  
- Kept the slice repo-first by limiting the change to the window engine without reshaping upstream economy state or UI wiring.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/economyWindows.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
1) `cd apps/investing-board-game-v3`  
2) `npm run dev`  
3) In devtools, set `gameState.economy.leverageLevel = 1` and `momentum = 70`; confirm no window starts on the next tick because leverage is not “rich.”  
4) Raise `leverageLevel = 2`, keep `momentum = 70`, and set `momentumPeak = 70`, `momentumFloor = 40`; confirm a window can now start after cooldown.  
5) Drop `momentum` to 50 (below the hot band) and confirm new windows do not start after the current one ends.

**Date:** 2026-01-24  
**Slice:** M3.1 (audit stock tile modal system)  
**Summary:**  
- Audited the stock tile modal flow, including overlay lifecycle, preview timing, and ring reward messaging.  
- Confirmed the universe stock data mapping and Supabase fallback path used by category tile landings.  
- Captured findings in the master dev plan to guide the upcoming portfolio UI slice.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (not applicable — documentation-only update)  

**Date:** 2026-01-24  
**Slice:** M3.5 (price data strategy — with fallback)  
**Summary:**  
- Added a deterministic stock pricing helper that maps composite scores into stable price bands with a seeded jitter and fallback range.  
- Updated Supabase universe mapping and demo stock selection to use the shared pricing resolver and avoid random price drift.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/stockPricing.ts  
- apps/investing-board-game-v3/src/hooks/useUniverseStocks.ts  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on stock tiles multiple times and confirm prices stay consistent per symbol between refreshes (Supabase and demo).  

**Date:** 2026-01-24  
**Slice:** M3.2 (portfolio readout panel)  
**Summary:**  
- Added a mobile-first portfolio readout panel summarizing net worth, cash vs portfolio value, top holdings, and category mix.  
- Replaced the empty center carousel panel with the portfolio readout for quick in-board access.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/PortfolioReadoutPanel.tsx  
- apps/investing-board-game-v3/src/components/CenterCarousel.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board, swipe the center carousel to the first panel, and confirm the portfolio readout renders on mobile and desktop.  

**Date:** 2026-01-24  
**Slice:** M3.3 (stock tile buy action — paper trading)  
**Summary:**  
- Updated the stock modal purchase flow to buy ring-scaled share bundles with correct affordability checks and total cost display.  
- Merged stock purchases into existing holdings and tracked total/unique stock purchase stats for achievements.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/StockModal.tsx  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a stock tile, confirm the buy button shows the ring-scaled bundle cost, purchase once, and verify holdings + stats update.  
