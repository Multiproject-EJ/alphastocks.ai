# CHANGELOG_DEV.md

## Unreleased

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
