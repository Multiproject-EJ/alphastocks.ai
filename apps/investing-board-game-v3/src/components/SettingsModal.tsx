import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(70)
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('soundEnabled')
    const savedSoundVolume = localStorage.getItem('soundVolume')
    const savedHapticsEnabled = localStorage.getItem('hapticsEnabled')
    const savedReducedMotion = localStorage.getItem('reducedMotion')
    const savedAutoSave = localStorage.getItem('autoSave')

    if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === 'true')
    if (savedSoundVolume !== null) setSoundVolume(parseInt(savedSoundVolume))
    if (savedHapticsEnabled !== null) setHapticsEnabled(savedHapticsEnabled === 'true')
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion === 'true')
    if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true')
  }, [])

  // Save settings to localStorage
  const handleSoundEnabledChange = (value: boolean) => {
    setSoundEnabled(value)
    localStorage.setItem('soundEnabled', value.toString())
  }

  const handleSoundVolumeChange = (value: number[]) => {
    setSoundVolume(value[0])
    localStorage.setItem('soundVolume', value[0].toString())
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

  const handleResetTutorial = () => {
    localStorage.removeItem('tutorialCompleted')
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

          {/* Haptics Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Haptics</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="haptics-enabled">Vibration Feedback</Label>
              <Switch
                id="haptics-enabled"
                checked={hapticsEnabled}
                onCheckedChange={handleHapticsEnabledChange}
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
              />
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
              Reset Tutorial
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
