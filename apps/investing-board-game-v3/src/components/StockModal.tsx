import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResponsiveDialogClass } from '@/hooks/useResponsiveDialogClass'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stock } from '@/lib/types'
import { 
  getScoreColor, 
  getScoreBgColor, 
  getRiskLabel,
  getRiskLabelColor,
  getQualityLabelColor,
  getTimingLabelColor,
  formatRelativeTime,
  getWarningFlags
} from '@/lib/stockScores'
import { Coins, TrendUp, ShieldCheck, Speedometer, Sparkle, Clock, CheckCircle, WarningCircle } from '@phosphor-icons/react'

interface StockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: Stock | null
  onBuy: (multiplier: number) => void
  cash: number
  showInsights?: boolean
}

export function StockModal({ open, onOpenChange, stock, onBuy, cash, showInsights = false }: StockModalProps) {
  const dialogClass = useResponsiveDialogClass('small')
  const [imageError, setImageError] = useState(false)
  
  if (!stock) return null

  const baseShares = 10
  const smallCost = stock.price * (baseShares * 0.5)
  const normalCost = stock.price * baseShares
  const highCost = stock.price * (baseShares * 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClass} bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)] flex flex-col max-h-[85vh] relative`}>
        <DialogHeader className="flex-shrink-0">
          {/* Hero Score - Top Right */}
          {stock.scores && (
            <div className="absolute top-4 right-4 flex flex-col items-center">
              <div className={`text-5xl font-bold font-mono ${getScoreColor(stock.scores.composite)}`}>
                {stock.scores.composite.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Overall
              </div>
              <div className="text-[10px] text-muted-foreground">
                / 10
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            {/* Image Placeholder */}
            <div className="relative w-16 h-16 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30 overflow-hidden flex-shrink-0">
              {stock.image_url && !imageError ? (
                <img 
                  src={stock.image_url} 
                  alt={stock.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  LOGO
                </div>
              )}
            </div>
            
            <div className="flex-1 pr-24">
              <Badge variant="outline" className="text-xs font-mono uppercase bg-accent/20 text-accent border-accent/50 mb-2">
                {stock.category}
              </Badge>
              {/* NEW: Label Badges in Header */}
              {stock.risk_label && (
                <Badge className={`text-xs px-2 py-1 border ml-2 ${getRiskLabelColor(stock.risk_label)}`}>
                  {stock.risk_label}
                </Badge>
              )}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-accent">{stock.name}</DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-2">
            {stock.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="py-4 space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-sm text-muted-foreground">Current Price:</div>
            <div className="text-2xl font-bold font-mono text-foreground">
              ${stock.price.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins size={16} className="text-accent" />
            Available Cash: <span className="font-mono text-foreground">${cash.toLocaleString()}</span>
          </div>

          {/* Universe Scores Section */}
          {stock.scores && (
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 space-y-3">
              <div className="text-sm font-semibold text-accent flex items-center gap-2 mb-3">
                📊 Stock Analysis Scores
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Quality Score */}
                <div className={`rounded-lg p-3 border ${getScoreBgColor(stock.scores.quality)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={16} className={getScoreColor(stock.scores.quality)} weight="bold" />
                    <div className="text-xs text-muted-foreground font-semibold">Quality</div>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(stock.scores.quality)}`}>
                    {stock.scores.quality.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Business Quality</div>
                </div>

                {/* Risk Score */}
                <div className={`rounded-lg p-3 border ${getScoreBgColor(stock.scores.risk, true)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendUp size={16} className={getScoreColor(stock.scores.risk, true)} weight="bold" />
                    <div className="text-xs text-muted-foreground font-semibold">Risk</div>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(stock.scores.risk, true)}`}>
                    {getRiskLabel(stock.scores.risk)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Risk Level ({stock.scores.risk.toFixed(1)})</div>
                </div>

                {/* Timing Score */}
                <div className={`rounded-lg p-3 border ${getScoreBgColor(stock.scores.timing)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Speedometer size={16} className={getScoreColor(stock.scores.timing)} weight="bold" />
                    <div className="text-xs text-muted-foreground font-semibold">Timing</div>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getScoreColor(stock.scores.timing)}`}>
                    {stock.scores.timing.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Market Timing</div>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Quality/Timing Label Badges */}
          {(stock.quality_label || stock.timing_label) && (
            <div className="flex flex-wrap gap-2">
              {stock.quality_label && (
                <Badge className={`text-xs px-3 py-1.5 border ${getQualityLabelColor(stock.quality_label)}`}>
                  ⭐ Quality: {stock.quality_label}
                </Badge>
              )}
              {stock.timing_label && (
                <Badge className={`text-xs px-3 py-1.5 border ${getTimingLabelColor(stock.timing_label)}`}>
                  ⏰ Timing: {stock.timing_label}
                </Badge>
              )}
            </div>
          )}

          {/* NEW: Warning Flags Section */}
          {stock.addon_flags && getWarningFlags(stock.addon_flags).length > 0 && (
            <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-orange-700 flex items-center gap-2 mb-2">
                <WarningCircle size={18} weight="fill" />
                Risk Warnings
              </div>
              <div className="space-y-2">
                {getWarningFlags(stock.addon_flags).map((warning, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${warning.color}`}
                  >
                    <span className="text-lg">{warning.icon}</span>
                    <span className="font-semibold">{warning.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW: Stock Intelligence Section */}
          {(stock.ai_model || stock.analyzed_at) && (
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-accent flex items-center gap-2">
                <Sparkle size={18} weight="fill" />
                Stock Intelligence
              </div>
              <div className="space-y-2 text-sm">
                {stock.ai_model && (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-accent" weight="fill" />
                    <span className="text-muted-foreground">AI Model:</span>
                    <span className="font-mono font-semibold text-foreground">{stock.ai_model}</span>
                  </div>
                )}
                {stock.analyzed_at && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-accent" weight="bold" />
                    <span className="text-muted-foreground">Analyzed:</span>
                    <span className="font-semibold text-foreground">{formatRelativeTime(stock.analyzed_at)}</span>
                  </div>
                )}
                {stock.analyzed_at && (
                  <div className="mt-2 pt-2 border-t border-accent/20">
                    <div className="flex items-center gap-2 text-xs">
                      {(() => {
                        const diffDays = Math.floor((Date.now() - new Date(stock.analyzed_at).getTime()) / (1000 * 60 * 60 * 24))
                        if (diffDays <= 1) {
                          return (
                            <>
                              <CheckCircle size={14} className="text-green-500" weight="fill" />
                              <span className="text-green-700 font-semibold">Fresh Analysis</span>
                            </>
                          )
                        } else if (diffDays <= 7) {
                          return (
                            <>
                              <CheckCircle size={14} className="text-yellow-500" weight="fill" />
                              <span className="text-yellow-700 font-semibold">Recent Analysis</span>
                            </>
                          )
                        } else {
                          return (
                            <>
                              <WarningCircle size={14} className="text-orange-500" weight="fill" />
                              <span className="text-orange-700 font-semibold">Older Analysis - Consider Updating</span>
                            </>
                          )
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showInsights && (
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-accent flex items-center gap-2">
                🔍 Stock Insights
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">P/E Ratio</div>
                  <div className="font-mono text-foreground">
                    {(Math.random() * 30 + 10).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Analyst Rating</div>
                  <div className="font-mono text-foreground">
                    {['Buy', 'Strong Buy', 'Hold'][Math.floor(Math.random() * 3)]}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Dividend Yield</div>
                  <div className="font-mono text-foreground">
                    {(Math.random() * 3).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Market Cap</div>
                  <div className="font-mono text-foreground">
                    ${(Math.random() * 100 + 10).toFixed(1)}B
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="space-y-2">
              <Button
                onClick={() => onBuy(0.5)}
                disabled={cash < smallCost}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                size="lg"
              >
                Buy Small
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {Math.floor(baseShares * 0.5)} shares
                <br />${smallCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onBuy(1)}
                disabled={cash < normalCost}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Buy Normal
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {baseShares} shares
                <br />${normalCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onBuy(2)}
                disabled={cash < highCost}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent"
                size="lg"
              >
                High Conviction
              </Button>
              <div className="text-xs text-center text-muted-foreground font-mono">
                {baseShares * 2} shares
                <br />${highCost.toLocaleString()}
              </div>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full mt-4"
          >
            Pass
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}