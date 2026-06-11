/**
 * Sound system using Web Audio API — no audio files needed.
 * AudioContext is lazily created on first user interaction.
 */

let audioCtx = null

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const isSoundEnabled = () =>
  localStorage.getItem('sakuraSoundEnabled') === 'true'

export const toggleSound = () => {
  const next = !isSoundEnabled()
  localStorage.setItem('sakuraSoundEnabled', String(next))
  return next
}

export const getSoundEnabled = () => isSoundEnabled()

/**
 * Play a tone with a proper gain envelope
 */
const playTone = (frequency, duration, volume, startDelay = 0, type = 'sine') => {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)

  const attackTime = 0.005
  const releaseTime = 0.035
  const sustainEnd = ctx.currentTime + startDelay + duration / 1000 - releaseTime

  gain.gain.setValueAtTime(0, ctx.currentTime + startDelay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + attackTime)
  gain.gain.setValueAtTime(volume, sustainEnd)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration / 1000)

  osc.start(ctx.currentTime + startDelay)
  osc.stop(ctx.currentTime + startDelay + duration / 1000 + 0.01)
}

/**
 * Habit checked: soft wooden chime — C5 + E5 blend, 120ms
 */
export const playHabitCheck = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(523.25, 120, 0.12)       // C5
    playTone(659.25, 120, 0.06, 0.01) // E5 harmony
  } catch (e) { console.warn('Sound error:', e) }
}

/**
 * All habits done: temple bell chord C5→E5→G5
 */
export const playAllDone = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(523.25, 200, 0.18, 0)    // C5
    playTone(659.25, 200, 0.18, 0.08) // E5
    playTone(783.99, 280, 0.18, 0.16) // G5 — longer release
  } catch (e) { console.warn('Sound error:', e) }
}

/**
 * Achievement: E5→A5 chord + shimmer arpeggio
 */
export const playAchievement = () => {
  if (!isSoundEnabled()) return
  try {
    playTone(659.25, 150, 0.2, 0)      // E5
    playTone(880.00, 220, 0.2, 0.19)   // A5
    // Shimmer arpeggio
    playTone(659.25, 40, 0.07, 0.42)   // E5
    playTone(783.99, 40, 0.07, 0.48)   // G5
    playTone(987.77, 40, 0.07, 0.54)   // B5
    playTone(1318.5, 40, 0.07, 0.60)   // E6
  } catch (e) { console.warn('Sound error:', e) }
}

/**
 * Mood selected: soft raindrop A4
 */
export const playMoodSelect = () => {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) { console.warn('Sound error:', e) }
}
