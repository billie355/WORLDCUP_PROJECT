import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account Suspended | PredictCup 2026' }

export default async function BannedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use admin client to bypass RLS and ensure we always get accurate ban data
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('is_banned, ban_reason, ban_message, ban_expires_at, banned_at, display_name, username')
    .eq('id', user.id)
    .single()

  if (!profile?.is_banned) redirect('/dashboard')

  const expiresAt = profile.ban_expires_at ? new Date(profile.ban_expires_at) : null
  const bannedAt  = profile.banned_at ? new Date(profile.banned_at) : null
  const isPermanent = !expiresAt

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const formatDateTime = (d: Date) =>
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Wordmark */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{
            fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--color-text-subtle)', textTransform: 'uppercase',
          }}>
            PredictCup 2026
          </span>
        </div>

        {/* Main card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          {/* Top accent strip */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />

          <div style={{ padding: '32px 32px 28px' }}>
            {/* Status line */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '4px 10px', borderRadius: 6, marginBottom: 24,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444',
              }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Account Suspended
              </span>
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
              Your account has been suspended
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              Hi {profile.display_name || profile.username}, this account has been suspended
              from PredictCup 2026 by a member of the administrative team.
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 24 }} />

            {/* Reason */}
            {profile.ban_reason && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 5 }}>
                  Reason
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {profile.ban_reason}
                </p>
              </div>
            )}

            {/* Message from admin */}
            {profile.ban_message && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 8 }}>
                  Note from admin
                </p>
                <div style={{
                  padding: '14px 16px',
                  borderLeft: '2px solid rgba(239,68,68,0.3)',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {profile.ban_message}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              {bannedAt && (
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 500, marginBottom: 3 }}>
                    Date issued
                  </p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {formatDate(bannedAt)}
                  </p>
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 500, marginBottom: 3 }}>
                  Duration
                </p>
                <p style={{
                  fontSize: '0.82rem', fontWeight: 600,
                  color: isPermanent ? '#ef4444' : 'var(--color-text)',
                }}>
                  {isPermanent ? 'Permanent' : `Until ${formatDateTime(expiresAt!)}`}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 500, marginBottom: 3 }}>
                  Issued by
                </p>
                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--color-text-subtle)',
          lineHeight: 1.6,
          marginBottom: 24,
          padding: '0 4px',
        }}>
          {isPermanent
            ? 'If you believe this is a mistake, contact the platform administrator directly.'
            : `Your access will be restored automatically on ${formatDateTime(expiresAt!)}.`}
        </p>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
