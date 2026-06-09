import { createClient } from '@/lib/supabase/server'
import { getUpcomingMatches } from '@/lib/actions/predictions'
import { formatKickoffTime, formatCountdown, getAccuracyPercentage, isMatchLocked } from '@/lib/utils'
import { Target, Trophy, TrendingUp, Clock, CheckCircle, XCircle, Minus } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: lb },
    { data: recentPreds },
    { data: upcomingMatches },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('leaderboard').select('*').eq('user_id', user!.id).single(),
    supabase.from('predictions')
      .select('*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))')
      .eq('user_id', user!.id)
      .not('points_awarded', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5),
    getUpcomingMatches(6),
  ])

  const accuracy = getAccuracyPercentage(lb?.predictions_correct || 0, lb?.predictions_total || 0)

  const stats = [
    { label: 'Total Points', value: (lb?.total_points || 0).toLocaleString(), icon: Trophy, color: '#f59e0b', suffix: 'pts' },
    { label: 'Global Rank', value: lb?.rank ? `#${lb.rank}` : '—', icon: TrendingUp, color: '#10b981' },
    { label: 'Predictions', value: lb?.predictions_total || 0, icon: Target, color: '#8b5cf6', suffix: 'made' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: CheckCircle, color: '#3b82f6' },
  ]

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>
          Welcome back, <span style={{ color: 'var(--color-gold)' }}>{profile?.display_name?.split(' ')[0] || profile?.username}!</span> 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Here's your World Cup prediction summary.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map(({ label, value, icon: Icon, color, suffix }) => (
          <div key={label} className="card animate-slide-up" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon size={20} color={color} />
              </div>
            </div>
            <div className="font-display" style={{ fontSize: '2rem', color, marginBottom: 6, lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {label}{suffix ? ` (${suffix})` : ''}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
        {/* Upcoming matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⏱ Upcoming Matches</h2>
            <Link href="/predictions/matches" style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 600 }}>
              Predict all →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingMatches.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                No upcoming matches scheduled yet
              </div>
            ) : (
              upcomingMatches.map((match: any) => {
                const locked = isMatchLocked(match.kickoff_time, match.lock_minutes)
                return (
                  <Link
                    key={match.id}
                    href="/predictions/matches"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="card card-hover" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{match.stage.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: locked ? '#ef4444' : 'var(--color-gold)' }}>
                          <Clock size={12} />
                          {locked ? 'Locked' : formatCountdown(match.kickoff_time, match.lock_minutes)}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {match.home_team?.flag_url && (
                            <img src={match.home_team.flag_url} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.home_team?.name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>vs</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.away_team?.name}</span>
                          {match.away_team?.flag_url && (
                            <img src={match.away_team.flag_url} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' }}>
                        {formatKickoffTime(match.kickoff_time)}
                        {match.venue && ` • ${match.venue}`}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Recent results */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📋 Recent Results</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(recentPreds || []).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                No scored predictions yet
              </div>
            ) : (
              (recentPreds || []).map((pred: any) => {
                const isExact = pred.points_awarded === 5
                const isCorrect = pred.points_awarded > 0 && pred.points_awarded < 5
                const isWrong = pred.points_awarded === 0
                return (
                  <div key={pred.id} className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pred.match?.home_team?.name}</span>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Your pick</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pred.predicted_home} - {pred.predicted_away}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Result: {pred.match?.home_score} - {pred.match?.away_score}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>{pred.match?.away_team?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        {isExact ? <CheckCircle size={14} color="#10b981" /> : isCorrect ? <CheckCircle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
                        <span style={{ color: isExact ? '#10b981' : isCorrect ? '#f59e0b' : '#ef4444' }}>
                          {isExact ? 'Exact score!' : isCorrect ? 'Correct result' : 'Wrong prediction'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: pred.points_awarded > 0 ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        +{pred.points_awarded} pts
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
