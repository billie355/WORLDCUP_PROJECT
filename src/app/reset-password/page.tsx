'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trophy, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { resetPassword } from '@/lib/actions/auth'

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
      else setSent(true)
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={24} color="#0a0e1a" strokeWidth={2.5} />
            </div>
            <span className="font-display" style={{ fontSize: '1.4rem' }}>
              Predict<span style={{ color: 'var(--color-gold)' }}>Cup</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Reset password</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Check your inbox!</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              We've sent a password reset link to your email address.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>Back to Sign In</Link>
          </div>
        ) : (
          <div className="card animate-scale-in" style={{ padding: 32 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, fontSize: '0.875rem', color: '#ef4444' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
                  <input name="email" type="email" required placeholder="you@example.com" className="input-base" style={{ paddingLeft: 42 }} />
                </div>
              </div>
              <button id="reset-password-btn" type="submit" disabled={isPending} className="btn btn-primary btn-lg">
                {isPending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 24 }}>
              <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>← Back to sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
