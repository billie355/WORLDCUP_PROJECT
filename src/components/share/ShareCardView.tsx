'use client'

import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategoryLabel } from '@/lib/utils'

interface ShareCardViewProps {
  shareCard: {
    id: string
    snapshot: {
      username: string
      display_name: string | null
      avatar_url: string | null
      tournament_predictions: { category: string; label: string; value: string }[]
      match_predictions: {
        home_team: string; away_team: string
        home_flag: string | null; away_flag: string | null
        predicted_home: number; predicted_away: number
      }[]
      total_points: number
      rank: number | null
    }
  }
}

export default function ShareCardView({ shareCard }: ShareCardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const snap = shareCard.snapshot
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  async function downloadPng() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `predictcup-${snap.username}.png`
      link.href = dataUrl
      link.click()
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to export image')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      background: 'var(--color-bg)',
    }}>
      {/* The exportable card */}
      <div
        ref={cardRef}
        style={{
          width: 560,
          maxWidth: '100%',
          background: 'linear-gradient(135deg, #070b17 0%, #0d1a3a 50%, #0a1628 100%)',
          border: '2px solid rgba(245,158,11,0.5)',
          borderRadius: 20,
          padding: '40px 36px',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(245,158,11,0.2)',
        }}
      >
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,0.05)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, fontWeight: 600 }}>
              FIFA World Cup 2026
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MY PREDICTIONS
            </div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🏆</div>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(245,158,11,0.2)', border: '2px solid rgba(245,158,11,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', overflow: 'hidden',
          }}>
            {snap.avatar_url ? <img src={snap.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (snap.display_name || snap.username)?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>{snap.display_name || snap.username}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.8)' }}>@{snap.username}</div>
          </div>
          {snap.rank && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase' }}>Global Rank</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f59e0b' }}>#{snap.rank}</div>
            </div>
          )}
        </div>

        {/* Tournament predictions */}
        {snap.tournament_predictions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.7)', marginBottom: 12, fontWeight: 600 }}>
              Tournament Picks
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {snap.tournament_predictions.slice(0, 4).map((pred) => (
                <div key={pred.category} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.7)', marginBottom: 3 }}>{pred.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>{pred.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match predictions */}
        {snap.match_predictions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(148,163,184,0.7)', marginBottom: 12, fontWeight: 600 }}>
              Match Picks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {snap.match_predictions.slice(0, 4).map((pred, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {pred.home_flag && <img src={pred.home_flag} alt="" style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 2 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>{pred.home_team}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f59e0b', textAlign: 'center', minWidth: 50 }}>
                    {pred.predicted_home} - {pred.predicted_away}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>{pred.away_team}</span>
                    {pred.away_flag && <img src={pred.away_flag} alt="" style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 2 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)' }}>Generated on PredictCup 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(245,158,11,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Points</span>
            <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>{snap.total_points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button id="download-png-btn" onClick={downloadPng} className="btn btn-primary">
          <Download size={16} /> Download PNG
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=My%20World%20Cup%202026%20predictions!&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          𝕏 Share on 𝕏
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          📘 Facebook
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('My World Cup predictions: ' + shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  )
}
