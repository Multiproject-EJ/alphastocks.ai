-- Add jackpot column to board_game_profiles table
-- This stores the accumulated jackpot amount from passing Start without landing

ALTER TABLE board_game_profiles
ADD COLUMN IF NOT EXISTS jackpot BIGINT DEFAULT 0;

COMMENT ON COLUMN board_game_profiles.jackpot IS 'Accumulated jackpot from passing Start without landing. Resets when player lands on Start during Jackpot Week.';
