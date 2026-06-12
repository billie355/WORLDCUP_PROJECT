'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { adminBanUser, adminResetUserPredictions, adminChangeUserRole } from '@/lib/actions/admin'
import { getInitials } from '@/lib/utils'
import { Ban, RotateCcw, Search, ShieldOff, ChevronDown, Shield, UserCheck, UserX, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminUsersClientProps {
  users: any[]
  currentUserRole: 'admin' | 'staff'
}

const ROLE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  admin:  { label: 'Admin',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  staff:  { label: 'Staff',  color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  user:   { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
}

const BAN_REASONS = ['Spam', 'Cheating / Prediction Fraud', 'Abusive Behavior', 'Harassment', 'Multiple Accounts', 'Other']

function RoleBadge({ role, isBanned }: { role: string; isBanned: boolean }) {
  if (isBanned && role !== 'admin' && role !== 'staff') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
      }}>🚫 Banned</span>
    )
  }
  const s = ROLE_STYLES[role] ?? ROLE_STYLES.user
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  )
}

// Role change dropdown
function RoleDropdown({ user, onRoleChange, disabled }: {
  user: any
  onRoleChange: (userId: string, role: 'user' | 'staff' | 'admin') => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (user.role === 'admin') return null

  const options: { role: 'user' | 'staff' | 'admin'; label: string; icon: React.ReactNode }[] = (
    [
      { role: 'user',  label: 'Set as User',  icon: <UserX size={12} /> },
      { role: 'staff', label: 'Set as Staff', icon: <UserCheck size={12} /> },
      { role: 'admin', label: 'Set as Admin', icon: <Shield size={12} /> },
    ] as const
  ).filter(o => o.role !== user.role)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={disabled}
        className="btn btn-ghost btn-sm"
        style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
        title="Change role"
      >
        <Shield size={12} />
        <ChevronDown size={10} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 8, overflow: 'hidden', minWidth: 145,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {options.map(({ role, label, icon }) => (
            <button
              key={role}
              onClick={() => { setOpen(false); onRoleChange(user.id, role) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', fontSize: '0.8rem', fontWeight: 500,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: ROLE_STYLES[role]?.color ?? 'var(--color-text)',
                textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Ban modal
function BanModal({ user, onConfirm, onClose, isPending }: {
  user: any
  onConfirm: (opts: { reason: string; message: string; expiresAt: string | null }) => void
  onClose: () => void
  isPending: boolean
}) {
  const [reason, setReason] = useState(BAN_REASONS[0])
  const [message, setMessage] = useState('')
  const [durationType, setDurationType] = useState<'permanent' | 'timed'>('permanent')
  const [expiresAt, setExpiresAt] = useState('')

  // Min datetime for the picker = now + 1 minute
  const minDatetime = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (durationType === 'timed' && !expiresAt) {
      toast.error('Please set a date/time for the ban expiry.')
      return
    }
    onConfirm({
      reason,
      message,
      expiresAt: durationType === 'permanent' ? null : new Date(expiresAt).toISOString(),
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14, padding: 28, maxWidth: 460, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Suspend account</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              @{user.username}{user.display_name ? ` · ${user.display_name}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', marginTop: -2 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 22 }} />

        <form onSubmit={handleSubmit}>
          {/* Reason */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>
              Reason
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-base"
              style={{ fontSize: '0.875rem' }}
            >
              {BAN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Message */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 7 }}>
              Message to user
              <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)', marginLeft: 6 }}>— shown on their suspension page</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Explain why this account is being suspended..."
              rows={4}
              className="input-base"
              style={{ fontSize: '0.875rem', resize: 'vertical', minHeight: 88 }}
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 10 }}>
              Duration
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${durationType === 'permanent' ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
                background: durationType === 'permanent' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.12s',
              }}>
                <input type="radio" name="duration" value="permanent" checked={durationType === 'permanent'}
                  onChange={() => setDurationType('permanent')} style={{ accentColor: '#ef4444', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Permanent</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: 1 }}>Can be lifted manually by an admin at any time</div>
                </div>
              </label>

              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${durationType === 'timed' ? 'rgba(255,255,255,0.15)' : 'var(--color-border)'}`,
                background: durationType === 'timed' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.12s',
              }}>
                <input type="radio" name="duration" value="timed" checked={durationType === 'timed'}
                  onChange={() => setDurationType('timed')} style={{ accentColor: 'var(--color-gold)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Until a specific date</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: 1 }}>Account is restored automatically when the date passes</div>
                </div>
              </label>

              {durationType === 'timed' && (
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  min={minDatetime}
                  className="input-base"
                  style={{ fontSize: '0.875rem', marginTop: 2 }}
                  required
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn btn-danger" style={{ flex: 1 }}>
              {isPending ? 'Suspending...' : 'Suspend account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersClient({
  users: initialUsers,
  currentUserRole,
}: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [banTarget, setBanTarget] = useState<any | null>(null)
  const isAdmin = currentUserRole === 'admin'

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  function handleBanClick(user: any) {
    setBanTarget(user)
  }

  function handleBanConfirm(opts: { reason: string; message: string; expiresAt: string | null }) {
    if (!banTarget) return
    startTransition(async () => {
      const result = await adminBanUser(banTarget.id, true, opts)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`@${banTarget.username} has been banned`)
        setUsers(prev => prev.map(u => u.id === banTarget.id
          ? { ...u, is_banned: true, ban_reason: opts.reason, ban_expires_at: opts.expiresAt }
          : u
        ))
        setBanTarget(null)
      }
    })
  }

  function handleUnban(userId: string, username: string) {
    if (!confirm(`Unban @${username}? They will regain full access immediately.`)) return
    startTransition(async () => {
      const result = await adminBanUser(userId, false)
      if (result?.error) toast.error(result.error)
      else {
        toast.success('User unbanned')
        setUsers(prev => prev.map(u => u.id === userId
          ? { ...u, is_banned: false, ban_reason: null, ban_expires_at: null }
          : u
        ))
      }
    })
  }

  async function handleReset(userId: string) {
    if (!confirm('Reset all predictions for this user? This cannot be undone.')) return
    startTransition(async () => {
      const result = await adminResetUserPredictions(userId)
      if (result?.error) toast.error(result.error)
      else toast.success('Predictions reset')
    })
  }

  async function handleRoleChange(userId: string, newRole: 'user' | 'staff' | 'admin') {
    const target = users.find(u => u.id === userId)
    if (!confirm(`Change ${target?.display_name || target?.username}'s role to "${newRole}"?`)) return
    startTransition(async () => {
      const result = await adminChangeUserRole(userId, newRole)
      if (result?.error) toast.error(result.error)
      else {
        toast.success(`Role updated to ${newRole}`)
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    })
  }

  return (
    <div>
      {/* Ban modal */}
      {banTarget && (
        <BanModal
          user={banTarget}
          onConfirm={handleBanConfirm}
          onClose={() => setBanTarget(null)}
          isPending={isPending}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>👥 User Management</h1>
        {!isAdmin && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem',
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
            color: '#eab308',
          }}>
            <Shield size={13} />
            Staff mode — you can reset predictions only
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base"
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <div style={{ minWidth: 760 }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isAdmin ? '1fr 120px 80px 140px 220px' : '1fr 120px 80px 140px 100px',
              gap: 16, padding: '12px 24px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.72rem', color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
            }}>
              <span>User</span>
              <span>Country</span>
              <span>Points</span>
              <span>Role / Status</span>
              <span>Actions</span>
            </div>

            {filtered.map((user) => (
              <div key={user.id} style={{
                display: 'grid',
                gridTemplateColumns: isAdmin ? '1fr 120px 80px 140px 220px' : '1fr 120px 80px 140px 100px',
                gap: 16, padding: '14px 24px', alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                background: user.is_banned ? 'rgba(239,68,68,0.03)' : 'transparent',
              }}>
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden',
                  }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(user.display_name || user.username)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.display_name || user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>@{user.username}</div>
                  </div>
                </div>

                {/* Country */}
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{user.country || '—'}</span>

                {/* Points */}
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {user.leaderboard?.total_points?.toLocaleString() || 0}
                </span>

                {/* Role / Status + ban expiry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <RoleBadge role={user.role} isBanned={user.is_banned} />
                  {user.is_banned && user.ban_expires_at && (
                    <span style={{ fontSize: '0.68rem', color: '#eab308' }}>
                      Until {new Date(user.ban_expires_at).toLocaleDateString()}
                    </span>
                  )}
                  {user.is_banned && !user.ban_expires_at && (
                    <span style={{ fontSize: '0.68rem', color: '#ef4444' }}>Permanent</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Reset — both admin and staff */}
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleReset(user.id)}
                      disabled={isPending}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '5px 8px' }}
                      title="Reset predictions"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}

                  {/* Ban/Unban — admin only */}
                  {isAdmin && user.role !== 'admin' && (
                    user.is_banned ? (
                      <button
                        onClick={() => handleUnban(user.id, user.username)}
                        disabled={isPending}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 10px' }}
                        title="Unban user"
                      >
                        <ShieldOff size={12} /> Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanClick(user)}
                        disabled={isPending}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '5px 10px' }}
                        title="Ban user"
                      >
                        <Ban size={12} /> Ban
                      </button>
                    )
                  )}

                  {/* Change Role — admin only */}
                  {isAdmin && (
                    <RoleDropdown
                      user={user}
                      onRoleChange={handleRoleChange}
                      disabled={isPending}
                    />
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
