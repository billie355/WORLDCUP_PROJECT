'use client'

import { useState, useTransition } from 'react'
import { adminUpdatePointsConfig } from '@/lib/actions/admin'
import { adminRecalculateScores } from '@/lib/actions/leaderboard'
import { RotateCcw, Save, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminLeaderboardClientProps {
  pointsConfig: { key: string; value: number; description: string | null }[]
  currentUserRole: 'admin' | 'staff'
}

export default function AdminLeaderboardClient({ pointsConfig, currentUserRole }: AdminLeaderboardClientProps) {
  const [config, setConfig] = useState(pointsConfig)
  const [isSaving, startSaving] = useTransition()
  const [isRecalculating, startRecalculating] = useTransition()
  const isAdmin = currentUserRole === 'admin'

  function handleSave() {
    startSaving(async () => {
      const result = await adminUpdatePointsConfig(config)
      if (result?.error) toast.error(result.error)
      else toast.success('Points configuration saved!')
    })
  }

  function handleRecalculate() {
    if (!confirm('Recalculate ALL scores? This will re-score every finished match. This may take a moment.')) return
    startRecalculating(async () => {
      const result = await adminRecalculateScores()
      if (result?.error) toast.error(result.error)
      else toast.success('Scores recalculated successfully!')
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 24 }}>⚙️ Leaderboard & Points</h1>

      {/* Staff notice */}
      {!isAdmin && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
          padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308',
        }}>
          <Shield size={14} />
          Staff mode — Points configuration is read-only. Contact an admin to change values.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32, alignItems: 'start' }}>
        {/* Points config */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.1rem' }}>Points Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {config.map((item, i) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                    {item.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.description}</div>
                </div>
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => setConfig((prev) => prev.map((c, j) => j === i ? { ...c, value: parseInt(e.target.value) || 0 } : c))}
                  min={0}
                  className="input-base"
                  disabled={!isAdmin}
                  style={{ width: 80, textAlign: 'center', fontWeight: 700, opacity: isAdmin ? 1 : 0.5 }}
                />
              </div>
            ))}
          </div>
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 24 }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          )}
        </div>

        {/* Recalculate actions — admin only */}
        {isAdmin && (
          <div className="card" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.15)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1.1rem' }}>⚠️ Recalculate Scores</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              This will recalculate all match prediction scores using the current points configuration.
              Use this after editing scores or changing the points system.
            </p>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              <RotateCcw size={16} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate All Scores'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
