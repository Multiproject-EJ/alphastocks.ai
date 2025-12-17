import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { useHaptics } from '@/hooks/useHaptics'

interface HapticButtonProps extends ComponentProps<typeof Button> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'roll' | 'celebration'
  children: React.ReactNode
}

export function HapticButton({ 
  hapticType = 'light', 
  onClick, 
  children, 
  ...props 
}: HapticButtonProps) {
  const { light, medium, heavy, success, error, roll, celebration } = useHaptics()
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic
    if (hapticType === 'light') light()
    else if (hapticType === 'medium') medium()
    else if (hapticType === 'heavy') heavy()
    else if (hapticType === 'success') success()
    else if (hapticType === 'error') error()
    else if (hapticType === 'roll') roll()
    else if (hapticType === 'celebration') celebration()
    
    // Call original onClick
    onClick?.(e)
  }
  
  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}
