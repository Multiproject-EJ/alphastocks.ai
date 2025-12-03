-- 006_valuebot_queue_last_run.sql
-- Add last_run timestamp for batch worker bookkeeping

ALTER TABLE public.valuebot_analysis_queue
ADD COLUMN IF NOT EXISTS last_run timestamptz;
