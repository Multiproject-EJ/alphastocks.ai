-- valuebot_deep_dives
-- Deep-dive outputs for ValueBot Modules 0–6 (saved from Module 6 Final Verdict).
-- Run with: psql $DATABASE_URL -f supabase/patches/002_valuebot_deep_dives.sql

BEGIN;

-- Ensure UUID generation is available for primary keys.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Stores the full ValueBot deep-dive (modules 0–6) so users can reopen analyses from the Investing Universe.
CREATE TABLE IF NOT EXISTS valuebot_deep_dives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  ticker text NOT NULL,
  company_name text,
  currency text,
  provider text NOT NULL DEFAULT 'openai',
  model text,
  timeframe text,
  custom_question text,
  module0_markdown text,
  module1_markdown text,
  module2_markdown text,
  module3_markdown text,
  module4_markdown text,
  module5_markdown text,
  module6_markdown text NOT NULL,
  source text DEFAULT 'valuebot_deep_dive'
);

-- RLS policies are managed via the Supabase dashboard for this table.

COMMIT;
