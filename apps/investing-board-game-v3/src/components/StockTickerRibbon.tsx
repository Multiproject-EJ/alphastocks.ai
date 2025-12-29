import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUniverseStocks } from '@/hooks/useUniverseStocks'

interface StockTickerRibbonProps {
  radius: number // Radius of the circular board
  isActive?: boolean
  isSpinning?: boolean
}

export function StockTickerRibbon({
  radius,
  isActive = false,
  isSpinning = false,
}: StockTickerRibbonProps) {
  const { getStockForCategory } = useUniverseStocks()
  const [tickerItems, setTickerItems] = useState<Array<{ symbol: string; price: number; change: number }>>([])

  useEffect(() => {
    // Generate ticker items from different categories
    const categories = ['Growth', 'Value', 'Dividends', 'Moats', 'Turnarounds']
    const items = categories.map(category => {
      const stock = getStockForCategory(category as any)
      return {
        symbol: stock?.ticker || 'N/A',
        price: stock?.price || 0,
        change: Math.random() * 10 - 5 // Random change for demo (-5% to +5%)
      }
    }).filter(item => item.symbol !== 'N/A') // Filter out any invalid items
    
    setTickerItems(items)
  }, [getStockForCategory])

  const placeholderItems = Array.from({ length: 5 }, () => ({
    symbol: '?',
    price: 0,
    change: 0,
  }))
  const shouldShowRealStocks = isActive && tickerItems.length > 0
  const displayItems = shouldShowRealStocks ? tickerItems : placeholderItems

  // Calculate the circumference for the ribbon
  const ribbonRadius = radius * 0.75 // 75% of board radius for inner ribbon
  const circumference = 2 * Math.PI * ribbonRadius
  const spinDuration = isSpinning ? 6 : 36

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* Circular ribbon band */}
      <svg
        width={ribbonRadius * 2}
        height={ribbonRadius * 2}
        className="absolute"
        style={{
          transform: 'rotate(-90deg)',
        }}
      >
        {/* Background ribbon */}
        <circle
          cx={ribbonRadius}
          cy={ribbonRadius}
          r={ribbonRadius - 20}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="40"
          className="backdrop-blur-sm"
        />
        
        {/* Animated stock ticker path */}
        <motion.path
          d={`M ${ribbonRadius - 20},${ribbonRadius} 
              m -${ribbonRadius - 20},0 
              a ${ribbonRadius - 20},${ribbonRadius - 20} 0 1,0 ${(ribbonRadius - 20) * 2},0 
              a ${ribbonRadius - 20},${ribbonRadius - 20} 0 1,0 -${(ribbonRadius - 20) * 2},0`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="35"
          strokeDasharray="10 5"
          initial={{ strokeDashoffset: 0 }}
          animate={isActive ? { strokeDashoffset: circumference } : { strokeDashoffset: 0 }}
          transition={{
            duration: isActive ? spinDuration : 0,
            repeat: isActive ? Infinity : 0,
            ease: 'linear',
          }}
        />
      </svg>

      {/* Ticker text items positioned around the circle */}
      {displayItems.map((item, index) => {
        const angle = (360 / displayItems.length) * index
        const x = Math.cos((angle - 90) * (Math.PI / 180)) * (ribbonRadius - 20)
        const y = Math.sin((angle - 90) * (Math.PI / 180)) * (ribbonRadius - 20)
        
        return (
          <motion.div
            key={`${item.symbol}-${index}`}
            className="absolute text-xs font-mono"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={isActive ? { 
              opacity: [0.5, 1, 0.5],
              rotate: [angle, angle + 360],
            } : { opacity: 0.6, rotate: angle }}
            transition={{
              opacity: isActive ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              } : { duration: 0 },
              rotate: isActive ? {
                duration: spinDuration,
                repeat: Infinity,
                ease: 'linear',
              } : { duration: 0 },
            }}
          >
            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
              <span className="text-white font-semibold">{isActive ? item.symbol : '?'}</span>
              <span className="text-gray-300 ml-2">
                {isActive ? `$${item.price.toFixed(2)}` : '?'}
              </span>
              <span
                className={`ml-1 ${isActive ? (item.change >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}
              >
                {isActive ? `${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}%` : '?'}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
