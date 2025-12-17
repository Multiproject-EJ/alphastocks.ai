/**
 * Sound Controls Component
 * Provides UI for controlling game audio (mute/unmute and volume)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { useSound } from '@/hooks/useSound'

export function SoundControls() {
  const { volume, muted, setVolume, toggleMute } = useSound()
  const [showSlider, setShowSlider] = useState(false)

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0])
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Volume Slider - shows on hover or when clicked */}
        <AnimatePresence>
          {showSlider && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 120 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              onMouseLeave={() => setShowSlider(false)}
            >
              <div className="px-3 py-2 rounded-lg bg-card/90 backdrop-blur-md border border-border shadow-lg">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="w-full"
                  aria-label="Volume"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mute/Unmute Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          onMouseEnter={() => setShowSlider(true)}
          className="rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card/90 transition-all shadow-md h-10 w-10"
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        >
          {muted ? (
            <SpeakerSlash size={20} weight="fill" className="text-muted-foreground" />
          ) : (
            <SpeakerHigh size={20} weight="fill" className="text-accent" />
          )}
        </Button>
      </div>
    </div>
  )
}
