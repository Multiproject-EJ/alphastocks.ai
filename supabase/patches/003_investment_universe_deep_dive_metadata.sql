ALTER TABLE public.investment_universe
  ADD COLUMN IF NOT EXISTS last_deep_dive_at   timestamptz,
  ADD COLUMN IF NOT EXISTS last_risk_label     text,
  ADD COLUMN IF NOT EXISTS last_quality_label  text,
  ADD COLUMN IF NOT EXISTS last_timing_label   text,
  ADD COLUMN IF NOT EXISTS last_composite_score numeric;
