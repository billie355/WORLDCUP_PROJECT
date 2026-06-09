import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '60px 24px 40px',
        marginTop: 40,
      }}
    >
      <div className="container-app">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--gradient-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={18} color="#0a0e1a" strokeWidth={2.5} />
              </div>
              <span className="font-display" style={{ fontSize: '1.1rem' }}>
                Predict<span style={{ color: 'var(--color-gold)' }}>Cup</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 260 }}>
              The ultimate FIFA World Cup 2026 prediction platform. Predict, compete, and share!
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.9rem', color: 'var(--color-text)' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/register', label: 'Get Started' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/stats', label: 'Community Stats' },
                { href: '/predictions/matches', label: 'Match Predictions' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s',
                  }}
                  className="hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Points */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.9rem', color: 'var(--color-text)' }}>
              Points System
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Correct winner', pts: '3 pts' },
                { label: 'Correct draw', pts: '3 pts' },
                { label: 'Exact scoreline', pts: '5 pts' },
                { label: 'Tournament winner', pts: '30 pts' },
                { label: 'Golden Boot', pts: '20 pts' },
              ].map(({ label, pts }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', maxWidth: 220 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem' }}>
            © 2026 PredictCup. All rights reserved. Not affiliated with FIFA.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: '𝕏', title: 'Twitter/X' },
              { label: '📸', title: 'Instagram' },
            ].map(({ label, title }) => (
              <button
                key={title}
                className="btn btn-ghost"
                style={{ padding: '8px', borderRadius: '50%', width: 36, height: 36, fontSize: '1rem' }}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
