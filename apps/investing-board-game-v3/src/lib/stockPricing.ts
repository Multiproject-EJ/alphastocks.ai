const SCORE_RANGE = {
  min: 1,
  max: 10,
}

const PRICE_RANGE = {
  min: 12,
  max: 260,
}

const FALLBACK_RANGE = {
  min: 18,
  max: 180,
}

type StockPriceInput = {
  ticker: string
  compositeScore?: number | null
  seedIndex?: number
}

type StockUniversePriceInput = StockPriceInput & {
  marketPrice?: number | string | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t
}

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function mulberry32(seed: number): () => number {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100
}

function normalizeMarketPrice(value: number | string | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return roundToCents(value)
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return roundToCents(parsed)
    }
  }

  return null
}

export function resolveStockPrice({ ticker, compositeScore, seedIndex = 0 }: StockPriceInput): number {
  const symbol = ticker?.trim().toUpperCase() || 'UNIVERSE'
  const seed = hashString(`${symbol}-${seedIndex}`)
  const random = mulberry32(seed)()

  if (typeof compositeScore === 'number' && Number.isFinite(compositeScore)) {
    const normalizedScore = clamp(compositeScore, SCORE_RANGE.min, SCORE_RANGE.max)
    const base = lerp(PRICE_RANGE.min, PRICE_RANGE.max, (normalizedScore - SCORE_RANGE.min) / (SCORE_RANGE.max - SCORE_RANGE.min))
    const jitter = lerp(-8, 8, random)
    return roundToCents(clamp(base + jitter, PRICE_RANGE.min, PRICE_RANGE.max))
  }

  const fallback = lerp(FALLBACK_RANGE.min, FALLBACK_RANGE.max, random)
  return roundToCents(clamp(fallback, FALLBACK_RANGE.min, FALLBACK_RANGE.max))
}

export function resolveUniversePrice({
  ticker,
  compositeScore,
  seedIndex = 0,
  marketPrice,
}: StockUniversePriceInput): number {
  const normalizedMarketPrice = normalizeMarketPrice(marketPrice)
  if (normalizedMarketPrice !== null) {
    return normalizedMarketPrice
  }

  return resolveStockPrice({ ticker, compositeScore, seedIndex })
}
