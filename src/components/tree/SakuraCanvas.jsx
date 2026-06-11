import { useEffect, useRef } from 'react'
import { useHabitStore } from '../../stores/habitStore'

// ─── Drawing helpers ──────────────────────────────────────────

function drawBranch(ctx, x1, y1, x2, y2, width, color) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}

function drawTrunk(ctx, baseX, baseY, W, H) {
  const trunkH = H * 0.38
  const topX = baseX - 8
  const topY = baseY - trunkH

  // Main trunk shape (filled bezier)
  ctx.beginPath()
  ctx.moveTo(baseX - 14, baseY)
  ctx.bezierCurveTo(baseX - 18, baseY - trunkH * 0.4, baseX - 22, baseY - trunkH * 0.7, topX - 6, topY)
  ctx.bezierCurveTo(topX + 2, topY - 2, topX + 10, topY, topX + 10, topY)
  ctx.bezierCurveTo(baseX + 16, baseY - trunkH * 0.65, baseX + 18, baseY - trunkH * 0.35, baseX + 14, baseY)
  ctx.closePath()
  ctx.fillStyle = '#2A1F1A'
  ctx.fill()

  // Texture lines along trunk
  const textures = [
    { x1: baseX - 4, y1: baseY - trunkH * 0.15, x2: baseX - 8, y2: baseY - trunkH * 0.55 },
    { x1: baseX + 4, y1: baseY - trunkH * 0.1, x2: baseX + 2, y2: baseY - trunkH * 0.5 },
    { x1: baseX - 8, y1: baseY - trunkH * 0.35, x2: baseX - 12, y2: baseY - trunkH * 0.65 },
  ]
  ctx.lineWidth = 0.8
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  for (const t of textures) {
    ctx.beginPath()
    ctx.moveTo(t.x1, t.y1)
    ctx.lineTo(t.x2, t.y2)
    ctx.stroke()
  }

  return { topX, topY, trunkH }
}

function drawBonsaiBranches(ctx, ratio) {
  // Will be called with the canvas ctx and habit ratio
}

function drawBlossomCluster(ctx, x, y, ratio, seed) {
  if (ratio <= 0) return
  const rand = (n) => {
    let s = seed + n * 127.1
    s = Math.sin(s) * 43758.5453123
    return s - Math.floor(s)
  }

  const threshold = 1 - ratio
  const r = rand(seed * 3.7)
  if (r < threshold) return

  const clusterSize = 3 + Math.floor(rand(seed * 1.3) * 4)
  for (let i = 0; i < clusterSize; i++) {
    const ox = (rand(i * 7.1) - 0.5) * 10
    const oy = (rand(i * 13.7) - 0.5) * 10
    const pr = 3 + rand(i * 4.1) * 4
    const alpha = 0.65 + rand(i * 2.3) * 0.35
    const light = rand(i * 9.3) > 0.5

    // Glow halo
    const grd = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, pr * 2.5)
    grd.addColorStop(0, `rgba(255,183,213,${alpha * 0.25 * ratio})`)
    grd.addColorStop(1, 'rgba(255,183,213,0)')
    ctx.beginPath()
    ctx.arc(x + ox, y + oy, pr * 2.5, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()

    // Petal
    ctx.beginPath()
    ctx.arc(x + ox, y + oy, pr, 0, Math.PI * 2)
    ctx.fillStyle = light ? `rgba(255,201,224,${alpha})` : `rgba(255,183,213,${alpha})`
    ctx.fill()
  }
}

function drawMoon(ctx, cx, cy) {
  const r = 80
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grd.addColorStop(0, 'rgba(248,247,242,0.1)')
  grd.addColorStop(0.5, 'rgba(248,247,242,0.04)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()
}

function drawMonPattern(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,183,213,0.04)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - r, y); ctx.lineTo(x + r, y)
  ctx.moveTo(x, y - r); ctx.lineTo(x, y + r)
  ctx.stroke()
}

function drawGoldRing(ctx, cx, cy, progress) {
  if (progress <= 0) return
  const count = 8
  const ringR = 95
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const lx = cx + Math.cos(a) * ringR
    const ly = cy + Math.sin(a) * ringR
    ctx.save()
    ctx.globalAlpha = progress * 0.85
    ctx.beginPath()
    ctx.ellipse(lx, ly, 5, 9, a, 0, Math.PI * 2)
    ctx.fillStyle = '#D4A853'
    ctx.fill()
    ctx.restore()
  }
}

function drawGlow(ctx, cx, cy, ratio) {
  if (ratio <= 0.05) return
  const r = 120 + ratio * 60
  const alpha = ratio * 0.16
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grd.addColorStop(0, `rgba(255,183,213,${alpha})`)
  grd.addColorStop(1, 'rgba(255,183,213,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()
}

function drawPot(ctx, baseX, baseY) {
  const pw = 120, ph = 28, rx = 4
  const px = baseX - pw / 2

  // Pot body
  ctx.beginPath()
  ctx.roundRect(px, baseY, pw, ph, rx)
  ctx.fillStyle = '#2A1A14'
  ctx.fill()

  // Rim highlight
  ctx.beginPath()
  ctx.moveTo(px + rx, baseY)
  ctx.lineTo(px + pw - rx, baseY)
  ctx.strokeStyle = '#4A3020'
  ctx.lineWidth = 1
  ctx.stroke()

  // Feet
  ctx.fillStyle = '#221410'
  ctx.fillRect(px + 16, baseY + ph, 16, 6)
  ctx.fillRect(px + pw - 32, baseY + ph, 16, 6)
}

// ─── Full bonsai tree drawing ──────────────────────────────────

function drawFullBonsai(ctx, W, H, ratio, goldRingRef) {
  ctx.clearRect(0, 0, W, H)

  const cx = W / 2
  const baseY = H - 40

  // Moon
  drawMoon(ctx, cx + 30, H * 0.22)

  // Mon decorations (subtle family crest patterns)
  drawMonPattern(ctx, cx - W * 0.28, H * 0.3, 20)
  drawMonPattern(ctx, cx + W * 0.22, H * 0.18, 16)
  drawMonPattern(ctx, cx - W * 0.1, H * 0.45, 12)

  // Crown glow
  drawGlow(ctx, cx - 8, H * 0.3, ratio)

  // Pot
  drawPot(ctx, cx, baseY + 4)

  // Trunk
  const trunkH = H * 0.40
  const trunkTopX = cx - 8
  const trunkTopY = baseY - trunkH

  // Draw filled trunk
  ctx.beginPath()
  ctx.moveTo(cx - 14, baseY)
  ctx.bezierCurveTo(cx - 20, baseY - trunkH * 0.35, cx - 24, baseY - trunkH * 0.65, trunkTopX - 6, trunkTopY)
  ctx.bezierCurveTo(trunkTopX + 2, trunkTopY - 3, trunkTopX + 10, trunkTopY, trunkTopX + 10, trunkTopY)
  ctx.bezierCurveTo(cx + 18, baseY - trunkH * 0.62, cx + 20, baseY - trunkH * 0.32, cx + 14, baseY)
  ctx.closePath()

  const trunkGrad = ctx.createLinearGradient(cx - 20, baseY, cx + 20, baseY)
  trunkGrad.addColorStop(0, '#2A1F1A')
  trunkGrad.addColorStop(0.5, '#3A2A22')
  trunkGrad.addColorStop(1, '#2A1F1A')
  ctx.fillStyle = trunkGrad
  ctx.fill()

  // Trunk texture
  ctx.save()
  ctx.lineWidth = 0.7
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  const lines = [
    [[cx - 2, baseY - 10], [cx - 6, baseY - trunkH * 0.45]],
    [[cx + 3, baseY - 15], [cx + 2, baseY - trunkH * 0.42]],
    [[cx - 10, baseY - trunkH * 0.25], [cx - 14, baseY - trunkH * 0.6]],
  ]
  for (const [[x1, y1], [x2, y2]] of lines) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
  ctx.restore()

  // ─── Boughs ────────────────────────────────────────────────

  const boughs = [
    // Left bough — curves left and slightly up
    {
      start: [trunkTopX - 2, trunkTopY + 10],
      cp1: [trunkTopX - 55, trunkTopY - 18],
      cp2: [trunkTopX - 100, trunkTopY - 45],
      end: [trunkTopX - 130, trunkTopY - 55],
      w: 13,
      branches: [
        { angle: -0.7, len: 50, w: 7, sub: [{ angle: -0.5, len: 32, w: 3, blossomSeed: 11 }, { angle: -1.1, len: 28, w: 3, blossomSeed: 22 }] },
        { angle: -1.3, len: 44, w: 6, sub: [{ angle: -0.9, len: 30, w: 3, blossomSeed: 33 }, { angle: -1.5, len: 26, w: 3, blossomSeed: 44 }] },
        { angle: -0.3, len: 38, w: 5, sub: [{ angle: -0.4, len: 26, w: 3, blossomSeed: 55 }] },
      ],
    },
    // Right bough — curves right and steeply up
    {
      start: [trunkTopX + 6, trunkTopY + 4],
      cp1: [trunkTopX + 60, trunkTopY - 30],
      cp2: [trunkTopX + 110, trunkTopY - 70],
      end: [trunkTopX + 145, trunkTopY - 90],
      w: 14,
      branches: [
        { angle: 0.5, len: 55, w: 8, sub: [{ angle: 0.3, len: 34, w: 3, blossomSeed: 66 }, { angle: 0.9, len: 30, w: 3, blossomSeed: 77 }] },
        { angle: 1.2, len: 48, w: 7, sub: [{ angle: 0.8, len: 32, w: 3, blossomSeed: 88 }, { angle: 1.4, len: 28, w: 3, blossomSeed: 99 }] },
        { angle: 0.2, len: 40, w: 5, sub: [{ angle: 0.1, len: 28, w: 3, blossomSeed: 110 }, { angle: 0.6, len: 24, w: 3, blossomSeed: 121 }] },
      ],
    },
    // Center bough — goes up, slightly right
    {
      start: [trunkTopX, trunkTopY],
      cp1: [trunkTopX + 10, trunkTopY - 30],
      cp2: [trunkTopX + 20, trunkTopY - 60],
      end: [trunkTopX + 25, trunkTopY - 80],
      w: 10,
      branches: [
        { angle: -0.4, len: 38, w: 5, sub: [{ angle: -0.3, len: 28, w: 3, blossomSeed: 132 }] },
        { angle: 0.5, len: 36, w: 5, sub: [{ angle: 0.4, len: 26, w: 3, blossomSeed: 143 }] },
      ],
    },
  ]

  for (const bough of boughs) {
    // Draw bough as bezier
    ctx.beginPath()
    ctx.moveTo(...bough.start)
    ctx.bezierCurveTo(...bough.cp1, ...bough.cp2, ...bough.end)
    ctx.strokeStyle = '#3A2A22'
    ctx.lineWidth = bough.w
    ctx.lineCap = 'round'
    ctx.stroke()

    // Draw sub-branches from bough end
    const [ex, ey] = bough.end

    for (const branch of bough.branches) {
      // Compute base angle from bough direction
      const dx = bough.end[0] - bough.cp2[0]
      const dy = bough.end[1] - bough.cp2[1]
      const baseAngle = Math.atan2(dy, dx)
      const ba = baseAngle + branch.angle

      const bx = ex + Math.cos(ba) * branch.len
      const by = ey + Math.sin(ba) * branch.len

      ctx.beginPath()
      ctx.moveTo(ex, ey)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = '#3A2A22'
      ctx.lineWidth = branch.w
      ctx.lineCap = 'round'
      ctx.stroke()

      // Sub-branches (twigs)
      for (const sub of branch.sub || []) {
        const sa = ba + sub.angle
        const sx = bx + Math.cos(sa) * sub.len
        const sy = by + Math.sin(sa) * sub.len

        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = '#4A3530'
        ctx.lineWidth = sub.w
        ctx.lineCap = 'round'
        ctx.stroke()

        // Blossom cluster at twig tip
        drawBlossomCluster(ctx, sx, sy, ratio, sub.blossomSeed)
      }

      // Blossom at branch tip too
      drawBlossomCluster(ctx, bx, by, ratio * 0.7, branch.sub?.[0]?.blossomSeed + 200 || 999)
    }
  }

  // Gold ring at 100%
  if (ratio >= 1) {
    const g = goldRingRef.current
    if (!g.active) { g.active = true; g.progress = 0; g.dir = 1 }
    g.progress = Math.min(1, Math.max(0, g.progress + g.dir * 0.007))
    if (g.progress >= 1) g.dir = -1
    if (g.progress <= 0 && g.dir === -1) { g.active = false; g.progress = 0; g.dir = 1 }
    drawGoldRing(ctx, cx - 8, trunkTopY - 40, g.progress)
  } else {
    goldRingRef.current = { active: false, progress: 0, dir: 1 }
  }
}

// ─── Falling petals (hero canvas only) ────────────────────────

function renderPetals(ctx, W, H, petals, ratio, t) {
  const count = Math.floor(ratio * 40)
  while (petals.length < count) {
    petals.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: 0.3 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.03,
      phase: Math.random() * Math.PI * 2,
      size: 2 + Math.random() * 2,
    })
  }
  // Trim excess
  while (petals.length > count) petals.pop()

  for (const p of petals) {
    p.x += p.vx + Math.sin(t + p.phase) * 0.25
    p.y += p.vy
    p.rot += p.rotV
    if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W }

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.beginPath()
    ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,183,213,0.7)'
    ctx.fill()
    ctx.restore()
  }
}

// ─── Component ────────────────────────────────────────────────

export default function SakuraCanvas() {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const animRef = useRef(null)
  const petalsRef = useRef([])
  const goldRingRef = useRef({ active: false, progress: 0, dir: 1 })

  const habits = useHabitStore(s => s.habits)
  const todayCompletions = useHabitStore(s => s.todayCompletions)
  const ratio = habits.length > 0 ? todayCompletions.length / habits.length : 0

  // ResizeObserver — fills canvas on mount and resize
  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width
        canvas.height = entry.contentRect.height
      }
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  // Re-draw when ratio changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    drawFullBonsai(canvas.getContext('2d'), canvas.width, canvas.height, ratio, goldRingRef)
  }, [ratio])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const loop = () => {
      if (canvas.width > 0 && canvas.height > 0) {
        const ctx = canvas.getContext('2d')
        drawFullBonsai(ctx, canvas.width, canvas.height, ratio, goldRingRef)
        renderPetals(ctx, canvas.width, canvas.height, petalsRef.current, ratio, Date.now() * 0.001)
      }
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [ratio])

  return (
    <div ref={wrapperRef} className="relative w-full h-full" style={{ minHeight: '340px' }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  )
}
