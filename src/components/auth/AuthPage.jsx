import { useState } from 'react'
import { supabase } from '../../lib/supabase'

function SakuraTreeLogo() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="22" r="16" fill="rgba(255,183,213,0.06)" />
      {/* Trunk */}
      <rect x="28" y="38" width="4" height="16" rx="2" fill="#2A2235" />
      {/* Main branches */}
      <line x1="30" y1="38" x2="18" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30" y1="38" x2="42" y2="26" stroke="#2A2235" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30" y1="32" x2="30" y2="20" stroke="#2A2235" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="26" x2="12" y2="18" stroke="#2A2235" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="26" x2="22" y2="16" stroke="#2A2235" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="42" y1="26" x2="48" y2="18" stroke="#2A2235" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="42" y1="26" x2="38" y2="16" stroke="#2A2235" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Blossoms */}
      {[
        [12, 18], [22, 16], [30, 20], [48, 18], [38, 16],
        [16, 12], [26, 10], [34, 10], [44, 12],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="rgba(255,183,213,0.7)" />
          <circle cx={x} cy={y} r="2.5" fill="rgba(255,201,224,0.9)" />
        </g>
      ))}
    </svg>
  )
}

function Input({ id, label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-xs" style={{ color: '#9B98B0' }} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full font-sans text-sm outline-none transition-all"
        style={{
          background: '#12121A',
          border: '1px solid rgba(255,183,213,0.15)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#F8F7F2',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,183,213,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,183,213,0.15)'}
      />
    </div>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #0F0F18 0%, #0B0B0F 100%)',
      }}
    >
      {/* Floating petals decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {[
          { top: '15%', left: '10%', size: 6, delay: '0s', opacity: 0.25 },
          { top: '30%', right: '8%', size: 8, delay: '1.2s', opacity: 0.2 },
          { top: '65%', left: '15%', size: 5, delay: '2.1s', opacity: 0.15 },
          { top: '75%', right: '20%', size: 7, delay: '0.8s', opacity: 0.2 },
          { top: '45%', left: '5%', size: 5, delay: '1.8s', opacity: 0.1 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              borderRadius: '50%',
              background: `rgba(255,183,213,${p.opacity})`,
              animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Auth card */}
      <div
        className="relative w-full flex flex-col items-center gap-6"
        style={{
          maxWidth: '380px',
          background: '#12121A',
          border: '1px solid rgba(255,183,213,0.1)',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-3">
          <SakuraTreeLogo />
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-serif text-2xl" style={{ color: '#F8F7F2', fontWeight: 400 }}>桜の習慣</h1>
            <p className="font-sans text-xs" style={{ color: '#5A5870', letterSpacing: '0.12em' }}>SAKURA HABIT TRACKER</p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex w-full"
          style={{
            background: '#0B0B0F',
            borderRadius: '8px',
            padding: '3px',
          }}
        >
          {['signin', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className="flex-1 font-sans text-sm py-2 rounded-md transition-all"
              style={{
                background: tab === t ? '#1A1A26' : 'transparent',
                color: tab === t ? '#F8F7F2' : '#5A5870',
                border: tab === t ? '1px solid rgba(255,183,213,0.12)' : '1px solid transparent',
              }}
              id={`auth-tab-${t}`}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" id="auth-form">
          <Input
            id="auth-email"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            id="auth-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
          />

          {error && (
            <div className="font-sans text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="font-sans text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(74,124,89,0.1)', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.3)' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full font-sans text-sm py-2.5 rounded-md transition-all mt-1"
            style={{
              background: loading || !email || !password ? 'rgba(255,183,213,0.3)' : '#FFB7D5',
              color: '#0B0B0F',
              fontWeight: 600,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
            id="auth-submit"
          >
            {loading ? '…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Guest placeholder */}
        <button
          disabled
          className="font-sans text-xs"
          style={{ color: '#3A3848', cursor: 'not-allowed', textDecoration: 'underline', textDecorationColor: '#3A3848' }}
        >
          Continue as guest (coming soon)
        </button>
      </div>
    </div>
  )
}
