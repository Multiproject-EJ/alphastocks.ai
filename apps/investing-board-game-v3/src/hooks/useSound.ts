/**
 * React hook for using sound effects in the board game
 */

import { useCallback, useEffect, useState } from 'react'
import { soundManager, SoundType, SoundSettings } from '@/lib/sounds'

export function useSound() {
  const [settings, setSettings] = useState<SoundSettings>(soundManager.getSettings())

  // Initialize sound manager on first user interaction
  useEffect(() => {
    const initSound = () => {
      soundManager.init()
      // Remove listener after first interaction
      document.removeEventListener('click', initSound)
      document.removeEventListener('keydown', initSound)
    }

    document.addEventListener('click', initSound)
    document.addEventListener('keydown', initSound)

    return () => {
      document.removeEventListener('click', initSound)
      document.removeEventListener('keydown', initSound)
    }
  }, [])

  const play = useCallback((soundType: SoundType) => {
    soundManager.play(soundType)
  }, [])

  const setVolume = useCallback((volume: number) => {
    soundManager.setVolume(volume)
    setSettings(soundManager.getSettings())
  }, [])

  const toggleMute = useCallback(() => {
    soundManager.toggleMute()
    setSettings(soundManager.getSettings())
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    soundManager.setMuted(muted)
    setSettings(soundManager.getSettings())
  }, [])

  return {
    play,
    setVolume,
    toggleMute,
    setMuted,
    volume: settings.volume,
    muted: settings.muted,
  }
}
