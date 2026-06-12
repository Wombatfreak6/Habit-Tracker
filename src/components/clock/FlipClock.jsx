import { useState, useEffect, useRef } from 'react'

// JAPANESE_DAYS indexed Monday=0
const JAPANESE_DAYS = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']
const ENGLISH_DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function pad(n) { return String(n).padStart(2, '0') }

/** Single clock digit card with fade-on-change animation */
function DigitCard({ value }) {
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value === prevRef.current) return
    // Fade out → swap → fade in
    setVisible(false)
    const t = setTimeout(() => {
      setDisplayed(value)
      prevRef.current = value
      setVisible(true)
    }, 80)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div
      style={{
        width: '80px',
        height: '90px',
        background: '#1A1A26',
        border: '1px solid rgba(255,183,213,0.12)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <span
        style={{
          fontFamily: '"Noto Serif JP", serif',
          fontSize: '54px',
          fontWeight: 300,
          color: '#F8F7F2',
          lineHeight: 1,
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transition: 'opacity 80ms ease',
          userSelect: 'none',
        }}
      >
        {displayed}
      </span>
    </div>
  )
}

/** Two sakura-pink dots between digit pairs */
function ColonDots() {
  const [bright, setBright] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setBright(b => !b), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        paddingBottom: '8px',
        flexShrink: 0,
      }}
    >
      {[0, 1].map(i => (
        <span
          key={i}
          style={{
            display: 'block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: bright ? '#FFB7D5' : 'rgba(255,183,213,0.18)',
            boxShadow: bright ? '0 0 8px rgba(255,183,213,0.6)' : 'none',
            transition: 'background 120ms, box-shadow 120ms',
          }}
        />
      ))}
    </div>
  )
}

export default function FlipClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hh = pad(time.getHours())
  const mm = pad(time.getMinutes())
  const ss = pad(time.getSeconds())

  // dow: 0=Sun → map to Mon-first index
  const dowIndex = (time.getDay() + 6) % 7
  const jpDay  = JAPANESE_DAYS[dowIndex]
  const enDay  = ENGLISH_DAYS[dowIndex]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px 16px',
        gap: '12px',
      }}
    >
      {/* Section label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <div className="font-serif" style={{ fontSize: '10px', color: '#5A5870', letterSpacing: '0.14em' }}>時刻</div>
        <div className="font-sans" style={{ fontSize: '10px', color: '#3A3848' }}>Current Time</div>
      </div>

      {/* Clock row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <DigitCard value={hh} />
        <ColonDots />
        <DigitCard value={mm} />
        <ColonDots />
        <DigitCard value={ss} />
      </div>

      {/* Day labels */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <div className="font-serif" style={{ fontSize: '11px', color: '#FFB7D5', letterSpacing: '0.08em' }}>
          {jpDay}
        </div>
        <div className="font-sans" style={{ fontSize: '12px', color: '#5A5870' }}>
          {enDay}
        </div>
      </div>
    </div>
  )
}
