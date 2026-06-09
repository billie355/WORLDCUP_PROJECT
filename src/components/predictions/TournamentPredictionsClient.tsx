'use client'

import { useState, useTransition } from 'react'
import { submitTournamentPrediction } from '@/lib/actions/predictions'
import { getCategoryLabel } from '@/lib/utils'
import { Check, Search, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import type { TournamentCategory, Team, Player, TournamentPrediction } from '@/types'

const TEAM_CATEGORIES: TournamentCategory[] = ['winner', 'runner_up']
const PLAYER_CATEGORIES: TournamentCategory[] = ['golden_boot', 'best_player', 'best_young_player', 'best_goalkeeper']

const CATEGORY_ICONS: Record<TournamentCategory, string> = {
  winner: '🏆',
  runner_up: '🥈',
  golden_boot: '⚽',
  best_player: '🌟',
  best_young_player: '🌱',
  best_goalkeeper: '🧤',
}

const CATEGORY_POINTS: Record<TournamentCategory, number> = {
  winner: 30,
  runner_up: 15,
  golden_boot: 20,
  best_player: 20,
  best_young_player: 10,
  best_goalkeeper: 10,
}

function TeamSelector({
  category,
  teams,
  currentTeamId,
  onSave,
}: {
  category: TournamentCategory
  teams: Team[]
  currentTeamId: string | null
  onSave: (teamId: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(currentTeamId)
  const [isPending, startTransition] = useTransition()

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.group_name?.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave() {
    if (!selected) return
    startTransition(async () => {
      await onSave(selected)
    })
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
        <input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base"
          style={{ paddingLeft: 36, fontSize: '0.85rem' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
        {filtered.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelected(team.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '12px 8px', border: '2px solid',
              borderColor: selected === team.id ? 'var(--color-gold)' : 'var(--color-border)',
              borderRadius: 12, background: selected === team.id ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
            }}
          >
            {selected === team.id && (
              <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={10} color="#0a0e1a" strokeWidth={3} />
              </div>
            )}
            {team.flag_url && (
              <img src={team.flag_url} alt="" style={{ width: 40, height: 26, objectFit: 'cover', borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{team.name}</div>
            {team.group_name && <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)' }}>Group {team.group_name}</div>}
          </button>
        ))}
      </div>
      {selected && (
        <button
          onClick={handleSave}
          disabled={isPending || selected === currentTeamId}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16 }}
        >
          {isPending ? 'Saving...' : selected === currentTeamId ? '✓ Saved' : 'Save Prediction'}
        </button>
      )}
    </div>
  )
}

function PlayerSelector({
  category,
  players,
  currentPlayerId,
  onSave,
}: {
  category: TournamentCategory
  players: Player[]
  currentPlayerId: string | null
  onSave: (playerId: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(currentPlayerId)
  const [isPending, startTransition] = useTransition()

  // Filter by position for goalkeeper category
  let filteredPlayers = players
  if (category === 'best_goalkeeper') filteredPlayers = players.filter((p) => p.position === 'GK')
  if (category === 'best_young_player') filteredPlayers = players.filter((p) => {
    if (!p.birth_date) return true
    const age = (Date.now() - new Date(p.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return age <= 23
  })

  const visible = filteredPlayers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.team as any)?.name?.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave() {
    if (!selected) return
    startTransition(async () => { await onSave(selected) })
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
        <input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base"
          style={{ paddingLeft: 36, fontSize: '0.85rem' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
        {visible.map((player) => (
          <button
            key={player.id}
            onClick={() => setSelected(player.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', border: '2px solid',
              borderColor: selected === player.id ? 'var(--color-gold)' : 'var(--color-border)',
              borderRadius: 10, background: selected === player.id ? 'rgba(245,158,11,0.06)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
          >
            {selected === player.id && <Check size={14} color="var(--color-gold)" />}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{player.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {(player.team as any)?.name} • {player.position}
              </div>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <button
          onClick={handleSave}
          disabled={isPending || selected === currentPlayerId}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16 }}
        >
          {isPending ? 'Saving...' : selected === currentPlayerId ? '✓ Saved' : 'Save Prediction'}
        </button>
      )}
    </div>
  )
}

interface TournamentPredictionsClientProps {
  teams: Team[]
  players: Player[]
  userPredictions: Record<TournamentCategory, TournamentPrediction>
}

export default function TournamentPredictionsClient({ teams, players, userPredictions }: TournamentPredictionsClientProps) {
  const [expanded, setExpanded] = useState<TournamentCategory | null>('winner')

  async function handleTeamSave(category: TournamentCategory, teamId: string) {
    const result = await submitTournamentPrediction(category, teamId, null)
    if (result?.error) toast.error(result.error)
    else toast.success('Prediction saved!')
  }

  async function handlePlayerSave(category: TournamentCategory, playerId: string) {
    const result = await submitTournamentPrediction(category, null, playerId)
    if (result?.error) toast.error(result.error)
    else toast.success('Prediction saved!')
  }

  const allCategories = [...TEAM_CATEGORIES, ...PLAYER_CATEGORIES] as TournamentCategory[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {allCategories.map((category) => {
        const pred = userPredictions[category]
        const isTeamCat = TEAM_CATEGORIES.includes(category)
        const isExpanded = expanded === category
        const savedValue = pred?.selected_team?.name || pred?.selected_player?.name

        return (
          <div key={category} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(isExpanded ? null : category)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: savedValue ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${savedValue ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                }}>
                  {CATEGORY_ICONS[category]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{getCategoryLabel(category)}</div>
                  <div style={{ fontSize: '0.8rem', color: savedValue ? 'var(--color-green)' : 'var(--color-text-muted)', marginTop: 2 }}>
                    {savedValue ? `✓ ${savedValue}` : 'Not predicted yet'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>+{CATEGORY_POINTS[category]} pts</span>
                {isExpanded ? <ChevronDown size={18} color="var(--color-text-muted)" style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
              </div>
            </button>
            {isExpanded && (
              <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                {isTeamCat ? (
                  <TeamSelector
                    category={category}
                    teams={teams}
                    currentTeamId={pred?.selected_team_id || null}
                    onSave={(teamId) => handleTeamSave(category, teamId)}
                  />
                ) : (
                  <PlayerSelector
                    category={category}
                    players={players}
                    currentPlayerId={pred?.selected_player_id || null}
                    onSave={(playerId) => handlePlayerSave(category, playerId)}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
