import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { useHaptics } from '@/hooks/useHaptics'

interface HapticButtonProps extends ComponentProps<typeof Button> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
  children: React.ReactNode
}

export function HapticButton({ 
  hapticType = 'light', 
  onClick, 
  children, 
  ...props 
}: HapticButtonProps) {
  const { lightTap, mediumTap, heavyTap, success, warning, error } = useHaptics()
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic
    if (hapticType === 'light') lightTap()
    else if (hapticType === 'medium') mediumTap()
    else if (hapticType === 'heavy') heavyTap()
    else if (hapticType === 'success') success()
    else if (hapticType === 'warning') warning()
    else if (hapticType === 'error') error()
    
    // Call original onClick
    onClick?.(e)
  }
  
  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}
