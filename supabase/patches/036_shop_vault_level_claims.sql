-- Shop Vault 2.0: add level-up claim tracking + level progression in purchase RPC
-- Run with: psql $DATABASE_URL -f supabase/patches/036_shop_vault_level_claims.sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.shop_vault_level_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, level)
);

CREATE INDEX IF NOT EXISTS idx_shop_vault_level_claims_profile
  ON public.shop_vault_level_claims(profile_id);

DROP TRIGGER IF EXISTS trigger_update_shop_vault_level_claims_updated_at
  ON public.shop_vault_level_claims;
CREATE TRIGGER trigger_update_shop_vault_level_claims_updated_at
  BEFORE UPDATE ON public.shop_vault_level_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_vault_updated_at();

ALTER TABLE public.shop_vault_level_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault level claims"
  ON public.shop_vault_level_claims FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own vault level claims"
  ON public.shop_vault_level_claims FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own vault level claims"
  ON public.shop_vault_level_claims FOR UPDATE
  USING (profile_id = auth.uid());

COMMENT ON TABLE public.shop_vault_level_claims IS
  'Tracks unclaimed and claimed Shop 2.0 vault level rewards per player.';

CREATE OR REPLACE FUNCTION public.shop_vault_purchase(p_item_id TEXT)
RETURNS TABLE (
  item_id TEXT,
  set_id UUID,
  season_id UUID,
  items_unlocked INTEGER,
  items_required INTEGER,
  sets_completed INTEGER,
  sets_required INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_set_id UUID;
  v_season_id UUID;
  v_item_price INTEGER;
  v_items_required INTEGER;
  v_items_unlocked INTEGER;
  v_sets_required INTEGER;
  v_sets_completed INTEGER;
  v_xp_gain INTEGER;
  v_current_level INTEGER;
  v_current_xp INTEGER;
  v_current_xp_to_next INTEGER;
  v_next_level INTEGER;
  v_next_xp INTEGER;
  v_next_xp_to_next INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT set_id, price
    INTO v_set_id, v_item_price
  FROM public.shop_vault_items
  WHERE id = p_item_id
    AND is_active = true;

  IF v_set_id IS NULL THEN
    RAISE EXCEPTION 'Invalid vault item';
  END IF;

  SELECT season_id
    INTO v_season_id
  FROM public.shop_vault_sets
  WHERE id = v_set_id;

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'Invalid vault set';
  END IF;

  v_xp_gain := GREATEST(25, CEIL(v_item_price * 0.05));

  INSERT INTO public.shop_vault_item_ownership (profile_id, item_id, source)
  VALUES (auth.uid(), p_item_id, 'shop2')
  ON CONFLICT (profile_id, item_id) DO NOTHING;

  SELECT level, xp, xp_to_next
    INTO v_current_level, v_current_xp, v_current_xp_to_next
  FROM public.shop_vault_profile_progress
  WHERE profile_id = auth.uid();

  v_current_level := COALESCE(v_current_level, 1);
  v_current_xp := COALESCE(v_current_xp, 0);
  v_current_xp_to_next := COALESCE(v_current_xp_to_next, 1000);

  v_next_level := v_current_level;
  v_next_xp := v_current_xp + v_xp_gain;
  v_next_xp_to_next := v_current_xp_to_next;

  WHILE v_next_xp >= v_next_xp_to_next LOOP
    v_next_xp := v_next_xp - v_next_xp_to_next;
    v_next_level := v_next_level + 1;
    v_next_xp_to_next := 1000 + (v_next_level - 1) * 250;

    INSERT INTO public.shop_vault_level_claims (profile_id, level)
    VALUES (auth.uid(), v_next_level)
    ON CONFLICT (profile_id, level) DO NOTHING;
  END LOOP;

  INSERT INTO public.shop_vault_profile_progress (profile_id, level, xp, xp_to_next)
  VALUES (auth.uid(), v_next_level, v_next_xp, v_next_xp_to_next)
  ON CONFLICT (profile_id) DO UPDATE
    SET level = EXCLUDED.level,
        xp = EXCLUDED.xp,
        xp_to_next = EXCLUDED.xp_to_next,
        updated_at = NOW();

  SELECT COUNT(*)
    INTO v_items_required
  FROM public.shop_vault_items
  WHERE set_id = v_set_id
    AND is_active = true;

  SELECT COUNT(*)
    INTO v_items_unlocked
  FROM public.shop_vault_item_ownership
  JOIN public.shop_vault_items
    ON public.shop_vault_items.id = public.shop_vault_item_ownership.item_id
  WHERE public.shop_vault_item_ownership.profile_id = auth.uid()
    AND public.shop_vault_items.set_id = v_set_id;

  INSERT INTO public.shop_vault_set_progress (
    profile_id,
    set_id,
    items_unlocked,
    items_required,
    completed_at
  )
  VALUES (
    auth.uid(),
    v_set_id,
    v_items_unlocked,
    v_items_required,
    CASE
      WHEN v_items_required > 0 AND v_items_unlocked >= v_items_required
        THEN NOW()
      ELSE NULL
    END
  )
  ON CONFLICT (profile_id, set_id) DO UPDATE
    SET items_unlocked = EXCLUDED.items_unlocked,
        items_required = EXCLUDED.items_required,
        completed_at = CASE
          WHEN EXCLUDED.items_required > 0 AND EXCLUDED.items_unlocked >= EXCLUDED.items_required
            THEN COALESCE(public.shop_vault_set_progress.completed_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW();

  SELECT COUNT(*)
    INTO v_sets_required
  FROM public.shop_vault_sets
  WHERE season_id = v_season_id
    AND is_active = true;

  SELECT COUNT(*)
    INTO v_sets_completed
  FROM public.shop_vault_set_progress
  WHERE profile_id = auth.uid()
    AND set_id IN (
      SELECT id
      FROM public.shop_vault_sets
      WHERE season_id = v_season_id
        AND is_active = true
    )
    AND completed_at IS NOT NULL;

  INSERT INTO public.shop_vault_season_progress (
    profile_id,
    season_id,
    sets_completed,
    sets_required,
    completed_at
  )
  VALUES (
    auth.uid(),
    v_season_id,
    v_sets_completed,
    v_sets_required,
    CASE
      WHEN v_sets_required > 0 AND v_sets_completed >= v_sets_required
        THEN NOW()
      ELSE NULL
    END
  )
  ON CONFLICT (profile_id, season_id) DO UPDATE
    SET sets_completed = EXCLUDED.sets_completed,
        sets_required = EXCLUDED.sets_required,
        completed_at = CASE
          WHEN EXCLUDED.sets_required > 0 AND EXCLUDED.sets_completed >= EXCLUDED.sets_required
            THEN COALESCE(public.shop_vault_season_progress.completed_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW();

  RETURN QUERY SELECT
    p_item_id,
    v_set_id,
    v_season_id,
    v_items_unlocked,
    v_items_required,
    v_sets_completed,
    v_sets_required;
END;
$$;

GRANT EXECUTE ON FUNCTION public.shop_vault_purchase(TEXT) TO authenticated;

COMMIT;
