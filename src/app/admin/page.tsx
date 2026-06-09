import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Overview' }

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalPredictions },
    { count: totalMatches },
    { count: finishedMatches },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('predictions').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'finished'),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, icon: '👥', color: '#8b5cf6' },
    { label: 'Match Predictions', value: totalPredictions || 0, icon: '⚽', color: '#f59e0b' },
    { label: 'Total Matches', value: totalMatches || 0, icon: '🏟️', color: '#3b82f6' },
    { label: 'Matches Scored', value: finishedMatches || 0, icon: '✅', color: '#10b981' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Admin Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
            <div className="font-display" style={{ fontSize: '2.2rem', color, marginBottom: 8 }}>
              {value.toLocaleString()}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
