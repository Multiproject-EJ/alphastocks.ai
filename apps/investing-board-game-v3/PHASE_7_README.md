# Phase 7: Thrift Path Status + Coins Currency

This implementation adds two major features to the investing board game:

1. **Coins Currency System** - A third currency for micro-transactions
2. **Thrift Path Persistent Status** - A behavioral reward system that tracks discipline

## Features Implemented

### 1. Coins Currency System

Coins are a third currency (alongside Cash and Stars) used for quick micro-transactions and convenience features.

#### Earning Coins

Players automatically earn coins through gameplay:
- **10 coins** - Rolling dice
- **15 coins** - Landing on a tile
- **25 coins** - Passing Start
- **30 coins** - Completing challenges
- **40 coins** - Completing quizzes
- **50 coins** - Daily login
- **100 coins** - Winning scratchcards

#### Spending Coins

Coins can be spent on convenience features:
- **100 coins** - Reroll dice (get a new roll without using daily rolls)
- **150 coins** - Skip event (bypass random market events)
- **75 coins** - Peek next tile (see what's ahead) - *Coming Soon*
- **200 coins** - Extra roll (beyond daily limit) - *Coming Soon*
- **50 coins** - Quiz hint - *Coming Soon*

#### UI Display

- Coins are displayed in the **UserIndicator** component (top-left) next to stars
- Yellow coin emoji (🪙) distinguishes coins from stars (⭐)
- Formatted display (1.5k for 1500 coins, etc.)

### 2. Thrift Path Persistent Status

A progressive behavioral reward system that tracks player discipline and rewards long-term thinking.

#### How It Works

1. **Earn XP** through disciplined actions:
   - Complete Thrifty Path challenges (+20 XP)
   - Perfect quiz scores (+15 XP)
   - Disciplined choices in quizzes (+10 XP)
   - Daily login streak (+5 XP per day)
   - Hold stocks 30+ days (+25 XP)
   - Moderate casino play (<3 cards/day) (+10 XP)

2. **Level Up** through XP thresholds:
   - Level 1: 0 XP - "Mindful Beginner"
   - Level 2: 100 XP - "Disciplined Investor"
   - Level 3: 300 XP - "Patient Accumulator"
   - Level 4: 600 XP - "Wisdom Seeker"
   - Level 5: 1000 XP - "Enlightened Master"

3. **Unlock Benefits** at each level:
   - Star multiplier: 1.1x → 1.3x (more stars from all sources)
   - Crash protection: 10% → 30% (reduce negative event impact)
   - Recovery boost: 1.1x → 1.5x (faster recovery after setbacks)

4. **Maintain Discipline** to stay active:
   - Activated at 50 XP
   - Deactivated if XP < 0 or 7+ days inactive
   - Daily streak tracking encourages consistency

#### Penalties

Lose XP for impulsive actions:
- Break daily streak (-50 XP)
- Sell at loss within 7 days (-20 XP)
- Casino abuse (>5 cards/day) (-15 XP)
- Greedy quiz choices (-10 XP)

#### UI Components

1. **ThriftPathStatus Widget** (left sidebar)
   - Shows current level and title
   - XP progress bar to next level
   - Active benefits preview
   - Daily streak indicator
   - Click to see details (future enhancement)

2. **ThriftPathAura** (player token)
   - Visual pulsing glow effect
   - Green for levels 1-3
   - Gold for levels 4-5
   - Shield icon at level 3+
   - Intensity increases with level

3. **ThriftyPathModal Enhancement**
   - Shows current Thrift Path status
   - Displays level and XP
   - Shows active benefits

## Database Schema

Run the SQL migration in `PHASE_7_MIGRATION.sql`:

```sql
-- Add coins column
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;

-- Add thrift_path column (JSONB)
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS thrift_path JSONB DEFAULT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_board_game_profiles_thrift_path 
ON board_game_profiles USING GIN (thrift_path);
```

## File Structure

### Core Logic
- `src/lib/coins.ts` - Coin earnings, costs, and utilities
- `src/lib/thriftPath.ts` - Thrift Path types, levels, XP sources, and helpers

### Hooks
- `src/hooks/useCoins.ts` - Coin state management
- `src/hooks/useThriftPath.ts` - Thrift Path state management

### Components
- `src/components/CoinAnimation.tsx` - Floating coin earn animation
- `src/components/ThriftPathAura.tsx` - Visual aura around player token
- `src/components/ThriftPathStatus.tsx` - HUD widget showing status

### Updated Components
- `src/components/UserIndicator.tsx` - Added coin display
- `src/components/DiceHUD.tsx` - Added reroll button
- `src/components/EventModal.tsx` - Added skip button
- `src/components/ThriftyPathModal.tsx` - Added status display

### Core Integration
- `src/App.tsx` - Integrated both systems
- `src/lib/types.ts` - Updated GameState interface
- `src/hooks/useGameSave.ts` - Added persistence

## Usage Examples

### Earning Coins
```typescript
// Automatically earned on actions
earnFromSource('dice_roll') // +10 coins
earnFromSource('land_on_tile') // +15 coins
earnFromSource('pass_start') // +25 coins
```

### Spending Coins
```typescript
// Reroll dice
if (spendCoins(COIN_COSTS.reroll_dice, 'Reroll dice')) {
  handleRoll()
}

// Skip event
if (spendCoins(COIN_COSTS.skip_event, 'Skip event')) {
  onOpenChange(false)
}
```

### Thrift Path XP
```typescript
// Reward good behavior
addThriftPathXP('complete_thrifty_challenge')
addThriftPathXP('perfect_quiz')
updateStats('totalChallengesCompleted')

// Penalize bad behavior
penalizeThriftPath('impulsive_sell')
penalizeThriftPath('casino_abuse')

// Apply benefits
if (thriftPathStatus.active) {
  starsToAward = Math.floor(starsToAward * thriftPathStatus.benefits.starMultiplier)
}
```

## Testing

### Manual Testing Checklist

1. **Coins System**
   - [ ] Coins earned on dice roll
   - [ ] Coins earned on tile landing
   - [ ] Coins earned on passing start
   - [ ] Coin display shows in UserIndicator
   - [ ] Reroll button appears in DiceHUD
   - [ ] Reroll spends 100 coins and triggers new roll
   - [ ] Skip button appears in EventModal
   - [ ] Skip spends 150 coins and closes modal
   - [ ] Insufficient coins prevents purchase
   - [ ] Coin balance persists to database

2. **Thrift Path**
   - [ ] XP gained on Thrifty challenge completion
   - [ ] Status widget appears when active
   - [ ] Level up toast appears at thresholds
   - [ ] Benefits apply (star multiplier)
   - [ ] Daily streak tracking works
   - [ ] Status persists to database
   - [ ] Deactivates when inactive 7+ days
   - [ ] ThriftyPathModal shows status

## Future Enhancements

- Coin animations on earn
- Sound effects for coin earn/spend
- Peek next tile feature
- Extra roll purchase
- Quiz hints
- Thrift Path details modal
- Visual aura around player token (needs pixel coordinates)
- Long-term stock holding tracking
- Cash flow positive tracking
- More behavioral tracking

## Integration Notes

- Coins default to 100 on new game
- Thrift Path starts inactive (requires 50 XP to activate)
- Both systems sync to gameState automatically via useEffect
- Data persists to Supabase on auto-save
- Toast notifications for all actions
- UI components are responsive and mobile-friendly

## Visual Design

### Colors
- **Coins**: Yellow/gold (🪙)
- **Stars**: Accent gold (⭐)
- **Cash**: White/neutral ($)
- **Thrift Path**: Green/nature (🌿) → Gold at high levels

### Hierarchy
Clear visual distinction between all three currencies to avoid confusion.
