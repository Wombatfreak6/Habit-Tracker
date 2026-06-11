import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useAchievementStore, ACHIEVEMENTS } from '../../stores/achievementStore'

function AchievementToast({ achievementKey, onDismiss }) {
  const achievement = ACHIEVEMENTS[achievementKey]
  if (!achievement) return null

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [])

  // Mini petals around the toast
  const petals = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i / 6) * 360,
    distance: 30 + Math.random() * 20,
  }))

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
      style={{ width: '280px' }}
    >
      {/* Petal particles */}
      {petals.map(p => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * p.distance,
              y: Math.sin(rad) * p.distance + 20,
              opacity: 0,
            }}
            transition={{ duration: 1, delay: 0.2 + p.id * 0.05 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '20%',
              width: '6px',
              height: '3.5px',
              borderRadius: '50%',
              background: 'rgba(255,183,213,0.8)',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Toast card */}
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={onDismiss}
        style={{
          background: '#1A1A26',
          borderLeft: '3px solid #D4A853',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,83,0.15)',
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,168,83,0.1)' }}
        >
          <span style={{ fontSize: '18px' }}>{achievement.icon}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="font-sans text-xs" style={{ color: '#D4A853', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Achievement Unlocked
          </div>
          <div className="font-serif text-sm" style={{ color: '#F8F7F2' }}>{achievement.name}</div>
          <div className="font-sans text-xs" style={{ color: '#9B98B0' }}>{achievement.description}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AchievementToastContainer() {
  const pending = useAchievementStore(s => s.pending)
  const markSeen = useAchievementStore(s => s.markSeen)

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end"
      style={{ pointerEvents: pending.length > 0 ? 'auto' : 'none' }}
    >
      <AnimatePresence>
        {pending.map(key => (
          <AchievementToast
            key={key}
            achievementKey={key}
            onDismiss={() => markSeen(key)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
