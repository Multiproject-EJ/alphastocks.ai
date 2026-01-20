# Casino Scratchcard Evolution Guide

## Why this guide exists
The current scratchcard is a clean, simple win/lose minigame. This guide expands it into a **multi-tier, multi-prize casino experience** while staying compatible with existing components such as `ScratchcardGame` and `CasinoModal`. It is designed so we can grow features iteratively without rewrites.

## Current baseline (what we’re building on)
- **Component**: `src/components/ScratchcardGame.tsx`
- **Entry point**: `src/components/CasinoModal.tsx`
- **Economy hooks**: win payouts and XP/coin rewards are already wired through existing reward hooks and game state.

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
