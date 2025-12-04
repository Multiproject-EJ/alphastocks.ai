-- Add last_auto_run_at to track the most recent cron execution time for ValueBot auto-queue.
ALTER TABLE valuebot_settings
ADD COLUMN last_auto_run_at timestamptz NULL;

COMMENT ON COLUMN valuebot_settings.last_auto_run_at IS 'Timestamp recorded by the ValueBot cron worker after each auto-run.';
