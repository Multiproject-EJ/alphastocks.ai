import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { useSound } from '@/hooks/useSound'
import { useAuth } from '@/context/AuthContext'
import { hasSupabaseConfig, supabaseClient } from '@/lib/supabaseClient'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [cameraMode, setCameraMode] = useState<'classic' | 'immersive'>('classic')
  const [tutorialEnabled, setTutorialEnabled] = useState(false)
  const [backgroundChoice, setBackgroundChoice] = useState<'cycle' | 'finance-board'>('cycle')
  const [isMobile, setIsMobile] = useState(false)
  const [developerModeEnabled, setDeveloperModeEnabled] = useState(false)
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [diagnosticsSummary, setDiagnosticsSummary] = useState<string>('Run a quick check for Supabase connectivity.')
  const [diagnosticsDetails, setDiagnosticsDetails] = useState<string[]>([])
  const [diagnosticsCheckedAt, setDiagnosticsCheckedAt] = useState<string | null>(null)
  const { enabled: notificationsEnabled, setNotificationsEnabled } = useNotificationPreferences()
  const { volume, muted, setVolume, setMuted } = useSound()
  const { user, session, loading: authLoading, isAuthenticated } = useAuth()
  const soundEnabled = !muted
  const soundVolume = Math.round(volume * 100)
  const toggleClassName =
    'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-600/70'
  
  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedHapticsEnabled = localStorage.getItem('hapticsEnabled')
    const savedReducedMotion = localStorage.getItem('reducedMotion')
    const savedAutoSave = localStorage.getItem('autoSave')
    const savedCameraMode = localStorage.getItem('alphastocks_camera_mode')
    const savedTutorialEnabled = localStorage.getItem('tutorialEnabled')
    const savedBackgroundChoice = localStorage.getItem('alphastocks_phone_background')
    const savedDeveloperMode = localStorage.getItem('developerModeEnabled')

    if (savedHapticsEnabled !== null) setHapticsEnabled(savedHapticsEnabled === 'true')
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion === 'true')
    if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true')
    if (savedTutorialEnabled !== null) setTutorialEnabled(savedTutorialEnabled === 'true')
    if (savedBackgroundChoice === 'cycle' || savedBackgroundChoice === 'finance-board') {
      setBackgroundChoice(savedBackgroundChoice)
    }
    if (savedCameraMode === 'classic' || savedCameraMode === 'immersive') {
      setCameraMode(savedCameraMode)
    } else {
      // Default based on screen size
      setCameraMode(window.innerWidth < 768 ? 'immersive' : 'classic')
    }
    if (savedDeveloperMode !== null) {
      setDeveloperModeEnabled(savedDeveloperMode === 'true')
    }
  }, [])

  // Save settings to localStorage
  const handleSoundEnabledChange = (value: boolean) => {
    setMuted(!value)
  }

  const handleSoundVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
  }

  const handleHapticsEnabledChange = (value: boolean) => {
    setHapticsEnabled(value)
    localStorage.setItem('hapticsEnabled', value.toString())
  }

  const handleReducedMotionChange = (value: boolean) => {
    setReducedMotion(value)
    localStorage.setItem('reducedMotion', value.toString())
    window.location.reload() // Reload to apply changes
  }

  const handleAutoSaveChange = (value: boolean) => {
    setAutoSave(value)
    localStorage.setItem('autoSave', value.toString())
  }

  const handleTutorialEnabledChange = (value: boolean) => {
    setTutorialEnabled(value)
    localStorage.setItem('tutorialEnabled', value.toString())
    if (value) {
      localStorage.removeItem('tutorialCompleted')
    }
    window.dispatchEvent(new Event('tutorial-settings-changed'))
  }
  
  const handleCameraModeChange = (value: boolean) => {
    const newMode = value ? 'immersive' : 'classic'
    setCameraMode(newMode)
    localStorage.setItem('alphastocks_camera_mode', newMode)
    // Reload to apply camera changes
    window.location.reload()
  }

  const handleBackgroundChoiceChange = (value: 'cycle' | 'finance-board') => {
    setBackgroundChoice(value)
    localStorage.setItem('alphastocks_phone_background', value)
    window.dispatchEvent(new Event('phone-background-changed'))
  }

  const handleDeveloperModeChange = (value: boolean) => {
    setDeveloperModeEnabled(value)
    localStorage.setItem('developerModeEnabled', value.toString())
    window.dispatchEvent(new CustomEvent('developer-mode-changed', { detail: { enabled: value } }))
  }

  const handleResetTutorial = () => {
    localStorage.removeItem('tutorialCompleted')
    localStorage.setItem('tutorialEnabled', 'true')
    setTutorialEnabled(true)
    window.dispatchEvent(new Event('tutorial-settings-changed'))
    window.location.reload()
  }

  const handleClearCache = () => {
    if (confirm('This will clear all cached data. Continue?')) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const runDiagnostics = async () => {
    const details: string[] = []
    let hasError = false

    setDiagnosticsStatus('running')
    setDiagnosticsSummary('Running diagnostics...')
    setDiagnosticsDetails([])

    if (!hasSupabaseConfig || !supabaseClient) {
      details.push('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      hasError = true
    } else {
      details.push('Supabase configuration detected.')
      const tokenPresent = Boolean(localStorage.getItem('supabase.auth.token'))
      details.push(`Shared login token in storage: ${tokenPresent ? 'found' : 'missing'}.`)
      details.push(`Auth session loaded: ${isAuthenticated ? 'signed in' : authLoading ? 'checking' : 'signed out'}.`)
      if (user?.email) {
        details.push(`User email: ${user.email}.`)
      } else if (session?.user?.id) {
        details.push(`User id: ${session.user.id}.`)
      }

      try {
        const { error } = await supabaseClient
          .from('board_game_profiles')
          .select('id', { head: true, count: 'exact' })
          .limit(1)
        if (error) {
          details.push(`Database check failed: ${error.message}`)
          hasError = true
        } else {
          details.push('Database reachable: board_game_profiles responded.')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        details.push(`Database check threw an error: ${message}`)
        hasError = true
      }

      if (!isAuthenticated || !user) {
        details.push('Save diagnostics skipped: user is not authenticated.')
      } else {
        try {
          const requiredColumns = [
            'profile_id',
            'cash',
            'position',
            'net_worth',
            'portfolio_value',
            'stars',
            'coins',
            'holdings',
            'inventory',
            'active_effects',
            'stats',
            'achievements',
            'rolls_remaining',
            'rolls_reset_at',
            'updated_at',
          ]
          const optionalColumns = ['challenges', 'thrift_path', 'event_track']
          let selectColumns = [...requiredColumns, ...optionalColumns]
          let data: Record<string, any> | null = null
          let profileError: { message: string } | null = null

          for (let attempt = 0; attempt < 2; attempt += 1) {
            const response = await supabaseClient
              .from('board_game_profiles')
              .select(selectColumns.join(','))
              .eq('profile_id', user.id)
              .maybeSingle()

            if (!response.error) {
              data = response.data
              profileError = null
              break
            }

            profileError = response.error
            const message = response.error.message || ''
            const missingMatch = message.match(/column\s+[^.]+\.(\w+)\s+does not exist/i)
            if (missingMatch) {
              const missingColumn = missingMatch[1]
              selectColumns = selectColumns.filter((column) => column !== missingColumn)
              details.push(`Schema warning: column ${missingColumn} is missing; continuing without it.`)
              continue
            }

            break
          }

          if (profileError) {
            details.push(`Save schema check failed: ${profileError.message}`)
            hasError = true
          } else if (!data) {
            details.push('Save schema check passed, but no profile row exists yet for this user.')
            details.push('Save test skipped to avoid creating a blank profile. Trigger a manual save and retry.')
          } else {
            const issues: string[] = []
            if (typeof data.cash !== 'number') issues.push('cash')
            if (typeof data.stars !== 'number') issues.push('stars')
            if (typeof data.coins !== 'number') issues.push('coins')
            if (typeof data.position !== 'number') issues.push('position')
            if (!Array.isArray(data.holdings)) issues.push('holdings')
            if (!Array.isArray(data.inventory)) issues.push('inventory')
            if (!Array.isArray(data.active_effects)) issues.push('active_effects')
            if (data.stats && typeof data.stats !== 'object') issues.push('stats')
            if (data.achievements && typeof data.achievements !== 'object') issues.push('achievements')

            if (issues.length > 0) {
              details.push(`Profile data type mismatch: ${issues.join(', ')}.`)
              hasError = true
            } else {
              details.push('Profile schema looks compatible with current save payload.')
            }

            const savePayload = {
              profile_id: data.profile_id,
              cash: data.cash ?? 0,
              position: data.position ?? 0,
              net_worth: data.net_worth ?? 0,
              portfolio_value: data.portfolio_value ?? 0,
              stars: data.stars ?? 0,
              coins: data.coins ?? 0,
              holdings: data.holdings ?? [],
              inventory: data.inventory ?? [],
              active_effects: data.active_effects ?? [],
              stats: data.stats ?? {},
              achievements: data.achievements ?? { unlocked: [], progress: {} },
              challenges: data.challenges ?? null,
              thrift_path: data.thrift_path ?? null,
              event_track: data.event_track ?? null,
              rolls_remaining: data.rolls_remaining ?? 0,
              rolls_reset_at: data.rolls_reset_at ?? new Date().toISOString(),
            }

            const { data: savedRow, error: saveError } = await supabaseClient
              .from('board_game_profiles')
              .upsert(savePayload, { onConflict: 'profile_id' })
              .select('profile_id, cash, stars, coins, position, holdings, inventory, updated_at')
              .maybeSingle()

            if (saveError) {
              details.push(`Save test failed: ${saveError.message}`)
              hasError = true
            } else if (!savedRow) {
              details.push('Save test failed: no row returned after upsert.')
              hasError = true
            } else {
              const writeChecks: string[] = []
              if (savedRow.cash !== data.cash) writeChecks.push('cash')
              if (savedRow.stars !== data.stars) writeChecks.push('stars')
              if (savedRow.coins !== data.coins) writeChecks.push('coins')
              if (savedRow.position !== data.position) writeChecks.push('position')
              if (Array.isArray(savedRow.holdings) && Array.isArray(data.holdings)) {
                if (savedRow.holdings.length !== data.holdings.length) writeChecks.push('holdings')
              }
              if (Array.isArray(savedRow.inventory) && Array.isArray(data.inventory)) {
                if (savedRow.inventory.length !== data.inventory.length) writeChecks.push('inventory')
              }

              if (writeChecks.length > 0) {
                details.push(`Save test completed, but mismatched fields: ${writeChecks.join(', ')}.`)
                hasError = true
              } else {
                details.push('Save test passed: upsert + fetch returned expected values.')
              }
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          details.push(`Save diagnostics threw an error: ${message}`)
          hasError = true
        }
      }
    }

    const timestamp = new Date().toLocaleTimeString()
    setDiagnosticsCheckedAt(timestamp)
    setDiagnosticsDetails(details)
    if (hasError) {
      setDiagnosticsStatus('error')
      setDiagnosticsSummary('Issues detected. Review details below.')
    } else {
      setDiagnosticsStatus('success')
      setDiagnosticsSummary('All checks passed.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Sound</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">Sound Effects</Label>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={handleSoundEnabledChange}
                className={toggleClassName}
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2">
                <Label htmlFor="sound-volume">Volume: {soundVolume}%</Label>
                <Slider
                  id="sound-volume"
                  min={0}
                  max={100}
                  step={5}
                  value={[soundVolume]}
                  onValueChange={handleSoundVolumeChange}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Notifications Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Notifications</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="toast-enabled">Toast Messages</Label>
                <p className="text-xs text-muted-foreground">
                  Show roll results and other game alerts.
                </p>
              </div>
              <Switch
                id="toast-enabled"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className={toggleClassName}
              />
            </div>
          </div>

          <Separator />

          {/* Haptics Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Haptics</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="haptics-enabled">Vibration Feedback</Label>
              <Switch
                id="haptics-enabled"
                checked={hapticsEnabled}
                onCheckedChange={handleHapticsEnabledChange}
                className={toggleClassName}
              />
            </div>
          </div>

          <Separator />

          {/* Accessibility Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Accessibility</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={handleReducedMotionChange}
                className={toggleClassName}
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Reduces animations and screen effects
            </p>
          </div>

          <Separator />

          {/* Game Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Game</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto Save</Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={handleAutoSaveChange}
                className={toggleClassName}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="tutorial-enabled">Onboarding / How to Play</Label>
                <p className="text-xs text-muted-foreground">
                  Show guided tips on screen when you return.
                </p>
              </div>
              <Switch
                id="tutorial-enabled"
                checked={tutorialEnabled}
                onCheckedChange={handleTutorialEnabledChange}
                className={toggleClassName}
              />
            </div>
            
            {/* Camera Mode - Only show on mobile */}
            {isMobile && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="camera-mode">Immersive Camera</Label>
                  <p className="text-xs text-muted-foreground">
                    3D follow-cam for phones (recommended)
                  </p>
                </div>
                <Switch
                  id="camera-mode"
                  checked={cameraMode === 'immersive'}
                  onCheckedChange={handleCameraModeChange}
                  className={toggleClassName}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Background Settings (Mobile only) */}
          {isMobile && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Background</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleBackgroundChoiceChange('cycle')}
                    className={`relative flex min-h-[96px] flex-col justify-between rounded-lg border px-3 py-2 text-left transition ${
                      backgroundChoice === 'cycle'
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-sm'
                        : 'border-border bg-background/60 hover:border-emerald-300/60'
                    }`}
                    aria-pressed={backgroundChoice === 'cycle'}
                  >
                    <div className="text-sm font-semibold">24 Hour Cycle</div>
                    <div className="text-xs text-muted-foreground">
                      Auto changes with the time of day.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBackgroundChoiceChange('finance-board')}
                    className={`relative flex min-h-[96px] flex-col justify-between overflow-hidden rounded-lg border px-3 py-2 text-left transition ${
                      backgroundChoice === 'finance-board'
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-sm'
                        : 'border-border bg-background/60 hover:border-emerald-300/60'
                    }`}
                    aria-pressed={backgroundChoice === 'finance-board'}
                  >
                    <div className="text-sm font-semibold">Finance Board</div>
                    <div className="text-xs text-muted-foreground">
                      Deep focus trading vibe.
                    </div>
                  </button>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={`background-placeholder-${index}`}
                      className="flex min-h-[96px] flex-col justify-between rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground"
                      aria-disabled="true"
                    >
                      <div className="text-sm font-semibold text-muted-foreground/70">
                        Coming Soon
                      </div>
                      <div>Placeholder</div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Developer Mode */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Developer Mode</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="developer-mode">Enable Dev Tools</Label>
                <p className="text-xs text-muted-foreground">
                  Show debug controls for jumping to tiles and triggering flows.
                </p>
              </div>
              <Switch
                id="developer-mode"
                checked={developerModeEnabled}
                onCheckedChange={handleDeveloperModeChange}
                className={toggleClassName}
              />
            </div>
          </div>

          <Separator />

          {/* Troubleshooting */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Troubleshooting</h3>
            <p className="text-xs text-muted-foreground">
              Run diagnostics to check Supabase connectivity and shared login status.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={runDiagnostics}
              disabled={diagnosticsStatus === 'running'}
            >
              {diagnosticsStatus === 'running' ? 'Running Diagnostics…' : 'Run Supabase Diagnostics'}
            </Button>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Status:{' '}
                <span className="font-semibold text-foreground">
                  {diagnosticsSummary}
                </span>
              </p>
              {diagnosticsCheckedAt && (
                <p>Last checked: {diagnosticsCheckedAt}</p>
              )}
              {diagnosticsDetails.length > 0 && (
                <ul className="list-disc space-y-1 pl-4">
                  {diagnosticsDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetTutorial}
            >
              Replay Tutorial
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-destructive"
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </div>

          <Separator />

          {/* Info */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Version: 3.0.0</p>
            <p>© 2024 Investing Board Game</p>
            <a href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
