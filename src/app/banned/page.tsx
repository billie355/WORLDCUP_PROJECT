import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account Suspended | PredictCup 2026' }

export default async function BannedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — send to login
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned, ban_reason, ban_message, ban_expires_at, banned_at, display_name, username')
    .eq('id', user.id)
    .single()

  // Not actually banned — send to dashboard
  if (!profile?.is_banned) redirect('/dashboard')

  const expiresAt = profile.ban_expires_at ? new Date(profile.ban_expires_at) : null
  const bannedAt = profile.banned_at ? new Date(profile.banned_at) : null
  const isPermanent = !expiresAt

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)',
            fontSize: '2.4rem', marginBottom: 24,
          }}>
            🚫
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>
            Account Suspended
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Hello <strong style={{ color: 'var(--color-text)' }}>{profile.display_name || profile.username}</strong>,
            your account has been suspended from PredictCup 2026.
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          {/* Header bar */}
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
              OFFICIAL NOTICE FROM ADMIN
            </span>
            {bannedAt && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {formatDate(bannedAt)}
              </span>
            )}
          </div>

          <div style={{ padding: 24 }}>
            {/* Reason badge */}
            {profile.ban_reason && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Reason
                </span>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 6,
                    background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                    fontSize: '0.82rem', fontWeight: 700,
                  }}>
                    {profile.ban_reason}
                  </span>
                </div>
              </div>
            )}

            {/* Message */}
            {profile.ban_message && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Message
                </span>
                <div style={{
                  marginTop: 8, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-text)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {profile.ban_message}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              padding: '16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Issued by
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Duration
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isPermanent ? '#ef4444' : '#f59e0b' }}>
                  {isPermanent ? '🔒 Permanent' : `Until ${formatDate(expiresAt!)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
          fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6,
          marginBottom: 24, textAlign: 'center',
        }}>
          {isPermanent
            ? 'This ban is permanent. If you believe this is a mistake, please contact the platform administrator.'
            : `Your access will be automatically restored on ${formatDate(expiresAt!)}.`}
        </div>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
