'use client'

import Link from 'next/link'
import { Crown, ChevronRight } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { getInitials } from '@/lib/utils'

const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32']
const rankEmojis = ['🥇', '🥈', '🥉']

interface LeaderboardPreviewProps {
  entries: any[]
}

export default function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  return (
    <section style={{ padding: '80px 24px' }}>
      <div className="container-app" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-gold" style={{ marginBottom: 16, display: 'inline-flex' }}>
            <Crown size={12} /> Global Leaderboard
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
            Top predictors
            <span style={{ color: 'var(--color-gold)' }}> this week</span>
          </h2>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div
            className="lb-row"
            style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}
          >
            <span>Rank</span>
            <span>Player</span>
            <span>Points</span>
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No predictions yet. Be the first on the leaderboard!
            </div>
          ) : (
            entries.map((entry, i) => (
              <div
                key={entry.user_id}
                className="lb-row"
                style={{
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Rank */}
                <div
                  style={{
                    fontSize: i < 3 ? '1.4rem' : '1rem',
                    fontWeight: 700,
                    color: rankColors[i] || 'var(--color-text-muted)',
                    textAlign: 'center',
                  }}
                >
                  {i < 3 ? rankEmojis[i] : `#${i + 1}`}
                </div>

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: i < 3
                        ? `linear-gradient(135deg, ${rankColors[i]}40, ${rankColors[i]}20)`
                        : 'rgba(255,255,255,0.06)',
                      border: `2px solid ${i < 3 ? rankColors[i] + '60' : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: i < 3 ? rankColors[i] : 'var(--color-text-muted)',
                      overflow: 'hidden',
                    }}
                  >
                    {entry.profile?.avatar_url ? (
                      <img src={entry.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(entry.profile?.display_name || entry.profile?.username)
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {entry.profile?.display_name || entry.profile?.username || 'Anonymous'}
                    </div>
                    {entry.profile?.country && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {entry.profile.country}
                      </div>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: i < 3 ? rankColors[i] : 'var(--color-text)',
                    fontFamily: 'Orbitron, Outfit, sans-serif',
                  }}
                >
                  {entry.total_points.toLocaleString()}
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'Outfit, sans-serif', marginLeft: 4, fontWeight: 500 }}>pts</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/leaderboard" className="btn btn-secondary">
            View Full Leaderboard
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
