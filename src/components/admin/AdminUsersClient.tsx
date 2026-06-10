'use client'

import { useState, useTransition } from 'react'
import { adminBanUser, adminResetUserPredictions } from '@/lib/actions/admin'
import { getInitials } from '@/lib/utils'
import { Ban, RotateCcw, Search, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

interface AdminUsersClientProps {
  users: any[]
}

export default function AdminUsersClient({ users: initialUsers }: AdminUsersClientProps) {
  const [users] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleBan(userId: string, banned: boolean) {
    startTransition(async () => {
      const result = await adminBanUser(userId, banned)
      if (result?.error) toast.error(result.error)
      else toast.success(banned ? 'User banned' : 'User unbanned')
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>👥 User Management</h1>
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
          <div style={{ minWidth: 700 }}>
            <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 80px 120px 160px',
          gap: 16, padding: '12px 24px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
        }}>
          <span>User</span><span>Country</span><span>Points</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map((user) => (
          <div key={user.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 80px 120px 160px',
            gap: 16, padding: '14px 24px', alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            background: user.is_banned ? 'rgba(239,68,68,0.03)' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden',
              }}>
                {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user.display_name || user.username)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.display_name || user.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>@{user.username}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{user.country || '—'}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-gold)' }}>
              {user.leaderboard?.total_points?.toLocaleString() || 0}
            </span>
            <div>
              {user.role === 'admin' ? (
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>Admin</span>
              ) : user.is_banned ? (
                <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Banned</span>
              ) : (
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Active</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {user.role !== 'admin' && (
                <>
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
                  <button
                    onClick={() => handleReset(user.id)}
                    disabled={isPending}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '5px 8px' }}
                    title="Reset predictions"
                  >
                    <RotateCcw size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  )
}
