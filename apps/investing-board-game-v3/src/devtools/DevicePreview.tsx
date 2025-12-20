import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEVICE_PRESETS, DevicePreset } from './presets'

interface DevicePreviewProps {
  children: ReactNode
}

export function DevicePreview({ children }: DevicePreviewProps) {
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Apply safe area CSS custom properties
  const applySafeArea = (preset: DevicePreset) => {
    document.documentElement.style.setProperty('--safe-area-inset-top', `${preset.safeArea.top}px`)
    document.documentElement.style.setProperty('--safe-area-inset-right', `${preset.safeArea.right}px`)
    document.documentElement.style.setProperty('--safe-area-inset-bottom', `${preset.safeArea.bottom}px`)
    document.documentElement.style.setProperty('--safe-area-inset-left', `${preset.safeArea.left}px`)
  }

  const handlePresetSelect = (preset: DevicePreset) => {
    setSelectedPreset(preset)
    applySafeArea(preset)
  }

  const handleReset = () => {
    setSelectedPreset(null)
    // Reset safe area to 0 or remove properties
    document.documentElement.style.removeProperty('--safe-area-inset-top')
    document.documentElement.style.removeProperty('--safe-area-inset-right')
    document.documentElement.style.removeProperty('--safe-area-inset-bottom')
    document.documentElement.style.removeProperty('--safe-area-inset-left')
  }

  return (
    <div className="relative w-full h-full">
      {/* Device Selector Toggle Button */}
      <motion.button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg font-mono text-xs font-bold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Device Preview"
      >
        📱
      </motion.button>

      {/* Device Selector Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-4 z-[9998] bg-black/95 text-white rounded-lg shadow-2xl border border-blue-500/50 w-72 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 px-3 py-2">
              <span className="font-mono text-xs font-bold">📱 Device Preview</span>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Current selection */}
              <div className="text-[10px] font-mono mb-3">
                <span className="text-blue-300">Current:</span>{' '}
                <span className="font-bold">
                  {selectedPreset ? selectedPreset.name : 'Real Device'}
                </span>
              </div>

              {/* Preset buttons */}
              <div className="space-y-1.5">
                {DEVICE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] font-mono transition-colors ${
                      selectedPreset?.id === preset.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      {preset.width}×{preset.height} • DPR {preset.dpr}
                    </div>
                  </button>
                ))}
              </div>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-[11px] font-mono font-bold"
              >
                Reset to Real Device
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewport container */}
      {selectedPreset ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-auto">
          <div
            className="bg-white relative shadow-2xl"
            style={{
              width: `${selectedPreset.width}px`,
              height: `${selectedPreset.height}px`,
              transform: `scale(${selectedPreset.dpr / window.devicePixelRatio})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Safe area overlay visualization */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderTop: `${selectedPreset.safeArea.top}px solid rgba(255, 0, 0, 0.1)`,
                borderRight: `${selectedPreset.safeArea.right}px solid rgba(255, 0, 0, 0.1)`,
                borderBottom: `${selectedPreset.safeArea.bottom}px solid rgba(255, 0, 0, 0.1)`,
                borderLeft: `${selectedPreset.safeArea.left}px solid rgba(255, 0, 0, 0.1)`,
              }}
            />
            
            {/* Device info overlay */}
            <div className="absolute top-0 left-0 right-0 bg-black/80 text-white text-[8px] font-mono px-2 py-1 z-[9999] text-center">
              {selectedPreset.name} • {selectedPreset.width}×{selectedPreset.height} • DPR {selectedPreset.dpr}
            </div>

            {/* App content */}
            <div className="w-full h-full overflow-auto">{children}</div>
          </div>
        </div>
      ) : (
        // Normal rendering
        children
      )}
    </div>
  )
}
