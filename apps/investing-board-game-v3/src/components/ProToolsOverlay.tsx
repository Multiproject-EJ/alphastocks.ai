import { useEffect } from 'react'
import { X, WarningCircle, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface ProToolsOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallback?: {
    type: 'login' | 'error'
    code: string
  }
  onLaunchProTools: () => void
}

export function ProToolsOverlay({ 
  open, 
  onOpenChange,
  fallback,
  onLaunchProTools,
}: ProToolsOverlayProps) {
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const fallbackDetails = fallback ?? { type: 'error', code: 'PROTOOLS_FALLBACK' }
  const isLoginState = fallbackDetails.type === 'login'

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-tools-title"
    >
      {/* Header with ProTools logo */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-gradient-to-r from-accent/10 to-accent/5 safe-top">
        <div className="flex-1">
          <h1 
            id="pro-tools-title" 
            className="text-4xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent tracking-tight"
          >
            ProTools
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced investment tools for serious traders
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label="Close Pro Tools"
          className="hover:bg-accent/20"
        >
          <X size={28} weight="bold" />
        </Button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-auto p-8 safe-bottom">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                {isLoginState ? (
                  <User size={24} className="text-accent" weight="bold" />
                ) : (
                  <WarningCircle size={24} className="text-destructive" weight="bold" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-semibold">
                  {isLoginState ? 'Sign in to ProTools' : 'Unable to open ProTools'}
                </h2>
                <p className="text-muted-foreground">
                  {isLoginState
                    ? 'Your ProTools session needs authentication. Sign in to continue and sync your progress.'
                    : 'We could not connect to ProTools from this screen. Please retry or use the link below.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dev code: <span className="font-mono">{fallbackDetails.code}</span>
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={onLaunchProTools}
                className="bg-accent text-accent-foreground"
              >
                {isLoginState ? 'Sign in to ProTools' : 'Retry opening ProTools'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
