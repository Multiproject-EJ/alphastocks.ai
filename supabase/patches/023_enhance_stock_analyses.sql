-- Enhance stock_analyses table with additional fields for mobile reports
BEGIN;

-- Add new columns to stock_analyses table
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS data_freshness VARCHAR(20) DEFAULT 'fresh';
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS verdict_rating INTEGER CHECK (verdict_rating >= 0 AND verdict_rating <= 100);
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS conviction_level VARCHAR(20) CHECK (conviction_level IN ('high', 'medium', 'low'));
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS upside_potential NUMERIC(5,2);
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS key_strengths JSONB DEFAULT '[]';
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS key_weaknesses JSONB DEFAULT '[]';
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS catalysts JSONB DEFAULT '[]';
ALTER TABLE stock_analyses ADD COLUMN IF NOT EXISTS red_flags JSONB DEFAULT '[]';

-- Add index for freshness queries
CREATE INDEX IF NOT EXISTS idx_stock_analyses_freshness ON stock_analyses(data_freshness, analyzed_at DESC);

-- Add index for rating queries
CREATE INDEX IF NOT EXISTS idx_stock_analyses_rating ON stock_analyses(verdict_rating DESC);

-- Comment on new columns
COMMENT ON COLUMN stock_analyses.analyzed_at IS 'Timestamp when analysis was performed';
COMMENT ON COLUMN stock_analyses.data_freshness IS 'Data age indicator: fresh (<7 days), stale (7-30 days), outdated (>30 days)';
COMMENT ON COLUMN stock_analyses.verdict_rating IS 'Overall investment rating score 0-100';
COMMENT ON COLUMN stock_analyses.conviction_level IS 'Confidence in the analysis: high, medium, low';
COMMENT ON COLUMN stock_analyses.upside_potential IS 'Expected upside percentage from current price to target';
COMMENT ON COLUMN stock_analyses.key_strengths IS 'Array of key competitive strengths (3-5 bullets)';
COMMENT ON COLUMN stock_analyses.key_weaknesses IS 'Array of key weaknesses or concerns (3-5 bullets)';
COMMENT ON COLUMN stock_analyses.catalysts IS 'Array of upcoming catalysts or triggers';
COMMENT ON COLUMN stock_analyses.red_flags IS 'Array of warning signs to monitor';

COMMIT;
