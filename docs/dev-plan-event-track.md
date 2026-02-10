# Event Reward Track / Progress Bar — Dev Plan

**System source of truth:** See `docs/DEV_PLAN_MARKETTYCOON_MASTER.md` for the canonical MarketTycoon game systems, loop, and economy. If something here conflicts, update the master plan first.


## Repo Findings
- Gameplay loop and UI orchestration live in `apps/investing-board-game-v3/src/App.tsx` with handlers like `handleRoll`, `handleTileLanding`, and the overlay system (`useOverlayManager`).
- Game state is modeled in `apps/investing-board-game-v3/src/lib/types.ts` (`GameState`), saved via Supabase in `apps/investing-board-game-v3/src/hooks/useGameSave.ts`.
- Gameplay events are produced inside `App.tsx` (dice rolls, tile landings, challenge completions), and the HUD/overlay layout is rendered in the same file.
- UI styling uses Tailwind classes and component primitives under `apps/investing-board-game-v3/src/components/ui`.

## Creative Upgrade Suggestions
1. Dual track (free + premium) with premium purchase upsell and locked premium milestones.
2. Event timer ribbon with end-time countdown and “last chance” glow.
3. Shimmer animation on claimable milestones (respect reduced motion).
4. Haptic burst + confetti overlay when milestones are claimed.
5. Reward preview tooltips with rarity color chips and icons.
6. “Close to milestone” CTA pulse and micro-animations.
7. Event leaderboard popover tied to track progress.
8. Accessibility improvements: high-contrast mode and reduced-motion toggle.
9. Remote config for milestones/rewards (Supabase/edge function).
10. Analytics hooks for impressions, CTA usage, and claim conversions.

**MVP**: single track, 4–6 milestones, local tooltips, basic CTA, points from rolls/landings/challenges.

**Deluxe**: free/premium track, dynamic event scheduling, confetti/haptics, remote config, analytics, and richer reward previews.

## Data Model
**Event Definition**
- `id` (string)
- `name` (string)
- `endTime` (ISO string)
- `pointsMax` (number)
- `milestones[]` (id, pointsRequired, reward)

**Player Progress State**
- `points` (number)
- `claimedMilestones[]` (string ids)
- `premiumPurchased?` (boolean)
- `lastUpdated` (ISO string)

## Integration Points
- **Gameplay → points**
  - Dice roll: `handleRoll` in `App.tsx`
  - Tile landing: `handleTileLanding` in `App.tsx`
  - Challenge completion: `useChallenges` hook callback
- **UI placement**
  - Desktop: left HUD stack in `App.tsx`
  - Phone: fixed bar below `CompactHUD`
- **Reward application**
  - Rolls: update `rollsRemaining` + `energyRolls`
  - Coins: `useCoins` hook
  - Boosts: `activeEffects` (e.g., `double-reward-card`, `market-shield`)

## Persistence
- Supabase per-user storage via `board_game_profiles.event_track` (JSONB)
- Local fallback handled through default `GameState.eventTrack` initialization

## Telemetry/Analytics (optional)
- Log CTA clicks, milestone claims, and completion rate (if analytics hooks exist).

## Execution Rules
- Keep slices small and shippable (single behavior change per slice when possible).
- Prefer config-first updates before introducing new hard-coded logic.
- After each slice: update this plan, mark the slice status, and write the next concrete step.

## Progress Tracker
- [x] Slice 1 — Create Event Track module
- [x] Slice 2 — Add UI component
- [x] Slice 3 — Persist and model state
- [x] Slice 4 — Gameplay integration
- [x] Slice 5 — Polish and UX baseline (reduced motion + responsive placement)
- [x] Slice 6 — CTA affordability guardrails (disable CTA when coins are insufficient)
- [x] Slice 7 — Config-first CTA tuning (cost multipliers + thresholds in config)
- [ ] Slice 8 — Config-first jump-threshold tuning (promote threshold into shared config)

## Progress Log
- 2026-02-10: Completed Slice 6 by wiring CTA disabled state to current coin balance in `useEventTrack` and propagating that disabled state to desktop + compact `EventTrackBar` usage in `App.tsx`. This prevents "boost" taps that cannot succeed and keeps the CTA honest.
- 2026-02-10: Completed Slice 7 by moving CTA pricing knobs (minimums + multipliers) into `features/eventTrack/config.ts` and routing `useEventTrack` through a pure `getEventTrackCtaCosts` helper. Added focused unit coverage for default and override pricing behavior.
- Next step: Start Slice 8 by making `jumpThreshold` config-driven (mirroring CTA costs) so pacing experiments can be tuned from one place without touching hook logic.

## Step-by-Step Dev Plan
1. **Create Event Track module**
   - **Goal**: Establish a clean feature boundary with types, store helpers, reward engine, and integration adapter.
   - **Files**: 
     - `apps/investing-board-game-v3/src/features/eventTrack/types.ts`
     - `apps/investing-board-game-v3/src/features/eventTrack/store.ts`
     - `apps/investing-board-game-v3/src/features/eventTrack/rewards.ts`
     - `apps/investing-board-game-v3/src/features/eventTrack/adapter.ts`
   - **Acceptance**: Pure utilities compile; reward application updates rolls/coins/boosts.
   - **Test Notes**: Static check with TypeScript build.

2. **Add UI component**
   - **Goal**: Render progress bar, milestones, tooltips, and CTA button.
   - **Files**: `apps/investing-board-game-v3/src/features/eventTrack/components/EventTrackBar.tsx`
   - **Acceptance**: UI renders with progress, milestone states, tooltip preview, and claim CTA.
   - **Test Notes**: Manual UI verification on desktop + phone.

3. **Persist and model state**
   - **Goal**: Extend `GameState` and Supabase save/load routines.
   - **Files**:
     - `apps/investing-board-game-v3/src/lib/types.ts`
     - `apps/investing-board-game-v3/src/hooks/useGameSave.ts`
     - `apps/investing-board-game-v3/PHASE_8_MIGRATION.sql`
   - **Acceptance**: Event track progress survives reload for authenticated users.
   - **Test Notes**: Login → roll → reload → progress remains.

4. **Gameplay integration**
   - **Goal**: Tie points to rolls, tile landings, and challenge completions.
   - **Files**: `apps/investing-board-game-v3/src/App.tsx`, `apps/investing-board-game-v3/src/hooks/useChallenges.ts`
   - **Acceptance**: Real actions add points; milestones can be claimed.
   - **Test Notes**: Roll dice, land on tiles, complete challenges to see progress increments.

5. **Polish and UX**
   - **Goal**: Ensure reduced motion support and consistent styling with the board UI.
   - **Files**: `apps/investing-board-game-v3/src/features/eventTrack/components/EventTrackBar.tsx`
   - **Acceptance**: Animations respect reduced motion; CTA updates correctly.
   - **Test Notes**: Toggle reduced motion in settings and verify.
