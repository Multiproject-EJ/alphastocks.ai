import { useMemo } from 'react'
import { GameState } from '@/lib/types'

interface PortfolioWheelProps {
  gameState: GameState
}

interface DonutSegmentProps {
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
  color: string
  label: string
  value: number
}

// Helper to create SVG path for donut segment
function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function DonutSegment({
  startAngle,
  endAngle,
  innerRadius,
  outerRadius,
  color,
  label,
  value,
}: DonutSegmentProps) {
  const centerX = 100
  const centerY = 100
  
  // Create path for outer arc
  const outerArc = describeArc(centerX, centerY, outerRadius, startAngle, endAngle)
  const innerArc = describeArc(centerX, centerY, innerRadius, startAngle, endAngle)
  
  // Connect the arcs
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle)
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  
  const path = [
    'M', outerStart.x, outerStart.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ')
  
  return (
    <g>
      <path
        d={path}
        fill={color}
        stroke="white"
        strokeWidth="1"
        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
      />
    </g>
  )
}

// Category color mapping from mockData.ts
const CATEGORY_COLORS: Record<string, string> = {
  // Main track categories
  turnarounds: 'oklch(0.60 0.20 330)', // pink/magenta
  dividends: 'oklch(0.65 0.20 200)',   // blue
  growth: 'oklch(0.70 0.18 25)',       // orange
  value: 'oklch(0.75 0.15 85)',        // gold/yellow
  moats: 'oklch(0.55 0.22 15)',        // red
  // Inner track categories
  ipo: 'oklch(0.80 0.25 320)',         // bright pink/magenta
  meme: 'oklch(0.75 0.30 60)',         // bright yellow
  crypto: 'oklch(0.70 0.25 280)',      // purple
  penny: 'oklch(0.65 0.20 120)',       // green
  leverage: 'oklch(0.60 0.30 0)',      // red
  options: 'oklch(0.70 0.20 180)',     // cyan
  // Cash
  cash: '#22c55e',                     // green
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k`
  }
  return num.toFixed(0)
}

export function PortfolioWheel({ gameState }: PortfolioWheelProps) {
  const segments = useMemo(() => {
    const parts: Array<{
      label: string
      value: number
      color: string
    }> = []
    
    // Add holdings grouped by category
    const categoryTotals: Record<string, number> = {}
    
    gameState.holdings.forEach((holding) => {
      const category = holding.stock.category
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += holding.totalCost
    })
    
    // Convert to segments
    Object.entries(categoryTotals).forEach(([category, value]) => {
      parts.push({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value,
        color: CATEGORY_COLORS[category] || '#888',
      })
    })
    
    // Add cash as a segment
    if (gameState.cash > 0) {
      parts.push({
        label: 'Cash',
        value: gameState.cash,
        color: CATEGORY_COLORS.cash,
      })
    }
    
    return parts
  }, [gameState.holdings, gameState.cash])
  
  // Calculate angles for each segment
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)
  const segmentsWithAngles = useMemo(() => {
    let currentAngle = 0
    return segments.map((segment) => {
      const percentage = segment.value / total
      const angleDelta = percentage * 360
      const result = {
        ...segment,
        startAngle: currentAngle,
        endAngle: currentAngle + angleDelta,
        percentage,
      }
      currentAngle += angleDelta
      return result
    })
  }, [segments, total])
  
  const isEmpty = segments.length === 0
  
  return (
    <div className="portfolio-wheel relative" style={{ width: '200px', height: '200px' }}>
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="20"
              strokeDasharray="4 4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground px-2">
              Start investing to see your portfolio
            </span>
          </div>
        </div>
      ) : (
        <>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {segmentsWithAngles.map((segment, i) => (
              <DonutSegment
                key={i}
                startAngle={segment.startAngle}
                endAngle={segment.endAngle}
                innerRadius={50}
                outerRadius={80}
                color={segment.color}
                label={segment.label}
                value={segment.value}
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">
              ${formatNumber(gameState.netWorth)}
            </span>
            <span className="text-xs text-white/70">Net Worth</span>
          </div>
        </>
      )}
    </div>
  )
}
