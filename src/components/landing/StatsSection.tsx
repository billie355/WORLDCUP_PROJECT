'use client'

import { useEffect, useRef, useState } from 'react'

interface StatBarProps {
  label: string
  flagUrl?: string | null
  percentage: number
  color?: string
  delay?: number
}

function StatBar({ label, flagUrl, percentage, color = 'var(--gradient-gold)', delay = 0 }: StatBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), delay + 200)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 50px', alignItems: 'center', gap: 16, padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {flagUrl && (
          <img
            src={flagUrl}
            alt={label}
            style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      <div className="progress-track">
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: color,
            width: `${width}%`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'var(--color-gold)',
          textAlign: 'right',
        }}
      >
        {percentage}%
      </div>
    </div>
  )
}

interface StatsSectionProps {
  stats: {
    winnerLeaderboard: { name: string; flag_url: string | null; percentage: number }[]
    bootLeaderboard: { name: string; teamName: string; percentage: number }[]
    totalMatchPredictions: number
    totalUsers: number
  }
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container-app">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="badge badge-green" style={{ marginBottom: 16, display: 'inline-flex' }}>
            Live Community Stats
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
            What fans are
            <span style={{ color: 'var(--color-gold)' }}> predicting</span>
          </h2>
        </div>

        {/* Summary numbers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 48,
          }}
        >
          {[
            { label: 'Total Predictions', value: stats.totalMatchPredictions.toLocaleString(), color: 'var(--color-gold)' },
            { label: 'Active Fans', value: stats.totalUsers.toLocaleString(), color: 'var(--color-green)' },
            { label: 'Teams Competing', value: '48', color: 'var(--color-purple)' },
            { label: 'Matches to Predict', value: '104', color: 'var(--color-blue)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: 28 }}>
              <div className="font-display" style={{ fontSize: '2.2rem', color, marginBottom: 8 }}>
                {value}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
          {/* Winner predictions */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              🏆 Most Predicted Winner
            </h3>
            {stats.winnerLeaderboard.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.winnerLeaderboard.map((team, i) => (
                  <StatBar
                    key={team.name}
                    label={team.name}
                    flagUrl={team.flag_url}
                    percentage={team.percentage}
                    delay={i * 100}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No predictions yet — be the first!
              </p>
            )}
          </div>

          {/* Golden boot predictions */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              ⚽ Most Predicted Golden Boot
            </h3>
            {stats.bootLeaderboard.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.bootLeaderboard.map((player, i) => (
                  <StatBar
                    key={player.name}
                    label={player.name}
                    percentage={player.percentage}
                    color="linear-gradient(90deg, #059669, #10b981)"
                    delay={i * 100}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No predictions yet — be the first!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
