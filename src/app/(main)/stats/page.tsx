import { getPublicStats } from '@/lib/actions/leaderboard'
import StatsSection from '@/components/landing/StatsSection'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community Stats' }

export default async function StatsPage() {
  const stats = await getPublicStats()

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          📊 Community Statistics
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          See what millions of fans are predicting for the 2026 World Cup.
        </p>
      </div>
      <StatsSection stats={stats} />
    </div>
  )
}
