-- Stock Universe Builder Tables

BEGIN;

-- 1. Global Stock Exchanges (ISO 10383 MIC codes)
CREATE TABLE IF NOT EXISTS stock_exchanges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mic_code VARCHAR(10) UNIQUE NOT NULL,  -- Market Identifier Code
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    region VARCHAR(50),  -- Americas, Europe, Asia-Pacific, etc.
    is_priority BOOLEAN DEFAULT FALSE,  -- User can mark as priority
    is_active BOOLEAN DEFAULT TRUE,
    last_analyzed_at TIMESTAMPTZ,
    last_analyzed_letter VARCHAR(1) DEFAULT NULL,  -- A-Z progress
    total_stocks_found INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stocks Universe Table (the growing global list)
CREATE TABLE IF NOT EXISTS stocks_universe_builder (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    exchange_mic VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap_category VARCHAR(20),  -- large, mid, small, micro
    is_valuebot_analyzed BOOLEAN DEFAULT FALSE,
    valuebot_last_run TIMESTAMPTZ,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticker, exchange_mic)
);

-- 3. Universe Build Progress Tracker (singleton row)
CREATE TABLE IF NOT EXISTS universe_build_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    current_exchange_mic VARCHAR(10),
    current_letter VARCHAR(1) DEFAULT 'A',
    total_exchanges_completed INTEGER DEFAULT 0,
    total_stocks_cataloged INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'idle',  -- idle, running, paused, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stocks_builder_exchange ON stocks_universe_builder(exchange_mic);
CREATE INDEX IF NOT EXISTS idx_stocks_builder_ticker ON stocks_universe_builder(ticker);
CREATE INDEX IF NOT EXISTS idx_exchanges_priority ON stock_exchanges(is_priority DESC, country);
CREATE INDEX IF NOT EXISTS idx_stocks_builder_valuebot ON stocks_universe_builder(is_valuebot_analyzed);

-- Insert initial progress tracker row
INSERT INTO universe_build_progress (status) 
VALUES ('idle')
ON CONFLICT DO NOTHING;

COMMIT;
