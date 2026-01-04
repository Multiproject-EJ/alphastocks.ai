-- Phase 8: Add event_track column to board_game_profiles table
-- Run this migration to persist the Event Reward Track state

ALTER TABLE board_game_profiles
ADD COLUMN IF NOT EXISTS event_track JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_board_game_profiles_event_track
ON board_game_profiles USING GIN (event_track);

-- Example event_track structure:
-- {
--   "eventId": "star-rush-weekend",
--   "points": 120,
--   "claimedMilestones": ["milestone-1", "milestone-2"],
--   "premiumPurchased": false,
--   "lastUpdated": "2024-05-16T12:00:00.000Z"
-- }
