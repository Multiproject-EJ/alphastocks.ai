# Daily Dividends Feature - Testing & Demo Guide

## Overview
The Daily Dividends feature is a Monopoly GO-inspired daily reward system for the stock market themed game. Users receive rewards for visiting the game each day.

## Feature Specifications

### Database Schema
Location: `supabase/patches/028_daily_dividends.sql`

Added columns to `board_game_profiles` table:
- `daily_dividend_day` (integer, 1-7): Current day in the 7-day cycle
- `daily_dividend_last_collection` (timestamptz): Last collection timestamp
- `daily_dividend_total_collected` (integer): Total dividends collected

### Reward Schedule
The 7-day reward pattern alternates between dice rolls and cash:
- Day 1: 10 dice rolls 🎲
- Day 2: $1,000 cash 💵
- Day 3: 10 dice rolls 🎲
- Day 4: $1,000 cash 💵
- Day 5: 10 dice rolls 🎲
- Day 6: $1,000 cash 💵
- Day 7: 10 dice rolls 🎲 (then resets to Day 1)

### User Flow
1. User opens the game
2. If it's a new day (and they haven't collected today), the Daily Dividends modal appears
3. User sees their progress through the 7-day cycle
4. User taps on the current day's card to reveal the reward
5. Celebration animation plays with confetti
6. Reward is added to user's balance (dice rolls or cash)
7. Day counter advances
8. Modal closes

### Key Features
- **Non-Calendar Based**: Progress only advances when user collects (skipping a day doesn't reset)
- **Mobile-First Design**: Optimized for 320px-428px width screens
- **Stock Market Theme**: Green emerald colors, financial icons
- **Celebration Effects**: Canvas confetti + framer-motion animations
- **Visual Progress**: Shows all 7 days with checkmarks for completed days

## Testing Instructions

### Prerequisites
1. Database migration must be run: `028_daily_dividends.sql`
2. Supabase configuration must be set up
3. User must be authenticated

### Manual Testing Steps

#### Test 1: First-Time User Experience
1. Start the app with a fresh user account
2. Expected: Daily Dividends modal should appear after loading screen
3. Current day should be Day 1
4. Tap on Day 1 card
5. Expected: 
   - Reward reveals: "10 Rolls!"
   - Confetti animation plays
   - Success toast appears
   - Modal closes after 2 seconds
   - User's dice roll count increases by 10

#### Test 2: Daily Visit Detection
1. Collect reward for current day
2. Reload the page (same day)
3. Expected: Modal does NOT appear (already collected today)
4. Change system date to next day (or wait 24 hours)
5. Reload the page
6. Expected: Modal appears with next day highlighted

#### Test 3: 7-Day Progression
1. Collect Day 1 reward (10 rolls)
2. Next day: Collect Day 2 reward ($1,000 cash)
3. Next day: Collect Day 3 reward (10 rolls)
4. Continue through Day 7
5. After collecting Day 7 reward, verify cycle resets to Day 1

#### Test 4: Skip Day Behavior
1. Collect Day 3 reward
2. Skip 2 days (don't open the app)
3. Open app on the 3rd day
4. Expected: Still on Day 4 (not reset, progression maintained)

#### Test 5: Mobile Responsiveness
Test on various screen sizes:
- iPhone SE (320px): All elements should fit without scrolling
- iPhone 12 (390px): Proper spacing and layout
- iPhone 14 Pro Max (428px): Comfortable viewing

#### Test 6: Animation & Sound
1. Collect reward
2. Verify:
   - Card animation on tap
   - Confetti burst from center
   - Success haptic feedback (on mobile)
   - Sound effect plays
   - Smooth reveal animation

### Automated Testing (E2E)

You can add this test to `e2e/screenshots.spec.ts`:

```typescript
test('daily dividends modal', async ({ page }) => {
  await page.goto('/?test-daily-dividends=true')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Wait for Daily Dividends modal
  const modal = page.locator('[role="dialog"]').filter({ hasText: /Daily Dividends/i })
  
  if (await modal.isVisible({ timeout: 5000 })) {
    // Take screenshot of modal
    await page.screenshot({
      path: `${screenshotDir}/daily-dividends-modal.png`,
      fullPage: true,
    })
    
    // Click on current day card
    const dayCard = modal.locator('button').first()
    await dayCard.click()
    await page.waitForTimeout(2000) // Wait for celebration animation
    
    // Take screenshot after collection
    await page.screenshot({
      path: `${screenshotDir}/daily-dividends-collected.png`,
      fullPage: true,
    })
  }
})
```

## Integration Points

### App.tsx Integration
The modal is triggered in `App.tsx` via a `useEffect` hook that:
1. Checks if user can collect (via `useDailyDividends` hook)
2. Shows modal using overlay manager with 'high' priority
3. Handles reward collection and balance updates
4. Provides success feedback (toast, sound, haptics)

### Hook: useDailyDividends
Location: `src/hooks/useDailyDividends.ts`

Key functions:
- `refreshStatus()`: Loads current dividend status from database
- `collectReward()`: Collects today's reward and advances day counter
- `canCollectToday()`: Checks if user can collect based on last collection date

Returns:
- `status`: Current dividend status (day, can collect, etc.)
- `loading`: Loading state
- `canShowPopup`: Whether to show the modal
- `collectReward`: Function to collect reward

### Component: DailyDividendsModal
Location: `src/components/DailyDividendsModal.tsx`

Props:
- `open`: Modal open state
- `onOpenChange`: Callback to close modal
- `status`: Current dividend status
- `onCollect`: Async callback to collect reward

Features:
- Responsive grid layout (3 cards, 3 cards, 1 large card)
- Current day highlighted with pulsing border
- Collected days show checkmarks
- Tap to reveal current day's reward
- Canvas confetti celebration
- Progress bar showing cycle completion

## Known Limitations

1. **Database Migration Required**: The feature won't work until migration is applied
2. **Graceful Degradation**: If columns don't exist, hook logs warning and shows default state
3. **Time Zone**: Uses browser's local time for day comparison
4. **No Backend API**: Directly updates Supabase (no API layer)

## Future Enhancements

1. **Special 7th Day Reward**: Make Day 7 reward bigger/special
2. **Streak Bonuses**: Reward users for consecutive daily visits
3. **Push Notifications**: Remind users to collect their daily dividend
4. **Animated Cards**: Add flip animation when revealing reward
5. **Social Sharing**: Let users share their streak on social media
6. **Personalized Rewards**: Based on user's play style or net worth tier

## Troubleshooting

### Modal Not Appearing
1. Check console for errors
2. Verify database migration is applied
3. Ensure user is authenticated
4. Check `canShowDividendsPopup` is true in React DevTools

### Rewards Not Added
1. Check `collectReward()` returns successful
2. Verify database update succeeded
3. Check state update in App.tsx
4. Review console logs

### Animation Issues
1. Ensure canvas-confetti is installed
2. Check framer-motion is working (other animations)
3. Test in different browsers
4. Check for console errors

## Files Modified/Created

### New Files
- `supabase/patches/028_daily_dividends.sql` - Database migration
- `src/hooks/useDailyDividends.ts` - Hook for dividend logic
- `src/components/DailyDividendsModal.tsx` - Modal component

### Modified Files
- `src/App.tsx` - Added modal integration
- `src/hooks/useGameSave.ts` - Added dividend fields to profile type
- `package.json` - Added canvas-confetti dependency

## Build & Deployment

Build command: `npm run build`
Build status: ✅ Success (verified)

The feature is ready for deployment after:
1. Running database migration on production
2. Testing on staging environment
3. QA approval
4. Product owner sign-off
