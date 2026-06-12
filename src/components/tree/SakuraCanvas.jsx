import { useEffect, useRef } from 'react'
import { useHabitStore } from '../../stores/habitStore'

// ─────────────────────────────────────────────────────────────────────
//  SHARED: 5-petal sakura flower
// ─────────────────────────────────────────────────────────────────────
function drawSakuraFlower(ctx, x, y, size, rotation, alpha, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 5)
    ctx.beginPath()
    ctx.ellipse(0, -size * 0.58, size * 0.32, size * 0.58, 0, 0, Math.PI * 2)
    ctx.fillStyle = color || (i % 2 === 0 ? '#FFB7D5' : '#FFC9E0')
    ctx.fill()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = '#FFE4F0'
  ctx.fill()
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────
//  FILLED TAPERED BEZIER BRANCH helper
// ─────────────────────────────────────────────────────────────────────
function drawFilledBezierBranch(ctx, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, wBase, wTip, color) {
  const dx  = x2 - x1
  const dy  = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx  = -dy / len
  const ny  =  dx / len

  ctx.beginPath()
  ctx.moveTo(x1 + nx * wBase, y1 + ny * wBase)
  ctx.bezierCurveTo(
    cp1x + nx * wBase * 0.7, cp1y + ny * wBase * 0.7,
    cp2x + nx * wTip  * 0.5, cp2y + ny * wTip  * 0.5,
    x2   + nx * wTip,        y2   + ny * wTip,
  )
  ctx.lineTo(x2 - nx * wTip, y2 - ny * wTip)
  ctx.bezierCurveTo(
    cp2x - nx * wTip  * 0.5, cp2y - ny * wTip  * 0.5,
    cp1x - nx * wBase * 0.7, cp1y - ny * wBase * 0.7,
    x1   - nx * wBase,       y1   - ny * wBase,
  )
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function addBarkLines(ctx, x1, y1, x2, y2, count = 3) {
  ctx.save()
  ctx.strokeStyle = 'rgba(20,10,4,0.4)'
  ctx.lineWidth   = 0.8
  ctx.lineCap     = 'round'
  for (let i = 0; i < count; i++) {
    const t1 = 0.15 + (i / count) * 0.6
    const t2 = t1 + 0.12
    const ox = (i % 2 === 0 ? 1 : -1) * (2 + i * 1.5)
    ctx.beginPath()
    ctx.moveTo(x1 + (x2 - x1) * t1 + ox, y1 + (y2 - y1) * t1)
    ctx.lineTo(x1 + (x2 - x1) * t2 + ox, y1 + (y2 - y1) * t2)
    ctx.stroke()
  }
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────
//  FULL BONSAI SCENE
// ─────────────────────────────────────────────────────────────────────
function drawBonsaiScene(ctx, W, H, ratio) {
  // ── Sway (inside draw loop — no CSS animation) ───────────────
  const now  = performance.now()
  const swayX = Math.sin(now * 0.00035) * 3.5
  const swayY = Math.sin(now * 0.00055) * 1.2

  ctx.clearRect(0, 0, W, H)

  const CX    = W * 0.5
  const POT_H = 32
  const BASE  = H - 30           // pot bottom reference
  const potY  = BASE - POT_H + 8
  const potW  = 130
  const potX  = CX - potW / 2
  const potRx = 6

  // TRUNK geometry
  const trunkBaseY = potY
  const trunkTopY  = trunkBaseY - 190

  // ── 1. Full moon (drawn before everything, no sway) ──────────
  const moonX = CX - 60
  const moonY = trunkTopY - 80
  const moonR = 55
  const moonOuterGrd = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90)
  moonOuterGrd.addColorStop(0,   'rgba(255,183,213,0.04)')
  moonOuterGrd.addColorStop(1,   'rgba(255,183,213,0)')
  ctx.beginPath()
  ctx.arc(moonX, moonY, 90, 0, Math.PI * 2)
  ctx.fillStyle = moonOuterGrd
  ctx.fill()

  const moonGrd = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR)
  moonGrd.addColorStop(0,   'rgba(248,247,242,0.10)')
  moonGrd.addColorStop(1,   'rgba(248,247,242,0)')
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  ctx.fillStyle = moonGrd
  ctx.fill()

  // ── 2. Sway starts here ──────────────────────────────────────
  ctx.save()
  ctx.translate(swayX, swayY)

  // ── 3. Bonsai pot ────────────────────────────────────────────
  // Feet
  ctx.fillStyle = '#221410'
  ctx.beginPath(); ctx.roundRect(potX + 14,        potY + POT_H, 16, 8, 2); ctx.fill()
  ctx.beginPath(); ctx.roundRect(potX + potW - 30,  potY + POT_H, 16, 8, 2); ctx.fill()

  // Pot body
  ctx.beginPath(); ctx.roundRect(potX, potY, potW, POT_H, potRx)
  ctx.fillStyle = '#2A1810'; ctx.fill()

  // Top rim
  ctx.beginPath()
  ctx.moveTo(potX + potRx, potY)
  ctx.lineTo(potX + potW - potRx, potY)
  ctx.strokeStyle = '#4A2A18'; ctx.lineWidth = 1; ctx.stroke()

  const potHl = ctx.createLinearGradient(potX, potY, potX, potY + 8)
  potHl.addColorStop(0, 'rgba(255,255,255,0.04)')
  potHl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = potHl
  ctx.beginPath(); ctx.roundRect(potX, potY, potW, 8, [potRx, potRx, 0, 0]); ctx.fill()

  // ── 4. Root buttress (4 roots) ───────────────────────────────
  const rootDefs = [
    { ex: CX - 35, spreadY: 6, reverse: false },
    { ex: CX - 20, spreadY: 4, reverse: false },
    { ex: CX + 20, spreadY: 4, reverse: true  },
    { ex: CX + 38, spreadY: 6, reverse: true  },
  ]
  ctx.fillStyle = '#3A2010'
  for (const root of rootDefs) {
    ctx.beginPath()
    ctx.moveTo(CX - 11, trunkBaseY)
    ctx.bezierCurveTo(
      (CX + root.ex) / 2, trunkBaseY + 2,
      root.ex - (root.reverse ? -10 : 10), trunkBaseY + root.spreadY,
      root.ex, trunkBaseY + root.spreadY,
    )
    ctx.lineTo(root.ex, trunkBaseY + root.spreadY + 2)
    ctx.bezierCurveTo(
      root.ex - (root.reverse ? -8 : 8), trunkBaseY + root.spreadY + 3,
      (CX + root.ex) / 2 + (root.reverse ? 4 : -4), trunkBaseY + 4,
      CX + 11, trunkBaseY,
    )
    ctx.fill()
  }

  // ── 5. Back-center bough (drawn FIRST = furthest back) ───────
  const boughBackX1 = CX
  const boughBackY1 = trunkBaseY - 185
  drawFilledBezierBranch(
    ctx,
    boughBackX1, boughBackY1,
    boughBackX1 + 10, boughBackY1 - 40,
    boughBackX1 + 25, boughBackY1 - 80,
    boughBackX1 + 32, boughBackY1 - 108,
    9, 3, '#2A1A10',
  )
  addBarkLines(ctx, boughBackX1, boughBackY1, boughBackX1 + 32, boughBackY1 - 108, 2)

  // ── 6. Trunk — filled S-curve shape ──────────────────────────
  const trunkGrd = ctx.createLinearGradient(CX - 11, 0, CX + 11, 0)
  trunkGrd.addColorStop(0,    '#2A1810')
  trunkGrd.addColorStop(0.35, '#4A3020')
  trunkGrd.addColorStop(0.65, '#5A3A28')
  trunkGrd.addColorStop(1,    '#2A1810')

  ctx.beginPath()
  // Left edge — S-curve
  ctx.moveTo(CX - 11, trunkBaseY)
  ctx.bezierCurveTo(
    CX - 38, trunkBaseY - 70,
    CX - 18, trunkBaseY - 130,
    CX - 22, trunkTopY,
  )
  // Top join
  ctx.lineTo(CX + 22, trunkTopY)
  // Right edge (reverse)
  ctx.bezierCurveTo(
    CX + 8,  trunkBaseY - 130,
    CX - 2,  trunkBaseY - 70,
    CX + 11, trunkBaseY,
  )
  ctx.closePath()
  ctx.fillStyle = trunkGrd
  ctx.fill()

  // Bark texture lines (6 thin beziers running down trunk)
  ctx.save()
  ctx.strokeStyle = 'rgba(20,10,4,0.4)'
  ctx.lineWidth   = 0.8
  ctx.lineCap     = 'round'
  for (let i = 0; i < 6; i++) {
    const ox = -9 + i * 4
    ctx.beginPath()
    ctx.moveTo(CX + ox, trunkTopY + 10)
    ctx.bezierCurveTo(
      CX + ox - 5, trunkTopY + 60,
      CX + ox + 3, trunkTopY + 120,
      CX + ox - 2, trunkBaseY - 10,
    )
    ctx.stroke()
  }
  // Bark cracks (3 diagonal)
  ctx.strokeStyle = 'rgba(20,10,4,0.3)'
  ctx.lineWidth   = 0.6
  const crackY = [trunkTopY + 50, trunkTopY + 100, trunkTopY + 140]
  for (const cy of crackY) {
    ctx.beginPath()
    ctx.moveTo(CX - 6, cy)
    ctx.lineTo(CX + 6, cy + 7)
    ctx.stroke()
  }
  ctx.restore()

  // ── 7. Left bough — windswept, droops then rises (S-curve) ───
  const lbX1 = CX - 4,  lbY1 = trunkBaseY - 160
  const lbCp1x = CX - 80, lbCp1y = lbY1 + 25   // droop left-down
  const lbCp2x = CX - 160, lbCp2y = lbY1 - 55  // rise toward tip
  const lbX2  = CX - 200, lbY2 = lbY1 - 45

  drawFilledBezierBranch(
    ctx, lbX1, lbY1, lbCp1x, lbCp1y, lbCp2x, lbCp2y, lbX2, lbY2,
    14, 6, '#3D2B1F',
  )
  addBarkLines(ctx, lbX1, lbY1, lbX2, lbY2, 2)

  // ── 8. Right bough — ascending at ~45° ───────────────────────
  const rbX1 = CX + 6,  rbY1 = trunkBaseY - 170
  const rbCp1x = CX + 70, rbCp1y = rbY1 - 40
  const rbCp2x = CX + 140, rbCp2y = rbY1 - 100
  const rbX2  = CX + 160, rbY2 = rbY1 - 118

  drawFilledBezierBranch(
    ctx, rbX1, rbY1, rbCp1x, rbCp1y, rbCp2x, rbCp2y, rbX2, rbY2,
    12, 5, '#3D2B1F',
  )
  addBarkLines(ctx, rbX1, rbY1, rbX2, rbY2, 2)

  // ── Helper: point on cubic bezier ────────────────────────────
  const bezierPoint = (t, x1, y1, c1x, c1y, c2x, c2y, x2, y2) => {
    const mt = 1 - t
    return {
      x: mt*mt*mt*x1 + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*x2,
      y: mt*mt*mt*y1 + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*y2,
    }
  }
  const bezierTangent = (t, x1, y1, c1x, c1y, c2x, c2y, x2, y2) => {
    const mt = 1 - t
    return {
      x: 3*mt*mt*(c1x-x1) + 6*mt*t*(c2x-c1x) + 3*t*t*(x2-c2x),
      y: 3*mt*mt*(c1y-y1) + 6*mt*t*(c2y-c1y) + 3*t*t*(y2-c2y),
    }
  }

  // ── 9. Secondary branches on each bough ──────────────────────
  const twigTips = []

  // collect secondary branch configs per bough
  const boughs = [
    {
      x1: lbX1, y1: lbY1, cp1x: lbCp1x, cp1y: lbCp1y,
      cp2x: lbCp2x, cp2y: lbCp2y, x2: lbX2, y2: lbY2,
      branches: [
        { t: 0.20, angle: -1.1, len: 55, wB: 6, wT: 2, seed: 101 },
        { t: 0.40, angle: -0.6, len: 50, wB: 5, wT: 2, seed: 202 },
        { t: 0.60, angle: -1.3, len: 44, wB: 5, wT: 2, seed: 303 },
        { t: 0.80, angle: -0.4, len: 40, wB: 4, wT: 2, seed: 404 },
      ],
    },
    {
      x1: rbX1, y1: rbY1, cp1x: rbCp1x, cp1y: rbCp1y,
      cp2x: rbCp2x, cp2y: rbCp2y, x2: rbX2, y2: rbY2,
      branches: [
        { t: 0.20, angle:  0.8, len: 52, wB: 6, wT: 2, seed: 501 },
        { t: 0.40, angle:  1.3, len: 48, wB: 5, wT: 2, seed: 602 },
        { t: 0.60, angle:  0.4, len: 44, wB: 5, wT: 2, seed: 703 },
        { t: 0.80, angle:  1.0, len: 38, wB: 4, wT: 2, seed: 804 },
      ],
    },
    {
      // back-center secondary branches
      x1: boughBackX1, y1: boughBackY1,
      cp1x: boughBackX1 + 10, cp1y: boughBackY1 - 40,
      cp2x: boughBackX1 + 25, cp2y: boughBackY1 - 80,
      x2: boughBackX1 + 32,   y2:  boughBackY1 - 108,
      branches: [
        { t: 0.4, angle: -0.6, len: 45, wB: 5, wT: 2, seed: 801 },
        { t: 0.7, angle:  0.4, len: 40, wB: 4, wT: 2, seed: 802 },
      ],
    },
  ]

  for (const bough of boughs) {
    const { x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, branches } = bough
    for (const br of branches) {
      const bp  = bezierPoint(br.t, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2)
      const tan = bezierTangent(br.t, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2)
      const baseAngle = Math.atan2(tan.y, tan.x)
      const angle = baseAngle + br.angle

      const brX2 = bp.x + Math.cos(angle) * br.len
      const brY2 = bp.y + Math.sin(angle) * br.len

      drawFilledBezierBranch(
        ctx,
        bp.x, bp.y,
        bp.x + Math.cos(angle) * br.len * 0.3, bp.y + Math.sin(angle) * br.len * 0.3,
        bp.x + Math.cos(angle) * br.len * 0.7, bp.y + Math.sin(angle) * br.len * 0.7,
        brX2, brY2,
        br.wB, br.wT, '#4A3020',
      )
      addBarkLines(ctx, bp.x, bp.y, brX2, brY2, 2)

      // Scatter blossom along secondary at 60% density
      for (let si = 1; si <= 3; si++) {
        const st = si / 4
        const sp = bezierPoint(st, bp.x, bp.y,
          bp.x + Math.cos(angle) * br.len * 0.3, bp.y + Math.sin(angle) * br.len * 0.3,
          bp.x + Math.cos(angle) * br.len * 0.7, bp.y + Math.sin(angle) * br.len * 0.7,
          brX2, brY2)
        if (Math.random() < 0.6) {
          twigTips.push({ x: sp.x, y: sp.y, seed: br.seed + si * 7, secondary: true })
        }
      }

      // Tertiary twigs
      const twigAngles = [-0.45, 0.35, -0.8]
      for (let ti = 0; ti < 3; ti++) {
        const ta  = angle + twigAngles[ti]
        const tl  = 22 + ((br.seed * (ti + 1) * 7919) % 1000) / 1000 * 14
        const tx2 = brX2 + Math.cos(ta) * tl
        const ty2 = brY2 + Math.sin(ta) * tl

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(brX2, brY2)
        ctx.lineTo(tx2, ty2)
        ctx.strokeStyle = '#5A3A28'
        ctx.lineWidth   = 1.2
        ctx.lineCap     = 'round'
        ctx.stroke()
        ctx.restore()

        twigTips.push({ x: tx2, y: ty2, seed: br.seed + ti * 13, secondary: false })
      }
      // Secondary branch tip also gets a cluster
      twigTips.push({ x: brX2, y: brY2, seed: br.seed + 999, secondary: false })
    }
  }

  // ── 10. Crown glow (behind blossoms at high ratio) ───────────
  if (ratio >= 0.8) {
    const glowAlpha = (ratio - 0.8) / 0.2
    const crownX = CX - 10
    const crownY = trunkTopY - 80
    const grd = ctx.createRadialGradient(crownX, crownY, 0, crownX, crownY, 200)
    grd.addColorStop(0,   `rgba(255,183,213,${0.08 * glowAlpha})`)
    grd.addColorStop(0.5, `rgba(255,183,213,${0.04 * glowAlpha})`)
    grd.addColorStop(1,   'rgba(255,183,213,0)')
    ctx.beginPath()
    ctx.ellipse(crownX, crownY, 300, 200, 0, 0, Math.PI * 2)
    ctx.fillStyle = grd
    ctx.fill()
  }

  // ── 11. Blossom clusters — scaled by ratio ───────────────────
  const totalTwigs = twigTips.length
  const clusterCount = Math.floor(totalTwigs * (0.15 + ratio * 0.85))
  const flowerCountPerCluster = Math.floor(8 + ratio * 6)   // 8→14
  const avgFlowerSize = 3.5 + ratio * 3.5                   // 3.5→7px

  // Deterministic seeded random
  const seededRng = (seed, n) => {
    let s = (seed * 127.1 + n * 311.7) % 1000
    s = Math.abs(Math.sin(s) * 43758.5453)
    return s - Math.floor(s)
  }

  const flowerColors = ['#FFB7D5', '#FFC9E0', '#FFD5E8']

  // Select which tips to render (always include the first 15% even at ratio=0)
  const activeTips = []
  for (let i = 0; i < totalTwigs; i++) {
    const tip = twigTips[i]
    const r = seededRng(tip.seed, 0)
    if (i < clusterCount || (ratio < 0.15 && r < 0.15)) {
      activeTips.push(tip)
    }
  }

  for (const tip of activeTips) {
    const { x, y, seed } = tip
    const isMinimum = ratio < 0.15
    const count = isMinimum
      ? Math.floor(4 + seededRng(seed, 1) * 4)   // 4–8 at minimum
      : flowerCountPerCluster
    const sz = isMinimum
      ? 3 + seededRng(seed, 2) * 1
      : avgFlowerSize

    for (let f = 0; f < count; f++) {
      const ox  = (seededRng(seed, f * 3 + 10) - 0.5) * 20
      const oy  = (seededRng(seed, f * 3 + 11) - 0.5) * 20
      const fsz = sz * (0.7 + seededRng(seed, f * 3 + 12) * 0.6)
      const rot = seededRng(seed, f * 3 + 13) * Math.PI * 2
      const alpha = isMinimum
        ? 0.4 + seededRng(seed, f * 3 + 14) * 0.2
        : 0.6 + seededRng(seed, f * 3 + 14) * 0.3
      const colorIdx = Math.floor(seededRng(seed, f * 3 + 15) * 3)
      drawSakuraFlower(ctx, x + ox, y + oy, fsz, rot, alpha, flowerColors[colorIdx])
    }
  }

  // ── 12. Sway ends ────────────────────────────────────────────
  ctx.restore()
}

// ─────────────────────────────────────────────────────────────────────
//  FALLING PETALS on hero canvas (tied to ratio)
// ─────────────────────────────────────────────────────────────────────
function renderHeroPetals(ctx, W, H, petals, ratio, t) {
  const count = Math.floor(ratio * 24)
  while (petals.length < count) {
    petals.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vy:    0.3 + Math.random() * 0.45,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.022,
      size:  3 + Math.random() * 3,
      alpha: 0.4 + Math.random() * 0.3,
      amp:   20 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
    })
  }
  while (petals.length > count) petals.pop()

  const colors = ['#FFB7D5', '#FFC9E0', '#FFD5E8']
  for (let i = 0; i < petals.length; i++) {
    const p = petals[i]
    p.x += Math.sin(t * 0.8 + p.phase) * 0.3
    p.y += p.vy
    p.rot += p.rotV
    if (p.y > H + 12) { p.y = -12; p.x = Math.random() * W }
    drawSakuraFlower(ctx, p.x, p.y, p.size, p.rot, p.alpha, colors[i % 3])
  }
}

// ─────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function SakuraCanvas() {
  const canvasRef  = useRef(null)
  const wrapperRef = useRef(null)
  const animRef    = useRef(null)
  const petalsRef  = useRef([])
  const ratioRef   = useRef(0)

  const habits           = useHabitStore(s => s.habits)
  const todayCompletions = useHabitStore(s => s.todayCompletions)
  const ratio = habits.length > 0 ? todayCompletions.length / habits.length : 0

  // Keep ratioRef in sync
  useEffect(() => { ratioRef.current = ratio }, [ratio])

  // ResizeObserver — syncs canvas buffer to CSS layout size
  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width  = e.contentRect.width
        canvas.height = e.contentRect.height
      }
    })
    obs.observe(wrapper)
    return () => obs.disconnect()
  }, [])

  // Animation loop — sway lives inside drawBonsaiScene via performance.now()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = (now) => {
      if (canvas.width > 0 && canvas.height > 0) {
        const r = ratioRef.current
        drawBonsaiScene(ctx, canvas.width, canvas.height, r)
        renderHeroPetals(ctx, canvas.width, canvas.height, petalsRef.current, r, now * 0.001)
      }
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', minHeight: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
