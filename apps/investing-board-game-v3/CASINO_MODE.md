# Casino Mode (Game Board V3) — Developer Plan

> **Purpose:** Track the full build of the new Casino Mode system as a living, check-off-able plan.
> This document is designed for AI + human execution in small, verifiable chunks.
> **Mobile-first always:** every layout, animation, and interaction should be built for mobile UI first, then scaled up for desktop. Do not ship desktop-only layouts.

---

## Mobile-First Foundations (Read This First)

- **Primary target:** phone-sized screens; assume touch input, limited vertical space, and one-handed play.
- **Design rule:** start with the mobile layout and interactions, then adapt for tablet/desktop.
- **Performance rule:** avoid heavy DOM layers during casino mode; keep animations efficient on mobile GPUs.
- **Accessibility rule:** ensure large tap targets, visible focus states, and readable text at small sizes.
- **QA rule:** every step in this plan must be validated on mobile view before desktop.

---

## 0) Quick Status

- **Doc owner:** Game Board V3
- **Scope:** Ring 1 gameplay + casino entry tile behavior
- **State:** In progress (single-truth plan)

### Status Snapshot (2026-02-13)
- **Single truth decision:** Casino tile now enters Plan A (Golden Tile Hunt) as the primary flow.
- **Integration rule:** Existing casino content is reused as mini-games inside Plan A (Scratchcard, Dice, Blackjack are live entries).
- **Code status:** Entry selection + Mode A panel integration started; full board masking and Mode B visuals still pending.

### Next Slice (P0 Foundation)

_All P0 tasks shipped._
1. Add `casinoMode` + `casinoModePhase` to core game state.
2. Implement ring-2/3 masking during casino mode (opacity 0 + pointer-events: none).
3. Add a minimal `CasinoWinOverlay` to verify end-to-end loop and exit safety.
4. Add a debug toggle to force Mode A/Mode B.

---

## 0.1 Context & Player Story

- **Why this exists:** Casino Mode is the high-drama, high-reward loop that breaks the normal board rhythm and spikes excitement.
- **Player expectation:** landing on the Casino tile should feel like the board transforms into a short, high-stakes mini-event.
- **Core fantasy:** “I triggered a special casino moment, the board changed, I made a bet, and I celebrated a win.”
- **Primary platform:** **mobile UI first**, always. This means clear touch targets, large labels, and legible contrast even under glow effects.

---

## 1) Outcomes (Definition of Done)

> Single truth: landing on Casino must route into Casino Mode.
> Plan A ships first and uses existing casino mini-games as the first set of 8 tiles.

- [x] Landing on the **Casino** tile triggers a 50/50 roll between **Casino Mode A** and **Casino Mode B**.
- [x] Casino Mode is **ring-1 only**. Rings 2 and 3 are fully muted (transparent/invisible) while Casino Mode is active.
- [x] The Casino Mode state **persists** until the mode’s win condition is completed, then the board resets to normal.
- [x] A full-screen **celebration** (fireworks + win summary) triggers on a casino win, then the board returns to normal.
- [x] Both modes are fully documented and testable with debug toggles.
- [x] **Mobile-first validation:** every flow is verified at phone width before desktop polish.

---

## 2) Shared Build Tasks (apply to both modes)

### 2.1 Data + State
- [x] Add a `casinoMode` state (`'none' | 'modeA' | 'modeB'`) to the core game state.
- [x] Add a `casinoModeStep` / `casinoModePhase` state for internal sub-flow (e.g., waiting, spinning, reward).
- [x] Add deterministic RNG helper to ensure true 50/50 selection in the long run.
- [x] Add a debug toggle (query param or in dev overlay) to force Mode A / Mode B.

### 2.2 Board Visual Layer Controls
- [x] Add a board “overlay mode” to recolor / restyle ring 1 tiles while muting other rings.
- [x] Add a `boardDimmer`/`boardMask` effect to fade rings 2 and 3 (opacity: 0, pointer-events: none).
- [x] Add per-tile override styling for Casino Mode (color, glow, prize labels, etc.).

### 2.3 Win + Celebration
- [x] Create a `CasinoWinOverlay` (full-screen) with fireworks + win summary.
- [x] Ensure celebration blocks other interactions until dismissed.
- [x] On celebration close, revert to normal board state and resume standard game loop.

---

## 3) Casino Mode A — Golden Tile Hunt

> **Theme:** The board becomes a yellow casino surface with 8 glowing gold/black “casino game” tiles.

### 3.1 Behavior
- [x] On entry, recolor **all ring 1 tiles** to yellow “win tiles.”
- [x] Insert **8 Casino Game Placeholder tiles** across ring 1 positions (evenly spaced).
- [x] All **non-game** tiles show a **cash prize** between $10 and $250,000.
- [x] Mode persists until player lands on one of the 8 Casino Game tiles.

### 3.2 Visual Spec
- [x] **Casino Game tiles:** glowing gold + black style, distinct from win tiles.
- [x] **Win tiles:** yellow with prize display (e.g., “$120,000”).
- [x] **Board ring 2/3:** invisible/transparent while mode is active.

### 3.3 Win Flow
- [x] Landing on a casino game tile triggers a **mini-game start** placeholder.
- [x] When the mini-game completes, trigger full-screen celebration.
- [x] After celebration, revert to normal board state.

---

## 4) Casino Mode B — Roulette Ring

> **Theme:** Ring 1 becomes a roulette track. Rings 2/3 are hidden.

### 4.1 Board Rendering
- [x] Set ring 1 tiles to roulette colors:
  - [x] Alternate **red / black** for most tiles.
  - [x] Add **1 green tile**.
- [x] Dim all non-ring-1 UI layers.

### 4.2 Player Selection UI
- [x] Provide a mini **numbers grid** that matches ring 1 tile count.
- [x] Player selects **5 numbers** to gamble on.
- [x] Add a **Random Pick** button that auto-selects 5 valid numbers.
- [x] Lock selections after spin starts.

### 4.3 Roulette Spin
- [x] On spin, animate a roulette marker or puck that moves around ring 1.
- [x] Movement: **2–4 full laps**, then decelerate to final tile.
- [x] When it lands:
  - [x] Check if selection matches.
  - [x] Award prize based on tile payout rules.
  - [x] Trigger full-screen celebration on win.

---

## 5) Prize & Payout Rules

- [x] Define base payout table for Mode A win tiles.
- [x] Define roulette payout logic (e.g., single number hit = high prize; miss = consolation or no prize).
- [x] Ensure payouts integrate with existing cash/coins/XP systems.

---

## 6) Implementation Notes (File Targets)

> **Likely touch points** (validate as you implement):

- `apps/investing-board-game-v3/src/App.tsx` — main game loop and tile landing logic.
- `apps/investing-board-game-v3/src/components/Tile.tsx` — tile rendering overrides.
- `apps/investing-board-game-v3/src/components/BoardViewport.tsx` or `MobileBoard3D.tsx` — ring visibility masking.
- `apps/investing-board-game-v3/src/components/` — new `CasinoWinOverlay`, `RouletteOverlay`, `CasinoModePanel`.
- `apps/investing-board-game-v3/src/lib/mockData.ts` — optional placeholder tiles.
- `apps/investing-board-game-v3/src/lib/types.ts` — new casino mode enums & types.

---

## 7) Testing Checklist

- [x] **Casino entry:** 50/50 mode distribution across 100+ simulated triggers.
- [x] **Mode A:** Landing on casino game tile ends mode and triggers celebration.
- [x] **Mode B:** Roulette selects a valid tile; win condition resolves correctly.
- [x] **Ring isolation:** Rings 2 and 3 are invisible and non-interactive during casino mode.
- [x] **Exit safety:** Board always returns to normal state after celebrations.
- [x] **Mobile-first QA:** verify all overlays, grids, and buttons are usable at phone width.

---

## 8) Debug / QA Rerun Notes

- [x] Add a dev flag to force Mode A or Mode B.
- [x] Add a “reset casino mode” button for QA retesting.
- [x] Log casino mode transitions to console in dev builds.

---

## 9) Changelog

- [x] _Add notes here as you ship changes._
- [x] **Phase 1 (Plan A + shared systems):** Confirmed 8-tile Mode A grid with Scratchcard, Dice, and Blackjack wired as the first 3 live mini-games.
- [x] **Phase 2 (UX hardening):** Updated Casino Mode panel for mobile-first touch targets, safe-area bottom padding, and explicit 5-number roulette selection state.
- [x] **Phase 3 (QA coverage):** Added deterministic and statistical tests for 50/50 mode selection plus Mode A game roster assertions.


## 10) Implementation Notes (2026-02-13)

- Added persistent `casinoMode`, `casinoModePhase`, and `casinoModeData` in core game state.
- Mode A now maps 8 ring-1 game tiles (including Scratchcard, Dice, Blackjack).
- Mode B now provides number selection, random pick, spin resolution, payout, and celebration flow.
- Added ring-1-only masking and safe reset controls for QA reruns.
