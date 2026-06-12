import { createClient } from '@/lib/supabase/server'
import AdminLeaderboardClient from '@/components/admin/AdminLeaderboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Leaderboard' }

export default async function AdminLeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  const { data: pointsConfig } = await supabase.from('points_config').select('*')
  return <AdminLeaderboardClient pointsConfig={pointsConfig || []} currentUserRole={profile?.role as 'admin' | 'staff'} />
}
