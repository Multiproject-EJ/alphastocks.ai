-- Shop Inventory and Cosmetics for Board Game V3
-- Add inventory, active effects, and equipped cosmetics to board_game_profiles
-- Run with: psql $DATABASE_URL -f supabase/patches/023_shop_inventory.sql

BEGIN;

-- Add inventory column for tracking owned items
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;

-- Add active effects column for tracking power-ups and upgrades
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS active_effects JSONB DEFAULT '[]'::jsonb;

-- Add equipped cosmetics columns
ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS equipped_theme TEXT DEFAULT 'default';

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS equipped_dice_skin TEXT DEFAULT 'default';

ALTER TABLE board_game_profiles 
ADD COLUMN IF NOT EXISTS equipped_trail TEXT;

-- Add comments for documentation
COMMENT ON COLUMN board_game_profiles.inventory IS 'Array of owned shop items with quantities and purchase dates';
COMMENT ON COLUMN board_game_profiles.active_effects IS 'Array of active power-ups and upgrades with expiration times';
COMMENT ON COLUMN board_game_profiles.equipped_theme IS 'Currently equipped board theme (default, dark, gold, cyber, forest)';
COMMENT ON COLUMN board_game_profiles.equipped_dice_skin IS 'Currently equipped dice skin (default, gold, neon, crystal)';
COMMENT ON COLUMN board_game_profiles.equipped_trail IS 'Currently equipped trail effect (sparkle, fire, null for none)';

COMMIT;
