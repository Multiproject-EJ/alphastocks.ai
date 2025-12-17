-- Add Challenges System: Add challenges column to board_game_profiles
-- Run with: psql $DATABASE_URL -f supabase/patches/025_challenges_system.sql
BEGIN;

-- Add challenges column to board_game_profiles
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS challenges jsonb DEFAULT '{"daily": [], "weekly": [], "completedToday": 0, "completedThisWeek": 0, "lastDailyReset": null, "lastWeeklyReset": null}'::jsonb;

-- Optional: Create event_participation table for analytics
CREATE TABLE IF NOT EXISTS public.event_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  participated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_event_participation_user ON public.event_participation(user_id);

-- Create index for event_id lookups
CREATE INDEX IF NOT EXISTS idx_event_participation_event ON public.event_participation(event_id);

-- Enable Row Level Security
ALTER TABLE public.event_participation ENABLE ROW LEVEL SECURITY;

-- Users can only read their own event participation
CREATE POLICY "Users can read their own event participation"
  ON public.event_participation
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own event participation
CREATE POLICY "Users can insert their own event participation"
  ON public.event_participation
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMIT;
