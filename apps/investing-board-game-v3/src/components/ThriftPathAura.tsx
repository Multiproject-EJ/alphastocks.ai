import { motion } from 'framer-motion'
import { Shield } from '@phosphor-icons/react'

// Visual aura around player token when Thrift Path is active
interface ThriftPathAuraProps {
  active: boolean
  level: number
  position: { x: number, y: number } // Token position
}

export function ThriftPathAura({ active, level, position }: ThriftPathAuraProps) {
  if (!active || level === 0) return null
  
  // Aura intensity based on level
  const auraStyles = {
    1: { color: '#10B981', opacity: 0.3, blur: 15, size: 60 },
    2: { color: '#10B981', opacity: 0.4, blur: 20, size: 70 },
    3: { color: '#10B981', opacity: 0.5, blur: 25, size: 80 },
    4: { color: '#F59E0B', opacity: 0.6, blur: 30, size: 90 }, // Gold tint
    5: { color: '#F59E0B', opacity: 0.7, blur: 35, size: 100 } // Full gold
  }
  
  const style = auraStyles[level as keyof typeof auraStyles] || auraStyles[1]
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [style.opacity, style.opacity * 0.7, style.opacity]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: style.size,
          height: style.size,
          background: `radial-gradient(circle, ${style.color}80, transparent)`,
          filter: `blur(${style.blur}px)`,
          boxShadow: `0 0 ${style.blur * 2}px ${style.color}`
        }}
      />
      
      {/* Shield icon for level 3+ */}
      {level >= 3 && (
        <div className="absolute top-0 right-0 text-green-500">
          <Shield size={20} weight="fill" />
        </div>
      )}
    </motion.div>
  )
}
