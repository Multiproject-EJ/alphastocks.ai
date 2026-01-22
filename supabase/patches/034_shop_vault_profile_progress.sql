-- Shop Vault 2.0: player-level progress for vault XP + levels
-- Run with: psql $DATABASE_URL -f supabase/patches/034_shop_vault_profile_progress.sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.shop_vault_profile_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_profile_progress_profile
  ON public.shop_vault_profile_progress(profile_id);

CREATE OR REPLACE FUNCTION update_shop_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shop_vault_profile_progress_updated_at
  ON public.shop_vault_profile_progress;
CREATE TRIGGER trigger_update_shop_vault_profile_progress_updated_at
  BEFORE UPDATE ON public.shop_vault_profile_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

ALTER TABLE public.shop_vault_profile_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault profile progress"
  ON public.shop_vault_profile_progress FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own vault profile progress"
  ON public.shop_vault_profile_progress FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own vault profile progress"
  ON public.shop_vault_profile_progress FOR UPDATE
  USING (profile_id = auth.uid());

COMMENT ON TABLE public.shop_vault_profile_progress IS
  'Tracks per-player Shop 2.0 vault level and XP progress.';

COMMIT;
