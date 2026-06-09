import { getAllTeams, getAllPlayers, getUserTournamentPredictions } from '@/lib/actions/predictions'
import TournamentPredictionsClient from '@/components/predictions/TournamentPredictionsClient'
import type { Metadata } from 'next'
import type { TournamentCategory } from '@/types'

export const metadata: Metadata = { title: 'Tournament Predictions' }

export default async function TournamentPredictionsPage() {
  const [{ data: teams }, { data: players }, { data: userPreds }] = await Promise.all([
    getAllTeams(),
    getAllPlayers(),
    getUserTournamentPredictions(),
  ])

  // Build lookup by category
  const predMap = (userPreds || []).reduce((acc: any, p: any) => {
    acc[p.category] = p
    return acc
  }, {} as Record<TournamentCategory, any>)

  const totalPredicted = Object.keys(predMap).length

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          🏆 Tournament Predictions
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Who will lift the trophy? Predict all 6 tournament awards for bonus points.
        </p>
        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="progress-track" style={{ flex: 1, height: 6 }}>
            <div className="progress-fill" style={{ width: `${(totalPredicted / 6) * 100}%` }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {totalPredicted}/6 predicted
          </span>
        </div>
      </div>

      <TournamentPredictionsClient
        teams={teams as any}
        players={players as any}
        userPredictions={predMap}
      />
    </div>
  )
}
