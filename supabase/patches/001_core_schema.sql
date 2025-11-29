-- Patch 0001: Core workspace schema
-- Minimal structure to support current UI features without loading full demo data.
BEGIN;

-- Profiles capture basic identity details for Supabase-authenticated users.
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY,
  "display_name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "role" text,
  "timezone" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Settings table used by workspace bootstrapping logic.
CREATE TABLE IF NOT EXISTS "settings" (
  "profile_id" uuid PRIMARY KEY REFERENCES "profiles"("id") ON DELETE CASCADE,
  "ai_api_key_placeholder" text,
  "alert_channels" jsonb,
  "currency" text,
  "number_format" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Portfolio container and related tables for dashboard metrics.
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

-- Events and journaling for dashboard timelines and reflection widgets.
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

-- Analysis queue and supporting stock analysis records.
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

-- Watchlists for dashboard focus selection.
CREATE TABLE IF NOT EXISTS "watchlist_items" (
  "id" uuid PRIMARY KEY,
  "profile_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "symbol" text NOT NULL,
  "thesis" text,
  "conviction" integer,
  "alerts" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

COMMIT;
