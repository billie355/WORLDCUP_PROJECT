import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Settings, Users, Trophy, BarChart3, Swords } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const adminNav = [
    { href: '/admin', icon: BarChart3, label: 'Overview' },
    { href: '/admin/matches', icon: Swords, label: 'Matches' },
    { href: '/admin/tournament', icon: Trophy, label: 'Tournament' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/leaderboard', icon: Settings, label: 'Leaderboard & Points' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Admin nav bar */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(13,21,38,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 60,
        position: 'sticky',
        top: 0,
        zIndex: 40,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
          color: '#ef4444', marginRight: 16, letterSpacing: '0.08em',
        }}>
          ADMIN
        </div>
        {adminNav.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="nav-link" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            <Icon size={16} /> {label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>← Back to App</Link>
      </div>
      <main className="container-app" style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
