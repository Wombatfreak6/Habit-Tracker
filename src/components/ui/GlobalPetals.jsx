import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// ── Draw a proper 5-petal sakura flower ──────────────────────
function drawSakuraFlower(ctx, x, y, size, rotation, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -size * 0.6, size * 0.35, size * 0.6, 0, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? '#FFB7D5' : '#FFC9E0'
    ctx.fill()
    ctx.restore()
  }
  // Center circle
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = '#FFE4F0'
  ctx.fill()
  ctx.restore()
}

// Spawn petals spread ACROSS screen (not above it) so they appear instantly
function makePetals(W, H) {
  return Array.from({ length: 40 }, () => ({
    x:      Math.random() * W,
    y:      Math.random() * H,           // distributed across screen, not above
    vy:     0.35 + Math.random() * 0.55,
    rot:    Math.random() * Math.PI * 2,
    rotV:   (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.014),
    size:   5 + Math.random() * 6,       // 5–11 px
    alpha:  0.35 + Math.random() * 0.30,
    amp:    25 + Math.random() * 30,     // 25–55 px drift amplitude
    period: 2800 + Math.random() * 2800,
    phase:  Math.random() * Math.PI * 2,
  }))
}

export default function GlobalPetals() {
  const canvasRef      = useRef(null)
  const petalsRef      = useRef([])
  const animRef        = useRef(null)
  const isRunningRef   = useRef(false)
  const canvasSizeRef  = useRef({ w: 0, h: 0 })

  // Opacity state for fade in/out
  const canvasOpacityRef = useRef(1)
  const targetOpacityRef = useRef(1)
  const fadeStartRef     = useRef(null)
  const FADE_MS = 800

  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('sakuraPetalsEnabled')
    return stored === null ? true : stored === 'true'
  })

  // ── Canvas sizing + petal init ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      canvasSizeRef.current = { w: canvas.width, h: canvas.height }
      // Re-initialise petals on first call
      if (petalsRef.current.length === 0) {
        petalsRef.current = makePetals(canvas.width, canvas.height)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Toggle — reinit petals on re-enable, fix stale closure ───
  useEffect(() => {
    // FIX: Reinitialise petals so they appear immediately across screen
    const canvas = canvasRef.current
    if (canvas && enabled) {
      petalsRef.current = makePetals(canvas.width, canvas.height)
    }

    targetOpacityRef.current = enabled ? 1 : 0
    fadeStartRef.current     = performance.now()
    localStorage.setItem('sakuraPetalsEnabled', String(enabled))

    // Restart loop if it was paused
    if (enabled && !isRunningRef.current) {
      startLoop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // ── Animation loop ────────────────────────────────────────
  function startLoop() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    isRunningRef.current = true

    const loop = (now) => {
      const { w, h } = canvasSizeRef.current
      ctx.clearRect(0, 0, w, h)

      // ── Fade opacity ──────────────────────────────────────
      if (fadeStartRef.current !== null) {
        const elapsed = now - fadeStartRef.current
        const t       = Math.min(1, elapsed / FADE_MS)
        const from    = enabled ? 0 : 1
        const to      = enabled ? 1 : 0
        canvasOpacityRef.current = from + (to - from) * t
        if (t >= 1) fadeStartRef.current = null
      }

      const opacity = canvasOpacityRef.current

      // Pause loop when fully hidden
      if (opacity <= 0.005 && targetOpacityRef.current === 0) {
        isRunningRef.current = false
        return
      }

      // ── Draw petals ───────────────────────────────────────
      const t = now * 0.001
      for (const p of petalsRef.current) {
        p.x  += Math.sin(t * (1000 / p.period) * Math.PI * 2 + p.phase) * (p.amp / p.period) * 12
        p.y  += p.vy
        p.rot += p.rotV

        // Wrap at bottom
        if (p.y > h + 16) {
          p.y = -16
          p.x = Math.random() * w
        }

        drawSakuraFlower(ctx, p.x, p.y, p.size, p.rot, p.alpha * opacity)
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    startLoop()
    return () => {
      cancelAnimationFrame(animRef.current)
      isRunningRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Full-screen overlay canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        9999,
          pointerEvents: 'none',
          width:         '100vw',
          height:        '100vh',
        }}
        aria-hidden
      />

      {/* Petal-rain toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              setEnabled(e => {
                const next = !e
                localStorage.setItem('sakuraPetalsEnabled', String(next))
                return next
              })
            }}
            id="petal-toggle"
            title={enabled ? '桜吹雪 ON' : '桜吹雪 OFF'}
            aria-label={enabled ? 'Disable petal rain' : 'Enable petal rain'}
            style={{
              position:       'fixed',
              bottom:         '24px',
              left:           '24px',
              zIndex:         10000,
              width:          '40px',
              height:         '40px',
              borderRadius:   '50%',
              background:     'rgba(26,26,38,0.85)',
              backdropFilter: 'blur(8px)',
              border:          enabled
                ? '1px solid rgba(255,183,213,0.5)'
                : '1px solid rgba(255,183,213,0.15)',
              boxShadow: enabled ? '0 0 12px rgba(255,183,213,0.2)' : 'none',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              transition:      'border-color 300ms, box-shadow 300ms',
            }}
          >
            {/* 5-petal sakura SVG icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              {[0, 72, 144, 216, 288].map((deg, i) => {
                const rad = (deg - 90) * (Math.PI / 180)
                const cx  = 10 + Math.cos(rad) * 4.5
                const cy  = 10 + Math.sin(rad) * 4.5
                return (
                  <ellipse
                    key={i}
                    cx={cx} cy={cy}
                    rx="3.6" ry="2.2"
                    transform={`rotate(${deg}, ${cx}, ${cy})`}
                    fill={enabled ? (i % 2 === 0 ? '#FFB7D5' : '#FFC9E0') : 'rgba(255,183,213,0.3)'}
                  />
                )
              })}
              <circle cx="10" cy="10" r="1.8" fill={enabled ? '#FFE4F0' : 'rgba(255,183,213,0.2)'} />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}
        >
          <div className="font-serif text-xs" style={{ color: '#FFB7D5' }}>桜吹雪</div>
          <div className="font-sans text-xs" style={{ color: '#5A5870' }}>Petal Rain</div>
        </TooltipContent>
      </Tooltip>
    </>
  )
}
