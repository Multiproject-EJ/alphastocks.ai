import { motion } from 'framer-motion'

interface CenterSlicesProps {
  radius: number
}

export function CenterSlices({ radius }: CenterSlicesProps) {
  // Create 8 decorative slices
  const slices = Array.from({ length: 8 }, (_, i) => i)
  const sliceAngle = 360 / slices.length

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="absolute"
        style={{
          transform: 'rotate(-90deg)',
        }}
      >
        {/* Central circle background */}
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.35}
          fill="rgba(0, 0, 0, 0.3)"
          className="backdrop-blur-sm"
        />
        
        {/* Decorative slices emanating from center */}
        {slices.map((slice, index) => {
          const startAngle = (sliceAngle * index * Math.PI) / 180
          const endAngle = (sliceAngle * (index + 1) * Math.PI) / 180
          const innerRadius = radius * 0.15
          const outerRadius = radius * 0.35
          
          // Calculate path points
          const x1 = radius + Math.cos(startAngle) * innerRadius
          const y1 = radius + Math.sin(startAngle) * innerRadius
          const x2 = radius + Math.cos(endAngle) * innerRadius
          const y2 = radius + Math.sin(endAngle) * innerRadius
          const x3 = radius + Math.cos(endAngle) * outerRadius
          const y3 = radius + Math.sin(endAngle) * outerRadius
          const x4 = radius + Math.cos(startAngle) * outerRadius
          const y4 = radius + Math.sin(startAngle) * outerRadius
          
          return (
            <motion.path
              key={slice}
              d={`M ${x1} ${y1} 
                  L ${x4} ${y4} 
                  A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} 
                  L ${x2} ${y2} 
                  A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`}
              fill={index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
              style={{
                transformOrigin: `${radius}px ${radius}px`,
              }}
            />
          )
        })}
        
        {/* Inner ring decoration */}
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.15}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
        
        {/* Outer ring decoration */}
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.35}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
        />
        
        {/* Animated pulse rings */}
        {[1, 2, 3].map((ring, i) => (
          <motion.circle
            key={ring}
            cx={radius}
            cy={radius}
            r={radius * 0.25}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            initial={{ r: radius * 0.15, opacity: 0 }}
            animate={{ 
              r: [radius * 0.15, radius * 0.35],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 1,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
