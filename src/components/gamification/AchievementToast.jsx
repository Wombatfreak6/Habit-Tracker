import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAchievementStore, ACHIEVEMENTS } from '../../stores/achievementStore'

function AchievementToast({ achievementKey, onDismiss }) {
  const achievement = ACHIEVEMENTS[achievementKey]
  if (!achievement) return null

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [])

  const petals = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i / 6) * 360,
    dist: 30 + Math.random() * 20,
  }))

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative"
      style={{ width: '288px' }}
    >
      {/* Petal burst */}
      {petals.map(p => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist + 20, opacity: 0 }}
            transition={{ duration: 1, delay: 0.15 + p.id * 0.05 }}
            style={{
              position: 'absolute', top: '50%', left: '18%',
              width: '6px', height: '3.5px',
              borderRadius: '50%', background: 'rgba(255,183,213,0.8)',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Toast card */}
      <div
        onClick={onDismiss}
        className="relative flex items-start gap-3 px-4 py-3 cursor-pointer overflow-hidden"
        style={{
          background: '#1A1A26',
          borderLeft: '3px solid #D4A853',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,83,0.15)',
        }}
      >
        {/* Mon watermark — top right */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(212,168,83,0.10)',
            border: '1px solid rgba(212,168,83,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="rgba(212,168,83,0.3)" strokeWidth="0.8"/>
            <circle cx="9" cy="9" r="4.5" stroke="rgba(212,168,83,0.25)" strokeWidth="0.8"/>
            <line x1="2" y1="9" x2="16" y2="9" stroke="rgba(212,168,83,0.2)" strokeWidth="0.8"/>
            <line x1="9" y1="2" x2="9" y2="16" stroke="rgba(212,168,83,0.2)" strokeWidth="0.8"/>
          </svg>
        </div>

        <div
          className="flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,168,83,0.1)' }}
        >
          <span style={{ fontSize: '18px' }}>{achievement.icon}</span>
        </div>
        <div className="flex flex-col gap-0.5 pr-8">
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
          <AchievementToast key={key} achievementKey={key} onDismiss={() => markSeen(key)} />
        ))}
      </AnimatePresence>
    </div>
  )
}
