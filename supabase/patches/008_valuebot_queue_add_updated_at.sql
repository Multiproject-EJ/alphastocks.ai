-- Add updated_at column to valuebot_analysis_queue

ALTER TABLE public.valuebot_analysis_queue
ADD COLUMN IF NOT EXISTS updated_at timestamptz NULL;

-- Optional: backfill any existing rows
UPDATE public.valuebot_analysis_queue
SET updated_at = NOW()
WHERE updated_at IS NULL;
