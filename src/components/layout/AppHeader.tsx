'use client'

import { Bell, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Profile, Leaderboard } from '@/types'

interface AppHeaderProps {
  profile: Profile | null
  leaderboard: Pick<Leaderboard, 'total_points' | 'rank'> | null
}

export default function AppHeader({ profile, leaderboard }: AppHeaderProps) {
  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'rgba(13, 21, 38, 0.6)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Page title placeholder - can be overridden by pages */}
      <div style={{ flex: 1 }} />

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Points badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: '0.875rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>⚡</span>
          <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
            {(leaderboard?.total_points || 0).toLocaleString()} pts
          </span>
          {leaderboard?.rank && (
            <>
              <span style={{ color: 'var(--color-border)', margin: '0 2px' }}>•</span>
              <span style={{ color: 'var(--color-text-muted)' }}>#{leaderboard.rank}</span>
            </>
          )}
        </div>

        {/* Notifications bell */}
        <button
          id="notifications-btn"
          className="btn btn-ghost"
          style={{ padding: 8, borderRadius: '50%', width: 38, height: 38, position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-gold)',
            border: '2px solid var(--color-surface)',
          }} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(245,158,11,0.2)',
            border: '2px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)',
            cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : getInitials(profile?.display_name || profile?.username)
          }
        </div>
      </div>
    </header>
  )
}
