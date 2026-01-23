-- Board Game Portfolio Check: Ensure portfolio saving/sharing SQL exists and is up to date
-- Run with: psql $DATABASE_URL -f supabase/patches/037_board_game_portfolio_check.sql
BEGIN;

-- Ensure UUID generation is available for primary keys.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the core table if missing (idempotent safeguard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'board_game_profiles'
  ) THEN
    CREATE TABLE board_game_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      cash numeric NOT NULL DEFAULT 100000,
      position integer NOT NULL DEFAULT 0,
      net_worth numeric NOT NULL DEFAULT 100000,
      portfolio_value numeric NOT NULL DEFAULT 0,
      stars integer NOT NULL DEFAULT 0,
      holdings jsonb NOT NULL DEFAULT '[]'::jsonb,
      rolls_remaining integer NOT NULL DEFAULT 10,
      rolls_reset_at timestamptz NOT NULL DEFAULT (date_trunc('day', now()) + interval '1 day'),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (profile_id)
    );
  END IF;
END;
$$;

-- Ensure required portfolio columns exist for buy/sell flow
ALTER TABLE board_game_profiles
  ADD COLUMN IF NOT EXISTS cash numeric NOT NULL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_worth numeric NOT NULL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS portfolio_value numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stars integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS holdings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rolls_remaining integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS rolls_reset_at timestamptz NOT NULL DEFAULT (date_trunc('day', now()) + interval '1 day'),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Ensure unique profile constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'board_game_profiles_profile_id_key'
  ) THEN
    ALTER TABLE board_game_profiles ADD CONSTRAINT board_game_profiles_profile_id_key UNIQUE (profile_id);
  END IF;
END;
$$;

-- Enable Row Level Security (safe if already enabled)
ALTER TABLE board_game_profiles ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist (safe checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_game_profiles'
      AND policyname = 'Users can read their own board game profile'
  ) THEN
    CREATE POLICY "Users can read their own board game profile"
      ON board_game_profiles
      FOR SELECT
      USING (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_game_profiles'
      AND policyname = 'Users can insert their own board game profile'
  ) THEN
    CREATE POLICY "Users can insert their own board game profile"
      ON board_game_profiles
      FOR INSERT
      WITH CHECK (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_game_profiles'
      AND policyname = 'Users can update their own board game profile'
  ) THEN
    CREATE POLICY "Users can update their own board game profile"
      ON board_game_profiles
      FOR UPDATE
      USING (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'board_game_profiles'
      AND policyname = 'Users can delete their own board game profile'
  ) THEN
    CREATE POLICY "Users can delete their own board game profile"
      ON board_game_profiles
      FOR DELETE
      USING (profile_id = auth.uid());
  END IF;
END;
$$;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_board_game_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_board_game_profiles_updated_at ON board_game_profiles;
CREATE TRIGGER trigger_update_board_game_profiles_updated_at
  BEFORE UPDATE ON board_game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_board_game_profiles_updated_at();

-- Portfolio summary view and functions (safe replace)
CREATE OR REPLACE VIEW board_game_portfolio_summary AS
SELECT 
  bgp.profile_id,
  bgp.cash,
  bgp.portfolio_value,
  bgp.net_worth,
  bgp.holdings,
  (
    SELECT jsonb_object_agg(
      category,
      ROUND((category_value / NULLIF(bgp.portfolio_value, 0) * 100)::numeric, 1)
    )
    FROM (
      SELECT 
        (holding->'stock'->>'category') as category,
        SUM((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as category_value
      FROM jsonb_array_elements(bgp.holdings) as holding
      GROUP BY (holding->'stock'->>'category')
    ) category_stats
  ) as category_allocation,
  jsonb_array_length(bgp.holdings) as holdings_count,
  bgp.created_at,
  bgp.updated_at
FROM board_game_profiles bgp;

CREATE OR REPLACE FUNCTION get_board_game_portfolio_positions(user_profile_id uuid)
RETURNS TABLE (
  symbol text,
  name text,
  category text,
  shares numeric,
  avg_price numeric,
  current_price numeric,
  total_cost numeric,
  current_value numeric,
  unrealized_gain_loss numeric,
  unrealized_gain_loss_pct numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (holding->'stock'->>'ticker')::text as symbol,
    (holding->'stock'->>'name')::text as name,
    (holding->'stock'->>'category')::text as category,
    (holding->>'shares')::numeric as shares,
    ((holding->>'totalCost')::numeric / NULLIF((holding->>'shares')::numeric, 0)) as avg_price,
    (holding->'stock'->>'price')::numeric as current_price,
    (holding->>'totalCost')::numeric as total_cost,
    ((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as current_value,
    (
      ((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) - 
      (holding->>'totalCost')::numeric
    ) as unrealized_gain_loss,
    (
      CASE 
        WHEN (holding->>'totalCost')::numeric > 0 THEN
          (
            (((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) - 
            (holding->>'totalCost')::numeric) / (holding->>'totalCost')::numeric
          ) * 100
        ELSE 0
      END
    ) as unrealized_gain_loss_pct
  FROM board_game_profiles bgp,
       jsonb_array_elements(bgp.holdings) as holding
  WHERE bgp.profile_id = user_profile_id
  ORDER BY current_value DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_board_game_portfolio_summary(user_profile_id uuid)
RETURNS TABLE (
  total_value numeric,
  cash_balance numeric,
  net_worth numeric,
  portfolio_value numeric,
  holdings_count integer,
  category_allocation jsonb,
  total_cost_basis numeric,
  total_unrealized_gain_loss numeric,
  total_unrealized_gain_loss_pct numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bgp.net_worth as total_value,
    bgp.cash as cash_balance,
    bgp.net_worth,
    bgp.portfolio_value,
    jsonb_array_length(bgp.holdings) as holdings_count,
    (
      SELECT jsonb_object_agg(
        category,
        ROUND((category_value / NULLIF(bgp.portfolio_value, 0) * 100)::numeric, 1)
      )
      FROM (
        SELECT 
          (holding->'stock'->>'category') as category,
          SUM((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as category_value
        FROM jsonb_array_elements(bgp.holdings) as holding
        GROUP BY (holding->'stock'->>'category')
      ) category_stats
    ) as category_allocation,
    (
      SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
      FROM jsonb_array_elements(bgp.holdings) as holding
    ) as total_cost_basis,
    (
      bgp.portfolio_value - (
        SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
        FROM jsonb_array_elements(bgp.holdings) as holding
      )
    ) as total_unrealized_gain_loss,
    (
      CASE 
        WHEN (
          SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
          FROM jsonb_array_elements(bgp.holdings) as holding
        ) > 0 THEN
          (
            (bgp.portfolio_value - (
              SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
              FROM jsonb_array_elements(bgp.holdings) as holding
            )) / (
              SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
              FROM jsonb_array_elements(bgp.holdings) as holding
            )
          ) * 100
        ELSE 0
      END
    ) as total_unrealized_gain_loss_pct
  FROM board_game_profiles bgp
  WHERE bgp.profile_id = user_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_board_game_portfolio_positions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_board_game_portfolio_summary(uuid) TO authenticated;

COMMIT;
