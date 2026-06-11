import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function PetalBurst({ origin, trigger }) {
  const [petals, setPetals] = useState([])

  useEffect(() => {
    if (!trigger || !origin) return
    const count = 8 + Math.floor(Math.random() * 5)
    const newPetals = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      angle: (i / count) * 360 + Math.random() * 20,
      distance: 40 + Math.random() * 50,
      size: 4 + Math.random() * 4,
      duration: 0.7 + Math.random() * 0.5,
      delay: Math.random() * 0.15,
    }))
    setPetals(newPetals)
    const t = setTimeout(() => setPetals([]), 1400)
    return () => clearTimeout(t)
  }, [trigger])

  if (!origin) return null

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: origin.x, top: origin.y }}
    >
      <AnimatePresence>
        {petals.map(p => {
          const rad = (p.angle * Math.PI) / 180
          const tx = Math.cos(rad) * p.distance
          const ty = Math.sin(rad) * p.distance
          return (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{
                x: tx,
                y: ty + 30,
                opacity: 0,
                scale: 0.3,
                rotate: p.angle + 180,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.55,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,183,213,0.85)',
                transformOrigin: 'center',
              }}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
