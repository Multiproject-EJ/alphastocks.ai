ALTER TABLE public.investment_universe
ADD COLUMN IF NOT EXISTS last_model text;

COMMENT ON COLUMN public.investment_universe.last_model
  IS 'AI model used for the latest ValueBot Module 6 MASTER deep dive (e.g. gpt-4.1, gpt-4o-mini).';
