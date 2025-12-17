# Daily Challenges and Events System - Implementation Summary

## Overview
This document describes the Daily Challenges and Events system implemented for Board Game V3 (Phase 3 of issue #243). The system drives daily engagement and retention through challenges and special events.

## Architecture

### Core Components

#### 1. Challenge System (`lib/challenges.ts`)
Defines and manages daily and weekly challenges:

**Challenge Types:**
- **Daily Challenges**: 3 per day (1 easy, 1 medium, 1 hard)
  - Reset at midnight
  - 20+ challenges in the pool
  - Rewards: 50-300 stars, XP, and season points

- **Weekly Challenges**: 2 per week
  - Reset Monday at midnight
  - 6 challenges in the pool
  - Larger rewards: 500-750 stars, XP, and season points

**Challenge Actions Tracked:**
- `roll` - Dice rolls (with optional value condition)
- `buy_stock` - Stock purchases (with category/portfolio conditions)
- `land_on_tile` - Landing on specific tiles/positions
- `land_on_corner` - Landing on corner tiles
- `earn_stars` - Cumulative star earning
- `complete_quiz` - Bias Sanctuary quiz completion
- `win_scratchcard` - Casino scratchcard wins
- `reach_net_worth` - Achieving net worth milestones
- `buy_from_shop` - Shop purchases
- `complete_thrifty` - Thrifty Path challenge completion
- `complete_daily_challenge` - Meta-challenge for weekly tracking

**Helper Functions:**
- `generateDailyChallenges()` - Creates 3 daily challenges avoiding yesterday's challenges
- `generateWeeklyChallenges()` - Creates 2 random weekly challenges
- `getNextMidnight()` - Calculates next daily reset time
- `getNextMonday()` - Calculates next weekly reset time

#### 2. Events System (`lib/events.ts`)
Manages recurring and special events that provide temporary bonuses:

**Event Types:**
- **Recurring Events**: Automatically activate on schedule
  - Star Rush Weekend (Fri 6PM, 48h) - 2x stars
  - Thrifty Thursday (Thu, 24h) - 2x Thrifty stars
  - Casino Happy Hour (Fri 6PM, 3h) - Guaranteed scratchcard win
  - Roll Fest Sunday (Sun, 24h) - +5 bonus rolls
  - Midweek Madness (Wed 12PM, 12h) - 1.5x XP

- **Special Events**: Manually scheduled for holidays/special occasions
  - New Year Celebration - 3x stars and XP

**Event Effects:**
- `starsMultiplier` - Multiplies star rewards
- `xpMultiplier` - Multiplies XP rewards
- `rollsBonus` - Adds bonus daily rolls
- `shopDiscount` - Percentage discount on shop items
- `guaranteedWin` - Ensures casino wins
- `customEffect` - Special logic identifiers

**Helper Functions:**
- `getActiveEvents()` - Returns currently active events
- `getUpcomingEvents()` - Returns next N upcoming events
- `checkEventStart()` - Checks if any event just started
- `checkEventEnd()` - Checks if any event just ended
- `updateEventStatus()` - Updates event active state

### Hooks

#### 3. useChallenges Hook (`hooks/useChallenges.ts`)
Manages challenge state and progress tracking:

**State:**
- `dailyChallenges` - Current 3 daily challenges
- `weeklyChallenges` - Current 2 weekly challenges
- `completedToday` - Count of completed daily challenges
- `completedThisWeek` - Count of completed weekly challenges

**Functions:**
- `updateChallengeProgress(action, value)` - Tracks progress for game actions
  - Checks if action matches challenge requirements
  - Validates conditions (dice value, tile position, etc.)
  - Auto-claims rewards on completion
  - Shows notifications and plays sounds
  - Updates game state with rewards

- `checkAndResetChallenges()` - Handles daily/weekly resets
  - Checks if new day/week
  - Generates new challenges
  - Resets counters
  - Shows notifications

**Integration:**
- Receives `addXP` and `addSeasonPoints` functions (if available)
- Updates game state directly for stars
- Persisted to Supabase via game state

#### 4. useEvents Hook (`hooks/useEvents.ts`)
Manages event lifecycle and effects:

**State:**
- `activeEvents` - Currently active events
- `upcomingEvents` - Next 5 upcoming events

**Functions:**
- `getActiveMultipliers()` - Calculates combined star/XP multipliers
- `hasGuaranteedCasinoWin()` - Checks for casino win guarantee
- `getRollsBonus()` - Returns total bonus rolls from events
- `getShopDiscount()` - Returns maximum shop discount
- `getCustomEffects()` - Returns array of custom effect identifiers

**Auto-Management:**
- Polls every minute for event start/end
- Shows notifications when events start/end
- Plays celebration sound on event start
- Auto-updates recurring event schedules

### UI Components

#### 5. ChallengeTracker (`components/ChallengeTracker.tsx`)
Compact HUD widget in top-left corner:
- Shows "🎯 Challenges" title
- Progress indicators (⭐⭐⬜ for 2/3 complete)
- Completion count (2/3 Complete)
- Stars earned today (+125 stars today)
- Pulsing animation when challenges available
- Click to open ChallengesModal
- Celebration glow when all completed

#### 6. ChallengesModal (`components/ChallengesModal.tsx`)
Full challenge overview modal:
- Daily Challenges section with countdown to reset
- Weekly Challenges section with countdown to Monday
- Each challenge card shows:
  - Tier badge (Easy/Medium/Hard) with color coding
  - Title and description
  - Progress bar (if not completed)
  - Checkmark if completed
  - Rewards (stars, XP, SP)
- Auto-scroll to view all challenges
- Animated card entrance

#### 7. EventBanner (`components/EventBanner.tsx`)
Top-of-screen event notification:
- Animated gradient background with pulsing glow
- Event icon, title, and description
- Countdown timer to event end
- "Calendar" button to open EventCalendar
- Dismiss button to minimize
- Sliding entrance animation
- Only shows when events are active

#### 8. EventCalendar (`components/EventCalendar.tsx`)
Calendar view of events:
- Monthly calendar grid
- Highlights today's date
- Dot indicators on dates with events
- Click date to see event details
- Upcoming Events list (next 5)
  - Event icon, title, description
  - Start date/time
  - Countdown if starting soon
  - "Active Now" badge for running events
- Responsive grid layout

### Integration Points

#### App.tsx Integration
The system is fully integrated into the main game:

**Hook Initialization:**
```typescript
const { 
  dailyChallenges, 
  weeklyChallenges,
  updateChallengeProgress,
  checkAndResetChallenges 
} = useChallenges({ gameState, setGameState, playSound })

const { 
  activeEvents,
  upcomingEvents,
  getActiveMultipliers 
} = useEvents({ playSound })
```

**Challenge Progress Tracking:**
- `handleRoll()` - Tracks 'roll' action with dice value
- `handleTileLanding()` - Tracks 'land_on_tile' and 'land_on_corner'
- `handleBuyStock()` - Tracks 'buy_stock' with ticker/category
- `handleBiasQuizComplete()` - Tracks 'complete_quiz' with score
- `handleCasinoWin()` - Tracks 'win_scratchcard'
- `handleChooseChallenge()` - Tracks 'complete_thrifty'

**Event Multipliers Applied:**
- `applyStarMultiplier()` - Updated to include event multipliers
- `getEffectiveDailyRollLimit()` - Includes event roll bonuses
- All reward calculations use event multipliers

**UI Components Added:**
- ChallengeTracker below UserIndicator
- EventBanner at top of screen
- ChallengesModal (opens from tracker or hub)
- EventCalendar (opens from banner or hub)

#### HubModal Integration
Added two new buttons in the Hub Stats tab:
- "🎯 Challenges" button - Opens ChallengesModal
- "📅 Events" button - Opens EventCalendar

### Database Schema

#### Supabase Migration (`025_challenges_system.sql`)

**board_game_profiles Updates:**
```sql
ALTER TABLE board_game_profiles 
ADD COLUMN challenges jsonb DEFAULT '{
  "daily": [], 
  "weekly": [], 
  "completedToday": 0, 
  "completedThisWeek": 0,
  "lastDailyReset": null,
  "lastWeeklyReset": null
}'::jsonb;
```

**event_participation Table (Optional Analytics):**
```sql
CREATE TABLE event_participation (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_id text NOT NULL,
  participated_at timestamptz DEFAULT now()
);
```

### Data Flow

#### Challenge Completion Flow:
1. Player performs action (e.g., rolls dice)
2. `updateChallengeProgress()` called with action and value
3. Hook checks all active challenges for matching action
4. If conditions met, progress incremented
5. If target reached:
   - Challenge marked as completed
   - Rewards auto-claimed (stars, XP, SP added to game state)
   - Success notification shown
   - Celebration sound played
   - Game state updated and persisted

#### Event Activation Flow:
1. `useEvents` polls every minute
2. `checkEventStart()` detects event should begin
3. Event marked as active
4. Start notification shown with celebration sound
5. Multipliers/effects now active
6. When event ends:
   - `checkEventEnd()` detects end time
   - Event marked inactive
   - End notification shown
   - For recurring events, next occurrence calculated

## Features

### Daily Engagement
- **Daily Reset**: New challenges every midnight
- **Variety**: 20+ unique challenges prevent repetition
- **Progression**: Easy/Medium/Hard tiers match player skill
- **Quick Wins**: Easy challenges completable in minutes
- **Stretch Goals**: Hard challenges require dedication

### Weekly Retention
- **Weekly Goals**: Larger rewards for sustained play
- **Streak Tracking**: Consecutive day completion bonuses
- **Meta-Challenges**: Complete daily challenges to progress weekly ones

### Event System
- **Recurring Events**: Predictable weekly bonuses
- **Special Events**: Holiday surprises
- **Stacking Effects**: Multiple events can run simultaneously
- **Visual Feedback**: Banner shows active events clearly
- **Planning Ahead**: Calendar shows upcoming events

### Reward Integration
- **Stars**: Immediate currency for shop purchases
- **XP**: Levels up player for milestone rewards
- **Season Points**: Progresses battle pass tiers
- **Multipliers**: Events boost all rewards temporarily

## Testing

### Manual Testing Checklist
- [ ] Daily challenges generate at midnight
- [ ] 3 daily challenges assigned (1 easy, 1 medium, 1 hard)
- [ ] Challenge progress tracks correctly:
  - [ ] Roll challenges (with dice value conditions)
  - [ ] Buy stock challenges (with portfolio conditions)
  - [ ] Landing on tile challenges
  - [ ] Quiz completion challenges
  - [ ] Casino win challenges
  - [ ] Net worth milestone challenges
- [ ] Challenge completion:
  - [ ] Auto-claims rewards
  - [ ] Shows notification
  - [ ] Plays sound
  - [ ] Updates tracker
- [ ] All daily challenges complete shows special notification
- [ ] Weekly challenges generate on Monday
- [ ] Weekly challenges reset properly
- [ ] Event banner appears when events active
- [ ] Event multipliers apply to rewards
- [ ] Event calendar shows correct dates
- [ ] Hub buttons open correct modals
- [ ] Data persists to Supabase
- [ ] No console errors

### Edge Cases to Test
- Player offline for multiple days (should get latest challenges)
- Challenge completion exactly at midnight (reset timing)
- Multiple challenges completing simultaneously
- Event starting while another is active
- Weekly reset on Monday while daily also resets

## Performance Considerations
- Challenge checking is O(n) where n = number of active challenges (typically 5)
- Event polling runs every minute (minimal overhead)
- All state updates batched in React setState
- Supabase saves debounced (2 second delay)
- No heavy computations in render loop

## Future Enhancements
Potential additions for future phases:
- Challenge categories (combat, investing, exploration)
- Challenge difficulty scaling based on player level
- Challenge streaks (complete all dailies X days in a row)
- Event-specific challenges (only available during events)
- Social challenges (compete with friends)
- Achievement integration (unlock achievements via challenges)
- Analytics dashboard for event participation
- A/B testing different challenge pools
- Seasonal challenges
- Challenge reroll system (spend stars to get new challenge)

## Migration Instructions

### For Developers
1. Pull latest code from `copilot/add-daily-challenges-system` branch
2. Run database migration:
   ```bash
   psql $DATABASE_URL -f supabase/patches/025_challenges_system.sql
   ```
3. Restart development server
4. Test challenge system by playing the game

### For Production
1. Review and test migration in staging environment
2. Schedule migration during low-traffic window
3. Run migration script
4. Monitor for errors in application logs
5. Verify challenge system working via user reports

## Related Files

### Core Logic
- `apps/investing-board-game-v3/src/lib/challenges.ts` - Challenge definitions
- `apps/investing-board-game-v3/src/lib/events.ts` - Event definitions
- `apps/investing-board-game-v3/src/lib/types.ts` - TypeScript types

### Hooks
- `apps/investing-board-game-v3/src/hooks/useChallenges.ts` - Challenge management
- `apps/investing-board-game-v3/src/hooks/useEvents.ts` - Event management
- `apps/investing-board-game-v3/src/hooks/useGameSave.ts` - Persistence (updated)

### Components
- `apps/investing-board-game-v3/src/components/ChallengeTracker.tsx` - HUD widget
- `apps/investing-board-game-v3/src/components/ChallengesModal.tsx` - Challenges modal
- `apps/investing-board-game-v3/src/components/EventBanner.tsx` - Event banner
- `apps/investing-board-game-v3/src/components/EventCalendar.tsx` - Event calendar
- `apps/investing-board-game-v3/src/components/HubModal.tsx` - Hub integration (updated)

### Integration
- `apps/investing-board-game-v3/src/App.tsx` - Main integration point

### Database
- `supabase/patches/025_challenges_system.sql` - Schema migration

## Support
For questions or issues with the challenges and events system, contact the development team or open an issue on GitHub.

## License
Same as parent project (see LICENSE file in repository root).
