import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import SakuraCanvas from './SakuraCanvas'
import { getSoundEnabled, toggleSound } from '../../lib/soundSystem'

// Seigaiha wave SVG divider
function WaveDivider() {
  return (
    <svg
      className="w-full"
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="seigaiha" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0 20 Q10 0 20 20 Q30 0 40 20"
            fill="none"
            stroke="rgba(255,183,213,0.12)"
            strokeWidth="1"
          />
          <path
            d="M-20 20 Q-10 0 0 20"
            fill="none"
            stroke="rgba(255,183,213,0.12)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="1200" height="40" fill="url(#seigaiha)" />
    </svg>
  )
}

export default function HeroSection() {
  const [soundOn, setSoundOn] = useState(getSoundEnabled())

  const handleSoundToggle = () => {
    const next = toggleSound()
    setSoundOn(next)
  }

  return (
    <div className="relative flex flex-col">
      {/* Hero canvas area */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '340px',
          background: 'linear-gradient(180deg, #0D0D1A 0%, #0B0B0F 100%)',
        }}
      >
        {/* Sway wrapper */}
        <div
          className="absolute inset-0"
          style={{
            animation: 'sway 4s ease-in-out infinite alternate',
            transformOrigin: 'bottom center',
          }}
        >
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
          title={soundOn ? 'Mute sounds' : 'Enable sounds'}
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
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

      {/* Wave divider */}
      <div style={{ marginTop: '-1px' }}>
        <WaveDivider />
      </div>
    </div>
  )
}
