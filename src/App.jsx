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
import GlobalPetals from './components/ui/GlobalPetals'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// ── Decorative SVG elements ──────────────────────────────────

function DarumaWidget() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 py-4 cursor-default" id="daruma-widget">
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <ellipse cx="24" cy="36" rx="18" ry="18" fill="#8B1A1A"/>
            <ellipse cx="24" cy="36" rx="14" ry="15" fill="#9B2020"/>
            {/* Gold trim */}
            <ellipse cx="24" cy="36" rx="18" ry="18" fill="none" stroke="#D4A853" strokeWidth="1.5"/>
            <ellipse cx="24" cy="28" rx="8" ry="2" fill="none" stroke="#D4A853" strokeWidth="1"/>
            {/* Face */}
            <ellipse cx="24" cy="22" rx="12" ry="11" fill="#F5E6D0"/>
            {/* Eyes */}
            <ellipse cx="20" cy="20" rx="3" ry="2.5" fill="white"/>
            <ellipse cx="28" cy="20" rx="3" ry="2.5" fill="white"/>
            <circle cx="20" cy="20" r="1.5" fill="#1A1A2E"/>
            <circle cx="28" cy="20" r="1.5" fill="#1A1A2E"/>
            {/* Eyebrows */}
            <path d="M17 17 Q20 15.5 23 17" stroke="#3A2010" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M25 17 Q28 15.5 31 17" stroke="#3A2010" strokeWidth="1" fill="none" strokeLinecap="round"/>
            {/* Mustache */}
            <path d="M19 24 Q24 27 29 24" stroke="#3A2010" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            {/* Gold pattern on body */}
            <path d="M12 38 Q24 44 36 38" stroke="#D4A853" strokeWidth="0.8" fill="none" opacity="0.6"/>
            <path d="M14 42 Q24 47 34 42" stroke="#D4A853" strokeWidth="0.6" fill="none" opacity="0.4"/>
          </svg>
          <div className="font-serif" style={{ fontSize: '10px', color: '#5A5870', letterSpacing: '0.08em' }}>達磨 / Daruma</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#9B98B0' }}>
        <span className="font-sans text-xs">Daruma dolls bring focus and perseverance</span>
      </TooltipContent>
    </Tooltip>
  )
}

function ManekiNekoWidget() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 py-4 cursor-default" id="maneki-neko-widget">
          <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <ellipse cx="22" cy="36" rx="14" ry="14" fill="none" stroke="rgba(255,183,213,0.4)" strokeWidth="1.2"/>
            {/* Head */}
            <circle cx="22" cy="18" r="11" fill="none" stroke="rgba(255,183,213,0.4)" strokeWidth="1.2"/>
            {/* Ears */}
            <path d="M13 10 L10 4 L18 8" fill="none" stroke="rgba(255,183,213,0.35)" strokeWidth="1"/>
            <path d="M31 10 L34 4 L26 8" fill="none" stroke="rgba(255,183,213,0.35)" strokeWidth="1"/>
            {/* Face */}
            <circle cx="18" cy="17" r="1.5" fill="rgba(255,183,213,0.5)"/>
            <circle cx="26" cy="17" r="1.5" fill="rgba(255,183,213,0.5)"/>
            <path d="M19 21 Q22 23 25 21" stroke="rgba(255,183,213,0.4)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            {/* Raised paw */}
            <path d="M33 22 Q40 16 38 10" fill="none" stroke="rgba(255,183,213,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="38" cy="9" r="3" fill="none" stroke="rgba(255,183,213,0.35)" strokeWidth="1"/>
            {/* Coin */}
            <circle cx="22" cy="38" r="5" fill="none" stroke="rgba(212,168,83,0.3)" strokeWidth="1"/>
            <text x="22" y="41" textAnchor="middle" fontSize="5" fill="rgba(212,168,83,0.4)" fontFamily="serif">福</text>
            {/* Tail */}
            <path d="M36 36 Q42 30 38 26" fill="none" stroke="rgba(255,183,213,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div className="font-serif" style={{ fontSize: '10px', color: '#5A5870', letterSpacing: '0.08em' }}>招き猫 / Lucky Cat</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" style={{ background: '#1A1A26', border: '1px solid rgba(255,183,213,0.15)', color: '#9B98B0' }}>
        <span className="font-sans text-xs">May good habits find you</span>
      </TooltipContent>
    </Tooltip>
  )
}

function BrushstrokeAccents() {
  return (
    <>
      {/* Top-left */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 2 }}
        width="50" height="50" viewBox="0 0 50 50" fill="none"
      >
        <path d="M2 2 Q15 8 30 5 Q20 18 8 28" stroke="rgba(255,183,213,0.08)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      </svg>
      {/* Top-right */}
      <svg
        style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 2 }}
        width="50" height="50" viewBox="0 0 50 50" fill="none"
      >
        <path d="M48 2 Q35 8 20 5 Q30 18 42 28" stroke="rgba(255,183,213,0.08)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      </svg>
    </>
  )
}

// ── Mobile fallback ──────────────────────────────────────────

function MobileFallback() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'radial-gradient(ellipse at center, #0F0F18 0%, #0B0B0F 100%)' }}
    >
      <svg width="80" height="80" viewBox="0 0 60 60" fill="none" className="mb-6 opacity-70">
        <rect x="28" y="38" width="4" height="16" rx="2" fill="#2A2235"/>
        <line x1="30" y1="38" x2="18" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="30" y1="38" x2="42" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="30" y1="32" x2="30" y2="20" stroke="#2A2235" strokeWidth="2" strokeLinecap="round"/>
        {[[12,18],[22,16],[30,20],[48,18],[38,16]].map(([x,y],i) => (
          <g key={i}><circle cx={x} cy={y} r="4" fill="rgba(255,183,213,0.6)"/></g>
        ))}
      </svg>
      <h1 className="font-serif text-2xl mb-2" style={{ color: '#F8F7F2' }}>桜の習慣</h1>
      <p className="font-sans text-sm" style={{ color: '#9B98B0' }}>桜の習慣 is designed for desktop.</p>
      <p className="font-sans text-xs mt-2" style={{ color: '#5A5870' }}>Please open on a screen wider than 1024px.</p>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────

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
    const unsub = subscribeToRealtime(userId)
    return unsub
  }, [userId])

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 35%, #0F0F18 0%, #0B0B0F 70%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Torii gate watermark */}
      <div
        style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.05,
        }}
        aria-hidden
      >
        <svg width="200" height="200" viewBox="0 0 120 120" fill="none">
          <rect x="10" y="30" width="100" height="8" rx="4" fill="#F8F7F2"/>
          <rect x="20" y="42" width="80" height="5" rx="2.5" fill="#F8F7F2"/>
          <rect x="24" y="47" width="10" height="60" rx="5" fill="#F8F7F2"/>
          <rect x="86" y="47" width="10" height="60" rx="5" fill="#F8F7F2"/>
          <path d="M5 30 Q60 5 115 30" fill="none" stroke="#F8F7F2" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Paper texture */}
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.03, pointerEvents: 'none', zIndex: 0,
        }}
        aria-hidden
      />

      {/* Hero */}
      <div style={{ flexShrink: 0, zIndex: 1, position: 'relative' }}>
        <BrushstrokeAccents />
        <HeroSection />
      </div>

      {/* Three-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

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
          <div style={{ height: '1px', background: 'rgba(255,183,213,0.06)', margin: '0 16px 4px' }} />
          <DarumaWidget />
        </div>

        {/* Center column */}
        <div
          className="sidebar-scroll"
          style={{ flex: 1, padding: '24px 32px', minWidth: 0 }}
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
          <div style={{ height: '1px', background: 'rgba(255,183,213,0.06)', margin: '4px 16px 0' }} />
          <ManekiNekoWidget />
        </div>
      </div>

      {/* Achievement toasts */}
      <AchievementToastContainer />
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────

export default function App() {
  const session = useUserStore(s => s.session)
  const setSession = useUserStore(s => s.setSession)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  return (
    <TooltipProvider>
      {/* Global falling petals overlay — visible on all screens */}
      <GlobalPetals />

      {isMobile ? (
        <MobileFallback />
      ) : session ? (
        <Dashboard userId={session.user.id} />
      ) : (
        <AuthPage />
      )}
    </TooltipProvider>
  )
}
