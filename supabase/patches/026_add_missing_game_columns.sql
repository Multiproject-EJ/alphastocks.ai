-- Add missing columns to board_game_profiles for coins, energy, and thrift path
-- Run with: psql $DATABASE_URL -f supabase/patches/026_add_missing_game_columns.sql
BEGIN;

-- Add coins column for third currency (micro-transactions)
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 100;

-- Add thrift path status column
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS thrift_path JSONB DEFAULT '{
  "active": false,
  "level": 0,
  "experience": 0,
  "streakDays": 0,
  "activatedAt": null,
  "lastActivityDate": null,
  "benefits": {
    "starMultiplier": 1,
    "crashProtection": 0,
    "recoveryBoost": 1
  },
  "stats": {
    "totalChallengesCompleted": 0,
    "perfectQuizzes": 0,
    "disciplinedChoices": 0,
    "impulsiveActions": 0,
    "longTermHoldings": 0
  }
}'::jsonb;

-- Add energy regeneration columns
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS last_energy_check TIMESTAMPTZ DEFAULT now();

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS energy_rolls INTEGER NOT NULL DEFAULT 10;

-- Add dice roll tracking columns
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS roll_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS doubles_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS total_doubles INTEGER NOT NULL DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN board_game_profiles.coins IS 'Third currency used for micro-transactions and skip actions';
COMMENT ON COLUMN board_game_profiles.thrift_path IS 'Thrift Path status tracking disciplined investing behavior';
COMMENT ON COLUMN board_game_profiles.last_energy_check IS 'Timestamp of last energy regeneration check';
COMMENT ON COLUMN board_game_profiles.energy_rolls IS 'Current energy-based rolls available (regenerates over time)';
COMMENT ON COLUMN board_game_profiles.roll_history IS 'Recent dice roll history for patterns and statistics';
COMMENT ON COLUMN board_game_profiles.doubles_streak IS 'Current consecutive doubles streak';
COMMENT ON COLUMN board_game_profiles.total_doubles IS 'Total number of doubles rolled all-time';

COMMIT;
