import { useState, useEffect } from 'react'
import { format } from 'date-fns'

function FlipDigit({ value }) {
  const [current, setCurrent] = useState(value)
  const [prev, setPrev] = useState(value)
  const [phase, setPhase] = useState('idle') // 'idle' | 'top-flip' | 'show-new'

  useEffect(() => {
    if (value === current) return
    setPrev(current)
    setPhase('top-flip')

    const t1 = setTimeout(() => {
      setCurrent(value)
      setPhase('show-new')
    }, 160)
    const t2 = setTimeout(() => setPhase('idle'), 320)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [value])

  const display = String(current).padStart(2, '0')
  const prevDisplay = String(prev).padStart(2, '0')

  return (
    <div
      style={{
        position: 'relative',
        width: '72px',
        height: '88px',
        perspective: '400px',
        flexShrink: 0,
      }}
    >
      {/* Card background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#1A1A26',
          borderRadius: '8px',
          border: '1px solid rgba(255,183,213,0.12)',
          boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Top half — current digit */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '52px',
              fontWeight: 300,
              color: '#F8F7F2',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              paddingBottom: '0px',
              userSelect: 'none',
            }}
          >
            {display}
          </span>
        </div>

        {/* Split line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 5,
          }}
        />

        {/* Bottom half — current digit */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '52px',
              fontWeight: 300,
              color: '#F8F7F2',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: '-44px',
              userSelect: 'none',
            }}
          >
            {display}
          </span>
        </div>
      </div>

      {/* Flip overlay — top half animates away */}
      {phase === 'top-flip' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: '#1A1A26',
            borderRadius: '8px 8px 0 0',
            border: '1px solid rgba(255,183,213,0.12)',
            borderBottom: 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            transformOrigin: 'bottom center',
            animation: 'flipDown 160ms ease-in forwards',
            zIndex: 10,
            backfaceVisibility: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '52px',
              fontWeight: 300,
              color: '#F8F7F2',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {prevDisplay}
          </span>
        </div>
      )}

      {/* Flip overlay — bottom half of new digit reveals */}
      {phase === 'show-new' && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: '#1A1A26',
            borderRadius: '0 0 8px 8px',
            border: '1px solid rgba(255,183,213,0.12)',
            borderTop: 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            transformOrigin: 'top center',
            animation: 'flipUp 160ms ease-out forwards',
            zIndex: 10,
            backfaceVisibility: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '52px',
              fontWeight: 300,
              color: '#F8F7F2',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: '-44px',
              userSelect: 'none',
            }}
          >
            {display}
          </span>
        </div>
      )}
    </div>
  )
}

function ColonDots() {
  const [bright, setBright] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setBright(b => !b), 500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center gap-2" style={{ paddingBottom: '12px' }}>
      {[0, 1].map(i => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: bright ? '#FFB7D5' : 'rgba(255,183,213,0.2)',
            transition: 'background 120ms',
            boxShadow: bright ? '0 0 6px rgba(255,183,213,0.5)' : 'none',
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

  const hh = format(time, 'HH')
  const mm = format(time, 'mm')
  const ss = format(time, 'ss')

  return (
    <div className="flex flex-col items-center py-5 gap-3">
      <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>時刻</div>
      <div className="font-sans text-xs" style={{ color: '#5A5870', marginTop: '-8px' }}>Current Time</div>

      <div className="flex items-center gap-1.5">
        <FlipDigit value={hh} />
        <ColonDots />
        <FlipDigit value={mm} />
        <ColonDots />
        <FlipDigit value={ss} />
      </div>

      <div className="font-sans text-xs" style={{ color: '#5A5870', marginTop: '2px' }}>
        {format(time, 'EEEE')}
      </div>
    </div>
  )
}
