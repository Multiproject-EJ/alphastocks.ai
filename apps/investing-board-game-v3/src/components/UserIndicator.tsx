import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, SignOut, ArrowSquareOut, CloudCheck, CloudSlash, Spinner } from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'

interface UserIndicatorProps {
  saving?: boolean
  lastSaved?: Date | null
}

export function UserIndicator({ saving, lastSaved }: UserIndicatorProps) {
  const { user, isAuthenticated, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg backdrop-blur-sm border border-border/50">
        <Spinner size={16} className="animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // Navigate to ProTools for login
          window.location.href = 'https://www.alphastocks.ai/?proTools=1'
        }}
        className="gap-2 bg-background/80 backdrop-blur-sm"
      >
        <User size={16} weight="bold" />
        <span>Sign in to save</span>
      </Button>
    )
  }

  // Get display name
  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Player'

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            {saving ? (
              <Spinner size={16} className="animate-spin text-accent" />
            ) : isAuthenticated ? (
              <CloudCheck size={16} weight="bold" className="text-green-500" />
            ) : (
              <CloudSlash size={16} weight="bold" className="text-muted-foreground" />
            )}
            <span className="max-w-[100px] truncate">{displayName}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saving ? (
              <>
                <Spinner size={12} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CloudCheck size={12} className="text-green-500" />
                <span>Saved {formatLastSaved(lastSaved)}</span>
              </>
            ) : (
              <>
                <CloudCheck size={12} className="text-green-500" />
                <span>Auto-save enabled</span>
              </>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.location.href = 'https://www.alphastocks.ai/?proTools=1'
          }}
          className="gap-2"
        >
          <ArrowSquareOut size={16} />
          <span>Open ProTools</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOut()
            setIsOpen(false)
          }}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <SignOut size={16} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
