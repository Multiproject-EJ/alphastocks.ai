-- Daily Dividends System: Track user's daily dividend progress
-- Run with: psql $DATABASE_URL -f supabase/patches/028_daily_dividends.sql
BEGIN;

-- Add daily dividends columns to board_game_profiles table
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS daily_dividend_day integer NOT NULL DEFAULT 1 CHECK (daily_dividend_day >= 1 AND daily_dividend_day <= 7),
ADD COLUMN IF NOT EXISTS daily_dividend_last_collection timestamptz,
ADD COLUMN IF NOT EXISTS daily_dividend_total_collected integer NOT NULL DEFAULT 0;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_board_game_profiles_dividend_day ON board_game_profiles(daily_dividend_day);
CREATE INDEX IF NOT EXISTS idx_board_game_profiles_dividend_last_collection ON board_game_profiles(daily_dividend_last_collection);

-- Add comment for documentation
COMMENT ON COLUMN board_game_profiles.daily_dividend_day IS 'Current day in the 7-day dividend cycle (1-7). Only advances when user collects reward.';
COMMENT ON COLUMN board_game_profiles.daily_dividend_last_collection IS 'Timestamp of last dividend collection. Used to determine if user can collect today.';
COMMENT ON COLUMN board_game_profiles.daily_dividend_total_collected IS 'Total number of dividends collected (for stats/achievements).';

COMMIT;
