import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'
import { getRandomStock } from '@/lib/mockData'
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
  addon_flags: any | null
  last_addon_run_at: string | null
  created_at: string | null
}

const CATEGORY_ORDER: TileCategory[] = ['turnarounds', 'dividends', 'growth', 'moats', 'value']

function deriveCategory(symbol: string, index: number): TileCategory {
  const normalizedSymbol = symbol?.trim() || 'UNIVERSE'
  const codePoints = Array.from(normalizedSymbol).map((char) => char.codePointAt(0) ?? 0)
  const total = codePoints.reduce((sum, value) => sum + value, index)
  return CATEGORY_ORDER[Math.abs(total) % CATEGORY_ORDER.length]
}

function normalizePrice(score?: number | null): number {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return Math.max(5, Math.round(score * 100))
  }
  return 100
}

function mapUniverseRowToStock(row: UniverseRow, index: number): Stock {
  return {
    name: row.name?.trim() || row.symbol,
    ticker: row.symbol,
    category: deriveCategory(row.symbol, index),
    price: normalizePrice(row.last_composite_score),
    description: row.addon_summary?.trim() || 'Saved from your investment universe.',
    risk_label: row.last_risk_label,
    quality_label: row.last_quality_label,
    timing_label: row.last_timing_label,
    ai_model: row.last_model,
    analyzed_at: row.last_deep_dive_at,
    addon_flags: row.addon_flags,
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
          created_at
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
