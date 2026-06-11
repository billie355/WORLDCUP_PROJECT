'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, Check, User, Trophy, Zap } from 'lucide-react'
import { submitPlayerMatchPrediction, getPlayersForMatch } from '@/lib/actions/player-predictions'
import toast from 'react-hot-toast'
import type { PlayerMatchPrediction, PlayerPredictionType } from '@/types'

interface PlayerOption {
  id: string
  name: string
  position: string | null
  team: { id: string; name: string; flag_url: string | null } | null
}

interface PlayerPicksSectionProps {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  locked: boolean
  existingPicks: Record<PlayerPredictionType, PlayerMatchPrediction | undefined>
}

function PlayerSearchDropdown({
  label,
  icon,
  players,
  currentPick,
  locked,
  onSave,
}: {
  label: string
  icon: React.ReactNode
  players: PlayerOption[]
  currentPick: PlayerMatchPrediction | undefined
  locked: boolean
  onSave: (playerId: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(currentPick?.player_id || null)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentName = currentPick?.player
    ? (currentPick.player as any).name
    : players.find((p) => p.id === selected)?.name

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team?.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate fixed position when opening
  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropHeight = 280

    if (spaceBelow >= dropHeight) {
      // Open below
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    } else {
      // Open above
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
    setOpen(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function handleSelect(playerId: string) {
    setSelected(playerId)
    setOpen(false)
    setSearch('')
    startTransition(async () => {
      await onSave(playerId)
    })
  }

  const dropdownContent = open ? (
    <div
      ref={dropdownRef}
      style={{
        ...dropdownStyle,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0d1830',
        border: '1px solid rgba(245,158,11,0.35)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.5)' }} />
          <input
            autoFocus
            placeholder="Search player or team…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px 7px 28px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, fontSize: '0.8rem', color: '#f1f5f9', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '16px 14px', fontSize: '0.8rem', color: 'rgba(148,163,184,0.5)', textAlign: 'center' }}>
            No players found
          </div>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(p.id) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px',
                background: selected === p.id ? 'rgba(245,158,11,0.12)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (selected !== p.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { if (selected !== p.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {p.team?.flag_url && (
                <img
                  src={p.team.flag_url}
                  alt=""
                  style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.83rem', fontWeight: 600,
                  color: selected === p.id ? '#f59e0b' : '#f1f5f9',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(148,163,184,0.6)' }}>
                  {p.team?.name} · {p.position || '—'}
                </div>
              </div>
              {selected === p.id && <Check size={13} color="#f59e0b" />}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: 'var(--color-gold)', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
          {label}
        </span>
      </div>

      {locked ? (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--color-border)',
          fontSize: '0.85rem', fontWeight: 600,
          color: currentName ? '#f1f5f9' : 'var(--color-text-subtle)',
        }}>
          {currentName || '—'}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <button
            ref={triggerRef}
            onClick={() => open ? (setOpen(false), setSearch('')) : openDropdown()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: selected ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${open ? 'rgba(245,158,11,0.5)' : selected ? 'rgba(245,158,11,0.4)' : 'var(--color-border)'}`,
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentName ? '#f1f5f9' : 'var(--color-text-subtle)' }}>
              {isPending ? 'Saving…' : (currentName || 'Pick a player…')}
            </span>
            {currentName && !isPending && <Check size={13} color="var(--color-gold)" />}
          </button>

          {/* Render dropdown in a portal to escape overflow clipping */}
          {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
      )}
    </div>
  )
}

export default function PlayerPicksSection({
  matchId,
  homeTeamName,
  awayTeamName,
  locked,
  existingPicks,
}: PlayerPicksSectionProps) {
  const [players, setPlayers] = useState<PlayerOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPlayersForMatch(matchId).then(({ data }) => {
      setPlayers(data as PlayerOption[])
      setLoading(false)
    })
  }, [matchId])

  async function handleSave(type: PlayerPredictionType, playerId: string) {
    const result = await submitPlayerMatchPrediction(matchId, type, playerId)
    if (result?.error) toast.error(result.error)
    else toast.success('Player pick saved!')
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(245,158,11,0.15)' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={12} color="var(--color-gold)" />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,158,11,0.8)' }}>
          Player Picks
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', marginLeft: 'auto' }}>
          {homeTeamName} vs {awayTeamName}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
          Loading players…
        </div>
      ) : players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
          No players listed for this match yet.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <PlayerSearchDropdown
            label="Goal Scorer"
            icon={<Zap size={13} />}
            players={players}
            currentPick={existingPicks.goal_scorer}
            locked={locked}
            onSave={(pid) => handleSave('goal_scorer', pid)}
          />
          <PlayerSearchDropdown
            label="Man of the Match"
            icon={<Trophy size={13} />}
            players={players}
            currentPick={existingPicks.man_of_match}
            locked={locked}
            onSave={(pid) => handleSave('man_of_match', pid)}
          />
        </div>
      )}

      {!locked && (
        <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.67rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} color="var(--color-gold)" /> Goal scorer correct = <strong style={{ color: 'var(--color-gold)' }}>+15 pts</strong>
          </span>
          <span style={{ fontSize: '0.67rem', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Trophy size={10} color="var(--color-gold)" /> Man of Match correct = <strong style={{ color: 'var(--color-gold)' }}>+10 pts</strong>
          </span>
        </div>
      )}
    </div>
  )
}
