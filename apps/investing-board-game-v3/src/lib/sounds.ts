/**
 * Sound Manager for Board Game V3
 * Uses Web Audio API to generate simple tones for game sound effects
 * TODO: Replace with actual sound files in /public/sounds/ when available
 */

export type SoundType =
  | 'dice-roll'
  | 'dice-land'
  | 'tile-land'
  | 'coin-collect'      // Small reward (coins, small stars)
  | 'star-collect'      // Medium reward
  | 'cash-collect'      // Cash rewards
  | 'cash-register'     // Legacy - maps to cash-collect
  | 'cha-ching'         // High rewards ($1000+)
  | 'big-win'           // Jackpot/legendary rewards
  | 'mega-jackpot'      // 200× premium tile wins
  | 'celebration'
  | 'button-click'
  | 'level-up'
  | 'achievement'       // Achievement unlocked
  | 'swipe-no'
  | 'error'
  | 'portal-ascend'
  | 'portal-descend'
  | 'mystery-box-open'  // Mystery box opening
  | 'mystery-box-reveal' // Mystery box result

export interface SoundSettings {
  volume: number // 0-1
  muted: boolean
}

/**
 * Get the appropriate reward sound based on reward type and amount
 */
export function getRewardSound(
  type: 'coins' | 'stars' | 'cash' | 'xp',
  amount: number
): SoundType {
  if (type === 'cash') {
    if (amount >= 100000) return 'mega-jackpot'  // $100K+ (premium tiles)
    if (amount >= 10000) return 'big-win'        // $10K+
    if (amount >= 1000) return 'cha-ching'       // $1K+
    return 'cash-collect'                         // < $1K
  }
  
  if (type === 'stars') {
    if (amount >= 1000) return 'big-win'         // 1000+ stars
    if (amount >= 100) return 'cha-ching'        // 100+ stars
    return 'star-collect'                         // < 100 stars
  }
  
  if (type === 'coins') {
    if (amount >= 2000) return 'cha-ching'       // 2000+ coins
    if (amount >= 500) return 'star-collect'     // 500+ coins
    return 'coin-collect'                         // < 500 coins
  }
  
  return 'coin-collect' // Default for XP and other
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
          this.playDiceRoll(now)
          return // Special handling

        case 'dice-land':
          this.playDiceLand(now)
          return // Special handling

        case 'tile-land':
          // Single soft beep (token landing)
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(400, now)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
          oscillator.start(now)
          oscillator.stop(now + 0.1)
          break

        case 'coin-collect':
          this.playCoinCollect(now)
          return // Special handling

        case 'star-collect':
          this.playStarCollect(now)
          return // Special handling

        case 'cash-collect':
          this.playCashCollect(now)
          return // Special handling

        case 'cash-register':
          // Legacy support - redirect to cash-collect
          this.playCashCollect(now)
          return // Special handling

        case 'cha-ching':
          this.playChaChing(now)
          return // Special handling

        case 'big-win':
          this.playBigWin(now)
          return // Special handling

        case 'mega-jackpot':
          this.playMegaJackpot(now)
          return // Special handling

        case 'celebration':
          this.playCelebration(now)
          return // Special handling

        case 'button-click':
          this.playButtonClick(now)
          return // Special handling

        case 'level-up':
          this.playLevelUp(now)
          return // Special handling

        case 'achievement':
          this.playAchievement(now)
          return // Special handling

        case 'swipe-no':
          // Short flick down (dismiss)
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(480, now)
          oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.12)
          gainNode.gain.setValueAtTime(this.settings.volume * 0.35, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
          oscillator.start(now)
          oscillator.stop(now + 0.12)
          break

        case 'error':
          this.playError(now)
          return // Special handling

        case 'portal-ascend':
          this.playPortalAscend(now)
          return // Special handling

        case 'portal-descend':
          this.playPortalDescend(now)
          return // Special handling

        case 'mystery-box-open':
          this.playMysteryBoxOpen(now)
          return // Special handling

        case 'mystery-box-reveal':
          this.playMysteryBoxReveal(now)
          return // Special handling
      }
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  /**
   * Play dice roll sound - soft clicking sounds like real dice
   */
  private playDiceRoll(startTime: number) {
    if (!this.audioContext) return

    // 4-5 soft taps in sequence using filtered noise
    const taps = 5
    const duration = 0.08
    
    for (let i = 0; i < taps; i++) {
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext.destination)
      
      const tapStart = startTime + i * duration
      osc.type = 'sine'
      
      // Randomize frequency slightly for natural feel
      const baseFreq = 250 + Math.random() * 150
      osc.frequency.setValueAtTime(baseFreq, tapStart)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, tapStart + 0.05)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.3, tapStart)
      gain.gain.exponentialRampToValueAtTime(0.001, tapStart + 0.06)
      osc.start(tapStart)
      osc.stop(tapStart + 0.07)
    }
  }

  /**
   * Play dice land sound - single soft thump when dice stops
   */
  private playDiceLand(startTime: number) {
    if (!this.audioContext) return

    // Low sine wave pulse
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(100, startTime)
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.1)
    
    gain.gain.setValueAtTime(this.settings.volume * 0.4, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)
    
    osc.start(startTime)
    osc.stop(startTime + 0.2)
    
    // Add subtle "settle" sound
    const settle = this.audioContext.createOscillator()
    const settleGain = this.audioContext.createGain()
    settle.connect(settleGain)
    settleGain.connect(this.audioContext.destination)
    
    settle.type = 'sine'
    settle.frequency.setValueAtTime(120, startTime + 0.08)
    settleGain.gain.setValueAtTime(this.settings.volume * 0.2, startTime + 0.08)
    settleGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)
    
    settle.start(startTime + 0.08)
    settle.stop(startTime + 0.2)
  }

  /**
   * Play coin collect sound - gentle two-note chime for small rewards
   */
  private playCoinCollect(startTime: number) {
    if (!this.audioContext) return

    // Two-note chime (fifth interval): C5 + G5
    const notes = [523, 784]
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * 0.05
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.25, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.5)
    })
  }

  /**
   * Play star collect sound - magical but gentle twinkle for medium rewards
   */
  private playStarCollect(startTime: number) {
    if (!this.audioContext) return

    // Three-note ascending: C5 → E5 → G5
    const notes = [523, 659, 784]
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * 0.08
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.3, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.5)
    })
    
    // Add subtle shimmer (high harmonic at low volume)
    const shimmer = this.audioContext.createOscillator()
    const shimmerGain = this.audioContext.createGain()
    shimmer.connect(shimmerGain)
    shimmerGain.connect(this.audioContext.destination)
    
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(1568, startTime + 0.16) // G6
    shimmerGain.gain.setValueAtTime(this.settings.volume * 0.15, startTime + 0.16)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5)
    
    shimmer.start(startTime + 0.16)
    shimmer.stop(startTime + 0.6)
  }

  /**
   * Play cash collect sound - pleasant cash sound for moderate cash rewards
   */
  private playCashCollect(startTime: number) {
    if (!this.audioContext) return

    // Soft descending two-note pattern
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()
    osc1.connect(gain1)
    gain1.connect(this.audioContext.destination)
    
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(440, startTime)
    gain1.gain.setValueAtTime(this.settings.volume * 0.3, startTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)
    
    osc1.start(startTime)
    osc1.stop(startTime + 0.3)
    
    const osc2 = this.audioContext.createOscillator()
    const gain2 = this.audioContext.createGain()
    osc2.connect(gain2)
    gain2.connect(this.audioContext.destination)
    
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(330, startTime + 0.08)
    gain2.gain.setValueAtTime(this.settings.volume * 0.3, startTime + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
    
    osc2.start(startTime + 0.08)
    osc2.stop(startTime + 0.35)
  }

  /**
   * Play cha-ching sound - satisfying cash register sound for high rewards
   */
  private playChaChing(startTime: number) {
    if (!this.audioContext) return
    
    // Part 1: Mechanical "ka" click
    const click = this.audioContext.createOscillator()
    const clickGain = this.audioContext.createGain()
    click.connect(clickGain)
    clickGain.connect(this.audioContext.destination)
    click.type = 'sine'
    click.frequency.setValueAtTime(300, startTime)
    click.frequency.exponentialRampToValueAtTime(150, startTime + 0.05)
    clickGain.gain.setValueAtTime(this.settings.volume * 0.3, startTime)
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)
    click.start(startTime)
    click.stop(startTime + 0.1)
    
    // Part 2: Bell "ching" (layered harmonics)
    const bellFreqs = [1200, 1800, 2400] // Harmonics for rich bell tone
    const bellStart = startTime + 0.05
    
    bellFreqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, bellStart)
      
      // Higher harmonics quieter
      const harmVolume = this.settings.volume * (0.4 - i * 0.1)
      gain.gain.setValueAtTime(harmVolume, bellStart)
      gain.gain.exponentialRampToValueAtTime(0.001, bellStart + 0.5)
      
      osc.start(bellStart)
      osc.stop(bellStart + 0.6)
    })
  }

  /**
   * Play big win sound - ascending jackpot melody for legendary rewards
   */
  private playBigWin(startTime: number) {
    if (!this.audioContext) return
    
    // Ascending arpeggio: C4 → E4 → G4 → C5 → E5 → G5
    const notes = [262, 330, 392, 523, 659, 784]
    const noteSpacing = 0.12
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * noteSpacing
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      // Each note builds in volume slightly
      const noteVolume = this.settings.volume * (0.25 + i * 0.05)
      gain.gain.setValueAtTime(0.001, noteStart)
      gain.gain.linearRampToValueAtTime(noteVolume, noteStart + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.5)
    })
    
    // Final shimmer on last note
    const shimmer = this.audioContext.createOscillator()
    const shimmerGain = this.audioContext.createGain()
    shimmer.connect(shimmerGain)
    shimmerGain.connect(this.audioContext.destination)
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(1568, startTime + notes.length * noteSpacing) // G6
    shimmerGain.gain.setValueAtTime(this.settings.volume * 0.15, startTime + notes.length * noteSpacing)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, startTime + notes.length * noteSpacing + 0.8)
    shimmer.start(startTime + notes.length * noteSpacing)
    shimmer.stop(startTime + notes.length * noteSpacing + 1)
  }

  /**
   * Play mega jackpot sound - epic but pleasant jackpot for 200× rewards
   */
  private playMegaJackpot(startTime: number) {
    if (!this.audioContext) return
    
    // Extended ascending arpeggio with more notes
    const notes = [262, 330, 392, 523, 659, 784, 988, 1047] // C4 to C6
    const noteSpacing = 0.10
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * noteSpacing
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      // Build up volume progressively
      const noteVolume = this.settings.volume * (0.3 + i * 0.06)
      gain.gain.setValueAtTime(0.001, noteStart)
      gain.gain.linearRampToValueAtTime(noteVolume, noteStart + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.6)
    })
    
    // Multiple shimmers for epic feel
    const shimmerFreqs = [1568, 1976, 2349]
    shimmerFreqs.forEach((freq, i) => {
      const shimmer = this.audioContext!.createOscillator()
      const shimmerGain = this.audioContext!.createGain()
      shimmer.connect(shimmerGain)
      shimmerGain.connect(this.audioContext!.destination)
      shimmer.type = 'sine'
      shimmer.frequency.setValueAtTime(freq, startTime + notes.length * noteSpacing + i * 0.1)
      shimmerGain.gain.setValueAtTime(this.settings.volume * 0.2, startTime + notes.length * noteSpacing + i * 0.1)
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, startTime + notes.length * noteSpacing + 1.0 + i * 0.1)
      shimmer.start(startTime + notes.length * noteSpacing + i * 0.1)
      shimmer.stop(startTime + notes.length * noteSpacing + 1.2 + i * 0.1)
    })
  }

  /**
   * Play celebration sound - confetti pop + descending chime cascade
   */
  private playCelebration(startTime: number) {
    if (!this.audioContext) return

    // Initial soft "pop" (noise burst simulation with quick sweep)
    const pop = this.audioContext.createOscillator()
    const popGain = this.audioContext.createGain()
    pop.connect(popGain)
    popGain.connect(this.audioContext.destination)
    pop.type = 'sine'
    pop.frequency.setValueAtTime(800, startTime)
    pop.frequency.exponentialRampToValueAtTime(200, startTime + 0.05)
    popGain.gain.setValueAtTime(this.settings.volume * 0.3, startTime)
    popGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05)
    pop.start(startTime)
    pop.stop(startTime + 0.06)

    // Descending chime cascade: G5 → E5 → C5 → G4
    const notes = [784, 659, 523, 392]
    const duration = 0.15

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)

      const noteStart = startTime + 0.1 + i * duration
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      gain.gain.setValueAtTime(this.settings.volume * 0.35, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration * 2)
      osc.start(noteStart)
      osc.stop(noteStart + duration * 2.5)
    })
  }

  /**
   * Play level up sound - elegant harp glissando
   */
  private playLevelUp(startTime: number) {
    if (!this.audioContext) return
    
    // Ascending glissando: C4 → D4 → E4 → F4 → G4 → A4 → B4 → C5
    const notes = [262, 294, 330, 349, 392, 440, 494, 523]
    const noteSpacing = 0.05
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * noteSpacing
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.3, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.25)
    })
    
    // Sustained final note with slow fade
    const finalNote = this.audioContext.createOscillator()
    const finalGain = this.audioContext.createGain()
    finalNote.connect(finalGain)
    finalGain.connect(this.audioContext.destination)
    finalNote.type = 'sine'
    finalNote.frequency.setValueAtTime(523, startTime + notes.length * noteSpacing) // C5
    finalGain.gain.setValueAtTime(this.settings.volume * 0.4, startTime + notes.length * noteSpacing)
    finalGain.gain.exponentialRampToValueAtTime(0.001, startTime + notes.length * noteSpacing + 0.5)
    finalNote.start(startTime + notes.length * noteSpacing)
    finalNote.stop(startTime + notes.length * noteSpacing + 0.6)
  }

  /**
   * Play achievement sound - similar to level up but shorter
   */
  private playAchievement(startTime: number) {
    if (!this.audioContext) return
    
    // Quick ascending arpeggio: C5 → E5 → G5 → C6
    const notes = [523, 659, 784, 1047]
    const noteSpacing = 0.08
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * noteSpacing
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.35, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.35)
    })
  }

  /**
   * Play button click sound - soft tactile pop
   */
  private playButtonClick(startTime: number) {
    if (!this.audioContext) return
    
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, startTime)
    gain.gain.setValueAtTime(this.settings.volume * 0.15, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03)
    
    osc.start(startTime)
    osc.stop(startTime + 0.04)
  }

  /**
   * Play error sound - gentle "nope" with two descending notes
   */
  private playError(startTime: number) {
    if (!this.audioContext) return
    
    // Two descending notes: E4 → C4
    const notes = [330, 262]
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * 0.12
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.2, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.15)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.2)
    })
  }

  /**
   * Play portal ascend sound - ascending magical whoosh
   */
  private playPortalAscend(startTime: number) {
    if (!this.audioContext) return
    
    // Sine sweep from 200Hz → 800Hz with shimmering harmonics
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, startTime)
    osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.8)
    
    gain.gain.setValueAtTime(0.001, startTime)
    gain.gain.linearRampToValueAtTime(this.settings.volume * 0.3, startTime + 0.2)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)
    
    osc.start(startTime)
    osc.stop(startTime + 0.9)
    
    // Add shimmer harmonic
    const shimmer = this.audioContext.createOscillator()
    const shimmerGain = this.audioContext.createGain()
    shimmer.connect(shimmerGain)
    shimmerGain.connect(this.audioContext.destination)
    
    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(400, startTime + 0.2)
    shimmer.frequency.exponentialRampToValueAtTime(1600, startTime + 0.8)
    shimmerGain.gain.setValueAtTime(this.settings.volume * 0.15, startTime + 0.2)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)
    
    shimmer.start(startTime + 0.2)
    shimmer.stop(startTime + 0.9)
  }

  /**
   * Play portal descend sound - descending but not scary
   */
  private playPortalDescend(startTime: number) {
    if (!this.audioContext) return
    
    // Sine sweep from 600Hz → 200Hz
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, startTime)
    osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.6)
    
    gain.gain.setValueAtTime(this.settings.volume * 0.3, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)
    
    osc.start(startTime)
    osc.stop(startTime + 0.7)
  }

  /**
   * Play mystery box open sound - anticipation sound
   */
  private playMysteryBoxOpen(startTime: number) {
    if (!this.audioContext) return
    
    // Rising anticipation sweep
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, startTime)
    osc.frequency.exponentialRampToValueAtTime(600, startTime + 0.3)
    
    gain.gain.setValueAtTime(this.settings.volume * 0.25, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)
    
    osc.start(startTime)
    osc.stop(startTime + 0.4)
  }

  /**
   * Play mystery box reveal sound - reveal based on rarity
   */
  private playMysteryBoxReveal(startTime: number) {
    if (!this.audioContext) return
    
    // Bright reveal chime - three overlapping notes
    const notes = [659, 784, 988] // E5, G5, B5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator()
      const gain = this.audioContext!.createGain()
      osc.connect(gain)
      gain.connect(this.audioContext!.destination)
      
      const noteStart = startTime + i * 0.05
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteStart)
      
      gain.gain.setValueAtTime(this.settings.volume * 0.3, noteStart)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.5)
      
      osc.start(noteStart)
      osc.stop(noteStart + 0.6)
    })
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
