-- valuebot_deep_dive_reads
-- Track which ValueBot deep dives have been opened/read per user.
-- Run with: psql $DATABASE_URL -f supabase/patches/030_valuebot_deep_dive_reads.sql

BEGIN;

CREATE TABLE IF NOT EXISTS valuebot_deep_dive_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  deep_dive_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, deep_dive_id)
);

COMMIT;
