import { useEffect } from 'react'
import { X, ChartLine, TrendUp, Newspaper, BookOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { GameState } from '@/lib/types'

interface ProToolsOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
}

export function ProToolsOverlay({ 
  open, 
  onOpenChange, 
  gameState
}: ProToolsOverlayProps) {
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const menuItems = [
    {
      title: 'Portfolio Analysis',
      description: 'Analyze your portfolio performance and risk metrics',
      icon: ChartLine,
      comingSoon: true,
    },
    {
      title: 'Market Insights',
      description: 'Access real-time market data and trends',
      icon: TrendUp,
      comingSoon: true,
    },
    {
      title: 'News & Updates',
      description: 'Stay informed with the latest financial news',
      icon: Newspaper,
      comingSoon: true,
    },
    {
      title: 'Learning Center',
      description: 'Educational resources and investment guides',
      icon: BookOpen,
      comingSoon: true,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-tools-title"
    >
      {/* Header with ProTools logo */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="flex-1">
          <h1 
            id="pro-tools-title" 
            className="text-4xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent tracking-tight"
          >
            ProTools
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced investment tools for serious traders
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label="Close Pro Tools"
          className="hover:bg-accent/20"
        >
          <X size={28} weight="bold" />
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Main Menu</h2>
            <p className="text-muted-foreground">
              Select a tool to get started with advanced investment features
            </p>
          </div>

          {/* Game State Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Cash</div>
              <div className="text-2xl font-bold text-foreground">${(gameState.cash / 1000).toFixed(1)}k</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Net Worth</div>
              <div className="text-2xl font-bold text-foreground">${(gameState.netWorth / 1000).toFixed(1)}k</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Portfolio</div>
              <div className="text-2xl font-bold text-foreground">${(gameState.portfolioValue / 1000).toFixed(1)}k</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Holdings</div>
              <div className="text-2xl font-bold text-foreground">{gameState.holdings.length}</div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.title}
                  className="group relative bg-card border-2 border-border hover:border-accent/50 rounded-xl p-6 text-left transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={item.comingSoon}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon size={28} className="text-accent" weight="bold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                        {item.title}
                        {item.comingSoon && (
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                            Coming Soon
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer info */}
          <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              ProTools is currently under development. Features will be added progressively to enhance your investment experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
