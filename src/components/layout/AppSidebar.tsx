'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, Trophy, BarChart3,
  User, LogOut, Crown, Settings, ChevronRight
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { getInitials } from '@/lib/utils'
import type { Profile, Leaderboard } from '@/types'

const navItems = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/predictions/matches',    icon: Target,          label: 'Match Predictions' },
  { href: '/predictions/tournament', icon: Trophy,          label: 'Tournament Picks' },
  { href: '/leaderboard',            icon: Crown,           label: 'Leaderboard' },
  { href: '/stats',                  icon: BarChart3,       label: 'Community Stats' },
  { href: '/profile',                icon: User,            label: 'My Profile' },
]

interface AppSidebarProps {
  profile: Profile | null
  leaderboard: Pick<Leaderboard, 'total_points' | 'rank'> | null
}

export default function AppSidebar({ profile, leaderboard }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 260,
        background: 'rgba(13, 21, 38, 0.95)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '24px 24px 20px',
          textDecoration: 'none',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--gradient-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Trophy size={18} color="#0a0e1a" strokeWidth={2.5} />
        </div>
        <span className="font-display" style={{ fontSize: '1.1rem' }}>
          Predict<span style={{ color: 'var(--color-gold)' }}>Cup</span>
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 8, padding: '0 8px 8px', fontSize: '0.7rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Menu
        </div>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              style={{ marginBottom: 2, justifyContent: 'flex-start' }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          )
        })}

        {/* Admin link if admin */}
        {profile?.role === 'admin' && (
          <>
            <div style={{ margin: '16px 0 8px', padding: '0 8px 8px', fontSize: '0.7rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, borderTop: '1px solid var(--color-border)' }}>
              Admin
            </div>
            <Link
              href="/admin"
              className={`nav-link ${pathname.startsWith('/admin') ? 'nav-link-active' : ''}`}
              style={{ marginBottom: 2 }}
            >
              <Settings size={18} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* User card */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        padding: 16,
      }}>
        {/* Points summary */}
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points</div>
            <div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--color-gold)' }}>
              {(leaderboard?.total_points || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rank</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>
              {leaderboard?.rank ? `#${leaderboard.rank}` : '—'}
            </div>
          </div>
        </div>

        {/* User info + signout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(profile?.display_name || profile?.username)
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.display_name || profile?.username || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{profile?.username}
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8, color: 'var(--color-text-subtle)' }} title="Sign out">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
