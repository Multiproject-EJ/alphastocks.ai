-- Hand-tuned seed file that also bootstraps the core workspace schema so it works even when
-- the Supabase project is empty. Tables mirror the columns used by the demo fixtures.
BEGIN;

-- 1) Ensure the required tables exist -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY,
  "display_name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "role" text,
  "timezone" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "settings" (
  "profile_id" uuid PRIMARY KEY REFERENCES "profiles"("id") ON DELETE CASCADE,
  "ai_api_key_placeholder" text,
  "alert_channels" jsonb,
  "currency" text,
  "number_format" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "portfolios" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "strategy" text,
  "benchmark" text,
  "visibility" text DEFAULT 'private',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "portfolio_positions" (
  "id" uuid PRIMARY KEY,
  "portfolio_id" uuid REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "symbol" text NOT NULL,
  "qty" numeric,
  "avg_price" numeric,
  "sector" text,
  "status" text DEFAULT 'active',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "portfolio_snapshots" (
  "id" uuid PRIMARY KEY,
  "portfolio_id" uuid REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "as_of" timestamptz NOT NULL,
  "nav" numeric,
  "alpha" numeric,
  "beta" numeric,
  "cash" numeric,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "transactions" (
  "id" uuid PRIMARY KEY,
  "portfolio_id" uuid REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "executed_at" timestamptz,
  "type" text,
  "symbol" text,
  "price" numeric,
  "qty" numeric,
  "fees" numeric DEFAULT 0,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "date" timestamptz NOT NULL,
  "category" text,
  "source" text,
  "link" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "mood" text,
  "plan" text,
  "bias_notes" text,
  "confidence" integer
);

CREATE TABLE IF NOT EXISTS "stock_analyses" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "symbol" text NOT NULL,
  "label" text,
  "summary" text,
  "porter_forces" jsonb,
  "stress_tests" jsonb,
  "valuation" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "analysis_tasks" (
  "id" uuid PRIMARY KEY,
  "stock_analysis_id" uuid REFERENCES "stock_analyses"("id") ON DELETE CASCADE,
  "payload" jsonb,
  "status" text,
  "task_type" text,
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "watchlist_items" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "symbol" text NOT NULL,
  "thesis" text,
  "conviction" integer,
  "alerts" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- 2) Optional cleanup: clear tables before inserting fresh data
TRUNCATE TABLE "analysis_tasks" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "events" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "journal_entries" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "portfolio_positions" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "portfolio_snapshots" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "portfolios" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "profiles" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "settings" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "stock_analyses" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "transactions" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "watchlist_items" RESTART IDENTITY CASCADE;

-- Dataset analysis_tasks (4 rows) source: workspace/src/data/demo/demo.analysis_tasks.json
-- Background AI tasks that power the research workflow
INSERT INTO "analysis_tasks" ("completed_at", "id", "payload", "status", "stock_analysis_id", "task_type") VALUES ('2025-10-31T10:20:00Z', '12d8a1f6-2e5a-4a1f-8fc1-97b6ccfb2a10', '{"symbol":"NVDA","priority":"high","notes":"Updated discount rate to reflect latest treasury curve."}'::jsonb, 'completed', '8c1bd0f1-0f64-4ad3-8e9b-8f5b52b91201', 'valuation_refresh');
INSERT INTO "analysis_tasks" ("completed_at", "id", "payload", "status", "stock_analysis_id", "task_type") VALUES (NULL, 'b7a0b0c4-7df8-4d72-a545-e8bff9e139b2', '{"symbol":"TSLA","priority":"medium","window_hours":12}'::jsonb, 'running', '631070b9-a6fc-4ec1-9cc2-4b61f3635941', 'headline_digest');
INSERT INTO "analysis_tasks" ("completed_at", "id", "payload", "status", "stock_analysis_id", "task_type") VALUES (NULL, '0bbfda93-18c9-45d1-96b3-fc5ecddf2272', '{"symbol":"GLD","priority":"low","shock":"Real yields +75bps"}'::jsonb, 'queued', '7b7e86fd-44b7-4f70-b64b-df8b06c7d8de', 'stress_test');
INSERT INTO "analysis_tasks" ("completed_at", "id", "payload", "status", "stock_analysis_id", "task_type") VALUES ('2025-10-30T22:15:00Z', 'f1c65f45-6a0e-4e46-8d91-8a9655c71643', '{"symbol":"MSFT","priority":"medium","format":"pdf"}'::jsonb, 'completed', 'b4e0ec8b-04d5-49df-9f0e-9972f6d0af52', 'notebook_export');

-- Dataset events (9 rows) source: workspace/src/data/demo/demo.events.json
-- Upcoming calendar and notable catalysts for the dashboard
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Earnings', '2025-10-31T21:00:00Z', 'e31f6d01-f043-4597-bf86-6942520e5b01', 'https://investor.nvidia.com', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'Company', 'NVDA earnings call');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Macro', '2025-11-01T14:00:00Z', '1a57d4f2-4b04-4d8a-8dc2-7d0b2a32f302', 'https://www.ismworld.org', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'Economic Calendar', 'ISM manufacturing print');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Macro', '2025-11-01T18:00:00Z', 'f71a0d1c-5b8e-4ed6-9d1e-b2f2c5ec1b10', 'https://www.federalreserve.gov', NULL, 'Federal Reserve', 'FOMC rate decision');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Commodities', '2025-11-02T09:00:00Z', 'd0b7199c-76fc-4ad1-a5a5-29e624d961c8', 'https://www.energyintel.com', NULL, 'Energy Intelligence', 'OPEC+ supply briefing');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Macro', '2025-11-02T17:30:00Z', '964d4a70-0da9-4f9b-a2f9-8c7d94ad413d', 'https://www.federalreserve.gov', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'Federal Reserve', 'Fed chair remarks at policy forum');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Process', '2025-11-03T12:30:00Z', 'b447d5cf-62c5-4b48-b498-c3f60379c833', 'https://alphastocks.ai/workspace', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'AlphaStocks', 'Monthly portfolio attribution review');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Research', '2025-11-04T20:00:00Z', '50e326f2-16ae-44d1-bd2d-105ca31a616c', 'https://alphastocks.ai/workspace/tasks', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'Workspace Task', 'SHOP GMV dashboard refresh');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Macro', '2025-11-05T13:30:00Z', 'c3f83bc4-67e6-4d62-9b61-388d3c3d8880', 'https://www.bls.gov/cpi/', NULL, 'Bureau of Labor Statistics', 'US CPI release');
INSERT INTO "events" ("category", "date", "id", "link", "profile_id", "source", "title") VALUES ('Macro', '2025-10-30T13:00:00Z', 'd3eb1a2f-9904-4cf1-9f5b-857c3e0b1f5d', 'https://home.treasury.gov', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'Treasury', 'Treasury refunding announcement');

-- Dataset journal_entries (3 rows) source: workspace/src/data/demo/demo.journal_entries.json
-- Recent daily check-in reflections
INSERT INTO "journal_entries" ("bias_notes", "confidence", "created_at", "id", "mood", "plan", "profile_id") VALUES ('Watched for FOMO chasing breakout gaps; stayed patient on entries.', 4, '2025-10-31T11:45:00Z', '5cb2691a-9bb1-49a6-9af0-9981721268c1', 'Focused', 'Scale into semis only on pullbacks, keep macro overlay hedged.', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5');
INSERT INTO "journal_entries" ("bias_notes", "confidence", "created_at", "id", "mood", "plan", "profile_id") VALUES ('Letting losses linger too long on consumer names; tighten review cadence.', 3, '2025-10-30T11:35:00Z', '6af820a1-62bc-4f3f-bf5c-08aa55a644a8', 'Balanced', 'Run post-close scrub on underperformers and cut if thesis unchanged.', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5');
INSERT INTO "journal_entries" ("bias_notes", "confidence", "created_at", "id", "mood", "plan", "profile_id") VALUES ('Good discipline exiting laggards early; avoid overconfidence tomorrow.', 5, '2025-10-29T11:20:00Z', 'f428981e-b372-4940-88a9-1cd4fa8a945d', 'Optimistic', 'Review AI holdings and confirm catalysts align with thesis.', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5');

-- Dataset portfolio_positions (20 rows) source: workspace/src/data/demo/demo.portfolio_positions.json
-- Representative holdings for each demo portfolio
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (182.5, '0f9c8c25-1a27-4e5e-bdfd-73b2d36bb1c1', '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa', 1200, 'Technology', 'active', 'AAPL');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (336.1, '0caa58a5-45b7-4d05-856a-0f0d9db43d5a', '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa', 900, 'Technology', 'active', 'MSFT');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (1040.35, '1dbf7191-7e51-4f49-9cb7-3f6d611b795d', '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0', 650, 'Technology', 'active', 'NVDA');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (710.2, '96d78448-24f3-4ef4-889f-27b30fce25f9', '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0', 300, 'Technology', 'active', 'ASML');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (92.15, '30d38101-3f15-4ad4-9c0a-d7286213b563', '541b9584-6188-420e-aa91-164d3c86a1eb', 1000, 'Communication Services', 'active', 'ATVI');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (555.4, '4b6b0d9c-7b2e-4db3-92c1-505dfad0b8c6', '541b9584-6188-420e-aa91-164d3c86a1eb', 200, 'Technology', 'active', 'ADBE');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (162.25, 'a5b9d52e-d155-4010-9e18-9056f8dcb541', '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14', 500, 'Healthcare', 'active', 'JNJ');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (145.1, '2b7ff8b7-ef15-4f3b-bcfa-7f90b93a8d16', '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14', 600, 'Consumer Staples', 'active', 'PG');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (184.2, '784c3d4e-fd1a-4cc7-ad77-64db98ed0d44', 'ac91b4cb-3e58-4a4f-8413-33ad0396b079', 800, 'Commodities', 'active', 'GLD');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (96.05, '7891c4ef-0f43-489d-b88d-30ee93878941', 'ac91b4cb-3e58-4a4f-8413-33ad0396b079', 700, 'Fixed Income', 'active', 'TLT');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (11.2, 'fc6a5eb6-9fba-4518-bcfe-e7a0051d9ec6', 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0', 50, 'Derivatives', 'rolling', 'SPXW');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (17.6, 'f8bda12c-2fb2-4c6e-b42b-f025037bb7d1', 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0', 1000, 'Exchange Traded Funds', 'active', 'QYLD');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (190.4, '8a8a65b1-470c-4f41-8d15-2d6cb86a2d71', 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399', 400, 'Technology', 'active', 'XLK');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (91.8, '3a926b67-cbd7-4e7f-a85d-7a1a2e8d029d', 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399', 500, 'Energy', 'active', 'XLE');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (248.5, '64fbd729-ef10-4c77-a460-5313c2d7a4f7', 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52', 300, 'Consumer Discretionary', 'active', 'TSLA');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (22.4, 'fd12b1df-3814-48b9-b5f0-bd9eea4d6c99', 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52', 1200, 'Technology', 'active', 'PLTR');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (91.2, '9c9af5b4-e1b2-4d70-a227-5a859504a829', 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad', 1500, 'Fixed Income', 'active', 'BIL');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (100.4, 'd9e9d6b5-c564-4691-9fa2-e0c693440032', 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad', 1200, 'Fixed Income', 'active', 'SGOV');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (162.3, 'e3b9d8c3-76b9-4e0b-bd6d-3c0a6c5c6a3f', '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14', 350, 'Technology', 'active', 'SMH');
INSERT INTO "portfolio_positions" ("avg_price", "id", "portfolio_id", "qty", "sector", "status", "symbol") VALUES (130.6, 'cbb3a6b9-2a52-4da0-a4e2-9af49f2448f3', '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14', 400, 'Healthcare', 'active', 'IBB');

-- Dataset portfolio_snapshots (30 rows) source: workspace/src/data/demo/demo.portfolio_snapshots.json
-- Three-day performance snapshots for each demo portfolio
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.032, '2025-10-29T13:30:00Z', 1.18, 110000, '11111111-1111-1111-1111-111111111101', 1795000, '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.035, '2025-10-30T13:30:00Z', 1.19, 115000, '11111111-1111-1111-1111-111111111102', 1820000, '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.038, '2025-10-31T13:30:00Z', 1.2, 120000, '11111111-1111-1111-1111-111111111103', 1845000, '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.065, '2025-10-29T13:30:00Z', 1.1, 70000, '22222222-2222-2222-2222-222222222201', 1140000, '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.069, '2025-10-30T13:30:00Z', 1.1, 75000, '22222222-2222-2222-2222-222222222202', 1180000, '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.072, '2025-10-31T13:30:00Z', 1.1, 80000, '22222222-2222-2222-2222-222222222203', 1210000, '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.022, '2025-10-29T13:30:00Z', 0.9, 45000, '33333333-3333-3333-3333-333333333301', 630000, '541b9584-6188-420e-aa91-164d3c86a1eb');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.025, '2025-10-30T13:30:00Z', 0.9, 47000, '33333333-3333-3333-3333-333333333302', 640000, '541b9584-6188-420e-aa91-164d3c86a1eb');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.028, '2025-10-31T13:30:00Z', 0.9, 50000, '33333333-3333-3333-3333-333333333303', 650000, '541b9584-6188-420e-aa91-164d3c86a1eb');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.014, '2025-10-29T13:30:00Z', 0.75, 58000, '44444444-4444-4444-4444-444444444401', 520000, '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.016, '2025-10-30T13:30:00Z', 0.75, 59000, '44444444-4444-4444-4444-444444444402', 530000, '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.018, '2025-10-31T13:30:00Z', 0.75, 60000, '44444444-4444-4444-4444-444444444403', 540000, '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.036, '2025-10-29T13:30:00Z', 0.6, 180000, '55555555-5555-5555-5555-555555555501', 750000, 'ac91b4cb-3e58-4a4f-8413-33ad0396b079');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.039, '2025-10-30T13:30:00Z', 0.6, 190000, '55555555-5555-5555-5555-555555555502', 765000, 'ac91b4cb-3e58-4a4f-8413-33ad0396b079');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.042, '2025-10-31T13:30:00Z', 0.6, 200000, '55555555-5555-5555-5555-555555555503', 780000, 'ac91b4cb-3e58-4a4f-8413-33ad0396b079');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.012, '2025-10-29T13:30:00Z', 0.4, 85000, '66666666-6666-6666-6666-666666666601', 400000, 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.013, '2025-10-30T13:30:00Z', 0.4, 88000, '66666666-6666-6666-6666-666666666602', 405000, 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.015, '2025-10-31T13:30:00Z', 0.4, 90000, '66666666-6666-6666-6666-666666666603', 410000, 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.048, '2025-10-29T13:30:00Z', 1.05, 65000, '77777777-7777-7777-7777-777777777701', 890000, 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.052, '2025-10-30T13:30:00Z', 1.05, 68000, '77777777-7777-7777-7777-777777777702', 910000, 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.055, '2025-10-31T13:30:00Z', 1.05, 70000, '77777777-7777-7777-7777-777777777703', 930000, 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.054, '2025-10-29T13:30:00Z', 1.3, 60000, '88888888-8888-8888-8888-888888888801', 830000, 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.059, '2025-10-30T13:30:00Z', 1.3, 62000, '88888888-8888-8888-8888-888888888802', 850000, 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.063, '2025-10-31T13:30:00Z', 1.3, 65000, '88888888-8888-8888-8888-888888888803', 870000, 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.009, '2025-10-29T13:30:00Z', 0.2, 200000, '99999999-9999-9999-9999-999999999901', 330000, 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.011, '2025-10-30T13:30:00Z', 0.2, 205000, '99999999-9999-9999-9999-999999999902', 340000, 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.012, '2025-10-31T13:30:00Z', 0.2, 210000, '99999999-9999-9999-9999-999999999903', 350000, 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.041, '2025-10-29T13:30:00Z', 1.1, 50000, 'aaaaaaa0-aaaa-aaaa-aaaa-aaaaaaaaa001', 630000, '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.044, '2025-10-30T13:30:00Z', 1.1, 53000, 'aaaaaaa0-aaaa-aaaa-aaaa-aaaaaaaaa002', 645000, '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14');
INSERT INTO "portfolio_snapshots" ("alpha", "as_of", "beta", "cash", "id", "nav", "portfolio_id") VALUES (0.047, '2025-10-31T13:30:00Z', 1.1, 55000, 'aaaaaaa0-aaaa-aaaa-aaaa-aaaaaaaaa003', 660000, '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14');

-- Dataset portfolios (10 rows) source: workspace/src/data/demo/demo.portfolios.json
-- Ten demo portfolios mirroring the Supabase schema
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('SPY', '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa', 'Core Momentum', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'long/short momentum', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('QQQ', '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0', 'Growth Compounders', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'long-only growth', 'private');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('RSP', '541b9584-6188-420e-aa91-164d3c86a1eb', 'Event-Driven Plays', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'catalyst-driven equities', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('DVY', '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14', 'Dividend Yielders', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'quality income', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('VT', 'ac91b4cb-3e58-4a4f-8413-33ad0396b079', 'Global Macro Overlay', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'cross-asset relative value', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('HYG', 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0', 'Options Income', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'systematic premium harvesting', 'private');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('SPY', 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399', 'Quant Trend', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'multi-factor trend following', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('ARKK', 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52', 'Long/Short Innovation', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'disruptive tech pairs', 'team');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('BIL', 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad', 'Capital Preservation', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'treasury ladder', 'private');
INSERT INTO "portfolios" ("benchmark", "id", "name", "profile_id", "strategy", "visibility") VALUES ('IYW', '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14', 'Thematic Rotation', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'sector rotation', 'team');

-- Dataset profiles (1 rows) source: workspace/src/data/demo/demo.profiles.json
-- Primary workspace profile for demo mode
INSERT INTO "profiles" ("display_name", "email", "id", "role", "timezone") VALUES ('Avery Quant', 'avery@alphastocks.ai', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'portfolio_manager', 'America/New_York');

-- Dataset settings (1 rows) source: workspace/src/data/demo/demo.settings.json
-- Workspace-level settings for the demo profile
INSERT INTO "settings" ("ai_api_key_placeholder", "alert_channels", "currency", "number_format", "profile_id") VALUES ('sk-live-****', '{"email":true,"push":true,"sms":false}'::jsonb, 'USD', 'en-US', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5');

-- Dataset stock_analyses (4 rows) source: workspace/src/data/demo/demo.stock_analyses.json
-- AI-assisted research summaries for priority symbols
INSERT INTO "stock_analyses" ("id", "label", "porter_forces", "profile_id", "stress_tests", "summary", "symbol", "valuation") VALUES ('8c1bd0f1-0f64-4ad3-8e9b-8f5b52b91201', 'Investable', '{"supplier_power":"Medium — key foundries concentrated but long-term agreements in place.","buyer_power":"Low — hyperscalers scrambling for GPU capacity.","competitive_rivalry":"Rising — AMD catching up but still lagging in software moat.","threat_new":"Low — capex intensity and ecosystem lock-in deter entrants.","threat_substitutes":"Medium — custom ASICs for specific workloads remain a watchpoint."}'::jsonb, '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', '[{"scenario":"Cloud capex pause","delta":-0.18},{"scenario":"China export tightening","delta":-0.12}]'::jsonb, 'Remain overweight as demand visibility stays strong; trim only if supply normalises faster than expected.', 'NVDA', '{"base":980,"bull":1120,"bear":780}'::jsonb);
INSERT INTO "stock_analyses" ("id", "label", "porter_forces", "profile_id", "stress_tests", "summary", "symbol", "valuation") VALUES ('631070b9-a6fc-4ec1-9cc2-4b61f3635941', 'Monitor', '{"supplier_power":"Medium — battery raw materials concentrated but easing.","buyer_power":"Medium — EV incentives fading, price sensitivity rising.","competitive_rivalry":"High — legacy OEMs rolling out EV lineups aggressively.","threat_new":"Medium — new entrants in China remain disruptive.","threat_substitutes":"Medium — ride sharing and public transit adoption in focus metros."}'::jsonb, '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', '[{"scenario":"EV tax credit sunset","delta":-0.2},{"scenario":"FSD attach inflection","delta":0.15}]'::jsonb, 'Maintain tactical position; wait for margin stability confirmation before adding.', 'TSLA', '{"base":255,"bull":320,"bear":170}'::jsonb);
INSERT INTO "stock_analyses" ("id", "label", "porter_forces", "profile_id", "stress_tests", "summary", "symbol", "valuation") VALUES ('7b7e86fd-44b7-4f70-b64b-df8b06c7d8de', 'Hedge', '{"supplier_power":"Low — diversified global miners.","buyer_power":"Low — ETF flows driven by macro conditions.","competitive_rivalry":"Low — limited alternatives for monetary hedge.","threat_new":"Low","threat_substitutes":"Medium — digital assets remain a hedge competitor."}'::jsonb, '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', '[{"scenario":"Real yields +50bps","delta":-0.08},{"scenario":"DXY -5%","delta":0.06}]'::jsonb, 'Retain as macro hedge while inflation expectations stay anchored below 3%.', 'GLD', '{"base":198,"bull":210,"bear":170}'::jsonb);
INSERT INTO "stock_analyses" ("id", "label", "porter_forces", "profile_id", "stress_tests", "summary", "symbol", "valuation") VALUES ('b4e0ec8b-04d5-49df-9f0e-9972f6d0af52', 'Investable', '{"supplier_power":"Medium — chip supply steady but watch AI accelerators.","buyer_power":"Low — enterprise cloud demand sticky with high switching costs.","competitive_rivalry":"Medium — AWS and Google Cloud continue to invest heavily.","threat_new":"Low","threat_substitutes":"Medium — open-source AI stacks could erode Azure premium."}'::jsonb, '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', '[{"scenario":"Enterprise IT budget freeze","delta":-0.14},{"scenario":"Copilot upsell success","delta":0.1}]'::jsonb, 'Remain core holding; upside tied to AI monetisation pace and licence retention.', 'MSFT', '{"base":390,"bull":430,"bear":310}'::jsonb);

-- Dataset transactions (10 rows) source: workspace/src/data/demo/demo.transactions.json
-- Recent ledger activity for demo portfolios
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-31T14:05:00Z', 9.75, 'd0c0a6aa-2e1a-4f0a-8d63-e375f38b3a01', 'Added ahead of earnings beat, risk managed with call spread hedge.', '9d8c7f66-23d4-4cb5-8abd-b3ca7dd567e0', 1025.4, 150, 'NVDA', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-31T13:45:00Z', 6.1, 'c7f53af5-083e-41ed-888a-1e2aaf497fd2', 'Trimmed energy after relative strength fade versus momentum basket.', 'c3b0d4e0-9d84-4bc1-bb7f-3ea364ab5399', 93.4, 200, 'XLE', 'SELL');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-30T19:15:00Z', 4.8, 'c46fdc9d-272d-4a6a-90e3-5eb95cc5020a', 'Scaled into gold on real-yield compression signal.', 'ac91b4cb-3e58-4a4f-8413-33ad0396b079', 183.2, 200, 'GLD', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-30T14:10:00Z', 0, '1a62c5b6-7a9c-4ae8-a81c-73f01c5db9fd', 'Monthly distribution captured and reinvestment scheduled.', 'd73b705e-6af4-4286-8cc4-26ab9dd98ec0', 0.21, 1000, 'QYLD', 'DIV');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-30T13:50:00Z', 5.25, '7fbb643d-2f2e-4d4b-9012-7781e9f0a5fa', 'Rebuilt starter position after AI demand channel checks.', 'd7b82ad4-2e92-4708-83d3-b97c8fd83b52', 245.1, 50, 'TSLA', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-29T20:10:00Z', 4.2, 'fd36f5c4-2fd4-4d8d-b963-0c5b55bc7eea', 'Rotating into higher dividend growth exposure.', '1b8f7d64-10c4-4cc7-aa7f-6b2e4b5a5b14', 161.7, 100, 'JNJ', 'SELL');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-29T14:35:00Z', 7.1, '7a1ef0f1-6de8-4c88-8a54-0fd3d01d6e5a', 'Rebalanced into software momentum sleeve.', '4f1dc1c6-8882-4f3e-877d-7e2de3afc9aa', 333.9, 150, 'MSFT', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-29T14:20:00Z', 3.9, '94788c65-15cf-4c48-9a14-d401d49b2d65', 'Rotation into semis theme ahead of monthly rebalance.', '69f6b7a4-63bb-4b0d-9b7f-9d649f8d2b14', 159.5, 80, 'SMH', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-28T13:40:00Z', 0, '5a621682-6b63-4e2d-8773-50c8ff7c2778', 'Extended treasury ladder duration modestly.', 'ef25d2e6-0e2c-43c3-9fb4-3f28ad1c75ad', 100.3, 300, 'SGOV', 'BUY');
INSERT INTO "transactions" ("executed_at", "fees", "id", "notes", "portfolio_id", "price", "qty", "symbol", "type") VALUES ('2025-10-28T14:00:00Z', 5.4, 'bcad2e3f-d910-4d94-bc21-90f6215dfc99', 'Built tranche to capture post-earnings gap fill.', '541b9584-6188-420e-aa91-164d3c86a1eb', 545.2, 50, 'ADBE', 'BUY');

-- Dataset watchlist_items (6 rows) source: workspace/src/data/demo/demo.watchlist_items.json
-- Conviction-ranked watchlist linked to dashboard focus list
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"today","channel":"push","next_check":"2025-10-31T18:00:00Z"}'::jsonb, 5, '2f815a37-1f5a-4d57-9f4b-24134d5c4d50', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'NVDA', 'Data center GPU demand accelerating into holiday cloud budgets.');
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"upcoming","channel":"email","next_check":"2025-11-01T15:30:00Z"}'::jsonb, 4, 'b78f4c7d-565e-4f95-9d2c-92f8cf950a66', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'TSLA', 'Monitoring margin impact from full self-driving subscription uptake.');
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"pinned","channel":"dashboard"}'::jsonb, 3, '4a64a7f5-a94a-4d64-9fc1-07d922aa63c8', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'GLD', 'Real yields breaking lower keeps upside skew intact.');
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"upcoming","channel":"email","next_check":"2025-11-04T13:00:00Z"}'::jsonb, 3, 'a01c5a2f-8241-4a0f-8aa8-f0c1f33a61f1', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'SHOP', 'Evaluating cross-border GMV trends vs. consensus.');
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"pinned","channel":"dashboard"}'::jsonb, 4, 'f251e038-2c4f-4b8d-ae8d-1748033c2c27', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'MSFT', 'Azure AI workloads comp growth sustaining double digits.');
INSERT INTO "watchlist_items" ("alerts", "conviction", "id", "profile_id", "symbol", "thesis") VALUES ('{"urgency":"monitor","channel":"email"}'::jsonb, 2, '681a3dd0-8729-4b7c-96a3-5e4641153530', '1f2a7f2e-0ad1-4a7d-8a19-3b22e35c88a5', 'ENPH', 'Tracking inventory digestion across EU installers.');

COMMIT;

