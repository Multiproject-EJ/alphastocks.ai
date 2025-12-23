import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stock } from '@/lib/types'
import { TrendUp, Briefcase, X } from '@phosphor-icons/react'

interface CentralStockCardProps {
  stock: Stock | null
  isVisible: boolean
  onClose?: () => void
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
              
              {/* Header with logo placeholder and name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30 flex items-center justify-center">
                  <Briefcase size={32} className="text-accent/50" weight="fill" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-accent mb-1">{stock.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stock.category}
                  </p>
                </div>
              </div>

              {/* Stock details */}
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-mono font-semibold text-muted-foreground block mb-2">
                    {stock.ticker}
                  </span>
                  <p className="text-sm text-muted-foreground">{stock.description}</p>
                </div>

                {/* Price display */}
                <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <TrendUp size={20} className="text-accent" weight="bold" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-2xl font-bold text-accent font-mono">
                      ${stock.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Simple teaser message */}
                <p className="text-xs text-center text-muted-foreground italic">
                  Opening details...
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
