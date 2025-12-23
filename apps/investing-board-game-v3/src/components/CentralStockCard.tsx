import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stock } from '@/lib/types'
import { TrendUp, Briefcase, X, Target, ShieldCheck, Speedometer } from '@phosphor-icons/react'

interface CentralStockCardProps {
  stock: Stock | null
  isVisible: boolean
  onClose?: () => void
}

// Helper function to get color based on score
const getScoreColor = (score: number, isRisk: boolean = false): string => {
  if (isRisk) {
    if (score <= 4) return 'text-green-500'
    if (score <= 7) return 'text-yellow-500'
    return 'text-red-500'
  } else {
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }
}

const getRiskLabel = (score: number): string => {
  if (score <= 4) return 'Low'
  if (score <= 7) return 'Med'
  return 'High'
}

export function CentralStockCard({ stock, isVisible, onClose }: CentralStockCardProps) {
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
            <Card className="w-[400px] p-6 bg-card/95 backdrop-blur-md border-4 border-accent/50 shadow-[0_0_60px_oklch(0.75_0.15_85_/_0.4)]">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Briefcase size={28} className="text-accent" weight="fill" />
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

                {/* Quick Scores Preview */}
                {stock.scores && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded bg-accent/10 border border-accent/20">
                      <Target size={14} className={`${getScoreColor(stock.scores.composite)} mx-auto mb-1`} weight="bold" />
                      <div className={`text-sm font-bold ${getScoreColor(stock.scores.composite)}`}>
                        {stock.scores.composite.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Score</div>
                    </div>
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
                        {getRiskLabel(stock.scores.risk)}
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
