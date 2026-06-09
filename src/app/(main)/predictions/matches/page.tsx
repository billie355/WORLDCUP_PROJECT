import { createClient } from '@/lib/supabase/server'
import { getAllMatches, getUserMatchPredictions } from '@/lib/actions/predictions'
import MatchPredictionsClient from '@/components/predictions/MatchPredictionsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Match Predictions' }

export default async function MatchPredictionsPage() {
  const [{ data: matches }, { data: userPreds }] = await Promise.all([
    getAllMatches(),
    getUserMatchPredictions(),
  ])

  // Build lookup map
  const predictionMap = (userPreds || []).reduce((acc: any, pred: any) => {
    acc[pred.match_id] = pred
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          ⚽ Match Predictions
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Predict the score for every match. Earn up to 5 points for an exact scoreline!
        </p>
      </div>

      {/* Points guide */}
      <div className="glass-gold" style={{ borderRadius: 14, padding: '16px 24px', marginBottom: 32, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Correct winner', pts: '3 pts', color: '#f59e0b' },
          { label: 'Correct draw', pts: '3 pts', color: '#f59e0b' },
          { label: 'Exact score', pts: '5 pts', color: '#10b981' },
        ].map(({ label, pts, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 700, color, fontSize: '1rem' }}>{pts}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏟️</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No matches scheduled yet</h3>
          <p>The admin will add matches soon. Check back later!</p>
        </div>
      ) : (
        <MatchPredictionsClient matches={matches as any} userPredictions={predictionMap} />
      )}
    </div>
  )
}
