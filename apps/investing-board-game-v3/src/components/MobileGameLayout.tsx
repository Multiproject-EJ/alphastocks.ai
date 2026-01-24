import { ReactNode, useEffect, useState } from 'react'

interface MobileGameLayoutProps {
  children: ReactNode
  showBottomNav?: boolean
}

export function MobileGameLayout({ children, showBottomNav = true }: MobileGameLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    const checkOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    checkMobile()
    checkOrientation()

    window.addEventListener('resize', checkMobile)
    window.addEventListener('resize', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  return (
    <div 
      className={`
        min-h-screen w-full
        ${isMobile ? 'mobile-layout' : 'desktop-layout'}
        ${isMobile && showBottomNav ? 'pb-20' : ''}
        ${orientation === 'landscape' ? 'orientation-landscape' : 'orientation-portrait'}
        safe-top safe-x
      `}
      style={{
        paddingBottom: isMobile && showBottomNav ? 'calc(5rem + var(--safe-area-bottom-padding))' : undefined,
      }}
      data-safe-area-enabled="true"
    >
      {children}
    </div>
  )
}
