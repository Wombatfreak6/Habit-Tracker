import { useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { supabase } from './lib/supabase'
import { useUserStore } from './stores/userStore'
import { useHabitStore } from './stores/habitStore'
import { useMoodStore } from './stores/moodStore'
import { useAchievementStore } from './stores/achievementStore'
import AuthPage from './components/auth/AuthPage'
import HeroSection from './components/tree/HeroSection'
import FlipClock from './components/clock/FlipClock'
import MonthlyCalendar from './components/calendar/MonthlyCalendar'
import HabitTracker from './components/habits/HabitTracker'
import AnalyticsSection from './components/analytics/AnalyticsSection'
import MoodTracker from './components/mood/MoodTracker'
import HabitHeatmap from './components/calendar/HabitHeatmap'
import AchievementToastContainer from './components/gamification/AchievementToast'

// Mobile fallback
function MobileFallback() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'radial-gradient(ellipse at center, #0F0F18 0%, #0B0B0F 100%)' }}
    >
      <svg width="80" height="80" viewBox="0 0 60 60" fill="none" className="mb-6 opacity-70">
        <rect x="28" y="38" width="4" height="16" rx="2" fill="#2A2235" />
        <line x1="30" y1="38" x2="18" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="30" y1="38" x2="42" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="30" y1="32" x2="30" y2="20" stroke="#2A2235" strokeWidth="2" strokeLinecap="round"/>
        {[[12,18],[22,16],[30,20],[48,18],[38,16]].map(([x,y],i) => (
          <g key={i}><circle cx={x} cy={y} r="4" fill="rgba(255,183,213,0.6)"/></g>
        ))}
      </svg>
      <h1 className="font-serif text-2xl mb-2" style={{ color: '#F8F7F2' }}>桜の習慣</h1>
      <p className="font-sans text-sm" style={{ color: '#9B98B0' }}>
        桜の習慣 is designed for desktop.
      </p>
      <p className="font-sans text-xs mt-2" style={{ color: '#5A5870' }}>
        Please open on a screen wider than 1024px.
      </p>
    </div>
  )
}

function Dashboard({ userId }) {
  const loadFromSupabase = useHabitStore(s => s.loadFromSupabase)
  const subscribeToRealtime = useHabitStore(s => s.subscribeToRealtime)
  const loadHistory = useMoodStore(s => s.loadHistory)
  const loadAchievements = useAchievementStore(s => s.loadAchievements)

  useEffect(() => {
    if (!userId) return
    loadFromSupabase(userId)
    loadHistory(userId)
    loadAchievements(userId)
    const unsubscribe = subscribeToRealtime(userId)
    return unsubscribe
  }, [userId])

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 40%, #0F0F18 0%, #0B0B0F 70%)',
        position: 'relative',
      }}
    >
      {/* Torii gate watermark */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.04,
        }}
        aria-hidden
      >
        <svg width="300" height="300" viewBox="0 0 120 120" fill="none">
          <rect x="10" y="30" width="100" height="8" rx="4" fill="#F8F7F2"/>
          <rect x="20" y="42" width="80" height="5" rx="2.5" fill="#F8F7F2"/>
          <rect x="24" y="47" width="10" height="60" rx="5" fill="#F8F7F2"/>
          <rect x="86" y="47" width="10" height="60" rx="5" fill="#F8F7F2"/>
          <path d="M5 30 Q60 5 115 30" fill="none" stroke="#F8F7F2" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Paper texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden
      />

      {/* Hero section — full width */}
      <div style={{ flexShrink: 0, zIndex: 1, position: 'relative' }}>
        <HeroSection />
      </div>

      {/* Three-column layout */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left sidebar */}
        <div
          className="sidebar-scroll"
          style={{
            width: '280px',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,183,213,0.06)',
            background: 'rgba(18,18,26,0.6)',
          }}
        >
          <FlipClock />
          <div style={{ height: '1px', background: 'rgba(255,183,213,0.06)', margin: '0 16px' }} />
          <MonthlyCalendar />
        </div>

        {/* Center column */}
        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            padding: '24px 32px',
            minWidth: 0,
          }}
        >
          <HabitTracker />
          <AnalyticsSection />
          <div style={{ height: '40px' }} />
        </div>

        {/* Right sidebar */}
        <div
          className="sidebar-scroll"
          style={{
            width: '300px',
            flexShrink: 0,
            borderLeft: '1px solid rgba(255,183,213,0.06)',
            background: 'rgba(18,18,26,0.6)',
          }}
        >
          <div style={{ height: '16px' }} />
          <MoodTracker />
          <div style={{ height: '1px', background: 'rgba(255,183,213,0.06)', margin: '8px 16px' }} />
          <HabitHeatmap />
        </div>
      </div>

      {/* Achievement toasts */}
      <AchievementToastContainer />
    </div>
  )
}

export default function App() {
  const session = useUserStore(s => s.session)
  const setSession = useUserStore(s => s.setSession)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mobile breakpoint guard (render-time check)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  if (isMobile) {
    return (
      <TooltipProvider>
        <MobileFallback />
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      {session ? (
        <Dashboard userId={session.user.id} />
      ) : (
        <AuthPage />
      )}
    </TooltipProvider>
  )
}
