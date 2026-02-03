import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getStockCategoryLabel, getStockCategoryPalette } from '@/lib/stockCategories'
import { GameState, TileCategory } from '@/lib/types'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  onTradeHolding?: (holdingIndex: number, action: 'buy' | 'sell', shares: number) => void
}

export function PortfolioModal({
  open,
  onOpenChange,
  gameState,
  onTradeHolding,
}: PortfolioModalProps) {
  const [tradeShares, setTradeShares] = useState<Record<number, string>>({})

  // Calculate category allocation data for pie chart
  const categoryData = useMemo(() => {
    if (gameState.holdings.length === 0) return []
    
    const categoryTotals: Record<string, number> = {}
    
    gameState.holdings.forEach((holding) => {
      const category = holding.stock.category
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += holding.totalCost
    })
    
    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: getStockCategoryLabel(category as TileCategory) || category,
      value,
      color: getStockCategoryPalette(category as TileCategory).hex,
    }))
  }, [gameState.holdings])

  // Calculate asset allocation (Cash vs Stocks)
  const assetAllocationData = useMemo(() => {
    if (gameState.netWorth === 0) return []
    
    return [
      { name: 'Cash', value: gameState.cash, color: '#6366F1' },
      { name: 'Stocks', value: gameState.portfolioValue, color: '#22C55E' },
    ].filter(item => item.value > 0)
  }, [gameState.cash, gameState.portfolioValue, gameState.netWorth])

  // Calculate percentages for display
  const cashPercent = gameState.netWorth > 0 
    ? ((gameState.cash / gameState.netWorth) * 100).toFixed(1) 
    : '0'
  const stocksPercent = gameState.netWorth > 0 
    ? ((gameState.portfolioValue / gameState.netWorth) * 100).toFixed(1) 
    : '0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-accent/30 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)] max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">Portfolio / Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Cash</div>
              <div className="font-mono font-semibold text-foreground">
                ${gameState.cash.toLocaleString()} <span className="text-xs text-muted-foreground">({cashPercent}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
              <div className="font-mono font-semibold text-foreground">
                ${gameState.portfolioValue.toLocaleString()} <span className="text-xs text-muted-foreground">({stocksPercent}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Net Worth</div>
              <div className="font-mono font-semibold text-accent">
                ${gameState.netWorth.toLocaleString()}
              </div>
            </div>
          </div>

          <Separator />

          {/* Asset Allocation Chart */}
          {assetAllocationData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Asset Allocation</h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {assetAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category Allocation Chart */}
          {categoryData.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Holdings by Category</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Invested']}
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Holdings List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Holdings ({gameState.holdings.length})</h3>
            {gameState.holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                You don't own any stocks yet. Land on a category tile to buy stocks!
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {gameState.holdings.map((holding, idx) => (
                  <div 
                    key={idx} 
                    className="text-xs space-y-1 p-3 rounded bg-background/50 border border-border"
                    style={{
                      borderLeftColor: getStockCategoryPalette(holding.stock.category).hex,
                      borderLeftWidth: 3,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-foreground">
                          {holding.stock.ticker}
                        </div>
                        <div className="text-muted-foreground">
                          {holding.stock.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          {holding.shares} shares
                        </div>
                        <div className="text-muted-foreground">
                          ${holding.totalCost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="capitalize">{getStockCategoryLabel(holding.stock.category)}</span>
                      <span>@${holding.stock.price.toLocaleString()}/share</span>
                    </div>
                    {onTradeHolding && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                          value={tradeShares[idx] ?? '1'}
                          onChange={(event) =>
                            setTradeShares((prev) => ({ ...prev, [idx]: event.target.value }))
                          }
                          aria-label={`Shares to trade for ${holding.stock.ticker}`}
                        />
                        <button
                          type="button"
                          className="rounded bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground"
                          onClick={() => {
                            const shares = Math.max(1, Number(tradeShares[idx] ?? 1))
                            onTradeHolding(idx, 'buy', shares)
                          }}
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground"
                          onClick={() => {
                            const shares = Math.max(1, Number(tradeShares[idx] ?? 1))
                            onTradeHolding(idx, 'sell', shares)
                          }}
                        >
                          Sell
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
