/**
 * Device preset configurations for testing mobile UX
 */

export interface DevicePreset {
  id: string
  name: string
  width: number
  height: number
  dpr: number
  safeArea: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 320,
    height: 568,
    dpr: 2,
    safeArea: {
      top: 20,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  {
    id: 'iphone-12-mini',
    name: 'iPhone 12 mini',
    width: 360,
    height: 780,
    dpr: 3,
    safeArea: {
      top: 44,
      right: 0,
      bottom: 34,
      left: 0,
    },
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    dpr: 3,
    safeArea: {
      top: 59,
      right: 0,
      bottom: 34,
      left: 0,
    },
  },
  {
    id: 'android-small',
    name: 'Small Android',
    width: 360,
    height: 640,
    dpr: 2,
    safeArea: {
      top: 24,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
]

export function getPresetById(id: string): DevicePreset | undefined {
  return DEVICE_PRESETS.find((preset) => preset.id === id)
}
