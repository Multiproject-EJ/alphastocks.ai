-- Currency Economy System: Exchange rates, shop items, mystery box tracking
-- Run with: psql $DATABASE_URL -f supabase/patches/029_currency_economy.sql
BEGIN;

-- ===== CURRENCY EXCHANGE HISTORY =====
CREATE TABLE IF NOT EXISTS public.currency_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL CHECK (from_currency IN ('cash', 'stars', 'coins')),
  to_currency TEXT NOT NULL CHECK (to_currency IN ('cash', 'stars', 'coins')),
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currency_exchanges_profile ON public.currency_exchanges(profile_id);
ALTER TABLE public.currency_exchanges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exchanges" ON public.currency_exchanges FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own exchanges" ON public.currency_exchanges FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ===== SHOP ITEMS CATALOG =====
CREATE TABLE IF NOT EXISTS public.shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('cosmetic', 'boost', 'convenience', 'premium', 'stock')),
  currency TEXT NOT NULL CHECK (currency IN ('cash', 'stars', 'coins')),
  price NUMERIC NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_consumable BOOLEAN DEFAULT false,
  icon TEXT,
  effect_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED: Coins Shop (Convenience)
INSERT INTO public.shop_items (id, name, description, category, currency, price, rarity, is_consumable, icon, effect_data) VALUES
  ('reroll_dice', 'Dice Reroll', 'Reroll your dice once', 'convenience', 'coins', 100, 'common', true, '🎲', '{"type": "reroll", "uses": 1}'),
  ('skip_event', 'Event Skip', 'Skip any unwanted event', 'convenience', 'coins', 150, 'common', true, '⏭️', '{"type": "skip_event", "uses": 1}'),
  ('peek_ahead', 'Peek Ahead', 'See the next 3 tiles', 'convenience', 'coins', 75, 'common', true, '👁️', '{"type": "peek", "tiles": 3}'),
  ('extra_roll', 'Extra Roll', 'Get +1 daily roll', 'convenience', 'coins', 200, 'uncommon', true, '➕', '{"type": "extra_roll", "amount": 1}'),
  ('double_stars_1h', 'Star Boost (1hr)', '2x stars for 1 hour', 'boost', 'coins', 300, 'uncommon', true, '⭐', '{"type": "multiplier", "currency": "stars", "multiplier": 2, "duration_minutes": 60}'),
  ('shield_1_turn', 'Shield', 'Protect from 1 negative event', 'convenience', 'coins', 250, 'uncommon', true, '🛡️', '{"type": "shield", "uses": 1}'),
  ('lucky_charm', 'Lucky Charm', '+10% better rewards for 30 min', 'boost', 'coins', 400, 'rare', true, '🍀', '{"type": "luck_boost", "bonus": 0.1, "duration_minutes": 30}'),
  ('teleport_token', 'Teleport Token', 'Move to any tile on current ring', 'convenience', 'coins', 500, 'rare', true, '🌀', '{"type": "teleport", "uses": 1}')
ON CONFLICT (id) DO NOTHING;

-- SEED: Stars Shop (Cosmetics)
INSERT INTO public.shop_items (id, name, description, category, currency, price, rarity, is_consumable, icon, effect_data) VALUES
  ('dice_skin_gold', 'Golden Dice', 'Luxurious gold dice skin', 'cosmetic', 'stars', 500, 'rare', false, '🎲', '{"type": "dice_skin", "skin_id": "gold"}'),
  ('dice_skin_diamond', 'Diamond Dice', 'Sparkling diamond dice', 'cosmetic', 'stars', 1000, 'epic', false, '💎', '{"type": "dice_skin", "skin_id": "diamond"}'),
  ('trail_sparkle', 'Sparkle Trail', 'Leave sparkles as you move', 'cosmetic', 'stars', 300, 'uncommon', false, '✨', '{"type": "trail", "trail_id": "sparkle"}'),
  ('trail_rainbow', 'Rainbow Trail', 'Colorful rainbow trail', 'cosmetic', 'stars', 600, 'rare', false, '🌈', '{"type": "trail", "trail_id": "rainbow"}'),
  ('theme_dark', 'Dark Theme', 'Sleek dark board theme', 'cosmetic', 'stars', 400, 'uncommon', false, '🌙', '{"type": "theme", "theme_id": "dark"}'),
  ('theme_neon', 'Neon Theme', 'Vibrant neon board theme', 'cosmetic', 'stars', 600, 'rare', false, '💜', '{"type": "theme", "theme_id": "neon"}'),
  ('avatar_frame_gold', 'Gold Frame', 'Gold avatar frame', 'cosmetic', 'stars', 800, 'rare', false, '🥇', '{"type": "avatar_frame", "frame_id": "gold"}'),
  ('avatar_frame_diamond', 'Diamond Frame', 'Diamond avatar frame', 'cosmetic', 'stars', 2000, 'legendary', false, '💎', '{"type": "avatar_frame", "frame_id": "diamond"}')
ON CONFLICT (id) DO NOTHING;

-- SEED: Cash Shop (Premium)
INSERT INTO public.shop_items (id, name, description, category, currency, price, rarity, is_consumable, icon, effect_data) VALUES
  ('premium_pass', 'Premium Season Pass', 'Unlock premium season rewards', 'premium', 'cash', 50000, 'legendary', false, '🎫', '{"type": "season_pass"}'),
  ('ring_skip', 'Ring Skip Ticket', 'Skip directly to Ring 2', 'premium', 'cash', 25000, 'epic', true, '⬆️', '{"type": "ring_skip", "target_ring": 2}'),
  ('stock_pack_starter', 'Starter Stock Pack', '3 random quality stocks', 'stock', 'cash', 10000, 'rare', true, '📦', '{"type": "stock_pack", "count": 3, "min_score": 6}'),
  ('vip_status_30d', 'VIP Status (30 days)', '+50% all rewards', 'premium', 'cash', 100000, 'legendary', true, '👑', '{"type": "vip", "duration_days": 30, "reward_bonus": 0.5}')
ON CONFLICT (id) DO NOTHING;

-- ===== MYSTERY BOX HISTORY =====
CREATE TABLE IF NOT EXISTS public.mystery_box_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  box_type TEXT NOT NULL DEFAULT 'standard',
  rarity_rolled TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_amount NUMERIC,
  reward_item_id TEXT REFERENCES public.shop_items(id),
  ring_multiplier INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mystery_box_profile ON public.mystery_box_history(profile_id);
ALTER TABLE public.mystery_box_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mystery boxes" ON public.mystery_box_history FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own mystery boxes" ON public.mystery_box_history FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ===== UPDATE BOARD_GAME_PROFILES =====
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS lifetime_cash_earned NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_stars_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_coins_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_xp_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mystery_boxes_opened INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS legendary_items_found INTEGER DEFAULT 0;

COMMIT;
