import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/lib/actions/leaderboard'
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leaderboard' }

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data, count }, { data: userLb }] = await Promise.all([
    getLeaderboard(0, 50),
    supabase.from('leaderboard').select('rank').eq('user_id', user!.id).single(),
  ])

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          👑 Leaderboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          See how you rank against fans worldwide. Points update after each match result.
        </p>
      </div>
      <LeaderboardClient
        initialData={data}
        initialCount={count}
        currentUserId={user!.id}
        currentUserRank={userLb?.rank || null}
      />
    </div>
  )
}
