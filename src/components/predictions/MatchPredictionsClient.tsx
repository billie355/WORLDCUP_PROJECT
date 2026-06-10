'use client'

import { useState, useTransition, useEffect } from 'react'
import { Clock, Lock, CheckCircle, XCircle, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import { submitMatchPrediction } from '@/lib/actions/predictions'
import { formatKickoffTime, formatCountdown, isMatchLocked, getStageLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Match, Prediction, MatchStage } from '@/types'

interface MatchPredictionsClientProps {
  matches: Match[]
  userPredictions: Record<string, Prediction>
}

const STAGE_ORDER: MatchStage[] = ['group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']

function MatchCard({ match, prediction }: { match: any; prediction?: any }) {
  const [homeScore, setHomeScore] = useState(prediction?.predicted_home ?? '')
  const [awayScore, setAwayScore] = useState(prediction?.predicted_away ?? '')
  const [isPending, startTransition] = useTransition()
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

  return (
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
  )
}

export default function MatchPredictionsClient({ matches, userPredictions }: MatchPredictionsClientProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(['group']))

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
