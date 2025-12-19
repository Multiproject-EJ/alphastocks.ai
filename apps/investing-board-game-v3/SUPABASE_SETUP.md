# Supabase setup for the Investing Board Game V3

The board game can now pull stock cards directly from your Supabase `investment_universe` table and save game progress (portfolio, stars, money, position) for authenticated users. This document lists the minimum steps to turn that on.

## 1) Environment variables
Add your Supabase project credentials to the board game environment (e.g., `.env.local` at the repo root or the Codespace secrets panel):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

## 2) Database objects

### Investment Universe Table
If the `investment_universe` table is missing, apply the shipped SQL patch:

```
psql $DATABASE_URL -f supabase/patches/001_create_investment_universe.sql
```

The later patch `supabase/patches/012_investment_universe_addons.sql` adds optional summary fields that the card descriptions will use when present.

### Board Game Profiles Table (Game Save)
To enable game saving (portfolio, stars, money, position), apply the board game profiles patch:

```
psql $DATABASE_URL -f supabase/patches/022_board_game_profiles.sql
```

This creates a `board_game_profiles` table that stores:
- Cash balance
- Board position
- Net worth
- Portfolio value
- Stars earned
- Holdings (stock portfolio as JSONB)
- Daily rolls remaining
- Roll reset timestamp

The patch includes Row Level Security policies so each user can only access their own game data.

### Additional Columns (Required)
Apply additional patches to add coins, energy, and thrift path tracking:

```
psql $DATABASE_URL -f supabase/patches/023_shop_inventory.sql
psql $DATABASE_URL -f supabase/patches/024_progression_system.sql
psql $DATABASE_URL -f supabase/patches/025_challenges_system.sql
psql $DATABASE_URL -f supabase/patches/026_add_missing_game_columns.sql
```

Patch 026 adds:
- Coins (third currency for micro-transactions)
- Thrift Path status (disciplined investing rewards)
- Energy rolls and regeneration tracking
- Dice roll history and doubles tracking

**Note:** If you see data not persisting after refresh, ensure patch 026 has been applied to your database.

## 3) Shared Authentication with ProTools

The board game shares authentication with the ProTools workspace. When you sign in to ProTools, you are automatically signed in to the board game as well.

Both applications use the same Supabase instance and share the authentication session via localStorage. The storage key `supabase.auth.token` is used consistently across both apps.

### How it works:
1. Sign in via ProTools at `https://www.alphastocks.ai/?proTools=1`
2. Navigate to the board game at `https://www.alphastocks.ai/board-game-v3/`
3. Your game progress is automatically loaded from the database
4. Any changes to your game state are auto-saved

## 4) Row-level security

### Investment Universe RLS
Enable RLS so each signed-in user only sees their own saved symbols. This policy uses the `profile_id` column and expects Supabase Auth to set `auth.uid()` to that profile id:

```
ALTER TABLE public.investment_universe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own universe" ON public.investment_universe
  FOR SELECT
  USING (profile_id IS NOT NULL AND profile_id = auth.uid());
```

Populate `profile_id` for existing rows so they remain visible to their owner (replace `<user-uuid>` with the `auth.users.id` of the owner):

```
UPDATE public.investment_universe
SET profile_id = '<user-uuid>'
WHERE profile_id IS NULL;
```

If you prefer to keep the starter demo rows globally visible, skip the last `UPDATE` and add a second policy allowing `profile_id IS NULL` for SELECT.

### Board Game Profiles RLS
The `022_board_game_profiles.sql` patch already includes RLS policies. Each user can only read, insert, update, and delete their own game profile.

## 5) Testing locally
1. Start the board game (`npm run dev` from `apps/investing-board-game-v3`).
2. Sign in with Supabase Auth via ProTools or the board game login prompt.
3. Play the game - your progress is automatically saved.
4. Refresh the page or return later - your game state is restored.
5. Add a few symbols to `investment_universe` (via your existing UI or psql), then land on a category tile to see your cards pulled from Supabase. The game falls back to built-in demo stocks if the query fails or returns no rows.

## 6) Game Save Features

When authenticated, the board game provides:

- **Auto-save**: Game state is automatically saved after each action
- **Progress restoration**: When you return, your game continues where you left off
- **Daily rolls sync**: Your remaining daily rolls are saved and restored
- **Cloud indicator**: A status indicator in the top-left shows your login status and save state

If you are not logged in, the game runs in demo mode with local state only (not persisted).
