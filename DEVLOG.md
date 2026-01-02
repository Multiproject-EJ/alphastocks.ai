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

## Step 1 — Define the Data Model for Stock Exchanges

### What changed
- Added a new Stock Exchange Builder data model with exchange definitions, pillars, upgrade cost formula, and helper utilities.
- Extended `GameState` to include an optional `stockExchangeBuilder` shape for persistence.

### Files touched
- `apps/investing-board-game-v3/src/lib/stockExchangeBuilder.ts`
- `apps/investing-board-game-v3/src/lib/types.ts`

### Commands run + results
- `npm test` → failed (missing script: "test").  
- `npm run build` → succeeded with existing warnings in the build output.  
- `npm run lint` → failed (missing script: "lint").  

### How to verify in the UI
- No UI changes in Step 1. This is a data-model-only update.

### TODOs / follow-ups
- Wire `stockExchangeBuilder` into app state and UI in Steps 2–3.
- Replace placeholder card art paths with real assets when available.

## Step 2 — Build Responsive UI Components for the Exchange Builder

### What changed
- Added a new `StockExchangeBuilderModal` UI with responsive layout for exchange navigation, pillar upgrades, and stock discovery.
- Built reusable cards for exchange overview, pillar progress, and stock discovery actions.

### Files touched
- `apps/investing-board-game-v3/src/components/StockExchangeBuilderModal.tsx`

### Commands run + results
- `npm test` → failed (missing script: "test").
- `npm run build` → succeeded with existing warnings in the build output.
- `npm run lint` → failed (missing script: "lint").

### How to verify in the UI
- Open the Stock Exchange Builder modal (once wired in Step 3) and confirm the layout adapts between mobile and desktop widths, with pillar cards and stock discovery panels visible.

### TODOs / follow-ups
- Wire the modal into the overlay system and hook it up to live progression logic in Step 3.

## Step 3 — Implement Progression Logic and Game Mechanics

### What changed
- Added progression utilities to compute stock discovery progress, overall progress, exchange level, glossy completion, and update card art.
- Implemented upgrade and stock-view helper functions to advance pillar levels, track capital invested, and recalculate exchange completion state.
- Updated the Stock Exchange Builder modal to display overall progress based on both pillar upgrades and stock discovery.

### Files touched
- `apps/investing-board-game-v3/src/lib/stockExchangeBuilder.ts`
- `apps/investing-board-game-v3/src/components/StockExchangeBuilderModal.tsx`

### Commands run + results
- `npm test` → failed (missing script: "test").
- `npm run build` → succeeded with existing warnings in the build output.
- `npm run lint` → failed (missing script: "lint").

### How to verify in the UI
- Open the Stock Exchange Builder modal and confirm the overall progress bar reflects combined pillar and stock discovery progress when the underlying state changes.

### TODOs / follow-ups
- Wire the Stock Exchange Builder modal into live game state to exercise the new progression helpers.
## Step 4 — Implement the Archive / Album Feature

### What changed
- Added archive entry helpers to collect completed exchanges and surface them in the Stock Exchange Builder UI.
- Added an Archive Album section to the modal that lists completed exchanges with card art, glossy badges, and completion dates.

### Files touched
- `apps/investing-board-game-v3/src/lib/stockExchangeBuilder.ts`
- `apps/investing-board-game-v3/src/components/StockExchangeBuilderModal.tsx`

### Commands run + results
- `npm test` → failed (missing script: "test").
- `npm run build` → succeeded with existing build warnings.
- `npm run lint` → failed (missing script: "lint").
- `npm run dev -- --host 0.0.0.0 --port 5000` (apps/investing-board-game-v3) → started for screenshot, then stopped.

### How to verify in the UI
- Open the Stock Exchange Builder modal and scroll below the stock discovery section.
- Confirm the "Archive Album" section appears and lists any exchanges with `completedAt` populated; otherwise it shows the empty-state message.

### TODOs / follow-ups
- Wire real completion data into game state once progression is connected to gameplay.

## Step 5 — Integrate Monetization Features (Optional)

### What changed
- Added premium offer metadata for Stock Exchange Builder monetization packs.
- Added a Premium Boosts section in the Stock Exchange Builder modal with offer cards and CTA buttons.

### Files touched
- `apps/investing-board-game-v3/src/lib/stockExchangeBuilder.ts`
- `apps/investing-board-game-v3/src/components/StockExchangeBuilderModal.tsx`

### Commands run + results
- `npm test` → failed (missing script: "test").
- `npm run build` → succeeded with existing build warnings.
- `npm run lint` → failed (missing script: "lint").
- `npm run dev -- --host 0.0.0.0 --port 5000` (apps/investing-board-game-v3) → started for screenshot, then stopped.

### How to verify in the UI
- Open the Stock Exchange Builder modal.
- Scroll below Exchange Insights to find the “Premium Boosts” section.
- Confirm the offer cards list perks and show “Coming Soon” CTAs when no purchase handler is wired.

### TODOs / follow-ups
- Wire real purchase flow and pricing configuration when monetization backend is ready.

## Step 6 — Testing and Optimization

### What changed
- Memoized stock discovery lookup sets and exchange progress lookups to reduce repeated searches in the Stock Exchange Builder modal.
- Reduced repeated `progress.find` calls by caching exchange progress in a map.

### Files touched
- `apps/investing-board-game-v3/src/components/StockExchangeBuilderModal.tsx`

### Commands run + results
- `npm test` → failed (missing script: "test").
- `npm run build` → succeeded with existing warnings in the build output.
- `npm run lint` → failed (missing script: "lint").

### How to verify in the UI
- Open the Stock Exchange Builder modal and switch between exchanges.
- Confirm the list, progress bars, and stock discovery buttons behave as before with no visual regressions.

### TODOs / follow-ups
- Add targeted performance profiling once the Stock Exchange Builder is wired to live gameplay state.
