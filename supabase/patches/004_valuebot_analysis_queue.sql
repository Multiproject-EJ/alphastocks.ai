-- ValueBot Analysis Queue
-- Creates a queue table for background deep-dive processing.

create table if not exists public.valuebot_analysis_queue (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  ticker text not null,
  company_name text null,
  provider text not null default 'openai',
  model text null,
  timeframe text null,
  custom_question text null,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'skipped')),
  priority integer not null default 100,
  attempts integer not null default 0,
  last_error text null,
  scheduled_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  last_run_at timestamptz null,
  deep_dive_id uuid null,
  source text not null default 'manual_queue'
);

create index if not exists idx_valuebot_queue_status_priority on public.valuebot_analysis_queue (status, scheduled_at, priority, created_at);
create index if not exists idx_valuebot_queue_user_ticker on public.valuebot_analysis_queue (user_id, ticker);
