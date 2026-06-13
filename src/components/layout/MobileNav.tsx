'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Crown, User, Settings } from 'lucide-react'
import type { Profile } from '@/types'

interface MobileNavProps {
  profile: Profile | null
}

export default function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/predictions/matches', icon: Target, label: 'Picks' },
    { href: '/leaderboard', icon: Crown, label: 'Ranks' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="mobile-bottom-nav mobile-only">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        )
      })}
      
      {(profile?.role === 'admin' || profile?.role === 'staff') && (
        <Link
          href="/admin"
          className={`mobile-nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}
        >
          <Settings size={22} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2} />
          <span>{profile?.role === 'admin' ? 'Admin' : 'Staff'}</span>
        </Link>
      )}
    </nav>
  )
}
