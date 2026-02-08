import { useMemo } from 'react'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'
import { CORE_STOCK_CATEGORIES } from '@/lib/stockCategories'
import { getRandomStock } from '@/lib/mockData'

type TickerItem = {
  symbol: string
  changePercent: number
}

function getChangePercent(lastPrice?: number | null, lastClosePrice?: number | null): number {
  if (!lastPrice || !lastClosePrice) return 0
  if (lastClosePrice === 0) return 0
  return ((lastPrice - lastClosePrice) / lastClosePrice) * 100
}

export function TickerTape() {
  const { universeStocks } = useUniverseStocks()

  const items = useMemo(() => {
    if (universeStocks.length > 0) {
      return universeStocks.map((stock) => ({
        symbol: stock.ticker,
        changePercent: getChangePercent(stock.lastPrice, stock.lastClosePrice),
      }))
    }

    return CORE_STOCK_CATEGORIES.map((category, index) => {
      const fallback = getRandomStock(category)
      const changeSeed = (fallback.ticker.length + index) % 10
      return {
        symbol: fallback.ticker,
        changePercent: changeSeed - 5,
      }
    })
  }, [universeStocks])

  const trimmedItems = items.slice(0, 40)
  const duration = Math.max(30, trimmedItems.length * 1.6)

  if (trimmedItems.length === 0) return null

  return (
    <div className="absolute left-0 right-0 top-0 h-[var(--safe-area-top-padding)] pointer-events-none overflow-hidden">
      <div className="flex h-full items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div
          className="ticker-track flex items-center gap-4 whitespace-nowrap px-3 text-[10px] font-semibold uppercase tracking-wide text-white/80"
          style={{ ['--ticker-duration' as string]: `${duration}s` }}
        >
          {trimmedItems.map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="ticker-item flex items-center gap-2">
              <span className="text-white/90">{item.symbol}</span>
              <span className={item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {item.changePercent >= 0 ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
          {trimmedItems.map((item, index) => (
            <div key={`${item.symbol}-repeat-${index}`} className="ticker-item flex items-center gap-2">
              <span className="text-white/90">{item.symbol}</span>
              <span className={item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {item.changePercent >= 0 ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
