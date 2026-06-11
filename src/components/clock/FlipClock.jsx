import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

function FlipDigit({ value, label }) {
  const [current, setCurrent] = useState(value)
  const [prev, setPrev] = useState(value)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    if (value !== current) {
      setPrev(current)
      setFlipping(true)
      const t = setTimeout(() => {
        setCurrent(value)
        setFlipping(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [value])

  const digits = String(current).padStart(2, '0')
  const prevDigits = String(prev).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative overflow-hidden select-none"
        style={{
          width: '64px',
          height: '80px',
          background: '#1A1A26',
          borderRadius: '6px',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
          perspective: '300px',
        }}
      >
        {/* Top half */}
        <div
          className="absolute top-0 left-0 w-full overflow-hidden flex items-end justify-center"
          style={{
            height: '50%',
            borderBottom: '1px solid rgba(255,183,213,0.15)',
            zIndex: 2,
          }}
        >
          <span
            className="font-serif text-moonlight pb-1"
            style={{ fontSize: '42px', lineHeight: '1', color: '#F8F7F2', fontWeight: 300 }}
          >
            {digits}
          </span>
        </div>

        {/* Bottom half */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden flex items-start justify-center"
          style={{ height: '50%', zIndex: 1 }}
        >
          <span
            className="font-serif pt-1"
            style={{ fontSize: '42px', lineHeight: '1', color: '#F8F7F2', fontWeight: 300, marginTop: '-40px' }}
          >
            {digits}
          </span>
        </div>

        {/* Flip animation overlay */}
        {flipping && (
          <div
            className="absolute top-0 left-0 w-full overflow-hidden flex items-end justify-center"
            style={{
              height: '50%',
              background: '#1A1A26',
              borderBottom: '1px solid rgba(255,183,213,0.15)',
              zIndex: 3,
              transformOrigin: 'bottom center',
              animation: 'flipDown 200ms ease-in forwards',
            }}
          >
            <span
              className="font-serif pb-1"
              style={{ fontSize: '42px', lineHeight: '1', color: '#F8F7F2', fontWeight: 300 }}
            >
              {prevDigits}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="font-sans" style={{ fontSize: '9px', color: '#5A5870', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  )
}

function Colon() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col gap-2 items-center pb-4">
      <div
        style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: visible ? '#FFB7D5' : 'rgba(255,183,213,0.2)',
          transition: 'background 100ms',
        }}
      />
      <div
        style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: visible ? '#FFB7D5' : 'rgba(255,183,213,0.2)',
          transition: 'background 100ms',
        }}
      />
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
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="font-serif text-xs tracking-widest mb-1" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>
        時刻
      </div>
      <div className="font-sans text-xs mb-2" style={{ color: '#5A5870' }}>Current Time</div>

      <div className="flex items-center gap-2">
        <FlipDigit value={hh} label="HH" />
        <Colon />
        <FlipDigit value={mm} label="MM" />
        <Colon />
        <FlipDigit value={ss} label="SS" />
      </div>
    </div>
  )
}
