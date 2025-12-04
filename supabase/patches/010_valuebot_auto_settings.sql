-- ValueBot auto-queue settings (singleton row)
create table if not exists public.valuebot_settings (
  id uuid primary key default gen_random_uuid(),
  auto_queue_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Ensure exactly one row exists with a stable id we can upsert against.
-- We'll use a hard-coded UUID so the API can always upsert with the same id.
insert into public.valuebot_settings (id, auto_queue_enabled)
values ('00000000-0000-0000-0000-000000000001', true)
on conflict (id) do nothing;
