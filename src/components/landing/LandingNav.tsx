'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Trophy, Menu, X } from 'lucide-react'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 24px',
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(7, 11, 23, 0.95)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div
        className="container-app"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--gradient-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={20} color="#0a0e1a" strokeWidth={2.5} />
          </div>
          <span
            className="font-display"
            style={{ fontSize: '1.2rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            Predict<span style={{ color: 'var(--color-gold)' }}>Cup</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center" style={{ gap: 8 }}>
          <Link href="/stats" className="nav-link">Stats</Link>
          <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link href="/login" className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn btn-ghost"
          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Link href="/stats" className="nav-link" onClick={() => setMobileOpen(false)}>Stats</Link>
          <Link href="/leaderboard" className="nav-link" onClick={() => setMobileOpen(false)}>Leaderboard</Link>
          <Link href="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  )
}
