'use client'

import { useRef, useEffect, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Download, X, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface MatchShareModalProps {
  isOpen: boolean
  onClose: () => void
  match: {
    id: string
    home_team: string
    away_team: string
    home_flag: string | null
    away_flag: string | null
    kickoff_time: string
    stage: string
  }
  prediction: {
    predicted_home: number
    predicted_away: number
  }
  playerPicks?: {
    goal_scorer?: string | null
    man_of_match?: string | null
  }
  username: string
  displayName?: string | null
}

function getStageEmoji(stage: string) {
  const map: Record<string, string> = {
    group: 'Group Stage',
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_final: 'Quarter Final 🔥',
    semi_final: 'Semi Final 💫',
    third_place: 'Third Place',
    final: 'THE FINAL 🏆',
  }
  return map[stage] || stage
}

export default function MatchShareModal({
  isOpen,
  onClose,
  match,
  prediction,
  playerPicks,
  username,
  displayName,
}: MatchShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, handleKey])

  if (!isOpen) return null

  async function downloadPng() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `predictcup-${match.home_team}-vs-${match.away_team}.png`
      link.href = dataUrl
      link.click()
      toast.success('Card downloaded!')
    } catch {
      toast.error('Failed to export image')
    }
  }

  const predHome = prediction.predicted_home
  const predAway = prediction.predicted_away
  const predResult = predHome > predAway ? match.home_team
    : predAway > predHome ? match.away_team
    : 'Draw'

  const shareText = `🏆 My World Cup prediction: ${match.home_team} ${predHome}–${predAway} ${match.away_team}! Can you beat me? #PredictCup2026`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,8,18,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Close button */}
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* === The exportable card === */}
        <div
          ref={cardRef}
          style={{
            width: 480,
            maxWidth: '100%',
            background: 'linear-gradient(135deg, #060a16 0%, #0c1830 45%, #070f22 100%)',
            border: '2px solid rgba(245,158,11,0.45)',
            borderRadius: 24,
            padding: '36px 32px',
            fontFamily: 'Outfit, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(245,158,11,0.18), 0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>
                FIFA World Cup 2026
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 30%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {getStageEmoji(match.stage)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: '0.62rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Predicted by</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{displayName || username}</span>
            </div>
          </div>

          {/* Match-up */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center', gap: 16, marginBottom: 28,
          }}>
            {/* Home */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {match.home_flag && (
                <img
                  src={match.home_flag}
                  alt=""
                  style={{ width: 64, height: 43, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', textAlign: 'center', lineHeight: 1.2 }}>
                {match.home_team}
              </span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 14, padding: '10px 18px',
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{predHome}</span>
                <span style={{ fontSize: '1.2rem', color: 'rgba(245,158,11,0.5)', fontWeight: 300 }}>–</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{predAway}</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                MY PICK
              </div>
            </div>

            {/* Away */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {match.away_flag && (
                <img
                  src={match.away_flag}
                  alt=""
                  style={{ width: 64, height: 43, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', textAlign: 'center', lineHeight: 1.2 }}>
                {match.away_team}
              </span>
            </div>
          </div>

          {/* Player picks */}
          {(playerPicks?.goal_scorer || playerPicks?.man_of_match) && (
            <div style={{
              display: 'grid', gridTemplateColumns: playerPicks.goal_scorer && playerPicks.man_of_match ? '1fr 1fr' : '1fr',
              gap: 10, marginBottom: 20,
            }}>
              {playerPicks.goal_scorer && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚡ Goal Scorer</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>{playerPicks.goal_scorer}</div>
                </div>
              )}
              {playerPicks.man_of_match && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>🏅 Man of Match</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>{playerPicks.man_of_match}</div>
                </div>
              )}
            </div>
          )}

          {/* Winner tag */}
          <div style={{
            textAlign: 'center', padding: '10px 0',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {predHome === predAway ? '🤝 I predict a Draw' : `🏆 I back ${predResult}`}
            </span>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.62rem', color: 'rgba(148,163,184,0.4)' }}>predictcup.app</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(148,163,184,0.4)' }}>
              {new Date(match.kickoff_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            id="match-share-download-btn"
            onClick={downloadPng}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Download size={15} /> Download PNG
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', gap: 8 }}
          >
            𝕏 Share on 𝕏
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', gap: 8 }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
