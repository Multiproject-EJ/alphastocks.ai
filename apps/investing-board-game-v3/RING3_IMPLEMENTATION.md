# Wealth Run + Roulette Implementation Summary

## Overview
This implementation replaces the prior Ring 3 victory lap with a **Wealth Run** (7-tile, single-roll jackpot) and a **roulette-style mega reward loop**. Ring 2 now includes fall portals and a Chance card lift that can send players into the Wealth Run.

## What Was Implemented

### 1. Wealth Run Configuration (mockData.ts)
- **RING_3_TILES**: 7 jackpot tiles with per-tile `ring3Reward` payouts (250K → 2M).
- **RING_3_CONFIG**: `maxRolls = 1`, `rewardPerWinTile = 250_000`, `minStockScore = 8.0`.
- **ROULETTE_REWARDS**: Mega reward table with cash, stars, coins, and mystery box outcomes.

### 2. Ring 2 Progression Updates
- **Fall Portals**: Ring 2 tiles with `specialAction: 'ring-fall'` drop players to Ring 1.
- **Chance Tile**: A dedicated `specialAction: 'chance'` tile that triggers the Chance card modal. Jackpot results lift the player into the Wealth Run.

### 3. Type System Updates (types.ts)
Extended `Tile` to support new special actions and styling:
```typescript
specialAction?: 'ring-fall' | 'chance' | 'big-fish-portal' | 'roulette-reward'
specialStyle?: 'fall-portal' | 'chance-card' | 'roulette-reward'
portalStyle?: 'blue' | 'gold'
```

### 4. Game Logic Integration (App.tsx)

#### Wealth Run Rules
- **Single roll only**: `ring3RollUsed` prevents additional rolls on Ring 3.
- **Landing payout**: `handleRing3Landing()` awards the tile’s `ring3Reward` (or fallback) and triggers the celebration.

#### Roulette Mode
- **Activation**: Winning a Wealth Run tile sets `rouletteModeActive` to true.
- **Roll behavior**: Dice button becomes **“SPIN ROULETTE”** and selects a reward from `ROULETTE_REWARDS` based on the roll.
- **Reward handling**: Adds cash/stars/coins or awards a mystery box outcome.

#### Chance Card Flow
- Landing on a Ring 2 Chance tile opens `ChanceCardModal`.
- Jackpot outcomes trigger portal animation and teleport to the Wealth Run.

### 5. UI Components
- **ChanceCardModal.tsx**: New modal for Chance outcomes.
- **DiceHUD**: Supports `rollLabel`, `rollIcon`, and `rollPulse` to surface roulette mode.
- **Tile**: Updated visuals for portal/fall/chance tiles and ring 3 reward callouts.

### 6. Styling (index.css)
- New portal/fall visuals and roulette animations.
- Ring 3 celebration pulse effects to spotlight Wealth Run wins.

## Wealth Run Rules Reference

| Rule | Value |
|------|-------|
| Dice Rolls Allowed | **1 roll only** |
| Win Amount per Tile | **250K–2M** |
| Winning Tiles | 7 out of 7 tiles |
| Entry Mechanic | Ring 2 Chance Card jackpot |
| Post-Win Loop | Roulette spin for mega rewards |

## Wealth Run Tiles

| Tile ID | Name | Outcome |
|---------|------|---------|
| 300 | Wealth Run: Apex Vault | $250,000 |
| 301 | Wealth Run: Diamond Surge | $400,000 |
| 302 | Wealth Run: Legacy Stack | $600,000 |
| 303 | Wealth Run: Titan Fortune | $850,000 |
| 304 | Wealth Run: Crown Reserve | $1,100,000 |
| 305 | Wealth Run: Sovereign Cache | $1,500,000 |
| 306 | Wealth Run: Omega Prize | $2,000,000 |

## Roulette Rewards

| Reward | Type | Amount |
|--------|------|--------|
| $5M Mega Cash | Cash | $5,000,000 |
| 2M Stars | Stars | 2,000,000 |
| 3M Coins | Coins | 3,000,000 |
| $8M Vault Jackpot | Cash | $8,000,000 |
| 5M Stars | Stars | 5,000,000 |
| Mystery Box | Mystery | — |

## File Changes Summary

### New Files Created
1. `src/components/ChanceCardModal.tsx` - Chance card modal for Ring 2 outcomes

### Modified Files
1. `src/lib/types.ts` - Added special-action fields for portal/chance/roulette
2. `src/lib/mockData.ts` - Wealth Run tiles, ring config, fall portal + Chance tile entries, roulette rewards
3. `src/index.css` - Portal/roulette animations and ring 3 celebration visuals
4. `src/App.tsx` - Wealth Run logic, Chance modal wiring, roulette mode flow

## Testing Checklist

### Automated Tests
- [ ] Build successful (no errors)
- [ ] TypeScript compilation clean
- [ ] No new linting errors in modified code

### Manual Testing Needed
- [ ] Land on Ring 2 Chance tile and verify modal outcome
- [ ] Trigger Chance jackpot and confirm portal to Wealth Run
- [ ] Roll on Ring 3 and confirm single-roll limit
- [ ] Confirm Wealth Run payout values match tile rewards
- [ ] Win Wealth Run and verify roulette mode activates
- [ ] Spin roulette and confirm reward payout

## Known Limitations

1. **Roulette fairness**: Reward selection is deterministic based on the dice total; not weighted.
2. **Legacy elevator odds**: Elevator odds constants remain in config, but current flow uses fall portals + Chance.
3. **Elite stock filtering**: Ring 3 stock filter uses mock scores; production should use live scoring.

## Future Enhancements

1. Add weighted roulette probabilities for rare outcomes.
2. Track Wealth Run visits and roulette wins in player stats.
3. Add bespoke audio for fall portals, Chance jackpot, and roulette spin.
4. Surface a “Wealth Run ready” indicator when Chance outcomes are possible.

## Build Output

```
(dist output not captured in this doc)
```

Documentation updated to match current Wealth Run + roulette behavior.
