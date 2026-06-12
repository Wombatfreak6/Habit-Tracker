import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import SakuraCanvas from './SakuraCanvas'
import { getSoundEnabled, toggleSound } from '../../lib/soundSystem'

// Single elegant gradient line — no waves, no scallops
function GradientDivider() {
  return (
    <div
      style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(to right, transparent 0%, rgba(255,183,213,0.25) 20%, rgba(255,183,213,0.4) 50%, rgba(255,183,213,0.25) 80%, transparent 100%)',
        margin: 0,
      }}
    />
  )
}

export default function HeroSection() {
  const [soundOn, setSoundOn] = useState(getSoundEnabled)

  const handleSoundToggle = () => {
    const next = toggleSound()
    setSoundOn(next)
  }

  return (
    <div className="relative flex flex-col">
      {/* Hero canvas area — NO sway wrapper; sway lives inside SakuraCanvas via ctx.translate */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '340px',
          background: 'linear-gradient(180deg, #0D0D1A 0%, #0B0B0F 100%)',
        }}
      >
        {/* Canvas wrapper — plain div, no CSS animation */}
        <div style={{ width: '100%', height: '100%', minHeight: 0 }}>
          <SakuraCanvas />
        </div>

        {/* Sound toggle */}
        <button
          onClick={handleSoundToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-md transition-colors"
          style={{
            background: 'rgba(26,26,38,0.6)',
            border: '1px solid rgba(255,183,213,0.15)',
            color: soundOn ? '#FFB7D5' : '#5A5870',
          }}
          title={soundOn ? '音 / Mute' : '音 / Sound On'}
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
          id="sound-toggle"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Section label overlay */}
        <div className="absolute bottom-4 left-5 z-10">
          <div
            className="font-serif text-xs tracking-widest"
            style={{ color: 'rgba(155,152,176,0.7)', letterSpacing: '0.12em' }}
          >
            桜の習慣
          </div>
          <div className="font-sans text-xs" style={{ color: 'rgba(90,88,112,0.8)' }}>
            Living Sakura Tree
          </div>
        </div>
      </div>

      {/* Gradient line divider — clean, no waves */}
      <GradientDivider />
    </div>
  )
}
