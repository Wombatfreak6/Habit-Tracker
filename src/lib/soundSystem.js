/**
 * Sound system using Web Audio API — no audio files needed.
 * All sounds respect the localStorage sound toggle (default: OFF).
 */

let audioCtx = null

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

const isSoundEnabled = () => {
  return localStorage.getItem('sakuraSoundEnabled') === 'true'
}

export const toggleSound = () => {
  const current = isSoundEnabled()
  localStorage.setItem('sakuraSoundEnabled', String(!current))
  return !current
}

export const getSoundEnabled = () => isSoundEnabled()

/**
 * Play a single sine-wave tone
 * @param {number} frequency - Hz
 * @param {number} duration - ms
 * @param {number} volume - 0 to 1
 * @param {number} startDelay - seconds from now
 */
const playTone = (frequency, duration, volume = 0.15, startDelay = 0) => {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration / 1000)

  oscillator.start(ctx.currentTime + startDelay)
  oscillator.stop(ctx.currentTime + startDelay + duration / 1000)
}

/**
 * Habit checked: Brief soft tone, C5 (523Hz), 80ms
 */
export const playHabitCheck = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(523.25, 80, 0.15)
  } catch (e) {
    console.warn('Sound playback failed:', e)
  }
}

/**
 * All habits done today: Three-tone ascending chord (C5, E5, G5)
 */
export const playAllDone = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(523.25, 200, 0.2, 0)      // C5
    playTone(659.25, 200, 0.2, 0.2)    // E5
    playTone(783.99, 200, 0.2, 0.4)    // G5
  } catch (e) {
    console.warn('Sound playback failed:', e)
  }
}

/**
 * Achievement unlocked: Two tones (E5 + A5)
 */
export const playAchievement = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(659.25, 150, 0.25, 0)     // E5
    playTone(880.00, 200, 0.25, 0.18)  // A5
  } catch (e) {
    console.warn('Sound playback failed:', e)
  }
}
