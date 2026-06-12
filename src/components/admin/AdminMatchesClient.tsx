'use client'

import { useState, useTransition } from 'react'
import { adminUpdateMatch, adminCreateMatch } from '@/lib/actions/admin'
import { formatKickoffTime, getStageLabel } from '@/lib/utils'
import { Plus, Edit2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MatchStage } from '@/types'

const STAGES: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']
const ALL_STATUSES = ['scheduled', 'live', 'finished', 'postponed', 'cancelled']
// Staff cannot set 'finished' — that triggers scoring
const STAFF_STATUSES = ['scheduled', 'live', 'postponed', 'cancelled']

interface AdminMatchesClientProps {
  matches: any[]
  teams: any[]
  currentUserRole: 'admin' | 'staff'
}

export default function AdminMatchesClient({ matches: initialMatches, teams, currentUserRole }: AdminMatchesClientProps) {
  const [matches, setMatches] = useState(initialMatches)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentUserRole === 'admin'
  const availableStatuses = isAdmin ? ALL_STATUSES : STAFF_STATUSES

  async function handleUpdateMatch(matchId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await adminUpdateMatch(matchId, formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Match updated!'); setEditingId(null) }
    })
  }

  async function handleAddMatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await adminCreateMatch(formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Match created!'); setShowAdd(false) }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Match Management</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">
          <Plus size={16} /> Add Match
        </button>
      </div>

      {/* Staff notice */}
      {!isAdmin && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
          padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308',
        }}>
          <Shield size={14} />
          Staff mode — You can add/edit matches (venue, schedule) but cannot enter scores or mark matches as finished.
        </div>
      )}

      {/* Add match form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 32, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>New Match</h3>
          <form onSubmit={handleAddMatch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Home Team</label>
                <select name="home_team_id" required className="input-base">
                  <option value="">Select team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Away Team</label>
                <select name="away_team_id" required className="input-base">
                  <option value="">Select team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Kickoff Time</label>
                <input type="datetime-local" name="kickoff_time" required className="input-base" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Stage</label>
                <select name="stage" required className="input-base">
                  {STAGES.map((s) => <option key={s} value={s}>{getStageLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Venue</label>
                <input type="text" name="venue" placeholder="Stadium name" className="input-base" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Lock (minutes before kickoff)</label>
                <input type="number" name="lock_minutes" defaultValue={60} min={0} className="input-base" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? 'Creating...' : 'Create Match'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Matches table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <div style={{ minWidth: 800 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 180px 120px 140px 100px',
          gap: 16, padding: '12px 24px',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.72rem', color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
        }}>
          <span>Home</span><span>Away</span><span>Kickoff</span><span>Stage</span><span>Result</span><span>Action</span>
        </div>
        {matches.map((match) => (
          <div key={match.id}>
            {editingId === match.id ? (
              <form onSubmit={(e) => handleUpdateMatch(match.id, e)} style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Kickoff Time</label>
                    <input type="datetime-local" name="kickoff_time" defaultValue={match.kickoff_time?.slice(0, 16)} className="input-base" style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Venue</label>
                    <input type="text" name="venue" defaultValue={match.venue || ''} className="input-base" style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
                    <select name="status" defaultValue={match.status} className="input-base" style={{ fontSize: '0.8rem' }}>
                      {availableStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Score fields — admin only */}
                  {isAdmin && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Home Score</label>
                        <input type="number" name="home_score" defaultValue={match.home_score ?? ''} min={0} className="input-base" style={{ fontSize: '0.8rem' }} placeholder="—" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Away Score</label>
                        <input type="number" name="away_score" defaultValue={match.away_score ?? ''} min={0} className="input-base" style={{ fontSize: '0.8rem' }} placeholder="—" />
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">{isPending ? '...' : 'Save'}</button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 180px 120px 140px 100px',
                gap: 16, padding: '14px 24px', alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.875rem',
              }}>
                <span style={{ fontWeight: 600 }}>{match.home_team?.name}</span>
                <span style={{ fontWeight: 600 }}>{match.away_team?.name}</span>
                <span suppressHydrationWarning style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatKickoffTime(match.kickoff_time)}</span>
                <span className="badge badge-muted" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{getStageLabel(match.stage)}</span>
                <span style={{ fontWeight: 700, color: match.home_score !== null ? 'var(--color-gold)' : 'var(--color-text-subtle)' }}>
                  {match.home_score !== null ? `${match.home_score} - ${match.away_score}` : '— vs —'}
                </span>
                <button
                  onClick={() => setEditingId(match.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px' }}
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
        {matches.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No matches yet. Add the first one above.
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
