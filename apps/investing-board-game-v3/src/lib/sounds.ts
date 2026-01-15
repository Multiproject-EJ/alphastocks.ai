/**
 * Sound Manager for Board Game V3
 * Uses Web Audio API to generate simple tones for game sound effects
 * TODO: Replace with actual sound files in /public/sounds/ when available
 */

export type SoundType =
  | 'dice-roll'
  | 'dice-land'
  | 'tile-land'
  | 'star-collect'
  | 'cash-register'
  | 'cha-ching'
  | 'celebration'
  | 'button-click'
  | 'level-up'
  | 'swipe-no'
  | 'error'
  | 'portal-ascend'
  | 'portal-descend'

export interface SoundSettings {
  volume: number // 0-1
  muted: boolean
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private settings: SoundSettings = {
    volume: 0.5,
    muted: false,
  }
  private initialized = false

  constructor() {
    this.loadSettings()
  }

  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  init() {
    if (this.initialized) return

    try {
      // Create audio context on first user interaction
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.initialized = true
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings() {
    try {
      const volume = localStorage.getItem('soundVolume')
      const muted = localStorage.getItem('soundMuted')

      if (volume !== null) {
        this.settings.volume = parseFloat(volume)
      }
      if (muted !== null) {
        this.settings.muted = muted === 'true'
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem('soundVolume', this.settings.volume.toString())
      localStorage.setItem('soundMuted', this.settings.muted.toString())
    } catch (error) {
      console.warn('Failed to save sound settings:', error)
    }
  }

  /**
   * Get current settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.settings.muted = !this.settings.muted
    this.saveSettings()
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean) {
    this.settings.muted = muted
    this.saveSettings()
  }

  /**
   * Play a sound effect
   */
  play(soundType: SoundType) {
    if (!this.initialized || !this.audioContext || this.settings.muted) {
      return
    }

    try {
      const now = this.audioContext.currentTime
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Configure sound based on type
      switch (soundType) {
        case 'dice-roll':
          // Quick ascending beep sequence (rolling sound)
          this.playDiceRoll(oscillator, gainNode, now)
          break

        case 'dice-land':
          // Double thud sound (dice landing)
          this.playDiceLand(oscillator, gainNode, now)
          break

        case 'tile-land':
          // Single soft beep (token landing)
          oscillator.frequency.setValueAtTime(400, now)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
          oscillator.start(now)
          oscillator.stop(now + 0.1)
          break

        case 'star-collect':
          // High-pitched ding (star collection)
          oscillator.frequency.setValueAtTime(800, now)
          oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.4, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          oscillator.start(now)
          oscillator.stop(now + 0.2)
          break

        case 'cash-register':
          // Low cash register beep (purchase sound)
          oscillator.frequency.setValueAtTime(200, now)
          oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.15)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.5, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
          oscillator.start(now)
          oscillator.stop(now + 0.15)
          break

        case 'cha-ching':
          // Bright up-chirp (success purchase)
          oscillator.frequency.setValueAtTime(520, now)
          oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.18)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.45, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          oscillator.start(now)
          oscillator.stop(now + 0.2)
          break

        case 'celebration':
          // Ascending arpeggio (celebration)
          this.playCelebration(now)
          return // Special handling, doesn't use single oscillator

        case 'button-click':
          // Quick click sound
          oscillator.frequency.setValueAtTime(600, now)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.2, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
          oscillator.start(now)
          oscillator.stop(now + 0.05)
          break

        case 'level-up':
          // Triumphant ascending tone
          oscillator.frequency.setValueAtTime(400, now)
          oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.3)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.5, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
          oscillator.start(now)
          oscillator.stop(now + 0.4)
          break

        case 'swipe-no':
          // Short flick down (dismiss)
          oscillator.frequency.setValueAtTime(480, now)
          oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.12)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.35, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
          oscillator.start(now)
          oscillator.stop(now + 0.12)
          break

        case 'error':
          // Descending tone (error)
          oscillator.frequency.setValueAtTime(400, now)
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          oscillator.start(now)
          oscillator.stop(now + 0.2)
          break

        case 'portal-ascend':
          // Ascending swirl (portal up)
          oscillator.frequency.setValueAtTime(300, now)
          oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.5)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.4, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
          oscillator.start(now)
          oscillator.stop(now + 0.6)
          break

        case 'portal-descend':
          // Descending whoosh (portal down)
          oscillator.frequency.setValueAtTime(800, now)
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.4, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
          oscillator.start(now)
          oscillator.stop(now + 0.6)
          break
      }
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  /**
   * Play dice roll sound (sequence of quick beeps)
   */
  private playDiceRoll(oscillator: OscillatorNode, gainNode: GainNode, startTime: number) {
    const frequencies = [300, 350, 400, 450, 500]
    const duration = 0.06
    
    oscillator.frequency.setValueAtTime(frequencies[0], startTime)
    gainNode.gain.setValueAtTime(this.settings.volume * 0.25, startTime)

    for (let i = 0; i < frequencies.length; i++) {
      const time = startTime + i * duration
      oscillator.frequency.setValueAtTime(frequencies[i], time)
      gainNode.gain.setValueAtTime(this.settings.volume * 0.25, time)
    }

    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + frequencies.length * duration)
    oscillator.start(startTime)
    oscillator.stop(startTime + frequencies.length * duration)
  }

  /**
   * Play dice land sound (double thud)
   */
  private playDiceLand(oscillator: OscillatorNode, gainNode: GainNode, startTime: number) {
    // First thud
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(150, startTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 0.08)
    gainNode.gain.setValueAtTime(this.settings.volume * 0.4, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)

    oscillator.start(startTime)
    oscillator.stop(startTime + 0.15)

    // Second thud (slightly quieter) - scheduled using audio context time for precision
    if (!this.audioContext) return
    const secondThudStart = startTime + 0.08
    const osc2 = this.audioContext.createOscillator()
    const gain2 = this.audioContext.createGain()
    osc2.connect(gain2)
    gain2.connect(this.audioContext.destination)
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(140, secondThudStart)
    osc2.frequency.exponentialRampToValueAtTime(90, secondThudStart + 0.06)
    gain2.gain.setValueAtTime(this.settings.volume * 0.3, secondThudStart)
    gain2.gain.exponentialRampToValueAtTime(0.001, secondThudStart + 0.06)
    osc2.start(secondThudStart)
    osc2.stop(secondThudStart + 0.1)
  }

  /**
   * Play celebration sound (ascending arpeggio)
   */
  private playCelebration(startTime: number) {
    if (!this.audioContext) return

    const notes = [262, 330, 392, 523] // C, E, G, C (major chord)
    const duration = 0.15

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)

      const noteStart = startTime + i * duration
      osc.frequency.setValueAtTime(freq, noteStart)
      gain.gain.setValueAtTime(this.settings.volume * 0.4, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration * 2)
      osc.start(noteStart)
      osc.stop(noteStart + duration * 2)
    })
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
