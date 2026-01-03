import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useSound } from '@/hooks/useSound'
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
import { ArrowLeft, ArrowRight, Coins, TrendUp, ShieldCheck, Speedometer, Sparkle, Clock, CheckCircle, WarningCircle, LockKey } from '@phosphor-icons/react'

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
  const { play: playSound } = useSound()
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [protoolsHovered, setProtoolsHovered] = useState(false)
  const [protoolsActive, setProtoolsActive] = useState(false)
  const [mobileProtoolsOpen, setMobileProtoolsOpen] = useState(false)
  const dragXRef = useRef(0)
  const swipeStateRef = useRef({
    startX: 0,
    startY: 0,
    pointerId: -1,
    isSwiping: false,
    triggered: false,
  })

  const swipeThreshold = 130
  const maxSwipe = 240

  useEffect(() => {
    if (!open) {
      setDragX(0)
      setIsDragging(false)
      dragXRef.current = 0
      swipeStateRef.current = {
        startX: 0,
        startY: 0,
        pointerId: -1,
        isSwiping: false,
        triggered: false,
      }
    }
  }, [open])

  const handlePenPointerUp = (action: () => void) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'pen') return
    event.preventDefault()
    action()
  }

  const handleViewFullAnalysis = () => {
    const baseUrl = import.meta.env.PROD ? 'https://www.alphastocks.ai' : window.location.origin
    window.open(`${baseUrl}/?proTools=1&analysis=${stock.symbol}`, '_blank')
  }

  if (!stock) return null

  const baseShares = 10
  const smallCost = stock.price * (baseShares * 0.5)
  const normalCost = stock.price * baseShares
  const highCost = stock.price * (baseShares * 2)
  const canSwipeInvest = cash >= normalCost
  const shouldDimProtools = !(protoolsHovered || protoolsActive)

  const triggerSwipeAction = useCallback((direction: 'left' | 'right') => {
    if (swipeStateRef.current.triggered) return
    if (direction === 'right' && !canSwipeInvest) {
      onBuy(1)
      dragXRef.current = 0
      setDragX(0)
      swipeStateRef.current.isSwiping = false
      return
    }
    swipeStateRef.current.triggered = true
    setIsDragging(false)
    const exitX = direction === 'right' ? maxSwipe * 1.4 : -maxSwipe * 1.4
    dragXRef.current = exitX
    setDragX(exitX)
    if (direction === 'right') {
      playSound('cha-ching')
    } else {
      playSound('swipe-no')
    }
    window.setTimeout(() => {
      if (direction === 'right') {
        onBuy(1)
      } else {
        onOpenChange(false)
      }
      dragXRef.current = 0
      setDragX(0)
      swipeStateRef.current.triggered = false
      swipeStateRef.current.isSwiping = false
    }, 220)
  }, [canSwipeInvest, maxSwipe, onBuy, onOpenChange, playSound])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [data-swipe-ignore]')) {
      return
    }
    swipeStateRef.current.startX = event.clientX
    swipeStateRef.current.startY = event.clientY
    swipeStateRef.current.pointerId = event.pointerId
    swipeStateRef.current.isSwiping = false
    swipeStateRef.current.triggered = false
    setIsDragging(true)
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || swipeStateRef.current.pointerId !== event.pointerId) return
    const deltaX = event.clientX - swipeStateRef.current.startX
    const deltaY = event.clientY - swipeStateRef.current.startY
    if (!swipeStateRef.current.isSwiping) {
      if (Math.abs(deltaX) < 12 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return
      }
      swipeStateRef.current.isSwiping = true
    }
    event.preventDefault()
    const clamped = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    dragXRef.current = clamped
    setDragX(clamped)
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStateRef.current.pointerId !== event.pointerId) return
    try {
      ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    } catch {
      // Ignore release errors for browsers that do not support capture
    }
    setIsDragging(false)
    const shouldTrigger = Math.abs(dragXRef.current) >= swipeThreshold
    if (shouldTrigger) {
      triggerSwipeAction(dragXRef.current > 0 ? 'right' : 'left')
      return
    }
    dragXRef.current = 0
    setDragX(0)
    swipeStateRef.current.isSwiping = false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`${dialogClass} md:w-[1000px] md:max-w-[1000px] bg-transparent border-0 shadow-none p-0 max-h-[calc(100dvh-2rem)] will-change-transform`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div 
          className="relative flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4"
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX / 22}deg)`,
            transition: isDragging ? 'none' : 'transform 220ms ease',
            touchAction: 'pan-y',
          }}
        >
          <div className="bg-card border-2 border-accent/50 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)] rounded-xl p-6 flex flex-col max-h-[calc(100dvh-2rem)] relative">
            <DialogHeader className="flex-shrink-0">
              {/* Hero Score - Top Right */}
              {stock.scores && (
                <div className="absolute top-4 right-12 flex flex-col items-center">
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

              <div className="md:hidden">
                <Button
                  className="w-full bg-blue-500/90 text-white hover:bg-blue-500"
                  onClick={() => setMobileProtoolsOpen((prev) => !prev)}
                  aria-expanded={mobileProtoolsOpen}
                  aria-controls="protools-insight-panel"
                >
                  Protools - Stock Insight
                </Button>
                {mobileProtoolsOpen && (
                  <div
                    id="protools-insight-panel"
                    className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100 max-h-[260px] overflow-y-auto"
                  >
                    <div className="flex items-center gap-2 text-blue-200 font-semibold">
                      <LockKey size={18} weight="fill" />
                      Protools Stock Insight
                    </div>
                    <p className="mt-2 text-blue-200/80">
                      Unlock premium insight cards, deeper risk scanning, and personalized catalysts before you invest.
                    </p>
                    <ul className="mt-3 space-y-2 text-blue-100/80">
                      <li>• AI sentiment summary and trend momentum</li>
                      <li>• Key catalysts, earnings signals, and alerts</li>
                      <li>• Suggested entry & exit ranges</li>
                      <li>• Watchlist-quality score boost</li>
                    </ul>
                    <Button
                      className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-400"
                      onClick={() => {
                        window.location.href = 'https://www.alphastocks.ai/?proTools=1'
                      }}
                    >
                      Unlock with Protools
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="space-y-2">
                  <Button
                    onClick={() => onBuy(0.5)}
                    onPointerUp={handlePenPointerUp(() => onBuy(0.5))}
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
                    onPointerUp={handlePenPointerUp(() => onBuy(1))}
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
                    onPointerUp={handlePenPointerUp(() => onBuy(2))}
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
                onPointerUp={handlePenPointerUp(() => onOpenChange(false))}
                variant="outline"
                className="w-full mt-4"
              >
                Pass
              </Button>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerSwipeAction('left')}
                  className="h-9 gap-2 text-rose-200 hover:text-rose-100"
                  aria-label="Pass this stock"
                >
                  <ArrowLeft size={14} />
                  Pass
                </Button>
                <span className="text-[10px] tracking-[0.4em] text-muted-foreground/80">Swipe</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerSwipeAction('right')}
                  className="h-9 gap-2 text-emerald-200 hover:text-emerald-100"
                  aria-label="Invest in this stock"
                >
                  Invest
                  <ArrowRight size={14} />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <button 
                  type="button" 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-accent font-medium" 
                  onClick={handleViewFullAnalysis}
                >
                  View Full Analysis Report
                </button>
              </div>
            </div>
          </div>

            <div className="pointer-events-none absolute inset-x-6 top-24 flex justify-between text-xs font-semibold uppercase tracking-[0.35em]">
              <span
                className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200"
                style={{
                  opacity: dragX > 0 ? Math.min(1, Math.abs(dragX) / swipeThreshold) : 0,
                  transform: `scale(${dragX > 0 ? 0.9 + Math.min(1, Math.abs(dragX) / swipeThreshold) * 0.1 : 0.9})`,
                }}
              >
                Invest
              </span>
              <span
                className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-rose-200"
                style={{
                  opacity: dragX < 0 ? Math.min(1, Math.abs(dragX) / swipeThreshold) : 0,
                  transform: `scale(${dragX < 0 ? 0.9 + Math.min(1, Math.abs(dragX) / swipeThreshold) * 0.1 : 0.9})`,
                }}
              >
                Pass
              </span>
            </div>
          </div>

          <div className="hidden md:flex md:flex-col bg-card border-2 border-blue-500/30 shadow-[0_0_40px_oklch(0.75_0.15_85_/_0.3)] rounded-xl p-6 max-h-[calc(100dvh-2rem)]">
            <div
              className={`flex-1 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-blue-100 transition-opacity duration-200 ${shouldDimProtools ? 'opacity-60' : 'opacity-100'}`}
              onMouseEnter={() => setProtoolsHovered(true)}
              onMouseLeave={() => setProtoolsHovered(false)}
              onFocus={() => setProtoolsActive(true)}
              onBlur={() => setProtoolsActive(false)}
              onClick={() => setProtoolsActive(true)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2 text-blue-200 font-semibold">
                <LockKey size={18} weight="fill" />
                Protools Stock Insight
              </div>
              <p className="mt-2 text-sm text-blue-200/80">
                Unlock a second insight card with deeper signals before you buy.
              </p>
              <div className="mt-3 space-y-2 text-sm max-h-[320px] overflow-y-auto pr-1">
                <div className="rounded-lg border border-blue-400/20 bg-blue-900/30 p-3">
                  <div className="text-xs uppercase tracking-widest text-blue-300">Momentum & Sentiment</div>
                  <p className="mt-1 text-blue-100/80">
                    AI sentiment trend, sector strength, and crowd positioning.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-400/20 bg-blue-900/30 p-3">
                  <div className="text-xs uppercase tracking-widest text-blue-300">Risk & Catalysts</div>
                  <p className="mt-1 text-blue-100/80">
                    Upcoming earnings, news triggers, and downside warnings.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-400/20 bg-blue-900/30 p-3">
                  <div className="text-xs uppercase tracking-widest text-blue-300">Entry Guidance</div>
                  <p className="mt-1 text-blue-100/80">
                    Suggested entry zones, watchlist priority, and exit ranges.
                  </p>
                </div>
              </div>
              <Button
                className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-400"
                onClick={() => {
                  window.location.href = 'https://www.alphastocks.ai/?proTools=1'
                }}
              >
                Unlock with Protools
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
