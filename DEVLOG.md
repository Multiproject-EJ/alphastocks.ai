# DEVLOG

## Step 0 — Repository inspection & setup

### Scope
Transform the existing City Builder feature into a Stock Exchange Builder for the board-game-v3 app.

### Key locations discovered (City Builder)
- **Data model & mechanics**: `apps/investing-board-game-v3/src/lib/cityBuilder.ts`
  - City, Building, CityBuilderState definitions.
  - Core logic like upgrade cost/reward, completion checks, and initial state.
- **UI**: `apps/investing-board-game-v3/src/components/CityBuilderModal.tsx`
  - Modal UI for city list, building cards, upgrade buttons, and progress indicators.
- **State hook**: `apps/investing-board-game-v3/src/hooks/useCityBuilder.ts`
  - Manages city progression, upgrade logic, unlocking, rewards, and daily limit.
- **Game state integration**:
  - `apps/investing-board-game-v3/src/lib/types.ts` includes `cityBuilder` data under `GameState`.
  - `apps/investing-board-game-v3/src/App.tsx` wires `useCityBuilder` into game state, syncs updates, and surfaces the City Builder modal.
- **Overlay routing**:
  - `apps/investing-board-game-v3/src/lib/overlayRegistry.ts` registers the `CityBuilderModal`.
  - `apps/investing-board-game-v3/src/components/UIModeOverlayBridge.tsx` references city builder overlay.
  - `apps/investing-board-game-v3/src/lib/uiModeStateMachine.ts` logs entry/exit for city builder mode.

### Notes on current behavior
- City Builder is a **Monopoly Go-style** progression with:
  - A fixed sequence of cities (`CITIES` array) and **5 buildings** each.
  - **Daily upgrade limit** (one upgrade per day) and **star cost** per upgrade.
  - Unlocking cities based on **star thresholds** (stars are checked, not spent).
  - Completion tracking and rewards (coins/stars).

### Environment / setup actions
- Created feature branch: `feature/stock-exchange-builder`.
- **No local dev server run yet** (npm install/start not executed during Step 0).

### Potential challenges for replacement
- City Builder is deeply wired into GameState and the overlay system, so a Stock Exchange Builder should replace or extend the existing `cityBuilder` shape to avoid breaking persistence.
- The daily upgrade limit and sequential unlocking are currently core mechanics; these will need to be swapped for the **dual progression model** (pillar upgrades + stock discovery).
- UI is optimized for a modal with per-building cards; the Stock Exchange Builder will need new card art handling, progress bars per pillar, and stock discovery counts while remaining responsive.
