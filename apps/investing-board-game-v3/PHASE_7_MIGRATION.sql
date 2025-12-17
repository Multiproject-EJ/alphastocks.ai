-- Phase 7: Add coins and thrift_path columns to board_game_profiles table
-- Run this migration to enable Coins currency and Thrift Path persistent status

-- Add coins column (default 100 starting coins)
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;

-- Add thrift_path column (JSONB to store the entire status)
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS thrift_path JSONB DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_board_game_profiles_thrift_path 
ON board_game_profiles USING GIN (thrift_path);

-- Example thrift_path structure:
-- {
--   "active": false,
--   "level": 0,
--   "experience": 0,
--   "streakDays": 0,
--   "activatedAt": null,
--   "lastActivityDate": null,
--   "benefits": {
--     "starMultiplier": 1,
--     "crashProtection": 0,
--     "recoveryBoost": 1
--   },
--   "stats": {
--     "totalChallengesCompleted": 0,
--     "perfectQuizzes": 0,
--     "disciplinedChoices": 0,
--     "impulsiveActions": 0,
--     "longTermHoldings": 0
--   }
-- }
