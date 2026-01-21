-- ===== LEADERBOARD SYNC SAFETY PATCH =====
-- Fix sync_to_leaderboard to avoid hard dependency on public.profiles
-- Run with: psql $DATABASE_URL -f supabase/patches/031_fix_leaderboard_profiles_reference.sql
BEGIN;

CREATE OR REPLACE FUNCTION sync_to_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  player_username TEXT;
  player_avatar TEXT;
  profiles_exists BOOLEAN;
BEGIN
  profiles_exists := to_regclass('public.profiles') IS NOT NULL;

  IF profiles_exists THEN
    SELECT
      COALESCE(p.username, u.raw_user_meta_data->>'full_name', u.email, 'Player'),
      COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url')
    INTO player_username, player_avatar
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE u.id = NEW.profile_id;
  ELSE
    SELECT
      COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Player'),
      u.raw_user_meta_data->>'avatar_url'
    INTO player_username, player_avatar
    FROM auth.users u
    WHERE u.id = NEW.profile_id;
  END IF;

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
    COALESCE(player_username, 'Player'),
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

COMMIT;
