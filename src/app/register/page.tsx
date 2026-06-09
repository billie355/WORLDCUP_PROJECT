'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Mail, Lock, User, Eye, EyeOff, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { signUp, checkUsernameAvailability } from '@/lib/actions/auth'
import { COUNTRIES } from '@/lib/constants'

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true)
      const result = await checkUsernameAvailability(username)
      setUsernameAvailable(result.available)
      setCheckingUsername(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [username])

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (usernameAvailable === false) {
      setError('Username is already taken')
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12 }}>Check your email!</h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            We've sent a confirmation link to your email. Click it to activate your PredictCup account.
          </p>
          <Link href="/login" className="btn btn-primary">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--gradient-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy size={24} color="#0a0e1a" strokeWidth={2.5} />
            </div>
            <span className="font-display" style={{ fontSize: '1.4rem' }}>
              Predict<span style={{ color: 'var(--color-gold)' }}>Cup</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Join thousands of fans predicting the World Cup
          </p>
        </div>

        <div className="card animate-scale-in" style={{ padding: 32 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              marginBottom: 20, fontSize: '0.875rem', color: '#ef4444',
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Display Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  id="display-name"
                  name="display_name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="input-base"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', fontSize: '1rem' }}>@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="yourhandle"
                  className="input-base"
                  style={{ paddingLeft: 32 }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  minLength={3}
                  maxLength={30}
                />
                {username.length >= 3 && (
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                    {checkingUsername ? (
                      <div style={{ width: 16, height: 16, border: '2px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                    ) : usernameAvailable ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                  </div>
                )}
              </div>
              {username.length >= 3 && !checkingUsername && (
                <p style={{ fontSize: '0.75rem', marginTop: 6, color: usernameAvailable ? '#10b981' : '#ef4444' }}>
                  {usernameAvailable ? '✓ Username available' : '✗ Username taken'}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Country
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <select
                  id="country"
                  name="country"
                  className="input-base"
                  style={{ paddingLeft: 42, appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-base"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  className="input-base"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: 0 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="register-submit-btn" type="submit" disabled={isPending || usernameAvailable === false} className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
              {isPending ? 'Creating account...' : 'Create Account Free'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
