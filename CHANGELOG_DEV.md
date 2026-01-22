# CHANGELOG_DEV.md

## Unreleased

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
