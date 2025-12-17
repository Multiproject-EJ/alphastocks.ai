-- Progression System: Add XP, Season Pass, Leaderboards, and Achievements
-- Run with: psql $DATABASE_URL -f supabase/patches/024_progression_system.sql
BEGIN;

-- ===== UPDATE BOARD_GAME_PROFILES TABLE =====
-- Add progression fields to existing board_game_profiles table

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS season_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_season_tier INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_premium_pass BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_season_tiers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{"unlocked": [], "progress": {}}'::jsonb,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
  "totalRolls": 0,
  "stocksPurchased": 0,
  "uniqueStocks": 0,
  "quizzesCompleted": 0,
  "perfectQuizzes": 0,
  "scratchcardsPlayed": 0,
  "scratchcardsWon": 0,
  "scratchcardWinStreak": 0,
  "tilesVisited": [],
  "consecutiveDays": 0,
  "lastLoginDate": null,
  "totalStarsEarned": 0,
  "roll6Streak": 0
}'::jsonb;

-- ===== CREATE LEADERBOARD TABLE =====
-- Global leaderboard tracking all-time stats

CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  net_worth BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  season_tier INTEGER DEFAULT 0,
  total_stars_earned BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_net_worth ON public.leaderboard(net_worth DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON public.leaderboard(level DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_season_tier ON public.leaderboard(season_tier DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_stars ON public.leaderboard(total_stars_earned DESC);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read leaderboards
CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

-- Users can update their own entry
CREATE POLICY "Users update own leaderboard entry"
  ON public.leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own entry
CREATE POLICY "Users insert own leaderboard entry"
  ON public.leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entry
CREATE POLICY "Users delete own leaderboard entry"
  ON public.leaderboard FOR DELETE
  USING (auth.uid() = user_id);

-- ===== CREATE WEEKLY LEADERBOARD TABLE =====
-- Weekly leaderboard (resets every Monday)

CREATE TABLE IF NOT EXISTS public.weekly_leaderboard (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  stars_earned_this_week BIGINT DEFAULT 0,
  week_start_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_weekly_lb_stars ON public.weekly_leaderboard(stars_earned_this_week DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_lb_week ON public.weekly_leaderboard(week_start_date);

-- Enable Row Level Security
ALTER TABLE public.weekly_leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read weekly leaderboard
CREATE POLICY "Anyone can view weekly leaderboard"
  ON public.weekly_leaderboard FOR SELECT
  USING (true);

-- Users can update their own entry
CREATE POLICY "Users update own weekly leaderboard entry"
  ON public.weekly_leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own entry
CREATE POLICY "Users insert own weekly leaderboard entry"
  ON public.weekly_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entry
CREATE POLICY "Users delete own weekly leaderboard entry"
  ON public.weekly_leaderboard FOR DELETE
  USING (auth.uid() = user_id);

-- ===== CREATE FUNCTION TO AUTO-UPDATE LEADERBOARD =====
-- Function to sync board game profile changes to leaderboard
CREATE OR REPLACE FUNCTION sync_to_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  player_username TEXT;
BEGIN
  -- Get username from auth.users or use email
  SELECT COALESCE(
    raw_user_meta_data->>'username',
    raw_user_meta_data->>'full_name',
    email
  ) INTO player_username
  FROM auth.users
  WHERE id = NEW.profile_id;

  -- Upsert to leaderboard
  INSERT INTO public.leaderboard (
    user_id,
    username,
    net_worth,
    level,
    season_tier,
    total_stars_earned,
    updated_at
  ) VALUES (
    NEW.profile_id,
    COALESCE(player_username, 'Player'),
    NEW.net_worth,
    NEW.level,
    NEW.current_season_tier,
    COALESCE((NEW.stats->>'totalStarsEarned')::BIGINT, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = COALESCE(player_username, 'Player'),
    net_worth = NEW.net_worth,
    level = NEW.level,
    season_tier = NEW.current_season_tier,
    total_stars_earned = COALESCE((NEW.stats->>'totalStarsEarned')::BIGINT, 0),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync leaderboard
DROP TRIGGER IF EXISTS trigger_sync_to_leaderboard ON board_game_profiles;
CREATE TRIGGER trigger_sync_to_leaderboard
  AFTER INSERT OR UPDATE ON board_game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_leaderboard();

-- ===== HELPER FUNCTIONS =====

-- Function to reset weekly leaderboard (call this via cron job every Monday)
CREATE OR REPLACE FUNCTION reset_weekly_leaderboard()
RETURNS void AS $$
BEGIN
  DELETE FROM public.weekly_leaderboard
  WHERE week_start_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get player rank in global leaderboard
CREATE OR REPLACE FUNCTION get_player_rank(player_id UUID, rank_type TEXT DEFAULT 'net_worth')
RETURNS INTEGER AS $$
DECLARE
  player_rank INTEGER;
BEGIN
  IF rank_type = 'level' THEN
    SELECT COUNT(*) + 1 INTO player_rank
    FROM public.leaderboard
    WHERE level > (SELECT level FROM public.leaderboard WHERE user_id = player_id);
  ELSIF rank_type = 'season_tier' THEN
    SELECT COUNT(*) + 1 INTO player_rank
    FROM public.leaderboard
    WHERE season_tier > (SELECT season_tier FROM public.leaderboard WHERE user_id = player_id);
  ELSIF rank_type = 'stars' THEN
    SELECT COUNT(*) + 1 INTO player_rank
    FROM public.leaderboard
    WHERE total_stars_earned > (SELECT total_stars_earned FROM public.leaderboard WHERE user_id = player_id);
  ELSE
    SELECT COUNT(*) + 1 INTO player_rank
    FROM public.leaderboard
    WHERE net_worth > (SELECT net_worth FROM public.leaderboard WHERE user_id = player_id);
  END IF;
  
  RETURN COALESCE(player_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
