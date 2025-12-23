import { useIsMobile } from "./use-mobile"

export type DialogSize = 'small' | 'medium' | 'large' | 'full'

/**
 * Hook to provide consistent responsive dialog sizing across all modals.
 * Uses the same 768px breakpoint as use-mobile.ts for consistency.
 * 
 * @param size - The desired dialog size on desktop
 * @returns CSS class string for DialogContent
 */
export function useResponsiveDialogClass(size: DialogSize = 'medium'): string {
  const isMobile = useIsMobile()
  
  // Base classes that apply to all dialogs
  const baseClasses = "max-w-[calc(100vw-2rem)]"
  
  // Desktop size mappings (>= 768px)
  const desktopSizeMap: Record<DialogSize, string> = {
    small: "md:max-w-[500px]",      // Stock Modal, Event Modal, Wildcard Event Modal, Out of Rolls Modal
    medium: "md:max-w-lg",           // Default, Hub Modal
    large: "md:max-w-2xl",           // Challenges Modal, Leaderboard Modal, Net Worth Gallery Modal
    full: "md:max-w-[95vw]"          // Shop Modal, City Builder Modal
  }
  
  return `${baseClasses} ${desktopSizeMap[size]}`
}
