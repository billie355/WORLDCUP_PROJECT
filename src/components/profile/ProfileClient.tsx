'use client'

import { useState, useTransition, useRef } from 'react'
import { updateProfile } from '@/lib/actions/auth'
import { generateShareCard } from '@/lib/actions/share'
import { getInitials, getAccuracyPercentage } from '@/lib/utils'
import { User, Globe, Save, Share2, Camera, Trophy, Target, TrendingUp } from 'lucide-react'
import { COUNTRIES } from '@/lib/constants'
import toast from 'react-hot-toast'
import type { Profile, Leaderboard } from '@/types'

interface ProfileClientProps {
  profile: Profile | null
  leaderboard: Leaderboard | null
  predictions: any[]
}

export default function ProfileClient({ profile, leaderboard, predictions }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition()
  const [isSharing, setIsSharing] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const accuracy = getAccuracyPercentage(leaderboard?.predictions_correct || 0, leaderboard?.predictions_total || 0)

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) toast.error(result.error)
      else { toast.success('Profile updated!'); setEditMode(false) }
    })
  }

  async function handleGenerateShareCard() {
    setIsSharing(async () => {
      const result = await generateShareCard()
      if (result?.error) toast.error(result.error)
      else {
        const url = `${window.location.origin}/share/${result.shareId}`
        setShareUrl(url)
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Share link copied to clipboard!')
        } catch {
          toast.success('Share card generated!')
        }
      }
    })
  }

  return (
    <div style={{ maxWidth: 900, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32, alignItems: 'start' }}>
      {/* Profile card */}
      <div>
        {/* Avatar & name */}
        <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto',
              background: 'rgba(245,158,11,0.2)', border: '3px solid rgba(245,158,11,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)', overflow: 'hidden',
            }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(profile?.display_name || profile?.username || 'User')
              }
            </div>
            <button className="btn btn-secondary" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, padding: 0, borderRadius: '50%' }} title="Change photo">
              <Camera size={12} />
            </button>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>
            {profile?.display_name || profile?.username || 'New User'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>@{profile?.username || 'user'}</p>
          {profile?.country && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>🌍 {profile.country}</p>}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { icon: Trophy, label: 'Points', value: (leaderboard?.total_points || 0).toLocaleString(), color: '#f59e0b' },
              { icon: TrendingUp, label: 'Rank', value: leaderboard?.rank ? `#${leaderboard.rank}` : '—', color: '#10b981' },
              { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: '#8b5cf6' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="font-display" style={{ fontSize: '1.4rem', color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share card button */}
        <div className="card glass-gold" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>📤 Share Your Predictions</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Generate a shareable card of your predictions to post on social media.
          </p>
          <button
            id="generate-share-card-btn"
            onClick={handleGenerateShareCard}
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Share2 size={16} />
            {isPending ? 'Generating...' : 'Generate Share Card'}
          </button>
          {shareUrl && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Share link:</p>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--color-green)', wordBreak: 'break-all' }}>
                {shareUrl}
              </a>
            </div>
          )}
          {/* Social share buttons */}
          {shareUrl && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: '𝕏 Twitter', url: `https://twitter.com/intent/tweet?text=My%20World%20Cup%20predictions!&url=${encodeURIComponent(shareUrl)}`, color: '#1da1f2' },
                { label: '📘 Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: '#1877f2' },
                { label: '💬 WhatsApp', url: `https://wa.me/?text=${encodeURIComponent('My World Cup predictions: ' + shareUrl)}`, color: '#25d366' },
              ].map(({ label, url, color }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40`, textDecoration: 'none', flex: 1 }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit profile form */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Edit Profile</h3>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`btn btn-sm ${editMode ? 'btn-ghost' : 'btn-secondary'}`}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Display Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <input
                name="display_name"
                defaultValue={profile?.display_name || ''}
                disabled={!editMode}
                className="input-base"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }}>@</span>
              <input
                name="username"
                defaultValue={profile?.username || ''}
                disabled={!editMode}
                className="input-base"
                style={{ paddingLeft: 28 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Country</label>
            <div style={{ position: 'relative' }}>
              <Globe size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <select
                name="country"
                defaultValue={profile?.country || ''}
                disabled={!editMode}
                className="input-base"
                style={{ paddingLeft: 38, appearance: 'none' }}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {editMode && (
            <button id="save-profile-btn" type="submit" disabled={isPending} className="btn btn-primary">
              <Save size={16} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
