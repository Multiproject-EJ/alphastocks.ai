-- Board Game Portfolio View: Transform board game holdings into ProTools-compatible format
-- Run with: psql $DATABASE_URL -f supabase/patches/028_board_game_portfolio_view.sql
BEGIN;

-- Create a view that transforms board game holdings into portfolio-compatible format
CREATE OR REPLACE VIEW board_game_portfolio_summary AS
SELECT 
  bgp.profile_id,
  bgp.cash,
  bgp.portfolio_value,
  bgp.net_worth,
  bgp.holdings,
  -- Calculate category allocations
  (
    SELECT jsonb_object_agg(
      category,
      ROUND((category_value / NULLIF(bgp.portfolio_value, 0) * 100)::numeric, 1)
    )
    FROM (
      SELECT 
        (holding->'stock'->>'category') as category,
        SUM((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as category_value
      FROM jsonb_array_elements(bgp.holdings) as holding
      GROUP BY (holding->'stock'->>'category')
    ) category_stats
  ) as category_allocation,
  -- Count holdings
  jsonb_array_length(bgp.holdings) as holdings_count,
  bgp.created_at,
  bgp.updated_at
FROM board_game_profiles bgp;

-- Create a function to get detailed portfolio positions from board game holdings
CREATE OR REPLACE FUNCTION get_board_game_portfolio_positions(user_profile_id uuid)
RETURNS TABLE (
  symbol text,
  name text,
  category text,
  shares numeric,
  avg_price numeric,
  current_price numeric,
  total_cost numeric,
  current_value numeric,
  unrealized_gain_loss numeric,
  unrealized_gain_loss_pct numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (holding->'stock'->>'ticker')::text as symbol,
    (holding->'stock'->>'name')::text as name,
    (holding->'stock'->>'category')::text as category,
    (holding->>'shares')::numeric as shares,
    ((holding->>'totalCost')::numeric / NULLIF((holding->>'shares')::numeric, 0)) as avg_price,
    (holding->'stock'->>'price')::numeric as current_price,
    (holding->>'totalCost')::numeric as total_cost,
    ((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as current_value,
    (
      ((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) - 
      (holding->>'totalCost')::numeric
    ) as unrealized_gain_loss,
    (
      CASE 
        WHEN (holding->>'totalCost')::numeric > 0 THEN
          (
            (((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) - 
            (holding->>'totalCost')::numeric) / (holding->>'totalCost')::numeric
          ) * 100
        ELSE 0
      END
    ) as unrealized_gain_loss_pct
  FROM board_game_profiles bgp,
       jsonb_array_elements(bgp.holdings) as holding
  WHERE bgp.profile_id = user_profile_id
  ORDER BY current_value DESC;
END;
$$;

-- Create a function to get portfolio summary statistics
CREATE OR REPLACE FUNCTION get_board_game_portfolio_summary(user_profile_id uuid)
RETURNS TABLE (
  total_value numeric,
  cash_balance numeric,
  net_worth numeric,
  portfolio_value numeric,
  holdings_count integer,
  category_allocation jsonb,
  total_cost_basis numeric,
  total_unrealized_gain_loss numeric,
  total_unrealized_gain_loss_pct numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bgp.net_worth as total_value,
    bgp.cash as cash_balance,
    bgp.net_worth,
    bgp.portfolio_value,
    jsonb_array_length(bgp.holdings) as holdings_count,
    (
      SELECT jsonb_object_agg(
        category,
        ROUND((category_value / NULLIF(bgp.portfolio_value, 0) * 100)::numeric, 1)
      )
      FROM (
        SELECT 
          (holding->'stock'->>'category') as category,
          SUM((holding->>'shares')::numeric * (holding->'stock'->>'price')::numeric) as category_value
        FROM jsonb_array_elements(bgp.holdings) as holding
        GROUP BY (holding->'stock'->>'category')
      ) category_stats
    ) as category_allocation,
    (
      SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
      FROM jsonb_array_elements(bgp.holdings) as holding
    ) as total_cost_basis,
    (
      bgp.portfolio_value - (
        SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
        FROM jsonb_array_elements(bgp.holdings) as holding
      )
    ) as total_unrealized_gain_loss,
    (
      CASE 
        WHEN (
          SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
          FROM jsonb_array_elements(bgp.holdings) as holding
        ) > 0 THEN
          (
            (bgp.portfolio_value - (
              SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
              FROM jsonb_array_elements(bgp.holdings) as holding
            )) / (
              SELECT COALESCE(SUM((holding->>'totalCost')::numeric), 0)
              FROM jsonb_array_elements(bgp.holdings) as holding
            )
          ) * 100
        ELSE 0
      END
    ) as total_unrealized_gain_loss_pct
  FROM board_game_profiles bgp
  WHERE bgp.profile_id = user_profile_id;
END;
$$;

-- Grant execute permissions on the functions to authenticated users
GRANT EXECUTE ON FUNCTION get_board_game_portfolio_positions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_board_game_portfolio_summary(uuid) TO authenticated;

COMMIT;
