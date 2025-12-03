-- Ensure the ValueBot analysis queue has metadata columns expected by the worker/UI

ALTER TABLE public.valuebot_analysis_queue
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_run timestamptz NULL,
  ADD COLUMN IF NOT EXISTS error text NULL;
