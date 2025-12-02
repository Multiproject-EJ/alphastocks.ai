-- Make ticker nullable to allow jobs keyed by company name and/or ticker
ALTER TABLE public.valuebot_analysis_queue
ALTER COLUMN ticker DROP NOT NULL;

COMMENT ON COLUMN public.valuebot_analysis_queue.ticker IS
  'Optional: jobs can be keyed by ticker and/or company_name.';
