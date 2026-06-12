'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { adminBanUser, adminResetUserPredictions, adminChangeUserRole } from '@/lib/actions/admin'
import { getInitials } from '@/lib/utils'
import { Ban, RotateCcw, Search, ShieldOff, ChevronDown, Shield, UserCheck, UserX } from 'lucide-react'
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

function RoleBadge({ role, isBanned }: { role: string; isBanned: boolean }) {
  if (isBanned && role === 'user') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700,
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
      }}>Banned</span>
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

// Dropdown for changing role (admin only)
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

  // Cannot change role of another admin
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
          borderRadius: 8, overflow: 'hidden', minWidth: 140,
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
                textAlign: 'left',
                transition: 'background 0.1s',
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

export default function AdminUsersClient({
  users: initialUsers,
  currentUserRole,
}: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentUserRole === 'admin'

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleBan(userId: string, banned: boolean) {
    startTransition(async () => {
      const result = await adminBanUser(userId, banned)
      if (result?.error) toast.error(result.error)
      else {
        toast.success(banned ? 'User banned' : 'User unbanned')
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: banned } : u))
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
              gridTemplateColumns: isAdmin ? '1fr 120px 80px 130px 200px' : '1fr 120px 80px 130px 100px',
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
                gridTemplateColumns: isAdmin ? '1fr 120px 80px 130px 200px' : '1fr 120px 80px 130px 100px',
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

                {/* Role / Status badge */}
                <div>
                  <RoleBadge role={user.role} isBanned={user.is_banned} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                    <button
                      onClick={() => handleBan(user.id, !user.is_banned)}
                      disabled={isPending}
                      className={`btn btn-sm ${user.is_banned ? 'btn-secondary' : 'btn-danger'}`}
                      style={{ padding: '5px 10px' }}
                      title={user.is_banned ? 'Unban user' : 'Ban user'}
                    >
                      {user.is_banned ? <ShieldOff size={12} /> : <Ban size={12} />}
                      {user.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  )}

                  {/* Change Role — admin only, cannot change other admins */}
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
