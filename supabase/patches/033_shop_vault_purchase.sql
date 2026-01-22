-- Shop Vault 2.0: atomic purchase function
-- Run with: psql $DATABASE_URL -f supabase/patches/033_shop_vault_purchase.sql
BEGIN;

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
  v_items_required INTEGER;
  v_items_unlocked INTEGER;
  v_sets_required INTEGER;
  v_sets_completed INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT set_id
    INTO v_set_id
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

  INSERT INTO public.shop_vault_item_ownership (profile_id, item_id, source)
  VALUES (auth.uid(), p_item_id, 'shop2')
  ON CONFLICT (profile_id, item_id) DO NOTHING;

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
