# CHANGELOG_DEV.md

**System source of truth:** See `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` for the canonical MarketTycoon game systems, loop, and economy. If something here conflicts, update the master plan first.


## Unreleased

- Activated the Court of Capital corner tile with choice-driven rewards.

**Date:** 2026-02-24  
**Slice:** M10.3 Court of Capital activation  
**Summary:**  
- Added a Court of Capital reward definition with two strategic outcomes.  
- Wired the corner tile to the event choice modal and existing reward handler for ring-aware payouts.  
- Updated the dev plan repo map and slice tracker to reflect the new activation.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/courtOfCapital.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on the Court of Capital corner tile and confirm the choice modal applies rewards.  

- Added scratchcard event override config for limited-time promos.

**Date:** 2026-02-23  
**Slice:** P3.10 Scratchcard 2.0 event override config  
**Summary:**  
- Added scratchcard event override config to boost odds and swap themed symbols during limited-time promos.  
- Applied active event overrides to Casino tier previews and scratchcard gameplay tiers.  
- Updated the scratchcard evolution log with the next UI banner/styling step.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/CasinoModal.tsx  
- apps/investing-board-game-v3/src/lib/scratchcardEvents.ts  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal during Happy Hour and confirm tier previews and symbols reflect the event override.  

- Added event-aware scratchcard odds modifiers for casino boosts.

**Date:** 2026-02-23  
**Slice:** P3.9 Scratchcard 2.0 odds modifiers  
**Summary:**  
- Added event-aware odds modifiers (casino luck + happy hour) to scratchcard odds summaries and previews.  
- Wired guaranteed-win Happy Hour boosts into scratchcard grid generation so outcomes match previewed odds.  
- Updated the scratchcard evolution log with the next event-override step.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/CasinoModal.tsx  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/src/lib/evaluateScratchcard.ts  
- apps/investing-board-game-v3/src/lib/scratchcardOdds.ts  
- apps/investing-board-game-v3/src/lib/__tests__/scratchcardOdds.test.ts  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal during Happy Hour and confirm win chance previews show 100% with a guaranteed-win callout.  
- (manual) Open the Casino modal with the Casino Luck perk and confirm win chance previews show the boosted percentage.  

- Added scratchcard odds helper coverage to lock in EV math expectations.

**Date:** 2026-02-23  
**Slice:** P3.8 Scratchcard 2.0 odds helper coverage  
**Summary:**  
- Added lightweight Vitest coverage for the shared scratchcard odds helper.  
- Validated EV ranges and per-currency summaries stay aligned with tier odds + prize tables.  
- Updated the scratchcard evolution log with the next odds-modifier step.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/__tests__/scratchcardOdds.test.ts  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) `cd apps/investing-board-game-v3 && npm run test -- scratchcardOdds`  

- Added a shared scratchcard odds helper for Casino tier previews.

**Date:** 2026-02-22  
**Slice:** P3.7 Scratchcard 2.0 odds helper reuse  
**Summary:**  
- Extracted scratchcard EV math into a shared helper for consistent odds calculations.  
- Reused the odds helper in the Casino modal tier preview to show estimated EV ranges alongside prizes.  
- Updated the scratchcard evolution log with the next validation step.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/CasinoModal.tsx  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/src/lib/scratchcardOdds.ts  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal, toggle “See odds + prizes,” and confirm EV ranges appear alongside the prize table.  
- (manual) Open a scratchcard and confirm the odds & EV panel still shows expected ranges.  

- Added scratchcard win-line pulse animations and big-win sparkles.

**Date:** 2026-02-22  
**Slice:** P3.5 Scratchcard 2.0 win-line sparkles  
**Summary:**  
- Added pulsing animations to winning scratchcard tiles for stronger win feedback.  
- Introduced big-win sparkle overlays on winning tiles to emphasize standout outcomes.  
- Updated the scratchcard evolution log with the next polish step.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/src/index.css  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal, complete a winning scratchcard, and confirm winning tiles pulse after reveal.  
- (manual) Trigger a big win and confirm sparkle overlays appear on the winning tiles.  

- Added tactile scratchcard feedback with sound + haptic cues.

**Date:** 2026-02-22  
**Slice:** P3.4 Scratchcard 2.0 tactile feedback  
**Summary:**  
- Added scratch sound + haptic cues on tile reveals, fast reveal, and win outcomes for more tactile ticket play.  
- Routed win feedback through reward-based sound selection while keeping miss feedback subtle.  
- Updated the scratchcard evolution log with the next polish step.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal, scratch tiles, and confirm each reveal plays a light haptic and sound.  
- (manual) Use the Fast Reveal CTA and confirm it triggers a tactile cue.  
- (manual) Complete a winning ticket and confirm a reward-appropriate sound and success haptic fire.  

- Added scratch-mask texture and fast-reveal CTA for Scratchcard 2.0.

**Date:** 2026-02-21  
**Slice:** P3.3 Scratchcard 2.0 next-level reveal polish  
**Summary:**  
- Added a textured scratch-mask overlay to make scratchcard tiles feel more tactile.  
- Added scratch progress messaging and a fast-reveal CTA that unlocks after a few scratches.  
- Logged the scratchcard evolution progress and queued the next tactile feedback step.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/src/index.css  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal, scratch a few tiles, and confirm the scratch texture overlay plus fast-reveal CTA appear after a few scratches.  
- (manual) Complete a ticket and confirm the CTA hides once the card is fully revealed.  

- Added tier selection callouts in the Casino modal and winning-line badges on scratchcard tiles.

**Date:** 2026-02-20  
**Slice:** P3.2 Scratchcard 2.0 tier selection polish  
**Summary:**  
- Enhanced Casino modal tier cards with odds, grid size, and top-prize context for faster ticket comparison.  
- Added line-number badges to winning scratchcard tiles while keeping the existing color-accent highlights in sync.  
- Logged the scratchcard evolution progress and next step in the planning docs.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/CasinoModal.tsx  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino modal, switch between ticket tiers, and confirm the tier cards show odds/top-prize details.  
- (manual) Play a scratchcard and confirm winning tiles show line badges matching the win summary list.  

- Activated Tier 1 event tiles with choice-driven rewards and a new event decision modal.

**Date:** 2026-02-05  
**Slice:** M10.2 Implement Tier 1 event tiles (Analyst Call, News Flash, Executive Event, Board Meeting)  
**Summary:**  
- Added Tier 1 event tile definitions with choice copy and reward previews for the four event tiles.  
- Built a reusable event choice modal and wired event tile landings to it.  
- Applied ring-aware rewards, portfolio buffs, and telemetry logging for event tile choices.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/EventChoiceModal.tsx  
- apps/investing-board-game-v3/src/lib/eventTiles.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on Analyst Call, News Flash, Executive Event, and Board Meeting tiles and confirm the decision modal appears and awards the selected reward.  

- Audited the casino flow and scoped the next casino game surface.

**Date:** 2026-02-18  
**Slice:** P3.1 Advanced casino games (audit CasinoModal + existing casino hooks and scope the first new game surface)  
**Summary:**  
- Confirmed the Casino modal currently wraps the scratchcard game without a lobby or game selection step.  
- Documented the scratchcard win-rate logic and noted the lack of wiring for Casino Happy Hour guaranteed wins.  
- Scoped the first new casino game as a small lobby + one additional game card that reuses existing reward messaging.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none; documentation-only audit)  

- Fixed portal animation hook ordering to prevent React 310 errors during ring transitions.

**Date:** 2026-02-15  
**Slice:** M1.5 Stock tile ascend meter (bugfix)  
**Summary:**  
- Moved portal animation hook usage so hook order stays stable across transition states.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/PortalAnimation.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on the Big Fish Portal and confirm the ring transition plays without a React error.  

- Added a stock-tile ascend meter that auto-lifts players to the next ring after 100 points.
- Surfaced the ascend meter in the mobile HUD for progress tracking.

**Date:** 2026-02-15  
**Slice:** M1.5 Stock tile ascend meter  
**Summary:**  
- Added a ring-ascend meter that increments 1–3 points when landing on stock tiles and resets on auto-ascend.  
- Triggered portal lift animations when the meter hits 100 to move players to the next ring.  
- Added a Compact HUD progress meter so players can see their ascent progress.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/phone/CompactHUD.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneLayout.tsx  
- apps/investing-board-game-v3/src/lib/types.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on stock tiles and confirm the ascend meter increases by 1–3 points.  
- (manual) Verify that reaching 100 triggers an automatic ring ascent and resets the meter.  
- (manual) Check the Compact HUD for the Ascend Meter progress bar.  

- Added an Event Tile Activations workstream to ensure marketing-titled tiles are scoped and built.
- Updated the suggested run order to include event tile activation slices.

**Date:** 2026-02-15  
**Slice:** M10.1 Event tile activation audit (plan only)  
**Summary:**  
- Added the M10 Event Tile Activations workstream with audit + implementation slices for marketing tiles.  
- Logged new slice notes to capture the audit scope and prioritization approach.  
- Updated the suggested run order to include the event tile activation workstream.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (n/a — documentation update)  

- Wired the Season Pass overlay into the mobile HUD so players can open the battle pass on demand.
- Routed challenge season points into the Season Pass progression helper.
- Registered the Season Pass overlay for consistent modal rendering.

**Date:** 2026-02-05  
**Slice:** P2.9 Seasonal battle pass UI wiring  
**Summary:**  
- Wired the Season Pass modal into the overlay manager and added a Compact HUD entry point.  
- Hooked challenge season point rewards into the Season Pass progression helper.  
- Logged the slice completion in the run-by-run plan and updated the master plan status.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/phone/CompactHUD.tsx  
- apps/investing-board-game-v3/src/components/phone/PhoneLayout.tsx  
- apps/investing-board-game-v3/src/lib/overlayRegistry.ts  
- DEV_PLAN.md  
- docs/DEV_PLAN_MARKETTYCOON_MASTER.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board game on mobile, expand the HUD, and confirm the Season Pass button opens the battle pass modal.  
- (manual) Complete a challenge and verify the Season Points total increases in the HUD.  

- Seeded a learning config JSON with tile definitions, question bank fixtures, and reward tuning defaults.
- Normalized the learning config loader to read the JSON seed with fallback defaults.

**Date:** 2026-02-12  
**Slice:** C1.4 Learning config seed  
**Summary:**  
- Seeded `config/learning.json` with learning tile definitions, category styles, question bank fixtures, and reward tuning.  
- Normalized the learning config loader to read from the JSON seed with deterministic fallbacks.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- config/learning.json  
- apps/investing-board-game-v3/src/config/learning.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board game, land on a learning tile, and confirm the tile styling and quiz data match expectations.  

- Seeded a central ring config JSON so ring rewards and portals can be tuned without code changes.
- Normalized ring config exports in the app to keep fallbacks aligned with current behavior.

**Date:** 2026-02-11  
**Slice:** C1.3 Ring config seed  
**Summary:**  
- Added a root ring config JSON for ring reward and portal defaults.  
- Normalized ring config exports in the board game app so fallback behavior stays deterministic.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- config/rings.json  
- apps/investing-board-game-v3/src/config/rings.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Launch the board game and confirm ring rewards, portal behavior, and ring multipliers match existing behavior.  

- Added telemetry context metadata so tuning sessions can group events by app, session, and runtime mode.
- Seeded telemetry context on boot for clearer event filtering between dev and production sessions.

**Date:** 2026-02-11  
**Slice:** M8.2 Telemetry review + tuning pass  
**Summary:**  
- Added shared telemetry context metadata (app + session identifiers) to every telemetry event.  
- Seeded telemetry context with runtime mode during app boot for easier tuning filters.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/telemetry.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board game and confirm telemetry events include context metadata in local storage or console when telemetry consent is enabled.  

- Added a shop vault config JSON for seasons, fixture data, XP curve defaults, and discounts, then normalized those values in the Shop 2.0 config helpers.
- Routed the Savings Surge event discount through the shared shop vault discount setting.

**Date:** 2026-02-10  
**Slice:** C1.2 Shop vault config seed (seasons, discounts, and level curve)  
**Summary:**  
- Added a shop vault config JSON seeded with seasons, sets, fixtures, and XP curve defaults.  
- Normalized shop vault config so fixtures, level curve, and discounts can be tuned centrally.  
- Routed Savings Surge event discounts through the shared shop vault discount value.  

**Files changed:**  
- config/shop_vault.json  
- apps/investing-board-game-v3/src/config/shopVault.ts  
- apps/investing-board-game-v3/src/lib/events.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (not run)  

- Updated the master plan Priority Roadmap checklist to reflect completed systems so the canonical roadmap matches shipped features.
- Marked master plan event schedules and formerly planned PRs as completed so the canonical roadmap reflects shipped mini-games.

**Date:** 2026-02-10  
**Slice:** C1.1 Economy config seed (follow-up)  
**Summary:**  
- Re-exported energy config constants from `energy.ts` so existing imports continue to resolve.  
- Updated the run-by-run plan notes for the config seed slice.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/energy.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) `npm run build`  

**Date:** 2026-02-10  
**Slice:** C1.1 Economy config seed  
**Summary:**  
- Seeded a central economy config JSON file for energy regen defaults and vault regen bonuses.  
- Added a normalization helper to safely export energy config values inside the board game app.  
- Logged the config strategy slice in the run-by-run plan.  

**Files changed:**  
- config/economy.json  
- apps/investing-board-game-v3/src/lib/economyConfig.ts  
- apps/investing-board-game-v3/src/lib/energy.ts  
- apps/investing-board-game-v3/tsconfig.json  
- apps/investing-board-game-v3/vite.config.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Launch the board game app and verify energy reset messaging still shows a 2-hour cycle and the correct reset amount.  

**Date:** 2026-02-08  
**Slice:** Master plan event schedule status sync  
**Summary:**  
- Updated the master plan schedule tables to mark Happy Hour Wheel, Stock Rush, Vault Heist, Mega Jackpot, Market Mayhem, and Holiday Events as shipped.  
- Reframed the legacy upcoming PR list in the master plan as completed work.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- docs/DEV_PLAN_MARKETTYCOON_MASTER.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Review the master plan schedule tables to confirm shipped mini-games are marked as completed.  

**Date:** 2026-02-07  
**Slice:** P4.3 Mega Jackpot boost  
**Summary:**  
- Applied a Mega Jackpot event boost so Jackpot Week payouts get an additional multiplier when the monthly Mega Jackpot window is live.  
- Updated Jackpot Week win messaging to acknowledge the Mega Jackpot boost when active.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) During a Jackpot Week while the Mega Jackpot event is active, land on the Big Fish Portal and confirm the payout includes the Mega Jackpot boost messaging.  

**Date:** 2026-02-06  
**Slice:** Plan update — Bias Sanctuary visual story mode (scope expansion)  
**Summary:**  
- Expanded the P2.7 scope notes with story structure, media, audio/accessibility, UX, and data integration details.  
- Kept the next-slice recommendation focused on the visual story mode work.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-06  
**Slice:** Plan update — Bias Sanctuary visual story mode  
**Summary:**  
- Added a planned slice for a visual Bias Sanctuary story mode with scrollable webtoon panels and optional audio.  
- Updated the next-slice recommendation to prioritize the new story mode concept.  

**Files changed:**  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-06  
**Slice:** P2.6 More case studies  
**Summary:**  
- Expanded the bias case study catalog with new scenarios covering loss aversion, herding, and overconfidence.  
- Added quiz prompts and explanations for each new case study to keep the Bias Sanctuary flow engaging.  
- Logged the case study slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-15  
**Slice:** M2.7 (Alpha Day scheduler — deterministic timebase)  
**Summary:**  
- Passed a shared reference time through event aggregation so Alpha Day and monthly rotation scheduling stay deterministic during polling or testing.  
- Kept the Alpha Day quarterly window and Jackpot Week calculations intact while unifying event evaluation with the supplied “now.”  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/events.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and open the event calendar to confirm Alpha Day still appears in upcoming events and no regressions appear in recurring rotations.  

**Date:** 2026-02-04  
**Slice:** Master plan mini-game status sync (docs)  
**Summary:**  
- Updated the master plan mini-game status table to reflect completed game surfaces and their source files.  
- Added the newest timed-event mini-games to the master plan status list to keep planned vs shipped accurate.  
- Logged the doc-sync slice in the run-by-run plan.  

**Files changed:**  
- docs/DEV_PLAN_MARKETTYCOON_MASTER.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-14  
**Slice:** M4.4 (Graphic templates + animations)  
**Summary:**  
- Added learning tile graphic template presets with shimmer, sparkle, and orbit layers for richer quiz tile visuals.  
- Wired learning tile definitions to select templates so category quizzes stay visually distinct and consistent.  
- Expanded the learning tile animation stack with shimmer/orbit motion while keeping the layout mobile-first.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- apps/investing-board-game-v3/src/config/learning.ts  
- apps/investing-board-game-v3/src/lib/learningTiles.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and confirm learning tiles show the new shimmer/orbit visuals and distinct templates per quiz type.  

**Date:** 2026-02-14  
**Slice:** M4.3 (Rewards + streak system)  
**Summary:**  
- Centralized learning reward tuning values in the learning config so base and streak payouts are shared.  
- Added a learning reward helper to calculate streak bonuses and totals for micro-learning tiles.  
- Reused the shared daily streak helper for learning and quiz streak tracking.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/config/learning.ts  
- apps/investing-board-game-v3/src/lib/learningRewards.ts  
- apps/investing-board-game-v3/src/lib/streaks.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a learning tile on consecutive days and confirm the streak bonus scales while the daily streak count increments.  
- (manual) Complete a Bias Quiz and confirm the daily quiz streak still increments.  

**Date:** 2026-02-05  
**Slice:** Config strategy follow-up (learning config exports)  
**Summary:**  
- Centralized learning tile metadata, category styles, and question bank content in a shared learning config module.  
- Re-exported learning config types/data from the legacy learning helpers to keep existing imports stable.  
- Preserved learning tile and question lookup helpers while shifting the source of truth to config.  

**Files changed:**  
- apps/investing-board-game-v3/src/config/learning.ts  
- apps/investing-board-game-v3/src/lib/learningTiles.ts  
- apps/investing-board-game-v3/src/lib/learningQuestionBank.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open a learning tile and confirm the quiz content and category styling still render as expected.  

**Date:** 2026-02-05  
**Slice:** Config strategy follow-up (shop vault config exports)  
**Summary:**  
- Centralized Shop 2.0 fixture data and XP tuning constants in a shared shop vault config module.  
- Re-exported shop vault fixture types/data from the legacy fixtures helper to keep existing imports stable.  
- Updated vault XP math to read tuning constants from the shared config.  

**Files changed:**  
- apps/investing-board-game-v3/src/config/shopVault.ts  
- apps/investing-board-game-v3/src/lib/shopVaultFixtures.ts  
- apps/investing-board-game-v3/src/lib/shopVaultXp.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open Shop 2.0 vault overview and confirm fixture data still renders when Supabase is unavailable.  
- (manual) Purchase a vault item and confirm XP progress still increments.  

**Date:** 2026-02-05  
**Slice:** Config strategy follow-up (economy config extraction)  
**Summary:**  
- Centralized core economy tuning constants into a dedicated config module for shared reuse.  
- Re-exported economy constants from the legacy constants module to keep existing imports stable.  
- Documented completion of the economy config follow-up slice and advanced the next slice recommendation.  

**Files changed:**  
- apps/investing-board-game-v3/src/config/economy.ts  
- apps/investing-board-game-v3/src/lib/constants.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and confirm rolls, rewards, and roll multipliers behave as before.  


**Date:** 2026-02-05  
**Slice:** Config strategy kickoff (ring config extraction)  
**Summary:**  
- Moved ring configuration, Ring 3 settings, and portal settings into a dedicated config module.  
- Re-exported ring config from `mockData` so existing imports remain stable during the config migration.  
- Documented completion of the config strategy kickoff slice.  

**Files changed:**  
- apps/investing-board-game-v3/src/config/rings.ts  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board and confirm ring transitions, portal behavior, and ring labels still match prior behavior.  

**Date:** 2026-02-04  
**Slice:** Right Now calendar polish (upcoming events + mini-games roster)  
**Summary:**  
- Added a mini-game window roster to the Right Now calendar so upcoming mini-game windows appear alongside events.  
- Surfaced active mini-game windows with time-remaining callouts for quick status scanning.  
- Documented completion of the Right Now calendar polish slice.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/EventCalendar.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open Right Now and confirm upcoming mini-game windows show start times and countdowns.  
- (manual) During an active mini-game window, confirm the roster highlights it with an active badge.  

**Date:** 2026-02-04  
**Slice:** Unified window UI pass  
**Summary:**  
- Added a shared economy window status pill so HUD and phone dice controls reuse the same countdown + bonus display.  
- Surfaced active economy windows during overlays with a fixed banner to keep window bonuses visible while modals are open.  
- Centralized economy window countdown formatting for consistent window messaging.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/DiceHUD.tsx  
- apps/investing-board-game-v3/src/components/EconomyWindowStatus.tsx  
- apps/investing-board-game-v3/src/components/phone/DiceButton.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger an economy window and confirm the countdown + bonuses appear in the desktop Dice HUD and phone dice button.  
- (manual) Open a modal during an active economy window and confirm the banner stays visible.  

**Date:** 2026-02-04  
**Slice:** Event window unification pass  
**Summary:**  
- Added a shared window scheduling helper so events and mini-games use consistent timing logic.  
- Updated mini-game scheduling to rely on unified window calculations for active, upcoming, and countdown state.  
- Mapped recurring event timings onto the shared schedule helper to keep recurrence calculations aligned.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/events.ts  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/lib/windowSchedule.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Games Hub and verify scheduled mini-games still show active/upcoming windows as before.  
- (manual) Wait for any recurring event window to start/end and confirm the event toast and effects still trigger.  

**Date:** 2026-02-04  
**Slice:** P2 (Mega Jackpot event currency multipliers)  
**Summary:**  
- Applied economy multipliers to event currency star rewards so active event boosts (including Mega Jackpot) amplify event prize payouts.  
- Updated the master dev plan notes and advanced the recommended next slice.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger an event currency gain during Mega Jackpot and confirm the awarded stars reflect the active event multipliers.  



**Date:** 2026-02-13  
**Slice:** P2 (Mega Jackpot monthly event window)  
**Summary:**  
- Added monthly recurrence support for first-weekday scheduling so event windows can target “first Saturday” slots.  
- Introduced the Mega Jackpot recurring event with boosted stars/XP rewards and a custom-effect marker for future hooks.  
- Wired the new Mega Jackpot event into the standard events pipeline with dedicated currency progression targets.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/events.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Use the events feed to confirm a “Mega Jackpot” entry appears as an upcoming monthly event and becomes active during the first Saturday window.  


**Date:** 2026-02-15  
**Slice:** P2.5 (Sound effects pass — HUD button feedback)  
**Summary:**  
- Added button-click sound feedback for Compact HUD controls (background toggle, settings, stocks, expand/collapse).  
- Ensured the mute toggle only plays a click when unmuting to avoid silent feedback loops.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/phone/CompactHUD.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Ensure sound is enabled, then tap Compact HUD buttons to confirm the click sound fires; mute and unmute to confirm the click only plays on unmute.  

**Date:** 2026-02-03  
**Slice:** P2.4 (Event system audit — limited-time windows)  
**Summary:**  
- Audited the event system scheduling (recurring, special, rotation, Alpha Day, Jackpot Week) and documented the client-local, minute-based polling model.  
- Reviewed mini-game window scheduling (daily/weekly/monthly-random) and noted the deterministic monthly-random slots and minute-based refresh.  
- Logged the current split between event windows and mini-game windows, highlighting the lack of shared window engine or server-time sync.  

**Files changed:**  
- apps/investing-board-game-v3/CHALLENGES_EVENTS_IMPLEMENTATION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none; documentation-only)  

**Date:** 2026-02-14  
**Slice:** P2.2 (Ring-based leaderboards)  
**Summary:**  
- Added ring-specific leaderboard tabs so Ring 1, Ring 2, and Ring 3 cohorts get their own rankings views.  
- Updated ring leaderboard fetching to pull the top entries per ring for consistent ranking data.  
- Kept the Hall of Fame view powered by throne counts while the footer highlights the active ring leaderboard context.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/LeaderboardModal.tsx  
- apps/investing-board-game-v3/src/hooks/useLeaderboard.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the leaderboard modal, switch to Ring Leaders, toggle Ring 1/2/3 tabs, and confirm the Hall of Fame view still orders by throne count.  

**Date:** 2026-02-07  
**Slice:** P3 (Merger Mania timed mini-game surface)  
**Summary:**  
- Built a mobile-first Merger Mania timed-event surface with deal targets, negotiation levers, and integration tracks for the M&A sprint.  
- Added a weekly Merger Mania schedule slot so the mini-game availability system can surface live/upcoming deal windows.  
- Wired the Games Hub card to show Merger Mania availability labels and gate access until the deal window is live.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/MergerMania.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm Merger Mania shows live/upcoming timing labels, and open it during an active window to view the deal-room layout.  

**Date:** 2026-02-07  
**Slice:** P3 (IPO Frenzy timed mini-game surface)  
**Summary:**  
- Built a mobile-first IPO Frenzy timed-event surface with allocation playbooks, pop signals, and roadshow framing for IPO launches.  
- Added a weekly IPO Frenzy schedule slot so the mini-game availability system can surface live/upcoming IPO windows.  
- Wired the Games Hub card to show IPO Frenzy availability labels and gate access until the window is live.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/IpoFrenzy.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm IPO Frenzy shows live/upcoming timing labels, and open it during the Tuesday 7pm local window to view the IPO layout.  

**Date:** 2026-02-06  
**Slice:** P3 (Bear Trap timed mini-game surface)  
**Summary:**  
- Built a mobile-first Bear Trap timed-event surface with defense pods, alert stream callouts, and rebound bonus framing for the bear-market loop.  
- Added a nightly Bear Trap schedule slot so the mini-game availability system can surface live/upcoming drop windows.  
- Wired the Games Hub card to show Bear Trap availability labels and gate access until the drop window is live.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/BearTrap.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm Bear Trap shows live/upcoming timing labels, and open it during the nightly drop window (daily at 9pm local) to view the defense layout.  

**Date:** 2026-02-05  
**Slice:** P3 (Bull Run timed mini-game surface)  
**Summary:**  
- Built a mobile-first Bull Run timed-event surface with momentum lanes, surge picks, and streak callouts for the rally loop.  
- Added daily Bull Run schedule metadata so the mini-game availability system can surface live/upcoming windows.  
- Wired the Games Hub card to show Bull Run availability labels and gate access until the rally is live.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/BullRun.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm Bull Run shows live/upcoming timing labels, and open it during an active window to view the rally layout.  

**Date:** 2026-02-04  
**Slice:** P3 (Dividend Derby timed mini-game surface)  
**Summary:**  
- Built a mobile-first Dividend Derby event surface with lane bonuses, lineup cards, and photo-finish messaging for the monthly showcase.  
- Added monthly schedule metadata so the mini-game availability system can surface upcoming Dividend Derby windows.  
- Wired the Games Hub card to show Dividend Derby availability labels and gate access until the derby is live.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/DividendDerby.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm Dividend Derby shows live/upcoming timing labels, and open it during an active window to view the race layout.  

**Date:** 2026-02-08  
**Slice:** P1.6 (Vault Heist timed mini-game surface)  
**Summary:**  
- Built a mobile-first Vault Heist timed-event surface with lane callouts, crew boost messaging, and alarm risk cues.  
- Wired the mini-games hub Vault Heist card to show schedule availability and open only during live heist windows.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/VaultHeist.tsx  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Games Hub during the Vault Heist window and launch Vault Heist to confirm the heist surface and countdown label render on mobile.  

**Date:** 2026-02-02  
**Slice:** P1.5 (Stock Rush timed mini-game surface)  
**Summary:**  
- Built a mobile-first Stock Rush timed-event surface with rush bonuses, countdown status, and pick cards.  
- Wired the mini-games hub Stock Rush card to show schedule availability and open only during live rush windows.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/StockRush.tsx  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Games Hub during a Stock Rush window and launch Stock Rush to confirm the rush surface, countdown, and pick cards render on mobile.  

**Date:** 2026-02-06  
**Slice:** P1.4 (Happy Hour wheel scheduling in Games Hub)  
**Summary:**  
- Tightened mobile UX by disabling focus/interaction on closed mini-game cards and tuning availability label sizing.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/GameCard.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Games Hub outside Happy Hour and confirm the Wheel of Fortune card is not focusable/clickable and the availability line fits on mobile.  

**Date:** 2026-02-06  
**Slice:** P1.4 (Happy Hour wheel scheduling in Games Hub)  
**Summary:**  
- Hooked the mini-games hub into the mini-game schedule engine so Wheel of Fortune is only playable during Happy Hour windows.  
- Added availability messaging on the Wheel of Fortune card for live countdowns or upcoming start times.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/GameCard.tsx  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Games Hub outside Happy Hour and confirm the Wheel of Fortune card shows Closed with a next start time.  
- (manual) During Happy Hour, confirm the Wheel of Fortune card shows a live countdown and the Play button is enabled.  

**Date:** 2026-02-06  
**Slice:** P0 (multi-ring UI rendering)  
**Summary:**  
- Synced phone board ring counts to the canonical ring configuration so Ring 2/3 positioning and scale match the real tile counts.  
- Normalized mobile ring position math to keep multi-ring rendering consistent when entering inner rings.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/phone/MobileBoard3D.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board on a phone viewport, transition to Ring 2 or Ring 3, and confirm the camera centers correctly on the inner ring tiles.  

**Date:** 2026-02-05  
**Slice:** P1.3 (Roulette victory sequence)  
**Summary:**  
- Added a dedicated roulette victory modal with tier-based styling, celebration effects, and reward recap copy.  
- Wired roulette spins and mode resets to open or clear the victory sequence for cleaner roulette flow feedback.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/RouletteVictoryModal.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger a Wealth Run roulette spin and confirm the victory modal appears with the reward summary, then close it to continue.  

**Date:** 2026-02-04  
**Slice:** Wealth Run Roulette Loop (richer roulette UX + long-tail rewards)  
**Summary:**  
- Expanded the roulette reward table with additional mid-tier payouts plus long-tail rewards like rolls and XP.  
- Added a roulette status panel to surface live mode, latest spin result, and highlighted rewards in a mobile-first layout.  
- Reset roulette session stats on activation and track roulette spins for clearer loop feedback.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/RouletteStatusPanel.tsx  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger a Wealth Run win tile, confirm the roulette status panel appears and highlights rewards.  
- (manual) Spin roulette multiple times; verify rewards apply for cash, stars, coins, XP, and rolls as shown in the toast.  


**Date:** 2026-02-02  
**Slice:** P1 (Elite stock special behaviors)  
**Summary:**  
- Added elite stock purchase bonuses that grant extra stars and XP based on composite scores with live economy multipliers.  
- Tracked bonus stars for elite purchases and surfaced a dedicated elite bonus toast on buy.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on an elite stock tile, purchase shares, and confirm the bonus toast shows added stars/XP.  

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

**Date:** 2026-02-03  
**Slice:** P2 (Market Mayhem timed mini-game surface)  
**Summary:**  
- Built a mobile-first Market Mayhem timed-event surface with rapid decision CTAs, flash signal callouts, and a leaderboard preview.  
- Added monthly-random schedule support for Market Mayhem so the mini-game hub can surface live and upcoming surge windows.  
- Wired the Games Hub card to show Market Mayhem availability labels and open the event when the surge is active.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/MarketMayhem.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub, confirm Market Mayhem shows live/upcoming timing labels, and open it during an active window to view the trading-floor layout.  

**Date:** 2026-02-02  
**Slice:** P3 (Portfolio Poker timed mini-game surface)  
**Summary:**  
- Built a mobile-first Portfolio Poker timed-event surface with hand-combo bonuses, opponent callouts, and round-flow framing.  
- Added a daily Portfolio Poker schedule slot so the mini-game hub can surface live/upcoming table windows.  
- Wired the Games Hub card to show Portfolio Poker availability labels and gate access to live windows.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/games/placeholders/PortfolioPoker.tsx  
- apps/investing-board-game-v3/src/lib/miniGameSchedule.ts  
- apps/investing-board-game-v3/src/pages/GamesHub.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the mini-games hub during the Portfolio Poker window (daily at 6pm local), confirm the card shows a live label, and open it to view the poker table layout.  

**Date:** 2026-02-03  
**Slice:** Ring Transition Animations  
**Summary:**  
- Added direction-aware ring transition pulses so portal ascents/descents accent the board container without fighting mobile transforms.  
- Hooked portal-driven ring transitions to trigger the new up/down focus animation and clear transition timers safely.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/index.css  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Trigger a portal ascend/descend (land on start tiles) and confirm the board container flashes a directional focus pulse.  

**Date:** 2026-02-08  
**Slice:** P3 (Stock category audit + config hooks)  
**Summary:**  
- Added a shared stock category catalog with tiering and palette metadata to prep expansion categories like international equities.  
- Routed portfolio visuals to read category labels/colors from the shared catalog for consistent future rollouts.  
- Updated universe stock bucketing to use shared category lists while keeping the core category order intact.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/stockCategories.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- apps/investing-board-game-v3/src/hooks/useUniverseStocks.ts  
- apps/investing-board-game-v3/src/components/PortfolioModal.tsx  
- apps/investing-board-game-v3/src/components/PortfolioReadoutPanel.tsx  
- apps/investing-board-game-v3/src/components/PortfolioWheel.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the portfolio modal/readout panel and confirm category labels/colors match prior visuals with no regressions.  

**Date:** 2026-02-09  
**Slice:** P3 (Expansion category tiles + mock data coverage)  
**Summary:**  
- Swapped in expansion stock categories on Ring 1 and Ring 2 mock tiles so IPO, meme, crypto, penny, leverage, options, and international lanes appear in the board loop.  
- Added mock stock coverage for every expansion category to keep fallback pulls deterministic when Supabase is unavailable.  
- Rebalanced Ring 2 stock tile labels to spotlight expansion category themes.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on the updated Ring 1/Ring 2 category tiles and confirm expansion category modals show the new mock stock entries.  

**Date:** 2026-02-10  
**Slice:** P3 (Expansion category tuning + tile copy pass)  
**Summary:**  
- Tuned expansion category metadata so international stocks live with the other expansion tiers.  
- Refreshed Ring 1/Ring 2 expansion tile titles to reinforce category themes.  
- Polished expansion mock stock blurbs with sharper, mobile-friendly copy.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/stockCategories.ts  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on expansion category tiles and confirm the refreshed titles and stock descriptions render in the stock modal.  

**Date:** 2026-02-11  
**Slice:** P3 (Expansion category art/FX + reward callouts)  
**Summary:**  
- Added expansion-tier tile FX overlays so expansion categories glow with their palette accent on the board.  
- Updated expansion category tile labels to call out bonus rewards alongside ring multipliers.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- apps/investing-board-game-v3/src/lib/stockCategories.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Load the board, find expansion category tiles, and confirm the glow FX + “Expansion” reward callout appear.  

**Date:** 2026-02-12  
**Slice:** P3 (Expansion category landing FX polish + sound stingers)  
**Summary:**  
- Added a landing-only expansion pulse glow so expansion tiles pop on touchdown.  
- Triggered an expansion landing stinger with celebratory tile emojis for expansion category stops.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/components/Tile.tsx  
- apps/investing-board-game-v3/src/lib/sounds.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on an expansion category tile and confirm the landing pulse glow, stinger sound, and celebratory emoji burst fire once.  

**Date:** 2026-02-13  
**Slice:** P2 (Ring history tracking)  
**Summary:**  
- Added ring visit counts, last-visit metadata, and ring history entries to player stats for tracking progression across rings.  
- Wired ring transitions (movement hops, portal transitions, manual jumps, and throne resets) to record ring history updates.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/hooks/useGameSave.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Move between rings via portals or debug jumps and confirm ring history/counts update in the saved game stats.  

**Date:** 2026-02-03  
**Slice:** P2.3 (Advanced portfolio analytics)  
**Summary:**  
- Added portfolio insight blocks with invested capital, unrealized P/L, diversification, and top performer metrics in the portfolio modal.  
- Surfaced per-holding value and gain/loss readouts alongside existing holdings details.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/PortfolioModal.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Portfolio modal with holdings and confirm the insight cards and per-holding P/L metrics render correctly.  
- (none)  

**Date:** 2026-02-03  
**Slice:** Fall Portals + Chance Lift (Ring 2 portal outcomes + feedback polish)  
**Summary:**  
- Added portal animation toast overrides so Ring 2 fall portals can rely on their reward feedback without the generic portal-down message.  
- Updated fall portal transitions to suppress the default portal toast, keeping the safety-net/evac reward callouts as the primary feedback.  
- Documented completion of the Fall Portals + Chance Lift slice and advanced the recommended next slice.  

**Files changed:**  
- apps/investing-board-game-v3/src/App.tsx  
- apps/investing-board-game-v3/src/lib/types.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Land on a Ring 2 Fall Portal tile and confirm the reward/portal outcome toast appears without the generic “Portal Down” message.  

**Date:** 2026-02-04  
**Slice:** Master plan status sync (docs alignment)  
**Summary:**  
- Synced the master plan status table with completed systems and cleared stale in-progress/planned entries.  
- Logged the master plan status sync slice in the run-by-run plan for traceability.  

**Files changed:**  
- docs/DEV_PLAN_MARKETTYCOON_MASTER.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-05  
**Slice:** P4.1 Holiday event schedule fixtures  
**Summary:**  
- Added seasonal special-event fixtures (Founders Day, Summer Market Festival, Holiday Rally) to the events catalog so the calendar can surface holiday windows.  
- Tuned reward multipliers and currency rules for the new holiday events to keep bonuses aligned with existing event tiers.  
- Logged completion of the holiday events slice in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/lib/events.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (none)  

**Date:** 2026-02-04  
**Slice:** P4.2 Rare event calendar callouts  
**Summary:**  
- Added rare-event badges to highlight Alpha Day and jackpot moments in the event calendar.  
- Kept the calendar layout mobile-first while adding rarity cues to selected-date and upcoming lists.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/EventCalendar.tsx  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the event calendar and confirm Alpha Day, Mega Jackpot, or Jackpot Week entries show a “Rare” badge in the selected-date and upcoming lists.  
**Date:** 2026-02-08  
**Slice:** M3.5 Price data strategy (with fallback)  
**Summary:**  
- Added a stock price resolver that prefers live market prices when provided, with deterministic fallback pricing when missing.  
- Updated universe stock fetching to accept optional price fields without breaking Supabase queries.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/hooks/useUniverseStocks.ts  
- apps/investing-board-game-v3/src/lib/stockPricing.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the board game, land on a stock tile, and confirm prices show; if your Supabase universe includes price fields, verify they appear instead of the fallback values.  

**Date:** 2026-02-06  
**Slice:** P2.7 Bias Sanctuary visual story mode  
**Summary:**  
- Added scrollable story mode panels with takeaway and resume/skip controls to the Bias Sanctuary flow.  
- Extended bias case study fixtures with story beats, mood treatments, and audio cue metadata plus a mute toggle.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/BiasSanctuaryModal.tsx  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- apps/investing-board-game-v3/src/lib/types.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open Bias Sanctuary and confirm story mode panels, takeaway, and resume/skip controls appear before the quiz.  

**Date:** 2026-02-04  
**Slice:** P2.8 Bias Sanctuary ambient audio cues  
**Summary:**  
- Added story-level ambient audio playback with captions in the Bias Sanctuary story header.  
- Applied ambient audio metadata to bias story fixtures for consistent fallback behavior.  
- Logged the slice completion in the run-by-run plan.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/BiasSanctuaryModal.tsx  
- apps/investing-board-game-v3/src/lib/mockData.ts  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open Bias Sanctuary, enter story mode, and confirm the ambient caption appears and the ambient cue plays once when the story starts.  

**Date:** 2026-02-07  
**Slice:** P3.6 Scratchcard 2.0 odds peek CTA  
**Summary:**  
- Added a “See odds + EV” CTA to the scratchcard header with win chances, EV ranges, and prize table details.  
- Displayed per-currency EV summaries so players can read payout expectations without leaving the ticket.  
- Logged the slice completion in the run-by-run plan and scratchcard evolution doc.  

**Files changed:**  
- apps/investing-board-game-v3/src/components/ScratchcardGame.tsx  
- apps/investing-board-game-v3/SCRATCHCARD_EVOLUTION.md  
- DEV_PLAN.md  
- CHANGELOG_DEV.md  

**SQL migrations:**  
- (none)  

**How to test:**  
- (manual) Open the Casino scratchcard, tap “See odds & EV,” and confirm win chances, EV ranges, and prize table details appear and toggle.  
