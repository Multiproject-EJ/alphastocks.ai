import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { getRandomStock } from '@/lib/mockData'
import { resolveStockPrice } from '@/lib/stockPricing'
import { Stock, TileCategory } from '@/lib/types'

type UniverseRow = {
  id: string
  symbol: string
  name: string | null
  addon_summary: string | null
  last_composite_score: number | null
  last_risk_label: string | null
  last_quality_label: string | null
  last_timing_label: string | null
  last_model: string | null
  last_deep_dive_at: string | null
  addon_flags: Record<string, boolean> | null
  last_addon_run_at: string | null
  created_at: string | null
  image_url: string | null
}

const CATEGORY_ORDER: TileCategory[] = ['turnarounds', 'dividends', 'growth', 'moats', 'value']
const DEFAULT_SCORE = 5

function deriveCategory(symbol: string, index: number): TileCategory {
  const normalizedSymbol = symbol?.trim() || 'UNIVERSE'
  const codePoints = Array.from(normalizedSymbol).map((char) => char.codePointAt(0) ?? 0)
  const total = codePoints.reduce((sum, value) => sum + value, index)
  return CATEGORY_ORDER[Math.abs(total) % CATEGORY_ORDER.length]
}

function normalizePrice(ticker: string, score?: number | null, seedIndex?: number): number {
  return resolveStockPrice({ ticker, compositeScore: score, seedIndex })
}

/**
 * Derive numeric scores (0-10) from label strings
 * Matches the logic from api-lib/valuebot/addons/parsers.js
 */
function deriveScoresFromLabels(
  riskLabel: string | null | undefined,
  qualityLabel: string | null | undefined,
  timingLabel: string | null | undefined,
  compositeScore: number | null | undefined
): { composite: number; quality: number; risk: number; timing: number } | undefined {
  const scores: Partial<{ composite: number; quality: number; risk: number; timing: number }> = {}

  // Risk: Low = 8, Medium = 5.5, High = 3
  if (riskLabel) {
    const lower = riskLabel.toLowerCase()
    if (lower.includes('low')) scores.risk = 8
    else if (lower.includes('medium') || lower.includes('med')) scores.risk = 5.5
    else if (lower.includes('high')) scores.risk = 3
  }

  // Quality: World Class = 9.5, Excellent = 8.5, Very Strong = 7.5, etc.
  if (qualityLabel) {
    const lower = qualityLabel.toLowerCase()
    if (lower.includes('world')) scores.quality = 9.5
    else if (lower.includes('excellent')) scores.quality = 8.5
    else if (lower.includes('very strong')) scores.quality = 7.5
    else if (lower.includes('strong')) scores.quality = 6.5
    else if (lower.includes('good')) scores.quality = 5.5
    else if (lower.includes('average')) scores.quality = 4.5
    else if (lower.includes('weak')) scores.quality = 3.5
    else if (lower.includes('poor')) scores.quality = 2.5
    else scores.quality = 1.5
  }

  // Timing: Buy = 8, Hold = 6, Wait = 4
  if (timingLabel) {
    const lower = timingLabel.toLowerCase()
    if (lower.includes('buy')) scores.timing = 8
    else if (lower.includes('hold')) scores.timing = 6
    else if (lower.includes('wait')) scores.timing = 4
    else scores.timing = 2
  }

  // Composite score from database (if available)
  if (typeof compositeScore === 'number' && !isNaN(compositeScore)) {
    scores.composite = compositeScore
  } else {
    // Calculate composite as average of available scores
    const values = [scores.risk, scores.quality, scores.timing].filter((v): v is number => v !== undefined)
    if (values.length > 0) {
      scores.composite = values.reduce((a, b) => a + b, 0) / values.length
    }
  }

  // Only return scores object if we have at least composite score
  if (scores.composite !== undefined) {
    return {
      composite: scores.composite || DEFAULT_SCORE,
      quality: scores.quality || DEFAULT_SCORE,
      risk: scores.risk || DEFAULT_SCORE,
      timing: scores.timing || DEFAULT_SCORE
    }
  }

  return undefined
}

function mapUniverseRowToStock(row: UniverseRow, index: number): Stock {
  return {
    name: row.name?.trim() || row.symbol,
    ticker: row.symbol,
    category: deriveCategory(row.symbol, index),
    price: normalizePrice(row.symbol, row.last_composite_score, index),
    description: row.addon_summary?.trim() || 'Saved from your investment universe.',
    risk_label: row.last_risk_label,
    quality_label: row.last_quality_label,
    timing_label: row.last_timing_label,
    ai_model: row.last_model,
    analyzed_at: row.last_deep_dive_at,
    addon_flags: row.addon_flags,
    image_url: row.image_url,
    scores: deriveScoresFromLabels(
      row.last_risk_label,
      row.last_quality_label,
      row.last_timing_label,
      row.last_composite_score
    ),
  }
}

function createEmptyBuckets(): Record<TileCategory, Stock[]> {
  return CATEGORY_ORDER.reduce(
    (acc, category) => ({
      ...acc,
      [category]: [],
    }),
    {} as Record<TileCategory, Stock[]>
  )
}

export function useUniverseStocks() {
  const [stocksByCategory, setStocksByCategory] = useState<Record<TileCategory, Stock[]>>(createEmptyBuckets())
  const [loading, setLoading] = useState<boolean>(hasSupabaseConfig)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'supabase' | 'mock'>(hasSupabaseConfig ? 'supabase' : 'mock')

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false)
      return
    }

    let isActive = true

    const fetchUniverse = async () => {
      setLoading(true)
      const { data, error: queryError } = await supabaseClient
        .from('investment_universe')
        .select(`
          id, 
          symbol, 
          name, 
          addon_summary,
          last_composite_score,
          last_risk_label,
          last_quality_label,
          last_timing_label,
          last_model,
          last_deep_dive_at,
          addon_flags,
          last_addon_run_at,
          created_at,
          image_url
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (!isActive) return

      if (queryError) {
        setError(queryError.message)
        setSource('mock')
        setLoading(false)
        return
      }

      const mappedStocks = (data ?? []).map((row, index) => mapUniverseRowToStock(row as UniverseRow, index))
      const buckets = createEmptyBuckets()

      for (const stock of mappedStocks) {
        buckets[stock.category].push(stock)
      }

      setStocksByCategory(buckets)
      setSource(mappedStocks.length > 0 ? 'supabase' : 'mock')
      setLoading(false)
    }

    fetchUniverse()

    return () => {
      isActive = false
    }
  }, [])

  const getStockForCategory = useCallback(
    (category: TileCategory): Stock => {
      const available = stocksByCategory[category]
      if (available?.length) {
        return available[Math.floor(Math.random() * available.length)]
      }
      return getRandomStock(category)
    },
    [stocksByCategory]
  )

  const universeCount = useMemo(
    () => Object.values(stocksByCategory).reduce((sum, stocks) => sum + stocks.length, 0),
    [stocksByCategory]
  )

  return {
    getStockForCategory,
    loading,
    error,
    source,
    universeCount,
  }
}
