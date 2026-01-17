-- ===== LEADERBOARD UPGRADE =====
-- Adds ring progress and throne tracking to leaderboards
-- Run this migration after merging the PR
BEGIN;

-- Add new columns to leaderboard table
ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS current_ring INTEGER DEFAULT 1 CHECK (current_ring >= 1 AND current_ring <= 3),
ADD COLUMN IF NOT EXISTS throne_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_ring_reached INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for ring-based queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_ring ON public.leaderboard(current_ring DESC, net_worth DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_throne ON public.leaderboard(throne_count DESC);

-- Add new columns to weekly leaderboard
ALTER TABLE public.weekly_leaderboard 
ADD COLUMN IF NOT EXISTS current_ring INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rings_ascended_this_week INTEGER DEFAULT 0;

-- Create index for weekly ring progress
CREATE INDEX IF NOT EXISTS idx_weekly_lb_rings ON public.weekly_leaderboard(rings_ascended_this_week DESC);

-- Update the sync function to include new fields
CREATE OR REPLACE FUNCTION sync_to_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  player_username TEXT;
  player_avatar TEXT;
BEGIN
  -- Get username from profiles or auth.users
  SELECT COALESCE(p.username, u.raw_user_meta_data->>'full_name', u.email, 'Player')
  INTO player_username
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = NEW.profile_id;

  -- Get avatar URL
  SELECT COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url')
  INTO player_avatar
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = NEW.profile_id;

  -- Upsert to leaderboard
  INSERT INTO public.leaderboard (
    user_id, 
    username, 
    net_worth, 
    level, 
    season_tier, 
    total_stars_earned,
    current_ring,
    throne_count,
    highest_ring_reached,
    avatar_url,
    updated_at
  )
  VALUES (
    NEW.profile_id,
    player_username,
    NEW.net_worth,
    NEW.level,
    NEW.current_season_tier,
    COALESCE((NEW.stats->>'totalStarsEarned')::BIGINT, 0),
    COALESCE(NEW.current_ring, 1),
    COALESCE(NEW.throne_count, 0),
    GREATEST(COALESCE(NEW.current_ring, 1), COALESCE(NEW.highest_ring_reached, 1)),
    player_avatar,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    net_worth = EXCLUDED.net_worth,
    level = EXCLUDED.level,
    season_tier = EXCLUDED.season_tier,
    total_stars_earned = EXCLUDED.total_stars_earned,
    current_ring = EXCLUDED.current_ring,
    throne_count = EXCLUDED.throne_count,
    highest_ring_reached = GREATEST(leaderboard.highest_ring_reached, EXCLUDED.highest_ring_reached),
    avatar_url = COALESCE(EXCLUDED.avatar_url, leaderboard.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add columns to board_game_profiles if they don't exist
ALTER TABLE public.board_game_profiles
ADD COLUMN IF NOT EXISTS current_ring INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS throne_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_ring_reached INTEGER DEFAULT 1;

COMMENT ON COLUMN public.leaderboard.current_ring IS 'Current ring the player is on (1-3)';
COMMENT ON COLUMN public.leaderboard.throne_count IS 'Number of times player has reached the Wealth Throne';
COMMENT ON COLUMN public.leaderboard.highest_ring_reached IS 'Highest ring ever reached by player';
COMMENT ON COLUMN public.leaderboard.avatar_url IS 'Player avatar URL for display';

COMMIT;
