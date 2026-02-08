# Vault Heist Evolution Guide

## Why this guide exists
Vault Heist is a weekly timed mini-game with a simple “pick a hatch” loop. The current flow is fun but **too shallow and easy to exploit**, so this guide defines a professional, step-by-step evolution plan that:
- Closes the current multi-hatch exploit.
- Adds meaningful risk/reward choices without a full rewrite.
- Keeps the timed-event framing and reward pipeline intact.
- Stays “alive” by logging progress and the next step after every change.

## Current baseline (what we’re building on)
- **Component**: `src/components/VaultHeistModal.tsx`
- **Entry point**: `src/App.tsx` (Vault Heist state + reward handling)
- **Schedule**: `src/lib/miniGameSchedule.ts`
- **Hub card**: `src/components/games/placeholders/VaultHeist.tsx`

## Status Snapshot (2026-02-23)
- **Code status:** Vault Heist UI is live with 5 hatches, weighted prizes, a 3-pick cap, and pick gating.
- **Known issues:** Resolution state messaging is minimal during crack → reveal → result.
- **Next slice focus:** Add explicit resolution states + HUD status line for P0.2.

---

# AI Execution Rules (mandatory)
**Always follow these rules when implementing any slice from this plan:**
1. Keep the plan accurate and actionable; update it whenever implementation changes.
2. After a slice ships, log **what’s done** and **what’s next** inside this doc.
3. Keep steps small, numbered, and scoped to a single slice.
4. Prefer config-first or helper-module changes before UI polish.
5. If a decision is made (odds, costs, rewards), document it here to keep the plan “alive.”

**Progress log (live, always update):**
- **Done (latest):** Implemented P0.1 pick gating + lockout with immediate pick consumption and HUD lock messaging.
- **Next step:** Implement P0.2 explicit resolution states + HUD status line.

---

# Experience Goals
1. **Integrity first**: one pick = one hatch, no multi-open exploits.
2. **Meaningful choices**: risk/reward options that feel fair but tense.
3. **Short sessions**: 30–60 seconds for a full heist run.
4. **Clarity**: players always know picks left, odds/risk, and rewards won.
5. **Scale-ready**: future variants (stages, crews, gear) are config-driven.

---

# Known Issues / Constraints
- **Exploit**: multiple hatches can be opened before the pick counter increments.
- **State timing**: pick consumption happens after the reveal delay, allowing spam.
- **Modal-only logic**: logic is embedded in the modal; no standalone “engine.”

---

# Architecture Direction (target shape)
**Near-term:** Keep logic inside `VaultHeistModal.tsx` but stabilize state transitions.
**Mid-term:** Extract a small helper (`vaultHeistEngine.ts`) for:
- pick eligibility rules
- weighted prize selection
- alarm handling choices

**Config candidates (future-ready):**
- `vaultHeistStages.ts`: stage odds + multipliers
- `vaultHeistRewards.ts`: prize tables + weights
- `vaultHeistModifiers.ts`: crew/gear adjustments

---

# Phase Plan (step-by-step)

## Phase 0 — Integrity Fix (P0)
**Goal:** close the multi-hatch exploit and make pick behavior deterministic.

### P0.1 — Pick gating + lockout (DONE)
**Objective:** prevent more than one hatch from opening per pick.

**Steps (do in order):**
1. Add `isPickResolving` boolean state in `VaultHeistModal.tsx`.
2. Disable all hatch buttons while `isPickResolving` is true.
3. Consume a pick immediately on click (optimistic decrement).
4. If a pick fails (insufficient coins), revert the decrement and unlock.
5. Unlock the grid only after the reveal animation completes.
6. Add a short HUD line: “Locking vaults…” while resolving.

**Done when:**
- You cannot open multiple hatches in rapid succession.
- Pick count decrements as soon as a hatch is selected.
- Grid re-enables only after the reveal completes.

**Decisions:**
- Picks are consumed immediately on click; failed coin spend restores the pick and unlocks.
- Grid remains locked until the reveal completes (after the crack animation).

### P0.2 — Clear resolution states
**Objective:** ensure consistent feedback for cracking → reveal → result.

**Steps:**
1. Add explicit state labels (cracking, reveal, resolved).
2. Display a short status line in the HUD.
3. Ensure alarms always show a final outcome state.

**Done when:** state transitions are deterministic and visible in the UI.

---

## Phase 1 — Strategy Layer (P1)
**Goal:** add risk/reward choices without inflating runtime.

### P1.1 — Stage-based odds config
**Objective:** define per-stage odds + multipliers in a config file.

**Steps:**
1. Create `vaultHeistStages.ts` with stage odds/multipliers.
2. Use stage data to drive prize odds and alarm chance.
3. Display current stage in the HUD.

**Done when:** stage-specific odds are used instead of hardcoded values.

### P1.2 — Crew + gear modifiers
**Objective:** add lightweight strategic modifiers before the heist starts.

**Steps:**
1. Add a small, optional pre-heist selection (crew + gear).
2. Apply modifier deltas to odds at pick time.
3. Surface the modifiers in the HUD.

**Done when:** modifiers affect odds in a visible, deterministic way.

---

## Phase 2 — Alarm Choice (P2)
**Goal:** introduce a meaningful “bail or bribe” decision.

### P2.1 — Alarm decision overlay
**Objective:** give players a single choice on alarm triggers.

**Steps:**
1. On alarm, pause the grid and show a decision overlay.
2. Options:
   - **Bail**: keep winnings and end heist.
   - **Bribe**: spend coins to continue.
3. Add a short explanation in the overlay.

**Done when:** alarm triggers always end in a clear, user-chosen outcome.

---

## Phase 3 — UX + Polish (P3)
**Goal:** improve clarity and visual tension.

### P3.1 — Heist HUD + meter
**Steps:**
1. Add a compact HUD showing picks left, stage, and alarm risk.
2. Add a “heist meter” progress bar.

### P3.2 — Ring visual identity
**Steps:**
1. Color-code ring tiers (1/2/3).
2. Apply ring colors to hatch borders and rewards.

### P3.3 — End-of-heist summary
**Steps:**
1. Display a clean summary with all prizes + multipliers.
2. Add a CTA to “Play again next Saturday.”

---

# “Alive Plan” Update Checklist (do after every implementation)
When you ship any slice, update this section immediately:
1. **Update “Progress log.”**
2. **Mark the slice as done.**
3. **Write the very next step to execute next session.**
4. **Document any decisions** (odds, costs, UI behavior).

---

# Progress log (rolling)
- **Done (latest):** Implemented P0.1 pick gating + lockout with immediate pick consumption and HUD lock messaging.
- **Next step:** Implement P0.2 explicit resolution states + HUD status line.
