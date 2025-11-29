-- Minimal patch to track the investment universe without bulk demo data.
-- Run with: psql $DATABASE_URL -f supabase/patches/001_create_investment_universe.sql
BEGIN;

-- Ensure UUID generation is available for primary keys.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table capturing every stock the user adds to their universe.
CREATE TABLE IF NOT EXISTS investment_universe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text,
  profile_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, symbol)
);

-- Optional starter rows to verify the table is wired up.
INSERT INTO investment_universe (symbol, name)
VALUES
  ('NVDA', 'NVIDIA Corporation'),
  ('TSM', 'Taiwan Semiconductor Manufacturing Company'),
  ('MSFT', 'Microsoft Corporation')
ON CONFLICT (profile_id, symbol) DO NOTHING;

COMMIT;
