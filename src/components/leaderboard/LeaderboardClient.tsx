'use client'

import { useState, useTransition } from 'react'
import { getLeaderboard, getCountryLeaderboard } from '@/lib/actions/leaderboard'
import { getInitials, getRankBadge } from '@/lib/utils'
import { Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LeaderboardTab } from '@/types'

const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32']
const rankEmojis = ['🥇', '🥈', '🥉']

interface LeaderboardClientProps {
  initialData: any[]
  initialCount: number
  currentUserId: string
  currentUserRank: number | null
}

export default function LeaderboardClient({ initialData, initialCount, currentUserId, currentUserRank }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global')
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const LIMIT = 50

  async function loadPage(newPage: number) {
    startTransition(async () => {
      const result = await getLeaderboard(newPage, LIMIT)
      setData(result.data)
      setTotal(result.count)
      setPage(newPage)
    })
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 32, maxWidth: 480 }}>
        {(['global', 'country', 'weekly'] as LeaderboardTab[]).map((tab) => (
          <button
            key={tab}
            id={`lb-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
          >
            {tab === 'global' ? '🌍 Global' : tab === 'country' ? '🏳️ Country' : '📅 Weekly'}
          </button>
        ))}
      </div>

      {/* Your rank banner */}
      {currentUserRank && (
        <div className="glass-gold" style={{ borderRadius: 14, padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={18} color="var(--color-gold)" />
            <span style={{ fontWeight: 600 }}>Your ranking</span>
          </div>
          <div className="font-display" style={{ fontSize: '1.3rem', color: 'var(--color-gold)' }}>
            #{currentUserRank}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '70px 1fr 120px',
          gap: 16, padding: '12px 24px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
        }}>
          <span>Rank</span>
          <span>Player</span>
          <span style={{ textAlign: 'right' }}>Points</span>
        </div>

        {isPending ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No entries yet. Be the first on the leaderboard!
          </div>
        ) : (
          data.map((entry: any, i: number) => {
            const globalRank = page * LIMIT + i + 1
            const isCurrentUser = entry.user_id === currentUserId
            const isTop3 = globalRank <= 3

            return (
              <div
                key={entry.user_id}
                style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr 120px',
                  alignItems: 'center', gap: 16,
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  background: isCurrentUser ? 'rgba(245,158,11,0.05)' : 'transparent',
                  borderLeft: isCurrentUser ? '3px solid var(--color-gold)' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isCurrentUser) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={(e) => { if (!isCurrentUser) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Rank */}
                <div style={{ fontSize: isTop3 ? '1.3rem' : '0.95rem', fontWeight: 700, color: isTop3 ? rankColors[globalRank - 1] : 'var(--color-text-muted)', textAlign: 'center' }}>
                  {isTop3 ? rankEmojis[globalRank - 1] : `#${globalRank}`}
                </div>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: isTop3 ? `${rankColors[globalRank - 1]}25` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isTop3 ? rankColors[globalRank - 1] + '60' : isCurrentUser ? 'rgba(245,158,11,0.5)' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden',
                    color: isTop3 ? rankColors[globalRank - 1] : 'var(--color-text-muted)',
                  }}>
                    {entry.profile?.avatar_url
                      ? <img src={entry.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(entry.profile?.display_name || entry.profile?.username)
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {entry.profile?.display_name || entry.profile?.username || 'Anonymous'}
                      {isCurrentUser && <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>You</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {entry.profile?.country && `${entry.profile.country} • `}
                      {entry.predictions_total} predictions
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <div className="font-display" style={{ fontSize: '1.15rem', color: isTop3 ? rankColors[globalRank - 1] : 'var(--color-text)' }}>
                    {entry.total_points.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>points</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page === 0 || isPending}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => loadPage(page + 1)}
            disabled={page >= totalPages - 1 || isPending}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
