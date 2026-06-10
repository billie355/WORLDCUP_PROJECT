'use client'

import { useState, useTransition } from 'react'
import { adminCreateTeam, adminCreatePlayer } from '@/lib/actions/admin'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminTournamentClientProps {
  teams: any[]
  players: any[]
}

export default function AdminTournamentClient({ teams: initialTeams, players: initialPlayers }: AdminTournamentClientProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams')
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleAddTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = await adminCreateTeam(new FormData(e.currentTarget))
      if (result?.error) toast.error(result.error)
      else { toast.success('Team added!'); setShowAddTeam(false) }
    })
  }

  async function handleAddPlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = await adminCreatePlayer(new FormData(e.currentTarget))
      if (result?.error) toast.error(result.error)
      else { toast.success('Player added!'); setShowAddPlayer(false) }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🏆 Tournament Management</h1>
        <button
          onClick={() => activeTab === 'teams' ? setShowAddTeam(!showAddTeam) : setShowAddPlayer(!showAddPlayer)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Add {activeTab === 'teams' ? 'Team' : 'Player'}
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 24, maxWidth: 300 }}>
        <button onClick={() => setActiveTab('teams')} className={`tab ${activeTab === 'teams' ? 'tab-active' : ''}`}>
          🏳️ Teams ({initialTeams.length})
        </button>
        <button onClick={() => setActiveTab('players')} className={`tab ${activeTab === 'players' ? 'tab-active' : ''}`}>
          ⚽ Players ({initialPlayers.length})
        </button>
      </div>

      {/* Add Team Form */}
      {showAddTeam && activeTab === 'teams' && (
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>New Team</h3>
          <form onSubmit={handleAddTeam}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              {[
                { name: 'name', label: 'Team Name', required: true, placeholder: 'e.g. Brazil' },
                { name: 'short_code', label: 'Short Code', required: true, placeholder: 'e.g. BRA' },
                { name: 'flag_url', label: 'Flag URL', placeholder: 'https://...' },
                { name: 'group_name', label: 'Group', placeholder: 'A, B, C...' },
                { name: 'confederation', label: 'Confederation', placeholder: 'UEFA, CONMEBOL...' },
              ].map(({ name, label, required, placeholder }) => (
                <div key={name}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input name={name} required={required} placeholder={placeholder} className="input-base" />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">{isPending ? '...' : 'Add Team'}</button>
              <button type="button" onClick={() => setShowAddTeam(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Player Form */}
      {showAddPlayer && activeTab === 'players' && (
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>New Player</h3>
          <form onSubmit={handleAddPlayer}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Name</label>
                <input name="name" required placeholder="Player name" className="input-base" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Team</label>
                <select name="team_id" required className="input-base">
                  <option value="">Select team</option>
                  {initialTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Position</label>
                <select name="position" required className="input-base">
                  {['GK', 'DEF', 'MID', 'FWD'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Birth Date</label>
                <input type="date" name="birth_date" className="input-base" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">{isPending ? '...' : 'Add Player'}</button>
              <button type="button" onClick={() => setShowAddPlayer(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Teams table */}
      {activeTab === 'teams' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {initialTeams.map((team, i) => (
            <div key={team.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 120px', gap: 16, padding: '12px 24px', alignItems: 'center', borderBottom: i < initialTeams.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {team.flag_url && <img src={team.flag_url} alt="" style={{ width: 28, height: 18, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                <span style={{ fontWeight: 600 }}>{team.name}</span>
              </div>
              <span className="badge badge-muted" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{team.short_code}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Group {team.group_name || '—'}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{team.confederation}</span>
            </div>
          ))}
          {initialTeams.length === 0 && <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No teams yet</div>}
        </div>
      )}

      {/* Players table */}
      {activeTab === 'players' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {initialPlayers.map((player, i) => (
            <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 80px 100px', gap: 16, padding: '12px 24px', alignItems: 'center', borderBottom: i < initialPlayers.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>{player.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{player.team?.name}</span>
              <span className="badge badge-muted" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{player.position}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                {player.birth_date ? new Date(player.birth_date).getFullYear() : '—'}
              </span>
            </div>
          ))}
          {initialPlayers.length === 0 && <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No players yet</div>}
        </div>
      )}
    </div>
  )
}
