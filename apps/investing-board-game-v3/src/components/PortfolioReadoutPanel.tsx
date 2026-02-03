import { useMemo } from 'react'
import { getStockCategoryLabel, getStockCategoryPalette } from '@/lib/stockCategories'
import { GameState, TileCategory } from '@/lib/types'

interface PortfolioReadoutPanelProps {
  gameState: GameState
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`
}

export function PortfolioReadoutPanel({ gameState }: PortfolioReadoutPanelProps) {
  const topHoldings = useMemo(() => {
    return [...gameState.holdings]
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3)
  }, [gameState.holdings])

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    gameState.holdings.forEach((holding) => {
      totals[holding.stock.category] =
        (totals[holding.stock.category] ?? 0) + holding.totalCost
    })
    return Object.entries(totals)
      .map(([category, value]) => ({
        category,
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [gameState.holdings])

  const portfolioValue = Math.max(gameState.portfolioValue, 0)
  const cashPercent = gameState.netWorth > 0 ? (gameState.cash / gameState.netWorth) * 100 : 0
  const stocksPercent =
    gameState.netWorth > 0 ? (gameState.portfolioValue / gameState.netWorth) * 100 : 0

  return (
    <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left shadow-xl backdrop-blur">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">Portfolio Readout</span>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">Net Worth</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(gameState.netWorth)}</p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            {gameState.holdings.length} Holdings
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/60">Cash</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(gameState.cash)}</p>
          <p className="text-[11px] text-white/50">{cashPercent.toFixed(1)}% of net worth</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/60">Portfolio Value</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(gameState.portfolioValue)}</p>
          <p className="text-[11px] text-white/50">{stocksPercent.toFixed(1)}% of net worth</p>
        </div>
      </div>

      {gameState.holdings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/5 p-3 text-sm text-white/70">
          Land on a category tile to start building your first position.
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Top Positions</p>
            <div className="space-y-2">
              {topHoldings.map((holding) => {
                const percent =
                  portfolioValue > 0 ? (holding.totalCost / portfolioValue) * 100 : 0
                return (
                  <div
                    key={holding.stock.ticker}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{holding.stock.ticker}</p>
                      <p className="text-[11px] text-white/60">{holding.stock.name}</p>
                    </div>
                    <div className="text-right text-xs text-white/70">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(holding.totalCost)}
                      </p>
                      <p>{percent.toFixed(1)}% • {holding.shares} shares</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Category Mix</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryTotals.map(({ category, value }) => {
                const percent = portfolioValue > 0 ? (value / portfolioValue) * 100 : 0
                return (
                  <div
                    key={category}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getStockCategoryPalette(category as TileCategory).chip}`}
                    />
                    <span>{getStockCategoryLabel(category as TileCategory) ?? category}</span>
                    <span className="text-white/50">{percent.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
