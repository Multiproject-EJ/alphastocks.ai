-- Board Game Profiles: Store player game state (portfolio, stars, money, position)
-- Run with: psql $DATABASE_URL -f supabase/patches/022_board_game_profiles.sql
BEGIN;

-- Ensure UUID generation is available for primary keys.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table to store board game player profiles and game state
CREATE TABLE IF NOT EXISTS board_game_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Game state
  cash numeric NOT NULL DEFAULT 100000,
  position integer NOT NULL DEFAULT 0,
  net_worth numeric NOT NULL DEFAULT 100000,
  portfolio_value numeric NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  -- Holdings stored as JSONB array
  holdings jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Daily rolls tracking
  rolls_remaining integer NOT NULL DEFAULT 10,
  rolls_reset_at timestamptz NOT NULL DEFAULT (date_trunc('day', now()) + interval '1 day'),
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Each user has one game profile
  UNIQUE (profile_id)
);

-- Create index for fast lookups by profile_id
CREATE INDEX IF NOT EXISTS idx_board_game_profiles_profile_id ON board_game_profiles(profile_id);

-- Enable Row Level Security
ALTER TABLE board_game_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own game profile
CREATE POLICY "Users can read their own board game profile"
  ON board_game_profiles
  FOR SELECT
  USING (profile_id = auth.uid());

-- Users can insert their own game profile
CREATE POLICY "Users can insert their own board game profile"
  ON board_game_profiles
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Users can update their own game profile
CREATE POLICY "Users can update their own board game profile"
  ON board_game_profiles
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Users can delete their own game profile
CREATE POLICY "Users can delete their own board game profile"
  ON board_game_profiles
  FOR DELETE
  USING (profile_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_board_game_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on changes
DROP TRIGGER IF EXISTS trigger_update_board_game_profiles_updated_at ON board_game_profiles;
CREATE TRIGGER trigger_update_board_game_profiles_updated_at
  BEFORE UPDATE ON board_game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_board_game_profiles_updated_at();

COMMIT;
