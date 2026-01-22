# MIGRATIONS_LOG.md

## SQL migrations / patches (append-only)
> Add every migration here so EJ knows exactly what to run or rerun.

### Template
- `YYYYMMDDHHMM__name.sql`
  - Purpose:
  - Depends on:
  - Safe rerun: Yes/No
  - Rollback:
  - Verify:
    - `SELECT 1;`
  - Required for prod: Yes/No

- `032_shop_vault_schema.sql`
  - Purpose: Add Shop 2.0 vault seasons, sets, items, and player progress tables.
  - Depends on: `022_board_game_profiles.sql` (auth users for profile_id references).
  - Safe rerun: Yes (uses IF NOT EXISTS where possible; unique constraints may error if duplicates exist).
  - Rollback: Drop shop_vault_* tables and update_shop_vault_updated_at trigger/function.
  - Verify:
    - `SELECT 1 FROM public.shop_vault_seasons LIMIT 1;`
    - `SELECT 1 FROM public.shop_vault_sets LIMIT 1;`
    - `SELECT 1 FROM public.shop_vault_items LIMIT 1;`
  - Required for prod: No (feature-flagged Shop 2.0).

- `033_shop_vault_purchase.sql`
  - Purpose: Add atomic Shop 2.0 vault purchase function to insert ownership and update set/season progress.
  - Depends on: `032_shop_vault_schema.sql`.
  - Safe rerun: Yes (CREATE OR REPLACE FUNCTION).
  - Rollback: Drop `public.shop_vault_purchase` function.
  - Verify:
    - `SELECT proname FROM pg_proc WHERE proname = 'shop_vault_purchase';`
  - Required for prod: No (feature-flagged Shop 2.0).

- `034_shop_vault_profile_progress.sql`
  - Purpose: Add per-player Shop 2.0 vault XP + level progress tracking table.
  - Depends on: `022_board_game_profiles.sql` (auth users for profile_id references).
  - Safe rerun: Yes (uses IF NOT EXISTS where possible).
  - Rollback: Drop `public.shop_vault_profile_progress` table and trigger.
  - Verify:
    - `SELECT 1 FROM public.shop_vault_profile_progress LIMIT 1;`
  - Required for prod: No (feature-flagged Shop 2.0).
