'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trophy, Mail, Lock, Eye, EyeOff, Globe2, AlertCircle } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  async function handleGoogle() {
    startTransition(async () => {
      await signInWithGoogle()
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Sign in to your prediction account
          </p>
        </div>

        <div className="card animate-scale-in" style={{ padding: 32 }}>
          {/* Google OAuth */}
          <button
            id="google-signin-btn"
            onClick={handleGoogle}
            disabled={isPending}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 24, gap: 12, padding: '12px 20px' }}
          >
            <Globe2 size={18} />
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem' }}>or email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              marginBottom: 20, fontSize: '0.875rem', color: '#ef4444',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-base"
                  style={{ paddingLeft: 42 }}
                  autoComplete="email"
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
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="input-base"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <Link href="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button id="login-submit-btn" type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 24 }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
