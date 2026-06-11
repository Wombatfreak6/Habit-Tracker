import { useEffect, useRef } from 'react'
import { useHabitStore } from '../../stores/habitStore'

const BRANCH_COLOR = '#2A2235'
const BLOSSOM_COLOR = 'rgba(255, 183, 213,'
const PETAL_COLOR = 'rgba(255, 183, 213, 0.75)'
const MOON_COLOR = 'rgba(248, 247, 242, 0.06)'
const GOLD_COLOR = 'rgba(212, 168, 83,'

function drawTree(ctx, x, y, angle, depth, length, ratio) {
  if (depth === 0 || length < 2) return

  const endX = x + Math.cos(angle) * length
  const endY = y + Math.sin(angle) * length

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(endX, endY)
  ctx.strokeStyle = BRANCH_COLOR
  ctx.lineWidth = Math.max(0.5, depth * 1.1)
  ctx.lineCap = 'round'
  ctx.stroke()

  // Draw blossoms at tips based on ratio
  const blossomThreshold = 1 - ratio
  if (depth <= 2) {
    const rand = (Math.sin(x * 127.1 + y * 311.7) * 0.5 + 0.5)
    if (rand > blossomThreshold || ratio >= 1) {
      const glowSize = 5 + ratio * 4
      const alpha = 0.5 + ratio * 0.5
      // Glow halo
      const grd = ctx.createRadialGradient(endX, endY, 0, endX, endY, glowSize * 2)
      grd.addColorStop(0, `rgba(255,183,213,${alpha * 0.4})`)
      grd.addColorStop(1, 'rgba(255,183,213,0)')
      ctx.beginPath()
      ctx.arc(endX, endY, glowSize * 2, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
      // Core blossom
      ctx.beginPath()
      ctx.arc(endX, endY, glowSize * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = `${BLOSSOM_COLOR}${alpha})`
      ctx.fill()
    }
  }

  if (depth === 0) return

  const spread = 0.35 + (1 - ratio) * 0.1
  const subBranches = depth > 3 ? 2 : 3
  const angleStep = spread / (subBranches - 1)
  const startAngle = angle - spread / 2

  for (let i = 0; i < subBranches; i++) {
    const branchAngle = startAngle + i * angleStep + (Math.random() - 0.5) * 0.08
    drawTree(ctx, endX, endY, branchAngle, depth - 1, length * 0.72, ratio)
  }
}

function drawMoon(ctx, cx, cy) {
  const r = 90
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grd.addColorStop(0, 'rgba(248,247,242,0.10)')
  grd.addColorStop(0.5, 'rgba(248,247,242,0.04)')
  grd.addColorStop(1, 'rgba(248,247,242,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()
}

function drawGlow(ctx, cx, cy, ratio) {
  if (ratio <= 0) return
  const r = 100 + ratio * 80
  const alpha = ratio * 0.18
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grd.addColorStop(0, `rgba(255,183,213,${alpha})`)
  grd.addColorStop(1, 'rgba(255,183,213,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grd
  ctx.fill()
}

function drawGoldRing(ctx, cx, cy, progress) {
  if (progress <= 0) return
  const count = 8
  const ringR = 80
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const lx = cx + Math.cos(a) * ringR
    const ly = cy + Math.sin(a) * ringR
    ctx.save()
    ctx.globalAlpha = progress
    ctx.beginPath()
    // Lantern body
    ctx.ellipse(lx, ly, 5, 8, a, 0, Math.PI * 2)
    ctx.fillStyle = `${GOLD_COLOR}0.9)`
    ctx.fill()
    ctx.restore()
  }
}

export default function SakuraCanvas() {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const petalsRef = useRef([])
  const animFrameRef = useRef(null)
  const goldRingRef = useRef({ active: false, progress: 0, direction: 1 })

  const habits = useHabitStore(s => s.habits)
  const todayCompletions = useHabitStore(s => s.todayCompletions)
  const ratio = habits.length > 0 ? todayCompletions.length / habits.length : 0

  const initPetals = (width, height, count) => {
    return Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.4 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.04,
      phase: Math.random() * Math.PI * 2,
      size: 2.5 + Math.random() * 2,
    }))
  }

  const render = (canvas, ratio) => {
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const cx = W / 2
    const moonY = H * 0.28
    const treeBaseX = cx
    const treeBaseY = H - 10

    // Moon
    drawMoon(ctx, cx, moonY)

    // Glow behind crown
    drawGlow(ctx, cx, H * 0.35, ratio)

    // Tree (use seeded random for stability)
    const savedRandom = Math.random
    let seed = 42
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff
      return (seed >>> 0) / 0xffffffff
    }
    drawTree(ctx, treeBaseX, treeBaseY, -Math.PI / 2, 6, H * 0.28, ratio)
    Math.random = savedRandom

    // Gold ring at 100%
    if (ratio >= 1) {
      if (!goldRingRef.current.active) {
        goldRingRef.current = { active: true, progress: 0, direction: 1 }
      }
      const g = goldRingRef.current
      g.progress = Math.min(1, Math.max(0, g.progress + g.direction * 0.008))
      if (g.progress >= 1) g.direction = -1
      if (g.progress <= 0 && g.direction === -1) {
        g.active = false
        g.progress = 0
        g.direction = 1
      }
      drawGoldRing(ctx, cx, H * 0.35, g.progress)
    } else {
      goldRingRef.current = { active: false, progress: 0, direction: 1 }
    }

    // Petals
    const petalCount = Math.floor(ratio * 60)
    const petals = petalsRef.current
    while (petals.length < petalCount) {
      petals.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.4 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2,
        size: 2.5 + Math.random() * 2,
      })
    }
    petalsRef.current = petals.slice(0, petalCount)

    const t = Date.now() * 0.001
    for (const p of petalsRef.current) {
      p.x += p.vx + Math.sin(t + p.phase) * 0.3
      p.y += p.vy
      p.rot += p.rotV
      if (p.y > H + 10) {
        p.y = -10
        p.x = Math.random() * W
      }
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
      ctx.fillStyle = PETAL_COLOR
      ctx.fill()
      ctx.restore()
    }
  }

  // ResizeObserver — fills canvas correctly on mount and resize
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

  // Redraw when ratio changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    render(canvas, ratio)
  }, [ratio])

  // Animation loop for petals
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const loop = () => {
      if (canvas.width > 0 && canvas.height > 0) {
        render(canvas, ratio)
      }
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [ratio])

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      style={{ minHeight: '340px' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
