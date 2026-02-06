# Casino Scratchcard Evolution Guide

## Why this guide exists
The current scratchcard is a clean, simple win/lose minigame. This guide expands it into a **multi-tier, multi-prize casino experience** while staying compatible with existing components such as `ScratchcardGame` and `CasinoModal`. It is designed so we can grow features iteratively without rewrites.

## Current baseline (what we’re building on)
- **Component**: `src/components/ScratchcardGame.tsx`
- **Entry point**: `src/components/CasinoModal.tsx`
- **Economy hooks**: win payouts and XP/coin rewards are already wired through existing reward hooks and game state.

## Status Snapshot (2026-01-24)
- **Documentation refresh:** Tiered scratchcard plan clarified with a config-first approach.
- **Code status:** Tier config, configurable grid, and multi-prize logic are implemented; evaluation logic now lives in a shared helper.
- **Next slice focus:** Add tier selection + win summary UI polish after helper test coverage.

## AI Plan Execution Rules (always follow)
**General instructions (always active):**
1. Keep the plan accurate and actionable; update it whenever implementation changes.
2. Always document **what’s been done** and **what’s next** inside the plan itself.
3. Keep steps small, numbered, and scoped to a single slice.
4. Prefer config-first or helper-module changes before UI polish.
5. After each completed step, immediately write the next step.

**Progress log (live, always update):**
- **Done (latest):** Refined scratch progress messaging with an unlock meter and locked fast-reveal CTA.
- **Next step:** Extract odds math into a shared helper so tier previews in the Casino modal can reuse the same EV ranges.

## Next Slice (P0 Foundation)
1. Create `scratchcardTiers` config with tier costs, odds, and prize pools.
2. Update `ScratchcardGame` to accept a tier config and render a configurable grid.
3. Replace the single “match 3” rule with win-pattern evaluation (rows/diagonals/bonus).
4. Return a structured list of prizes so the modal can show a win summary.

### P0.1 — Next thing to build (tier config scaffold)
**Goal:** ship the tier configuration file that unlocks the next evolution step.

**Action plan (do this next):**
1. Add `src/lib/scratchcardTiers.ts` and export `scratchcardTiers` + `ScratchcardTier` type.
2. Keep the data minimal but production-ready (Bronze → Legendary).
3. Wire a default tier (Bronze) into `ScratchcardGame` so the config is actually used.

**Minimal scaffold (starter content):**
```ts
export type ScratchcardTierId = 'bronze' | 'silver' | 'gold' | 'legendary';

export type ScratchcardTier = {
  id: ScratchcardTierId;
  name: string;
  entryCost: { currency: 'coins' | 'stars' | 'cash'; amount: number };
  symbolPool: string[];
  prizeSlots: number;
  winPatterns: Array<'row' | 'diagonal' | 'bonus' | 'multiplier'>;
  odds: {
    winChance: number;
    jackpotChance: number;
    multiplierChance: number;
  };
  prizes: Array<{
    label: string;
    minAmount: number;
    maxAmount: number;
    weight: number;
    currency: 'cash' | 'stars' | 'coins' | 'xp';
  }>;
};

export const scratchcardTiers: ScratchcardTier[] = [
  {
    id: 'bronze',
    name: 'Lucky 3',
    entryCost: { currency: 'coins', amount: 50 },
    symbolPool: ['🍒', '🍀', '⭐', '💎', '🎰', '🔔'],
    prizeSlots: 3,
    winPatterns: ['row'],
    odds: { winChance: 0.25, jackpotChance: 0.01, multiplierChance: 0.08 },
    prizes: [
      { label: 'Small Win', minAmount: 75, maxAmount: 150, weight: 60, currency: 'coins' },
      { label: 'Medium Win', minAmount: 200, maxAmount: 500, weight: 30, currency: 'coins' },
      { label: 'Jackpot', minAmount: 2500, maxAmount: 2500, weight: 10, currency: 'coins' },
    ],
  },
];
```

**Done when:**
- `scratchcardTiers.ts` exists and exports both the type + tier data.
- `ScratchcardGame` consumes the config (no hardcoded odds or rewards).
- The app builds with the new config without runtime errors.

## Experience goals
1. **Make scratchcards feel like a real casino ticket** (multiple prizes, real reveal patterns).
2. **Increase anticipation** with progressive reveals and small animations.
3. **Support event modifiers** (boosted odds, theme skins, limited-time symbol sets).
4. **Scale easily**: add new scratchcard types, odds tables, and prize pools without touching the rendering logic.

---

## Core Gameplay Enhancements

### 1) Ticket Types (tiered by price)
Introduce distinct ticket tiers with different entry prices, odds, and prize pools.

| Tier | Ticket Name | Cost | Prize Slots | Top Prize | Win Odds |
|------|-------------|------|-------------|-----------|----------|
| Bronze | “Lucky 3” | 50 🪙 | 3 lines | $2,500 | 25% |
| Silver | “Triple Star” | 150 🪙 | 5 lines | $10,000 | 30% |
| Gold | “Diamond Rush” | 300 🪙 | 8 lines | $50,000 | 35% |
| Legendary | “Jackpot Royale” | 1,000 🪙 | 10 lines + bonus | $250,000 | 40% |

**Implementation note:** Each tier can be represented as a configuration object (see data model below).

### 2) Prize Lines + Win Patterns
Match real scratchcards by supporting multiple win patterns per ticket:
- **Horizontal lines** (3 or 4 symbols)
- **Diagonal lines**
- **Bonus center symbol**
- **Multiplier badge** (2x, 3x, 5x)
- **“Reveal 3 matching icons” bonus zone** (e.g., 3x 💎 triggers jackpot tier)

### 3) Multi-prize Payouts
Instead of a single win, allow tickets to award **multiple prizes at once**:
- A tier may award **1–4 separate prizes** on one card.
- Each prize slot has its own odds and reward table.

---

## Flexible Data Model (drop-in ready)
Use a configuration-driven approach so the renderer never hardcodes odds or prize values.

```ts
type ScratchcardTier = {
  id: 'bronze' | 'silver' | 'gold' | 'legendary';
  name: string;
  entryCost: { currency: 'coins' | 'stars' | 'cash'; amount: number };
  symbolPool: string[]; // emoji or SVG identifiers
  prizeSlots: number;
  winPatterns: Array<'row' | 'diagonal' | 'bonus' | 'multiplier'>;
  odds: {
    winChance: number;         // overall ticket win chance
    jackpotChance: number;     // chance the top tier prize triggers
    multiplierChance: number;  // chance of applying 2x/3x/5x
  };
  prizes: Array<{
    label: string;
    minAmount: number;
    maxAmount: number;
    weight: number; // weighted random
    currency: 'cash' | 'stars' | 'coins' | 'xp';
  }>;
};
```

**Renderer contract**:
- The grid uses `symbolPool` + seeded RNG for deterministic reveal.
- Winning logic uses `winPatterns` to generate a **list of prize results**.
- Payout functions accept an array of winnings.

---

## UI/UX Upgrades

### 1) Visual polish
- **Card framing**: layered borders, foil shimmer, ticket rarity badge.
- **Reveal mask**: scratch texture overlay with a masked reveal (SVG clip path or canvas).
- **Symbol styling**: glow + drop shadow for rare symbols.

### 2) Animation ideas (Lottie/SVG)
- **Reveal burst**: a sparkle burst on each tile flip.
- **Win banner**: animated banner for “Big Win”, “Jackpot”, “Multiplier”.
- **Confetti/coins**: lightweight SVG confetti or coin burst for wins.

> Keep all animations optional behind feature flags (`useLottie`, `useSVGConfetti`) for easier performance tuning on mobile.

### 3) Sound + haptics
- Scratch sound loop (short, subtle).
- “Ting” on symbol reveal.
- Distinct win sound for jackpot vs. standard win.

---

## Economy + Reward Hooks

### Win payout mapping
For each prize result:
- Update **cash / stars / coins / XP** in game state.
- Increment the lifetime earned counters (`lifetimeCashEarned`, etc.).
- Emit a toast + activity log entry.

### Event modifiers
Enable multipliers from event systems:
- `casino_luck` boosts `winChance`.
- seasonal events can swap `symbolPool` with themed icons.

---

## Implementation Phases

### Phase 1 (Fast win)
✅ Convert `ScratchcardGame` to accept a `tier` object and render a configurable grid.  
✅ Replace the single “match 3” rule with win-pattern evaluation.  
✅ Award multiple prizes and show a detailed win summary.

### Phase 2 (Visual upgrade)
✅ Add SVG scratch mask + reveal animation.  
✅ Introduce Lottie confetti or SVG burst for wins.  
✅ Add tier frame styling + rarity badge.

### Phase 3 (Casino economy loop)
✅ Add ticket tiers to Shop + Casino modal selection.  
✅ Add “Lucky Ticket” limited-time events.  
✅ Hook into achievements + challenges for streaks and jackpots.

---

## Checklist for Developers
- [ ] New scratchcard tier config added in `lib/`.
- [ ] Scratchcard component uses tier config instead of hardcoded win logic.
- [ ] Multiple prizes are supported and displayed clearly.
- [ ] Lottie/SVG animations are optional and mobile-friendly.
- [ ] Rewards correctly update profile + lifetime counters.
- [ ] Casino modal offers tier selection + ticket preview.

---

## Suggested next steps
1. Add `scratchcardTiers.ts` config file.
2. Update `ScratchcardGame` to render the config + prize results.
3. Add a scratch reveal overlay with SVG masking.
4. Wire animations behind a feature flag for mobile performance.

---

# Scratchcard 2.0 Brainstorming Plan

## Why this plan
The current scratchcard is a simple win/lose placeholder. We want a **real casino-feeling ticket** with layered reveals, multiple win paths, and clear rewards without making it slow or overwhelming on mobile.

## Experience pillars (what players should feel)
1. **Tactile reveal**: Real scratch texture + progressive uncovering.
2. **Anticipation**: Micro-wins and “almost got it” tension.
3. **Variety**: Different ticket themes and rules, not just “match 3.”
4. **Clarity**: Players understand “what they did” and “what they won.”
5. **Speed**: 15–25 seconds total per play, mobile-first.

## Feature ideas to explore (pick a few, not all)
### Core ticket mechanics
- **Multi-line wins** (rows + diagonals) with clear highlights.
- **Bonus zones** (center bonus, corner bonus, or “match 3 icons” bubble).
- **Multiplier badges** (2×/3×/5×) revealed separately.
- **Instant win symbols** (e.g., “🎁” = automatic prize).
- **Fail-safe micro-reward** (small coin consolation for near misses).

### Ticket themes (rotation-ready)
- **Lucky 3 (bronze)**: simple 3x3 grid, 1–2 lines.
- **Triple Star (silver)**: 4x3 grid + bonus center.
- **Diamond Rush (gold)**: 4x4 grid, diagonals, multiplier badge.
- **Jackpot Royale (legendary)**: 5x4 grid + bonus zone + jackpot symbol hunt.

### Seasonal overlays
- **Event skins** (holiday, summer, neon casino).
- **Themed symbol pools** (emoji/icon sets).
- **Limited “boost tickets”** tied to event windows.

### Reward presentation
- **Win summary card** listing each prize line (amount + currency).
- **“Big Win” threshold** for special confetti + audio.
- **Optional “reveal all”** button after 3 scratches.
- **Odds peek CTA**: a “See odds + expected value” button that reveals the ticket’s win chance, prize table, and EV range (per tier).

## Proposed 2.0 architecture (lightweight + scalable)
### Data model (config-first)
- `scratchcardTiers.ts`: ticket types, cost, grid size, symbol pool, line rules, odds, prize tables.
- `scratchcardEvents.ts`: temporary overrides (boosted odds, skins).
- `scratchcardRewards.ts`: reward mappings, EV ranges, and payout clamps.

### Engine + renderer split
- **Engine**: deterministic grid + win evaluation (pure functions).
- **Renderer**: scratch overlay + reveal interactions + win UI.
- **Odds math helper**: deterministic helper that calculates and displays tier odds + EV for the “See odds” CTA.

### Reward hooks
- Return **structured prize list** (type + amount + label).
- Single payout function handles cash/coins/stars/XP.

## Proposed phases (iterative)
### Phase A — “Real ticket” baseline (1–2 slices)
- Config-driven tiers + line rules.
- Multi-prize results with summary UI.
- Basic scratch texture reveal (mask + gradual erasing or radial scrub).

### Phase B — “Casino polish”
- Win line highlights + multiplier reveal.
- Big-win animation + optional sound.
- Limited-time ticket skins.

### Phase C — “Live ops”
- Event overrides + schedule hooks.
- Rare “jackpot days.”
- Lightweight telemetry (win rate, avg payout).

---

## Scratchcard 2.0 — Delivery Plan (AI-ready)

### Integration touchpoints (scan + confirm)
- `ScratchcardGame.tsx`: UI + reveal interactions + win summary.
- `CasinoModal.tsx`: entry point and tier selection UI.
- Rewards/payout wiring in `App.tsx` (cash/coins/stars/XP updates).
- `useChallenges.ts` + `challenges.ts`: `win_scratchcard` progress.
- `achievements.ts`: scratchcard achievements + streaks.
- `events.ts` + `miniGameSchedule.ts`: event windows + availability.
- `shopItems.ts`: casino luck boost items (win rate modifiers).

### Definition of Done (per slice)
**Slice A1 — Config + Evaluation Engine**
- Tier config drives grid size, symbol pool, and win rules.
- `evaluateScratchcard()` returns structured prize list with odds + payout metadata.
- Unit tests for deterministic evaluation (seeded RNG).

**Slice A2 — Game UI + Summary**
- `ScratchcardGame` accepts tier config + engine results.
- Multi-prize summary panel with per-line highlights.
- “See odds + EV” CTA shows win chance + prize table.

**Slice A3 — Scratch Reveal Interaction**
- Scratch mask with gradual erasing or radial scrub.
- Reveal-all CTA after 3 scratches (if user wants fast mode).
- Performance guardrails (mobile-friendly, reduced motion respected).

**Slice B1 — Polish + Audio**
- Big-win banner + optional confetti.
- Subtle scratch sound loop + “ting” on reveal.
- Win line highlight animations.

**Slice C1 — Live Ops + Events**
- Event overrides swap symbol pools/skins and boost odds.
- Daily/weekly “jackpot day” boosts with clear schedule labels.

### Handoff notes (to avoid regressions)
- Keep payout values in config, not hardcoded in UI.
- Preserve existing challenge/achievement counters.
- Ensure deterministic RNG for tests and replayable outcomes.
- No blocking network calls in the reveal loop.

### Test plan (lightweight)
- Unit test: `evaluateScratchcard()` deterministic outputs with seed.
- UI test: render grid for each tier + summary content.
- Performance: verify mask render doesn’t stall on low-end mobile.

---

## Expanded feature ideas (v2+)

### Gameplay depth
- **Win patterns library**: rows, diagonals, corners, center cross, “X” patterns.
- **Bonus mini-zone**: 3-symbol side strip that can unlock a multiplier.
- **Progressive jackpot meter**: small % of ticket cost feeds a rolling pot.
- **Second-chance token**: lose once → earn token to re-roll one symbol.
- **“Almost win” animation**: subtle tease when 2/3 match.

### UX + player clarity
- **Tier selector with preview**: shows grid size, odds, and top prize.
- **Ticket rarity badge**: bronze/silver/gold/legendary.
- **Win history drawer**: last 5 plays + outcomes.
- **One-tap “fast reveal” mode**: skips scratch animation.

### Economy + balancing
- **EV bands**: expose EV ranges per tier to align with economy.
- **Dynamic pricing**: temporary price changes during events.
- **Daily tier caps**: higher tiers have lower daily limits.

### Social + progression hooks
- **Scratch streak meter**: 3 wins in a row → bonus ticket.
- **Achievement callouts**: inline badge when streak or tier unlocks.
- **Season pass hooks**: scratch wins contribute to pass XP.

### Accessibility + performance
- **Reduced motion mode**: disables scratch particles + confetti.
- **Tap-to-reveal fallback**: for users who can’t drag.
- **Low-end perf mode**: simplified texture + lower animation budget.

---

## Risk checklist (pre-merge)
- ✅ Payouts don’t exceed economy caps.
- ✅ Reveal loop doesn’t block main thread.
- ✅ Odds are clearly explained to avoid misleading UX.
- ✅ Event modifiers are reversible and logged.

## Decision points (choose early)
1. **Grid sizes**: 3x3/4x3/4x4/5x4?
2. **Daily limits**: keep 3/day or vary by tier?
3. **Currency mix**: coins only, or allow stars/cash?
4. **Payout curve**: more frequent small wins vs. rare big wins?
5. **UX default**: auto-reveal or manual scratch required?
6. **Odds disclosure**: show win chance + EV by default or behind a “See odds” CTA?

## Recommendation (first concrete slice)
1. Add `scratchcardTiers.ts` + `evaluateScratchcard.ts`.
2. Update `ScratchcardGame` to accept tier config + return prize list.
3. Add a basic scratch mask + line highlights.
4. Add a win summary panel (small list).
