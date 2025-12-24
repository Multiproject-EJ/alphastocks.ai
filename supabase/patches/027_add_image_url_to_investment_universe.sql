-- Add image_url column to investment_universe table
-- Run with: psql $DATABASE_URL -f supabase/patches/027_add_image_url_to_investment_universe.sql

BEGIN;

ALTER TABLE investment_universe 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN investment_universe.image_url 
IS 'URL to company logo or stock image for visual display in stock cards';

COMMIT;
