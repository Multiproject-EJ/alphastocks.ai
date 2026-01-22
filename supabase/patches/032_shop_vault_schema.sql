-- Shop Vault 2.0 Schema: seasons, sets, items, and progress tracking
-- Run with: psql $DATABASE_URL -f supabase/patches/032_shop_vault_schema.sql
BEGIN;

-- ===== VAULT SEASONS =====
CREATE TABLE IF NOT EXISTS public.shop_vault_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_seasons_active ON public.shop_vault_seasons(is_active);

-- ===== VAULT SETS =====
CREATE TABLE IF NOT EXISTS public.shop_vault_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.shop_vault_seasons(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (season_id, code)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_sets_season ON public.shop_vault_sets(season_id);
CREATE INDEX IF NOT EXISTS idx_shop_vault_sets_active ON public.shop_vault_sets(is_active);

-- ===== VAULT ITEMS =====
CREATE TABLE IF NOT EXISTS public.shop_vault_items (
  id TEXT PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.shop_vault_sets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'cash' CHECK (currency IN ('cash', 'stars', 'coins')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_items_set ON public.shop_vault_items(set_id);
CREATE INDEX IF NOT EXISTS idx_shop_vault_items_active ON public.shop_vault_items(is_active);

-- ===== VAULT ITEM OWNERSHIP =====
CREATE TABLE IF NOT EXISTS public.shop_vault_item_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.shop_vault_items(id) ON DELETE CASCADE,
  source TEXT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_item_ownership_profile ON public.shop_vault_item_ownership(profile_id);

-- ===== VAULT SET PROGRESS =====
CREATE TABLE IF NOT EXISTS public.shop_vault_set_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES public.shop_vault_sets(id) ON DELETE CASCADE,
  items_unlocked INTEGER NOT NULL DEFAULT 0,
  items_required INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, set_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_set_progress_profile ON public.shop_vault_set_progress(profile_id);

-- ===== VAULT SEASON PROGRESS =====
CREATE TABLE IF NOT EXISTS public.shop_vault_season_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.shop_vault_seasons(id) ON DELETE CASCADE,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  sets_required INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_season_progress_profile ON public.shop_vault_season_progress(profile_id);

-- ===== UPDATED_AT TRIGGERS =====
CREATE OR REPLACE FUNCTION update_shop_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shop_vault_seasons_updated_at ON public.shop_vault_seasons;
CREATE TRIGGER trigger_update_shop_vault_seasons_updated_at
  BEFORE UPDATE ON public.shop_vault_seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

DROP TRIGGER IF EXISTS trigger_update_shop_vault_sets_updated_at ON public.shop_vault_sets;
CREATE TRIGGER trigger_update_shop_vault_sets_updated_at
  BEFORE UPDATE ON public.shop_vault_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

DROP TRIGGER IF EXISTS trigger_update_shop_vault_set_progress_updated_at ON public.shop_vault_set_progress;
CREATE TRIGGER trigger_update_shop_vault_set_progress_updated_at
  BEFORE UPDATE ON public.shop_vault_set_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

DROP TRIGGER IF EXISTS trigger_update_shop_vault_season_progress_updated_at ON public.shop_vault_season_progress;
CREATE TRIGGER trigger_update_shop_vault_season_progress_updated_at
  BEFORE UPDATE ON public.shop_vault_season_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

-- ===== RLS POLICIES =====
ALTER TABLE public.shop_vault_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop vault seasons are viewable" ON public.shop_vault_seasons
  FOR SELECT USING (true);

ALTER TABLE public.shop_vault_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop vault sets are viewable" ON public.shop_vault_sets
  FOR SELECT USING (true);

ALTER TABLE public.shop_vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop vault items are viewable" ON public.shop_vault_items
  FOR SELECT USING (true);

ALTER TABLE public.shop_vault_item_ownership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vault items" ON public.shop_vault_item_ownership
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own vault items" ON public.shop_vault_item_ownership
  FOR INSERT WITH CHECK (profile_id = auth.uid());

ALTER TABLE public.shop_vault_set_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vault set progress" ON public.shop_vault_set_progress
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own vault set progress" ON public.shop_vault_set_progress
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own vault set progress" ON public.shop_vault_set_progress
  FOR UPDATE USING (profile_id = auth.uid());

ALTER TABLE public.shop_vault_season_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vault season progress" ON public.shop_vault_season_progress
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own vault season progress" ON public.shop_vault_season_progress
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own vault season progress" ON public.shop_vault_season_progress
  FOR UPDATE USING (profile_id = auth.uid());

-- ===== COMMENTS =====
COMMENT ON TABLE public.shop_vault_seasons IS 'Shop 2.0 vault seasons (album timelines).';
COMMENT ON TABLE public.shop_vault_sets IS 'Shop 2.0 vault sets grouped under seasons.';
COMMENT ON TABLE public.shop_vault_items IS 'Shop 2.0 vault items within sets (collectibles).';
COMMENT ON TABLE public.shop_vault_item_ownership IS 'Tracks which vault items a player owns.';
COMMENT ON TABLE public.shop_vault_set_progress IS 'Per-player progress towards completing a vault set.';
COMMENT ON TABLE public.shop_vault_season_progress IS 'Per-player progress towards completing a vault season.';

COMMIT;
