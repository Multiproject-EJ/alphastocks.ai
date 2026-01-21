# Supabase Auth & Daily Dividends Troubleshooting Log

Use this checklist to diagnose Daily Dividends collection failures that look like auth or RLS issues.

## 1) Identify the symptom in-app

Look at the error text shown in the Daily Dividends modal. Recent errors map to:

- **"Supabase is not configured"** → missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`.
- **"Please sign in again"** → auth session missing/expired or storage mismatch.
- **"Blocked by Row Level Security"** → RLS policy is preventing select/upsert on `board_game_profiles`.
- **"Daily dividends columns not found"** → migration `028_daily_dividends.sql` missing.

## 2) Supabase SQL checks (service role)

Replace `<USER_ID>` with the user's UUID from auth.

```sql
-- Check the user's profile row exists
select
  profile_id,
  daily_dividend_day,
  daily_dividend_last_collection,
  daily_dividend_total_collected
from board_game_profiles
where profile_id = '<USER_ID>';
```

```sql
-- Confirm RLS is enabled
select
  relname,
  relrowsecurity
from pg_class
where relname = 'board_game_profiles';
```

```sql
-- List policies applied to the table
select
  polname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where tablename = 'board_game_profiles'
order by polname;
```

```sql
-- Check recent updates to this user's profile row
select
  profile_id,
  updated_at,
  daily_dividend_last_collection
from board_game_profiles
where profile_id = '<USER_ID>'
order by updated_at desc
limit 5;
```

## 3) Client-side checks

- Ensure the app is using the expected Supabase project (`VITE_SUPABASE_URL`).
- Clear local storage and sign in again to refresh the Supabase session.
- Verify the auth session exists in localStorage under the `supabase.auth.token` key.

## 4) RLS failure checklist

If you see the RLS error:

- Confirm the table policies include **SELECT** and **UPSERT/INSERT/UPDATE** for `board_game_profiles`.
- Verify that `profile_id = auth.uid()` is used in `USING`/`WITH CHECK` clauses.

## 5) Logging notes (fill in when diagnosing)

- Date/time:
- User ID:
- Project URL:
- Error message:
- SQL checks run + results:
- Resolution:
