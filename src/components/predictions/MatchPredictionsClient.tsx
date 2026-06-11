'use client'

import { useState, useTransition, useEffect } from 'react'
import { Clock, Lock, CheckCircle, XCircle, Share2, ChevronDown, ChevronUp, User } from 'lucide-react'
import { submitMatchPrediction } from '@/lib/actions/predictions'
import { getUserPlayerMatchPredictions } from '@/lib/actions/player-predictions'
import { formatKickoffTime, formatCountdown, isMatchLocked, getStageLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Match, Prediction, MatchStage, PlayerMatchPrediction, PlayerPredictionType } from '@/types'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

// Lazy-load heavy components
const PlayerPicksSection = dynamic(() => import('./PlayerPicksSection'), { ssr: false })
const MatchShareModal = dynamic(() => import('@/components/share/MatchShareModal'), { ssr: false })

interface MatchPredictionsClientProps {
  matches: Match[]
  userPredictions: Record<string, Prediction>
}

const STAGE_ORDER: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']

function MatchCard({
  match,
  prediction,
  playerPicks,
  currentUser,
}: {
  match: any
  prediction?: any
  playerPicks: Record<PlayerPredictionType, PlayerMatchPrediction | undefined>
  currentUser: { username: string; display_name: string | null } | null
}) {
  const [homeScore, setHomeScore] = useState(prediction?.predicted_home ?? '')
  const [awayScore, setAwayScore] = useState(prediction?.predicted_away ?? '')
  const [isPending, startTransition] = useTransition()
  const [showPlayerPicks, setShowPlayerPicks] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const locked = isMatchLocked(match.kickoff_time, match.lock_minutes)
  const hasResult = match.home_score !== null
  const countdown = formatCountdown(match.kickoff_time, match.lock_minutes)
  const hasPrediction = prediction !== undefined

  // Result indicator
  let resultStatus: 'exact' | 'correct' | 'wrong' | null = null
  if (hasResult && hasPrediction && prediction.points_awarded !== null) {
    if (prediction.points_awarded === 5) resultStatus = 'exact'
    else if (prediction.points_awarded > 0) resultStatus = 'correct'
    else resultStatus = 'wrong'
  }

  function handleSubmit() {
    if (homeScore === '' || awayScore === '') {
      toast.error('Please enter both scores')
      return
    }
    startTransition(async () => {
      const result = await submitMatchPrediction(match.id, parseInt(homeScore), parseInt(awayScore))
      if (result?.error) toast.error(result.error)
      else toast.success(hasPrediction ? 'Prediction updated!' : 'Prediction saved!')
    })
  }

  const hasPlayerPicks = playerPicks.goal_scorer || playerPicks.man_of_match
  const goalScorerName = (playerPicks.goal_scorer?.player as any)?.name ?? null
  const motmName = (playerPicks.man_of_match?.player as any)?.name ?? null

  return (
    <>
      <div
        className="card"
        style={{
          padding: '20px 24px',
          opacity: locked && !hasPrediction ? 0.7 : 1,
          borderColor: resultStatus === 'exact' ? 'rgba(16,185,129,0.4)'
            : resultStatus === 'correct' ? 'rgba(245,158,11,0.4)'
            : resultStatus === 'wrong' ? 'rgba(239,68,68,0.2)'
            : undefined,
        }}
      >
        {/* Top row: stage badge + time/lock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className={`badge ${match.status === 'live' ? 'badge-red' : 'badge-muted'}`} style={{ fontSize: '0.7rem' }}>
            {match.status === 'live' ? '🔴 LIVE' : getStageLabel(match.stage)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: locked ? '#ef4444' : 'var(--color-gold)' }}>
            {locked ? <Lock size={12} /> : <Clock size={12} />}
            {locked ? (hasResult ? `${match.home_score} - ${match.away_score}` : 'Locked') : `Locks in ${countdown}`}
          </div>
        </div>

        {/* Teams + score inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
          {/* Home team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {(match.home_team as any)?.flag_url && (
              <img
                src={(match.home_team as any).flag_url}
                alt=""
                style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'center' }}>
              {(match.home_team as any)?.name}
            </span>
          </div>

          {/* Score inputs / result */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                className="score-input"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                min={0}
                max={20}
                disabled={locked}
                placeholder="0"
                aria-label={`${(match.home_team as any)?.name} predicted score`}
              />
              <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 300 }}>-</span>
              <input
                type="number"
                className="score-input"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                min={0}
                max={20}
                disabled={locked}
                placeholder="0"
                aria-label={`${(match.away_team as any)?.name} predicted score`}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', textAlign: 'center' }}>
              {formatKickoffTime(match.kickoff_time)}
            </div>
          </div>

          {/* Away team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {(match.away_team as any)?.flag_url && (
              <img
                src={(match.away_team as any).flag_url}
                alt=""
                style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <span style={{ fontSize: '0.9rem', fontWeight: 700, textAlign: 'center' }}>
              {(match.away_team as any)?.name}
            </span>
          </div>
        </div>

        {/* Result badge + save button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
          {resultStatus ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
              {resultStatus === 'exact' ? <CheckCircle size={14} color="#10b981" /> : resultStatus === 'correct' ? <CheckCircle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
              <span style={{ color: resultStatus === 'exact' ? '#10b981' : resultStatus === 'correct' ? '#f59e0b' : '#ef4444' }}>
                {resultStatus === 'exact' ? 'Exact! +5pts' : resultStatus === 'correct' ? 'Correct! +3pts' : 'Wrong prediction'}
              </span>
            </div>
          ) : hasPrediction ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-green)' }}>✓ Predicted</span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{locked ? 'Not predicted' : 'Enter your prediction'}</span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Share button — only if prediction exists */}
            {hasPrediction && (
              <button
                id={`share-btn-${match.id}`}
                onClick={() => setShareOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 12px', gap: 6 }}
                title="Share your prediction"
              >
                <Share2 size={13} /> Share
              </button>
            )}

            {!locked && (
              <button
                id={`predict-btn-${match.id}`}
                onClick={handleSubmit}
                disabled={isPending}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 80 }}
              >
                {isPending ? '...' : hasPrediction ? 'Update' : 'Save'}
              </button>
            )}
            {locked && hasPrediction && prediction?.points_awarded !== null && (
              <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '0.9rem' }}>
                +{prediction.points_awarded} pts
              </span>
            )}
          </div>
        </div>

        {/* Player picks toggle */}
        <button
          id={`player-picks-toggle-${match.id}`}
          onClick={() => setShowPlayerPicks((v) => !v)}
          style={{
            width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: showPlayerPicks ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showPlayerPicks ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
            <User size={13} color={showPlayerPicks ? 'var(--color-gold)' : 'var(--color-text-muted)'} />
            <span style={{ fontWeight: 600, color: showPlayerPicks ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
              Player Picks
            </span>
            {hasPlayerPicks && (
              <span style={{ fontSize: '0.65rem', color: 'var(--color-green)' }}>
                ✓ {[goalScorerName, motmName].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          {showPlayerPicks
            ? <ChevronUp size={14} color="var(--color-text-muted)" />
            : <ChevronDown size={14} color="var(--color-text-muted)" />
          }
        </button>

        {showPlayerPicks && (
          <PlayerPicksSection
            matchId={match.id}
            homeTeamName={(match.home_team as any)?.name || ''}
            awayTeamName={(match.away_team as any)?.name || ''}
            locked={locked}
            existingPicks={playerPicks}
          />
        )}
      </div>

      {/* Share Modal */}
      <MatchShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        match={{
          id: match.id,
          home_team: (match.home_team as any)?.name || '',
          away_team: (match.away_team as any)?.name || '',
          home_flag: (match.home_team as any)?.flag_url || null,
          away_flag: (match.away_team as any)?.flag_url || null,
          kickoff_time: match.kickoff_time,
          stage: match.stage,
        }}
        prediction={{
          predicted_home: prediction?.predicted_home ?? 0,
          predicted_away: prediction?.predicted_away ?? 0,
        }}
        playerPicks={{
          goal_scorer: goalScorerName,
          man_of_match: motmName,
        }}
        username={currentUser?.username || 'fan'}
        displayName={currentUser?.display_name}
      />
    </>
  )
}

export default function MatchPredictionsClient({ matches, userPredictions }: MatchPredictionsClientProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(['group']))
  const [playerPicks, setPlayerPicks] = useState<Record<string, Record<PlayerPredictionType, PlayerMatchPrediction | undefined>>>({})
  const [currentUser, setCurrentUser] = useState<{ username: string; display_name: string | null } | null>(null)

  // Load player picks for all matches and current user profile
  useEffect(() => {
    const matchIds = matches.map((m) => m.id)

    getUserPlayerMatchPredictions(matchIds).then(({ data }) => {
      const map: Record<string, Record<PlayerPredictionType, PlayerMatchPrediction | undefined>> = {}
      for (const pick of data as PlayerMatchPrediction[]) {
        if (!map[pick.match_id]) map[pick.match_id] = { goal_scorer: undefined, man_of_match: undefined }
        map[pick.match_id][pick.prediction_type] = pick
      }
      setPlayerPicks(map)
    })

    // Fetch current user profile for share card
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('username, display_name').eq('id', user.id).single().then(({ data }) => {
        if (data) setCurrentUser(data as any)
      })
    })
  }, [matches])

  // Group by stage
  const groupedMatches = STAGE_ORDER.reduce((acc, stage) => {
    const stageMatches = matches.filter((m) => m.stage === stage)
    if (stageMatches.length > 0) acc[stage] = stageMatches
    return acc
  }, {} as Record<string, Match[]>)

  function toggleStage(stage: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stage)) next.delete(stage)
      else next.add(stage)
      return next
    })
  }

  return (
    <div>
      {Object.entries(groupedMatches).map(([stage, stageMatches]) => {
        const expanded = expandedStages.has(stage)
        const predicted = stageMatches.filter((m) => userPredictions[m.id]).length
        return (
          <div key={stage} style={{ marginBottom: 24 }}>
            <button
              onClick={() => toggleStage(stage)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)', borderRadius: expanded ? '14px 14px 0 0' : 14,
                cursor: 'pointer', marginBottom: expanded ? 0 : 0,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{getStageLabel(stage as MatchStage)}</span>
                <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                  {predicted}/{stageMatches.length} predicted
                </span>
              </div>
              {expanded ? <ChevronUp size={18} color="var(--color-text-muted)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
            </button>
            {expanded && (
              <div style={{
                border: '1px solid var(--color-border)', borderTop: 'none',
                borderRadius: '0 0 14px 14px', padding: 16,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: 16,
              }}>
                {stageMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={userPredictions[match.id]}
                    playerPicks={playerPicks[match.id] || { goal_scorer: undefined, man_of_match: undefined }}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
