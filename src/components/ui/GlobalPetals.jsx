import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function drawSakuraFlower(ctx, x, y, radius, rotation, color) {
  const petalCount = 5
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.fillStyle = color
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const px = Math.cos(angle) * radius * 0.6
    const py = Math.sin(angle) * radius * 0.6
    ctx.beginPath()
    ctx.ellipse(px, py, radius * 0.55, radius * 0.38, angle, 0, Math.PI * 2)
    ctx.fill()
  }
  // Center dot
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,201,224,0.7)'
  ctx.fill()
  ctx.restore()
}

function initPetals(W, H) {
  return Array.from({ length: 35 }, (_, i) => ({
    x: Math.random() * W,
    y: -20 - Math.random() * H, // stagger initial y
    vy: 0.4 + Math.random() * 0.7,
    vx: (Math.random() - 0.5) * 0.3,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.018 + (Math.random() > 0.5 ? 0.008 : -0.008),
    amp: 30 + Math.random() * 30,
    period: 3000 + Math.random() * 3000,
    phase: Math.random() * Math.PI * 2,
    radius: 3 + Math.random() * 2,
    alpha: 0.35 + Math.random() * 0.2,
    hue: Math.random() > 0.5 ? '255,183,213' : '255,199,224',
  }))
}

export default function GlobalPetals() {
  const canvasRef = useRef(null)
  const petalsRef = useRef([])
  const animRef = useRef(null)
  const opacityRef = useRef(1)
  const targetOpacityRef = useRef(1)
  const fadeStartRef = useRef(null)

  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('sakuraPetalsEnabled')
    return stored === null ? true : stored === 'true'
  })

  // Init canvas size & petals
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    petalsRef.current = initPetals(window.innerWidth, window.innerHeight)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fade logic
  useEffect(() => {
    targetOpacityRef.current = enabled ? 1 : 0
    fadeStartRef.current = Date.now()
    localStorage.setItem('sakuraPetalsEnabled', String(enabled))
  }, [enabled])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Fade opacity
      const now = Date.now()
      const fadeDuration = 800
      if (fadeStartRef.current !== null) {
        const elapsed = now - fadeStartRef.current
        const t = Math.min(1, elapsed / fadeDuration)
        const from = enabled ? 0 : 1
        const to = enabled ? 1 : 0
        opacityRef.current = from + (to - from) * t
        if (t >= 1) fadeStartRef.current = null
      }

      if (opacityRef.current <= 0.01) {
        animRef.current = requestAnimationFrame(loop)
        return
      }

      ctx.globalAlpha = opacityRef.current

      const t = now * 0.001
      for (const p of petalsRef.current) {
        p.x += p.vx + Math.sin(t * (1000 / p.period) * Math.PI * 2 + p.phase) * 0.35
        p.y += p.vy
        p.rot += p.rotV
        if (p.y > H + 20) {
          p.y = -20
          p.x = Math.random() * W
        }
        drawSakuraFlower(ctx, p.x, p.y, p.radius, p.rot, `rgba(${p.hue},${p.alpha})`)
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          width: '100vw',
          height: '100vh',
        }}
        aria-hidden
      />

      {/* Petal toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setEnabled(e => !e)}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              zIndex: 10000,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(26,26,38,0.85)',
              backdropFilter: 'blur(8px)',
              border: enabled
                ? '1px solid rgba(255,183,213,0.6)'
                : '1px solid rgba(255,183,213,0.2)',
              boxShadow: enabled ? '0 0 12px rgba(255,183,213,0.2)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 300ms, box-shadow 300ms',
            }}
            aria-label={enabled ? 'Disable petal rain' : 'Enable petal rain'}
            id="petal-toggle"
          >
            {/* Sakura petal SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {[0,72,144,216,288].map((deg, i) => {
                const rad = (deg * Math.PI) / 180
                const px = 9 + Math.cos(rad) * 4
                const py = 9 + Math.sin(rad) * 4
                return (
                  <ellipse
                    key={i}
                    cx={px} cy={py}
                    rx="3.5" ry="2.4"
                    transform={`rotate(${deg}, ${px}, ${py})`}
                    fill={enabled ? 'rgba(255,183,213,0.9)' : 'rgba(255,183,213,0.35)'}
                  />
                )
              })}
              <circle cx="9" cy="9" r="1.8" fill={enabled ? '#FFC9E0' : 'rgba(255,183,213,0.3)'} />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#F8F7F2' }}
        >
          <div className="font-serif text-xs" style={{ color: '#5A5870' }}>桜吹雪 / Petal Rain</div>
        </TooltipContent>
      </Tooltip>
    </>
  )
}
