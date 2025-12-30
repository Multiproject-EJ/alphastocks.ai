import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { useSound } from '@/hooks/useSound'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [cameraMode, setCameraMode] = useState<'classic' | 'immersive'>('classic')
  const [tutorialEnabled, setTutorialEnabled] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { enabled: notificationsEnabled, setNotificationsEnabled } = useNotificationPreferences()
  const { volume, muted, setVolume, setMuted } = useSound()
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

    if (savedHapticsEnabled !== null) setHapticsEnabled(savedHapticsEnabled === 'true')
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion === 'true')
    if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true')
    if (savedTutorialEnabled !== null) setTutorialEnabled(savedTutorialEnabled !== 'false')
    if (savedCameraMode === 'classic' || savedCameraMode === 'immersive') {
      setCameraMode(savedCameraMode)
    } else {
      // Default based on screen size
      setCameraMode(window.innerWidth < 768 ? 'immersive' : 'classic')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
