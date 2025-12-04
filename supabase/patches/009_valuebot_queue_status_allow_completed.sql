-- 009_valuebot_queue_status_allow_completed.sql
-- Extend the queue status check constraint to allow 'completed' as a valid value.

ALTER TABLE public.valuebot_analysis_queue
  DROP CONSTRAINT IF EXISTS valuebot_analysis_queue_status_check;

ALTER TABLE public.valuebot_analysis_queue
  ADD CONSTRAINT valuebot_analysis_queue_status_check
  CHECK (status IN ('pending', 'running', 'completed', 'failed'));
