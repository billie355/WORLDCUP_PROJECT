import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInitials, getAccuracyPercentage, formatKickoffTime } from '@/lib/utils'
import { Trophy, Target, TrendingUp, CheckCircle, XCircle, Globe } from 'lucide-react'

import AvatarModal from '@/components/profile/AvatarModal'

export async function generateMetadata({ params }: { params: { identifier: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { identifier } = await params

  let query = supabase.from('profiles').select('*')
  if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    query = query.eq('id', identifier)
  } else {
    query = query.eq('username', identifier)
  }

  const { data: profile } = await query.single()

  return {
    title: profile ? `${profile.display_name || profile.username}'s Profile` : 'User Not Found'
  }
}

export default async function PublicProfilePage({ params }: { params: { identifier: string } }) {
  const supabase = await createClient()
  const { identifier } = await params

  let query = supabase.from('profiles').select('*')
  if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    query = query.eq('id', identifier)
  } else {
    query = query.eq('username', identifier)
  }

  const { data: profile } = await query.single()

  if (!profile) {
    notFound()
  }

  const userId = profile.id

  const [{ data: leaderboard }, { data: predictions }, { data: badges }] = await Promise.all([
    supabase.from('leaderboard').select('*').eq('user_id', userId).single(),
    supabase.from('predictions')
      .select('*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10),
    supabase.from('user_badges')
      .select('*')
      .eq('user_id', userId)
  ])

  const accuracy = getAccuracyPercentage(leaderboard?.predictions_correct || 0, leaderboard?.predictions_total || 0)
  const allBadges = badges || []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* Profile Header */}
      <div className="card glass" style={{ padding: '40px 32px', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <AvatarModal 
          avatarUrl={profile.avatar_url} 
          initials={getInitials(profile.display_name || profile.username)} 
        />
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {profile.display_name || profile.username || 'Anonymous User'}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          <span>@{profile.username || profile.id.slice(0, 8)}</span>
          {profile.country && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              • <Globe size={14} /> {profile.country}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
            <Trophy size={18} color="var(--color-gold)" /> Total Points
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{leaderboard?.total_points || 0}</div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
            <Target size={18} color="#10b981" /> Accuracy
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{accuracy}%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
            {leaderboard?.predictions_correct || 0} / {leaderboard?.predictions_total || 0} correct
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)' }}>
            <TrendingUp size={18} color="#3b82f6" /> Global Rank
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {leaderboard?.rank ? `#${leaderboard.rank}` : '-'}
          </div>
        </div>
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>🏆 Achievements</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {[
              { type: 'FIRST_BLOOD', name: 'First Pick', icon: '🩸', desc: 'Made your first prediction' },
              { type: 'SNIPER', name: 'Sniper', icon: '🎯', desc: 'Predicted exact scoreline' },
              { type: 'UNDERDOG_KING', name: 'Underdog', icon: '👑', desc: 'Predicted an underdog win' },
              { type: 'ON_FIRE', name: 'On Fire', icon: '🔥', desc: '3 correct predictions in a row' }
            ].map((badgeDef) => {
              const hasBadge = allBadges.some(b => b.badge_type === badgeDef.type)
              const count = allBadges.filter(b => b.badge_type === badgeDef.type).length

              if (!hasBadge) return null

              return (
                <div 
                  key={badgeDef.type} 
                  className="card" 
                  style={{ 
                    padding: '16px', textAlign: 'center', width: 140,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative'
                  }}
                >
                  {count > 1 && (
                    <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--color-gold)', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                      x{count}
                    </div>
                  )}
                  <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>{badgeDef.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{badgeDef.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Predictions */}
      <div style={{ maxWidth: 900 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>📜 Recent Predictions</h3>
        
        {(!predictions || predictions.length === 0) ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No predictions made yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
            {predictions.map((pred: any) => {
              const hasResult = pred.match?.home_score !== null
              const isExact = pred.points_awarded === 5 // Assuming exact score points config is 5 for display simplicity
              const isCorrect = pred.points_awarded > 0 && pred.points_awarded < 5

              return (
                <div key={pred.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                      {pred.match?.stage?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                      {formatKickoffTime(pred.match?.kickoff_time)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>{pred.match?.home_team?.name}</span>
                      {pred.match?.home_team?.flag_url && (
                        <img src={pred.match.home_team.flag_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Predicted</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: 2 }}>{pred.predicted_home}-{pred.predicted_away}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {pred.match?.away_team?.flag_url && (
                        <img src={pred.match.away_team.flag_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      )}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'left' }}>{pred.match?.away_team?.name}</span>
                    </div>
                  </div>

                  {hasResult ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        {isExact ? <CheckCircle size={14} color="#10b981" /> : isCorrect ? <CheckCircle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
                        <span style={{ color: isExact ? '#10b981' : isCorrect ? '#f59e0b' : '#ef4444' }}>
                          {isExact ? 'Exact Score!' : isCorrect ? 'Correct Result' : 'Wrong Prediction'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: (isExact || isCorrect) ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                        +{pred.points_awarded || 0} pts
                      </div>
                    </div>
                  ) : (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                      Waiting for result
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
