import { motion } from 'framer-motion'
import { useMoodStore, MOODS } from '../../stores/moodStore'
import { useUserStore } from '../../stores/userStore'
import { playMoodSelect } from '../../lib/soundSystem'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// SVG Mood Icons
function StormIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <ellipse cx="18" cy="14" rx="10" ry="7" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
      <ellipse cx="10" cy="12" rx="6" ry="5" fill="#1E1E2E" stroke="#5A5870" strokeWidth="1"/>
      <ellipse cx="25" cy="12" rx="5" ry="4" fill="#222230" stroke="#5A5870" strokeWidth="1"/>
      <path d="M16 20 L13 27 L18 24 L15 31" stroke="#FFB7D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
      </path>
      <path d="M22 22 L20 27 L24 25 L22 30" stroke="#FFB7D5" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/>
      </path>
    </svg>
  )
}
function RainIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <ellipse cx="18" cy="12" rx="10" ry="6" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
      <ellipse cx="11" cy="11" rx="5" ry="4" fill="#222230"/>
      {[12,16,20,24].map((x,i) => (
        <line key={x} x1={x} y1="20" x2={x-2} y2="30" stroke="#9B98B0" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="y1" values="18;22" dur={`${0.7+i*0.15}s`} repeatCount="indefinite"/>
          <animate attributeName="y2" values="28;32" dur={`${0.7+i*0.15}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur={`${0.7+i*0.15}s`} repeatCount="indefinite"/>
        </line>
      ))}
    </svg>
  )
}
function CloudyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <ellipse cx="20" cy="16" rx="10" ry="7" fill="#2A2A3A" stroke="#5A5870" strokeWidth="1"/>
      <ellipse cx="13" cy="18" rx="7" ry="5" fill="#1E1E2E" stroke="#5A5870" strokeWidth="1"/>
      <ellipse cx="24" cy="20" rx="6" ry="4" fill="#222230" stroke="#5A5870" strokeWidth="0.5"/>
    </svg>
  )
}
function SunnyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="7" fill="#D4A853" opacity="0.9">
        <animate attributeName="r" values="7;7.5;7" dur="2s" repeatCount="indefinite"/>
      </circle>
      {[0,45,90,135,180,225,270,315].map((a,i) => {
        const rad=(a*Math.PI)/180
        return (
          <line key={a} x1={18+Math.cos(rad)*9.5} y1={18+Math.sin(rad)*9.5} x2={18+Math.cos(rad)*12} y2={18+Math.sin(rad)*12} stroke="#D4A853" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${1.5+i*0.1}s`} repeatCount="indefinite"/>
          </line>
        )
      })}
    </svg>
  )
}
function FujiIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="sunrise2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB7D5" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#D4A853" stopOpacity="0.5"/>
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="26" rx="14" ry="4" fill="url(#sunrise2)" opacity="0.6"/>
      <polygon points="18,6 6,28 30,28" fill="#1E1E2E" stroke="#5A5870" strokeWidth="1"/>
      <polygon points="18,6 14,14 22,14" fill="#F8F7F2" opacity="0.7"/>
      <line x1="4" y1="28" x2="32" y2="28" stroke="#D4A853" strokeWidth="0.5" opacity="0.5"/>
    </svg>
  )
}

const MOOD_ICONS = { 1: StormIcon, 2: RainIcon, 3: CloudyIcon, 4: SunnyIcon, 5: FujiIcon }

function MoodCard({ mood, isSelected, onSelect }) {
  const Icon = MOOD_ICONS[mood.level]
  return (
    <motion.button
      onClick={() => onSelect(mood.level)}
      whileTap={{ scale: 0.98 }}
      animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      className="relative w-full flex items-center gap-3 text-left"
      style={{
        background: isSelected ? 'rgba(255,183,213,0.05)' : '#12121A',
        border: isSelected ? '1px solid rgba(255,183,213,0.4)' : '1px solid rgba(255,183,213,0.06)',
        borderRadius: '8px',
        padding: '10px 14px',
        cursor: 'pointer',
      }}
      id={`mood-${mood.level}`}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', left: 0, top: '8px', bottom: '8px',
          width: '3px', background: '#FFB7D5', borderRadius: '0 2px 2px 0',
        }} />
      )}
      <div style={{ flexShrink: 0 }}><Icon /></div>
      <div className="flex flex-col">
        <span className="font-serif" style={{ fontSize: '13px', color: '#F8F7F2', lineHeight: 1.3 }}>
          {mood.kanji}
        </span>
        <span className="font-sans" style={{ fontSize: '11px', color: '#9B98B0', marginTop: '2px' }}>
          {mood.romaji} — {mood.english}
        </span>
      </div>
    </motion.button>
  )
}

export default function MoodTracker() {
  const todayMood = useMoodStore(s => s.todayMood)
  const setTodayMood = useMoodStore(s => s.setTodayMood)
  const session = useUserStore(s => s.session)
  const userId = session?.user?.id

  const handleSelect = (level) => {
    if (!userId) return
    setTodayMood(level, userId)
    playMoodSelect()
  }

  return (
    <div className="px-4 pb-4">
      <div className="mb-4">
        <div className="font-serif text-xs tracking-widest" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>今日の気分</div>
        <div className="font-sans text-xs" style={{ color: '#5A5870' }}>Today's Mood</div>
      </div>
      <div className="flex flex-col gap-2">
        {MOODS.map(mood => (
          <MoodCard key={mood.level} mood={mood} isSelected={todayMood === mood.level} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}
