import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stock } from '@/lib/types'
import { 
  getScoreColor, 
  getRiskLabelShort,
  getRiskLabelColor,
  getQualityLabelColor,
  getTimingLabelColor,
  formatRelativeTime,
  getWarningFlags
} from '@/lib/stockScores'
import { TrendUp, Briefcase, X, ShieldCheck, Speedometer, Sparkle, Clock } from '@phosphor-icons/react'

interface CentralStockCardProps {
  stock: Stock | null
  isVisible: boolean
  onClose?: () => void
}

export function CentralStockCard({ stock, isVisible, onClose }: CentralStockCardProps) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <AnimatePresence>
        {isVisible && stock && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.6,
            }}
            className="pointer-events-auto"
          >
            <Card className="w-[400px] p-6 bg-card/95 backdrop-blur-md border-4 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)] relative">
              {onClose && (
                <div className="flex justify-end mb-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-full"
                    aria-label="Close card"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
              
              {/* Hero Score - Top Right */}
              {stock.scores && (
                <div className="absolute top-6 right-6 flex flex-col items-center">
                  <div className={`text-6xl font-bold font-mono ${getScoreColor(stock.scores.composite)}`}>
                    {stock.scores.composite.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Overall Score
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    out of 10
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
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
                    <div className="w-full h-full flex items-center justify-center">
                      <Briefcase size={32} className="text-accent/50" weight="fill" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-accent mb-1">Company / Tile</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stock.category}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="text-xl font-bold text-foreground">{stock.name}</h4>
                    <span className="text-sm font-mono font-semibold text-muted-foreground">
                      {stock.ticker}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.description}</p>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <TrendUp size={20} className="text-accent" weight="bold" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      ${stock.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quick Scores Preview - 3 Column Grid (Quality, Risk, Timing) */}
                {stock.scores && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded bg-accent/10 border border-accent/20">
                      <ShieldCheck size={14} className={`${getScoreColor(stock.scores.quality)} mx-auto mb-1`} weight="bold" />
                      <div className={`text-sm font-bold ${getScoreColor(stock.scores.quality)}`}>
                        {stock.scores.quality.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Quality</div>
                    </div>
                    <div className="text-center p-2 rounded bg-accent/10 border border-accent/20">
                      <TrendUp size={14} className={`${getScoreColor(stock.scores.risk, true)} mx-auto mb-1`} weight="bold" />
                      <div className={`text-sm font-bold ${getScoreColor(stock.scores.risk, true)}`}>
                        {getRiskLabelShort(stock.scores.risk)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Risk</div>
                    </div>
                    <div className="text-center p-2 rounded bg-accent/10 border border-accent/20">
                      <Speedometer size={14} className={`${getScoreColor(stock.scores.timing)} mx-auto mb-1`} weight="bold" />
                      <div className={`text-sm font-bold ${getScoreColor(stock.scores.timing)}`}>
                        {stock.scores.timing.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Timing</div>
                    </div>
                  </div>
                )}

                {/* NEW: Label Badges */}
                {(stock.risk_label || stock.quality_label || stock.timing_label) && (
                  <div className="flex flex-wrap gap-2">
                    {stock.risk_label && (
                      <Badge className={`text-xs px-2 py-1 border ${getRiskLabelColor(stock.risk_label)}`}>
                        🛡️ {stock.risk_label}
                      </Badge>
                    )}
                    {stock.quality_label && (
                      <Badge className={`text-xs px-2 py-1 border ${getQualityLabelColor(stock.quality_label)}`}>
                        ⭐ {stock.quality_label}
                      </Badge>
                    )}
                    {stock.timing_label && (
                      <Badge className={`text-xs px-2 py-1 border ${getTimingLabelColor(stock.timing_label)}`}>
                        ⏰ {stock.timing_label}
                      </Badge>
                    )}
                  </div>
                )}

                {/* NEW: Warning Flags */}
                {stock.addon_flags && getWarningFlags(stock.addon_flags).length > 0 && (
                  <div className="space-y-2">
                    {getWarningFlags(stock.addon_flags).map((warning, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${warning.color}`}
                      >
                        <span className="text-base">{warning.icon}</span>
                        <span className="font-semibold">{warning.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* NEW: AI Metadata Footer */}
                {(stock.ai_model || stock.analyzed_at) && (
                  <div className="flex items-center gap-2 pt-2 border-t border-accent/20 text-xs text-muted-foreground">
                    <Sparkle size={14} className="text-accent" weight="fill" />
                    <span>
                      {stock.ai_model && <span className="font-medium">Analyzed by {stock.ai_model}</span>}
                      {stock.ai_model && stock.analyzed_at && <span className="mx-1">•</span>}
                      {stock.analyzed_at && (
                        <span className="flex items-center gap-1 inline-flex">
                          <Clock size={12} weight="bold" />
                          {formatRelativeTime(stock.analyzed_at)}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground italic">
                  This card appears when you land on category tiles
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
