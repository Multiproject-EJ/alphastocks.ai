# Supabase setup for the Investing Board Game V3

The board game can now pull stock cards directly from your Supabase `investment_universe` table. This document lists the minimum steps to turn that on for authenticated users.

## 1) Environment variables
Add your Supabase project credentials to the board game environment (e.g., `.env.local` at the repo root or the Codespace secrets panel):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

## 2) Database objects
If the `investment_universe` table is missing, apply the shipped SQL patch:

```
psql $DATABASE_URL -f supabase/patches/001_create_investment_universe.sql
```

The later patch `supabase/patches/012_investment_universe_addons.sql` adds optional summary fields that the card descriptions will use when present.

## 3) Row-level security
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

## 4) Testing locally
1. Start the board game (`npm run dev` from `apps/investing-board-game-v3`).
2. Sign in with Supabase Auth so the anon client has a user access token.
3. Add a few symbols to `investment_universe` (via your existing UI or psql), then land on a category tile to see your cards pulled from Supabase. The game falls back to built-in demo stocks if the query fails or returns no rows.
