'use client'

import { useState, useTransition, useRef } from 'react'
import { updateProfile, updatePassword, signOut } from '@/lib/actions/auth'
import { generateShareCard } from '@/lib/actions/share'
import { getInitials, getAccuracyPercentage } from '@/lib/utils'
import { User, Globe, Save, Share2, Camera, Trophy, Target, TrendingUp, Loader2, LogOut, CheckCircle, XCircle, Bell } from 'lucide-react'
import { saveSubscription, sendTestNotification } from '@/lib/actions/notifications'
import { COUNTRIES } from '@/lib/constants'
import toast from 'react-hot-toast'
import type { Profile, Leaderboard } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { formatKickoffTime } from '@/lib/utils'

interface ProfileClientProps {
  profile: Profile
  leaderboard: Leaderboard
  predictions: any[]
  badges?: any[]
}

export default function ProfileClient({ profile, leaderboard, predictions, badges = [] }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition()
  const [isSharing, setIsSharing] = useTransition()
  const [isChangingPassword, startPasswordTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [country, setCountry] = useState(profile?.country || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // Push Notifications State
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accuracy = getAccuracyPercentage(leaderboard?.predictions_correct || 0, leaderboard?.predictions_total || 0)

  // Check if push notifications are supported and subscribed
  import('react').then((React) => {
    React.useEffect(() => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) setIsSubscribed(true)
          })
        })
      }
    }, [])
  })

  // Utility to convert Base64 URL to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function handleToggleNotifications() {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      toast.error('Push notifications are not supported in your browser.')
      return
    }

    setIsSubscribing(true)
    try {
      const registration = await navigator.serviceWorker.ready
      
      if (isSubscribed) {
        // Unsubscribe locally (removing from DB requires another action, keeping simple for now)
        toast('To stop notifications completely, revoke permission in browser settings.', { icon: 'ℹ️' })
        setIsSubscribing(false)
        return
      }

      // Ask for permission and subscribe
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        toast.error('VAPID public key missing. Check env variables.')
        setIsSubscribing(false)
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const subJSON = subscription.toJSON()
      const result = await saveSubscription(subJSON)

      if (result.error) {
        toast.error(result.error)
      } else {
        setIsSubscribed(true)
        toast.success('Notifications enabled!')
      }
    } catch (err: any) {
      console.error(err)
      if (err.name === 'NotAllowedError') {
        toast.error('You blocked notifications. Please enable them in browser settings.')
      } else {
        toast.error('Failed to subscribe: ' + err.message)
      }
    } finally {
      setIsSubscribing(false)
    }
  }

  async function handleSendTest() {
    const toastId = toast.loading('Sending test notification...')
    const result = await sendTestNotification()
    if (result.error) toast.error(result.error, { id: toastId })
    else toast.success(result.message || 'Sent!', { id: toastId })
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Not authenticated'); return }

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) { toast.error(uploadError.message); return }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const formData = new FormData()
      formData.append('avatar_url', publicUrl)
      const result = await updateProfile(formData, { avatarOnly: true })
      if (result?.error) {
        toast.error(result.error)
      } else {
        setAvatarUrl(publicUrl + '?t=' + Date.now())
        toast.success('Profile picture updated!')
      }
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleProfileUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newDisplayName = formData.get('display_name') as string
    const newUsername = formData.get('username') as string
    const newCountry = formData.get('country') as string
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) toast.error(result.error)
      else {
        setDisplayName(newDisplayName)
        setUsername(newUsername)
        setCountry(newCountry)
        toast.success('Profile updated!')
        setEditMode(false)
      }
    })
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    startPasswordTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) toast.error(result.error)
      else {
        toast.success('Password updated successfully!')
        form.reset()
      }
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
    <div>
      <div style={{ maxWidth: 900, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 32, alignItems: 'start', marginBottom: 32 }}>
      {/* Hidden file input for avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />

      {/* Profile card */}
      <div>
        <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto',
              background: 'rgba(245,158,11,0.2)', border: '3px solid rgba(245,158,11,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)', overflow: 'hidden',
              position: 'relative',
            }}>
              {isUploadingAvatar && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                }}>
                  <Loader2 size={24} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(displayName || username || 'User')
              }
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="btn btn-secondary"
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, padding: 0, borderRadius: '50%' }}
              title="Change photo"
            >
              <Camera size={12} />
            </button>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>
            {displayName || username || 'New User'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>@{username || 'user'}</p>
          {country && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>🌍 {country}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Points', value: (leaderboard?.total_points || 0).toLocaleString(), color: '#f59e0b' },
              { label: 'Rank', value: leaderboard?.rank ? `#${leaderboard.rank}` : '—', color: '#10b981' },
              { label: 'Accuracy', value: `${accuracy}%`, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="font-display" style={{ fontSize: '1.4rem', color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share card */}
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
          {shareUrl && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: '𝕏 Twitter', url: `https://twitter.com/intent/tweet?text=My%20World%20Cup%20predictions!&url=${encodeURIComponent(shareUrl)}`, color: '#1da1f2' },
                { label: '📘 Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: '#1877f2' },
                { label: '💬 WhatsApp', url: `https://wa.me/?text=${encodeURIComponent('My World Cup predictions: ' + shareUrl)}`, color: '#25d366' },
              ].map(({ label, url, color }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
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
              <input name="display_name" defaultValue={displayName} disabled={!editMode} className="input-base" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }}>@</span>
              <input name="username" defaultValue={username} disabled={!editMode} className="input-base" style={{ paddingLeft: 28 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Country</label>
            <div style={{ position: 'relative' }}>
              <Globe size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
              <select name="country" defaultValue={country} disabled={!editMode} className="input-base" style={{ paddingLeft: 38, appearance: 'none' }}>
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

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Bell size={20} color="var(--color-gold)" />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Push Notifications</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Get alerted when matches start or when your predictions earn points.
          </p>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleToggleNotifications}
              disabled={isSubscribing || isSubscribed}
              className={`btn ${isSubscribed ? 'btn-ghost' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {isSubscribing ? 'Setting up...' : isSubscribed ? '✅ Subscribed' : 'Enable Notifications'}
            </button>
            
            {isSubscribed && (
              <button onClick={handleSendTest} className="btn btn-secondary">
                Test
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Change Password</h3>
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>New Password</label>
              <input type="password" name="password" required minLength={6} placeholder="Min. 6 characters" className="input-base" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>Confirm New Password</label>
              <input type="password" name="confirm_password" required minLength={6} placeholder="Confirm password" className="input-base" />
            </div>
            <button type="submit" disabled={isChangingPassword} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <button
              onClick={() => startTransition(async () => { await signOut() })}
              disabled={isPending}
              className="btn btn-ghost"
              style={{ width: '100%', color: 'var(--color-red)' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Badges / Achievements Section */}
      <div style={{ marginBottom: 40, maxWidth: 900 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>🏆 My Achievements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {[
            { type: 'FIRST_BLOOD', name: 'First Pick', icon: '🩸', desc: 'Made your first prediction' },
            { type: 'SNIPER', name: 'Sniper', icon: '🎯', desc: 'Predicted exact scoreline' },
            { type: 'UNDERDOG_KING', name: 'Underdog', icon: '👑', desc: 'Predicted an underdog win' },
            { type: 'ON_FIRE', name: 'On Fire', icon: '🔥', desc: '3 correct predictions in a row' }
          ].map((badgeDef) => {
            const hasBadge = badges.some(b => b.badge_type === badgeDef.type)
            const count = badges.filter(b => b.badge_type === badgeDef.type).length

            return (
              <div 
                key={badgeDef.type} 
                className="card" 
                style={{ 
                  padding: '16px', 
                  textAlign: 'center', 
                  opacity: hasBadge ? 1 : 0.4,
                  filter: hasBadge ? 'none' : 'grayscale(100%)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 8,
                  position: 'relative'
                }}
              >
                {hasBadge && count > 1 && (
                  <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--color-gold)', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                    x{count}
                  </div>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>{badgeDef.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{badgeDef.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{badgeDef.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Predictions History */}
      <div style={{ maxWidth: 900 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>📜 My Recent Predictions</h3>



        {predictions.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No predictions made yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
            {predictions.map((pred: any) => {
              const hasResult = pred.match?.home_score !== null
              const isExact = pred.points_awarded === 5
              const isCorrect = pred.points_awarded > 0 && pred.points_awarded < 5

              return (
                <div key={pred.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                      {pred.match?.stage?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                      {formatKickoffTime(pred.match?.kickoff_time)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'right' }}>{pred.match?.home_team?.name}</span>
                      {pred.match?.home_team?.flag_url && (
                        <img src={pred.match.home_team.flag_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>Your pick</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: 2 }}>{pred.predicted_home}-{pred.predicted_away}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {pred.match?.away_team?.flag_url && (
                        <img src={pred.match.away_team.flag_url} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      )}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'left' }}>{pred.match?.away_team?.name}</span>
                    </div>
                  </div>

                  {hasResult ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        {isExact ? <CheckCircle size={14} color="#10b981" /> : isCorrect ? <CheckCircle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
                        <span style={{ color: isExact ? '#10b981' : isCorrect ? '#f59e0b' : '#ef4444' }}>
                          {isExact ? 'Exact Score!' : isCorrect ? 'Correct Result' : 'Wrong Prediction'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: pred.points_awarded > 0 ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        +{pred.points_awarded} pts
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Waiting for match to finish...
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>)
}
