import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: leaderboard }, { data: predictions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('leaderboard').select('*').eq('user_id', user!.id).single(),
    supabase.from('predictions')
      .select('*, match:matches(*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*))')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          👤 My Profile
        </h1>
      </div>
      <ProfileClient profile={profile} leaderboard={leaderboard} predictions={predictions || []} />
    </div>
  )
}
